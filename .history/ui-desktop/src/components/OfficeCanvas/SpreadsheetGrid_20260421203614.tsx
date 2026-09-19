import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../../i18n";

type SpreadsheetTheme = {
  canvasBg: string;
  canvasHeaderBg: string;
  canvasGrid: string;
  canvasText: string;
  canvasHighlight: string;
  canvasHighlightText: string;
  canvasLinked: string;
  canvasSelection: string;
};

function readSpreadsheetTheme(): SpreadsheetTheme {
  const styles = getComputedStyle(document.documentElement);

  return {
    canvasBg: styles.getPropertyValue("--canvas-grid-bg").trim(),
    canvasHeaderBg: styles.getPropertyValue("--canvas-grid-header-bg").trim(),
    canvasGrid: styles.getPropertyValue("--canvas-grid-line").trim(),
    canvasText: styles.getPropertyValue("--canvas-grid-text").trim(),
    canvasHighlight: styles.getPropertyValue("--canvas-grid-highlight").trim(),
    canvasHighlightText: styles.getPropertyValue("--canvas-grid-highlight-text").trim(),
    canvasLinked: styles.getPropertyValue("--canvas-grid-linked").trim(),
    canvasSelection: styles.getPropertyValue("--canvas-grid-selection").trim()
  };
}

export type UUID = string;

// Points to a CRDT operation identity in core-engine instead of storing static text.
export type CellPointer = {
  kind: "pointer";
  opId: UUID;
};

export type CellValue = string | number | CellPointer | null;

export type SpreadsheetGridData = {
  rows: number;
  cols: number;
  cells: Record<string, CellValue>;
};

type GridCell = {
  r: number;
  c: number;
};

type CellRange = {
  start: GridCell;
  end: GridCell;
};

type SpreadsheetGridProps = {
  data: SpreadsheetGridData;
  cellWidth?: number;
  cellHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  themeName?: string;
  revision?: number;
  peakRow?: number | null;
  focusRow?: number | null;
  focusCol?: number | null;
  resizable?: boolean;
};

const MIN_RESIZABLE_VIEWPORT_WIDTH = 360;
const MIN_RESIZABLE_VIEWPORT_HEIGHT = 220;
const RESIZABLE_SHELL_HORIZONTAL_CHROME = 34;

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function isCellPointer(value: CellValue): value is CellPointer {
  return typeof value === "object" && value !== null && value.kind === "pointer";
}

function getRenderableCellText(value: CellValue): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function normalizeRange(range: CellRange | null): { top: number; bottom: number; left: number; right: number } | null {
  if (!range) {
    return null;
  }

  return {
    top: Math.min(range.start.r, range.end.r),
    bottom: Math.max(range.start.r, range.end.r),
    left: Math.min(range.start.c, range.end.c),
    right: Math.max(range.start.c, range.end.c)
  };
}

function isCellInRange(row: number, col: number, range: CellRange | null): boolean {
  const normalized = normalizeRange(range);
  if (!normalized) {
    return false;
  }

  return row >= normalized.top && row <= normalized.bottom && col >= normalized.left && col <= normalized.right;
}

function getRangeOrigin(range: CellRange | null, fallback: GridCell | null): GridCell | null {
  const normalized = normalizeRange(range);
  if (!normalized) {
    return fallback;
  }

  return { r: normalized.top, c: normalized.left };
}

function parsePastedCellValue(raw: string): CellValue {
  const value = raw.trim();
  if (!value) {
    return "";
  }

  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return raw;
}

function buildClipboardText(data: SpreadsheetGridData, range: CellRange | null): string {
  const normalized = normalizeRange(range);
  if (!normalized) {
    return "";
  }

  const rows: string[] = [];

  for (let row = normalized.top; row <= normalized.bottom; row += 1) {
    const cols: string[] = [];
    for (let col = normalized.left; col <= normalized.right; col += 1) {
      cols.push(getRenderableCellText(data.cells[cellKey(row, col)] ?? null));
    }
    rows.push(cols.join("\t"));
  }

  return rows.join("\n");
}

function applyPastedText(data: SpreadsheetGridData, origin: GridCell, text: string): CellRange | null {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const normalizedLines = lines.filter((line, index) => index < lines.length - 1 || line.length > 0);

  if (normalizedLines.length === 0) {
    return null;
  }

  let maxRow = origin.r;
  let maxCol = origin.c;

  normalizedLines.forEach((line, rowOffset) => {
    const cols = line.split("\t");
    cols.forEach((cell, colOffset) => {
      const targetRow = origin.r + rowOffset;
      const targetCol = origin.c + colOffset;

      if (targetRow < 1 || targetCol < 1 || targetRow > data.rows || targetCol > data.cols) {
        return;
      }

      data.cells[cellKey(targetRow, targetCol)] = parsePastedCellValue(cell);
      maxRow = Math.max(maxRow, targetRow);
      maxCol = Math.max(maxCol, targetCol);
    });
  });

  return {
    start: origin,
    end: { r: maxRow, c: maxCol }
  };
}

function clearRange(data: SpreadsheetGridData, range: CellRange | null): void {
  const normalized = normalizeRange(range);
  if (!normalized) {
    return;
  }

  for (let row = normalized.top; row <= normalized.bottom; row += 1) {
    for (let col = normalized.left; col <= normalized.right; col += 1) {
      data.cells[cellKey(row, col)] = "";
    }
  }
}

function drawPointerBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  theme: SpreadsheetTheme
): void {
  const radius = Math.max(2, size * 0.24);
  const cx = x + size * 0.5;
  const cy = y + size * 0.5;

  ctx.save();
  ctx.strokeStyle = theme.canvasLinked;
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.arc(cx - radius * 0.8, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + radius * 0.8, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.1, cy - radius * 0.5);
  ctx.lineTo(cx + radius * 0.1, cy + radius * 0.5);
  ctx.stroke();

  ctx.restore();
}

function drawGrid(
  canvas: HTMLCanvasElement,
  data: SpreadsheetGridData,
  cellWidth: number,
  cellHeight: number,
  scrollLeft: number,
  scrollTop: number,
  viewportWidth: number,
  viewportHeight: number,
  peakRow: number | null,
  activeCell: { r: number; c: number } | null,
  selectedRange: CellRange | null,
  linkedLabel: string,
  theme: SpreadsheetTheme
): void {
  try {
    const dpr = window.devicePixelRatio || 1;
    const safeViewportWidth = Math.max(1, Math.floor(viewportWidth));
    const safeViewportHeight = Math.max(1, Math.floor(viewportHeight));

    canvas.width = Math.floor(safeViewportWidth * dpr);
    canvas.height = Math.floor(safeViewportHeight * dpr);
    canvas.style.width = `${safeViewportWidth}px`;
    canvas.style.height = `${safeViewportHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, safeViewportWidth, safeViewportHeight);

    ctx.fillStyle = theme.canvasBg;
    ctx.fillRect(0, 0, safeViewportWidth, safeViewportHeight);

    const startRow = Math.max(1, Math.floor(scrollTop / cellHeight));
    const endRow = Math.min(data.rows, Math.ceil((scrollTop + safeViewportHeight) / cellHeight));
    const startCol = Math.max(1, Math.floor(scrollLeft / cellWidth));
    const endCol = Math.min(data.cols, Math.ceil((scrollLeft + safeViewportWidth) / cellWidth));

    ctx.save();
    ctx.translate(-scrollLeft, -scrollTop);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        drawCell(
          ctx,
          data,
          cellWidth,
          cellHeight,
          peakRow,
          activeCell,
          selectedRange,
          linkedLabel,
          theme,
          row,
          col
        );
      }
    }

    const normalizedRange = normalizeRange(selectedRange);
    if (normalizedRange) {
      ctx.save();
      ctx.strokeStyle = theme.canvasSelection;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        normalizedRange.left * cellWidth + 1.5,
        normalizedRange.top * cellHeight + 1.5,
        (normalizedRange.right - normalizedRange.left + 1) * cellWidth - 3,
        (normalizedRange.bottom - normalizedRange.top + 1) * cellHeight - 3
      );
      ctx.restore();
    }

    ctx.restore();

    ctx.save();
    ctx.translate(-scrollLeft, 0);
    for (let col = startCol; col <= endCol; col += 1) {
      drawCell(ctx, data, cellWidth, cellHeight, peakRow, activeCell, selectedRange, linkedLabel, theme, 0, col);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(0, -scrollTop);
    for (let row = startRow; row <= endRow; row += 1) {
      drawCell(ctx, data, cellWidth, cellHeight, peakRow, activeCell, selectedRange, linkedLabel, theme, row, 0);
    }
    ctx.restore();

    drawCell(ctx, data, cellWidth, cellHeight, peakRow, activeCell, selectedRange, linkedLabel, theme, 0, 0);
  } catch (error) {
    console.error(error);
  }
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  data: SpreadsheetGridData,
  cellWidth: number,
  cellHeight: number,
  peakRow: number | null,
  active: { r: number; c: number } | null,
  selectedRange: CellRange | null,
  linkedLabel: string,
  theme: SpreadsheetTheme,
  row: number,
  col: number
): void {
  const x = col * cellWidth;
  const y = row * cellHeight;
  const isHighlighted = row > 0 && peakRow === row;
  const baseTextColor = isHighlighted ? theme.canvasHighlightText : theme.canvasText;
  const linkedTextColor = isHighlighted ? theme.canvasHighlightText : theme.canvasLinked;

  if (row === 0 && col === 0) {
    ctx.fillStyle = theme.canvasHeaderBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);
  } else if (row === 0) {
    ctx.fillStyle = theme.canvasHeaderBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = theme.canvasText;
    ctx.font = "12px Segoe UI";
    ctx.textBaseline = "middle";
    ctx.fillText(String.fromCharCode(64 + col), x + 8, y + cellHeight * 0.5);
  } else if (col === 0) {
    ctx.fillStyle = theme.canvasHeaderBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = theme.canvasText;
    ctx.font = "12px Segoe UI";
    ctx.textBaseline = "middle";
    ctx.fillText(String(row), x + 8, y + cellHeight * 0.5);
  } else {
    ctx.fillStyle = isHighlighted ? theme.canvasHighlight : theme.canvasBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);

    if (isCellInRange(row, col, selectedRange)) {
      ctx.save();
      ctx.fillStyle = theme.canvasSelection;
      ctx.globalAlpha = active && active.r === row && active.c === col ? 0.18 : 0.1;
      ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
      ctx.restore();
    }

    const value = data.cells[cellKey(row, col)] ?? null;
    ctx.fillStyle = baseTextColor;
    ctx.font = "12px Segoe UI";
    ctx.textBaseline = "middle";

    if (isCellPointer(value)) {
      drawPointerBadge(ctx, x + 6, y + 6, Math.min(cellWidth, cellHeight) - 12, theme);
      ctx.fillStyle = linkedTextColor;
      ctx.font = "11px Segoe UI";
      ctx.fillText(linkedLabel, x + 22, y + cellHeight * 0.5);
      ctx.fillStyle = baseTextColor;
      ctx.font = "12px Segoe UI";
    } else if (value !== null) {
      const text = getRenderableCellText(value);
      if (text) {
        ctx.fillText(text, x + 8, y + cellHeight * 0.5);
      }
    }

    if (active && active.r === row && active.c === col) {
      ctx.save();
      ctx.strokeStyle = theme.canvasSelection;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1.5, y + 1.5, cellWidth - 3, cellHeight - 3);
      ctx.restore();
    }
  }

  ctx.strokeStyle = theme.canvasGrid;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellWidth, cellHeight);
}

export default function SpreadsheetGrid({
  data,
  cellWidth = 100,
  cellHeight = 28,
  viewportWidth = 620,
  viewportHeight = 308,
  themeName,
  revision = 0,
  peakRow = null,
  focusRow = null,
  focusCol = 1,
  resizable = false
}: SpreadsheetGridProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: viewportWidth, height: viewportHeight });
  const [isResizing, setIsResizing] = useState(false);
  // 持久資料快照
  const dataRef = useRef<SpreadsheetGridData>(data);
  // 選取中的格子
  const activeCell = useRef<{ r: number; c: number } | null>(null);
  const selectedRange = useRef<CellRange | null>(null);
  const selectionAnchor = useRef<GridCell | null>(null);
  const isPointerSelecting = useRef(false);

  function clampViewportSize(nextWidth: number, nextHeight: number) {
    const parentWidth = shellRef.current?.parentElement?.clientWidth;
    const maxWidth =
      typeof parentWidth === "number" && parentWidth > 0
        ? Math.max(280, parentWidth - RESIZABLE_SHELL_HORIZONTAL_CHROME)
        : Number.POSITIVE_INFINITY;
    const minWidth = Number.isFinite(maxWidth)
      ? Math.min(MIN_RESIZABLE_VIEWPORT_WIDTH, maxWidth)
      : MIN_RESIZABLE_VIEWPORT_WIDTH;

    return {
      width: Math.max(minWidth, Math.min(nextWidth, maxWidth)),
      height: Math.max(MIN_RESIZABLE_VIEWPORT_HEIGHT, nextHeight)
    };
  }

  function drawCurrentGrid() {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) {
      return;
    }

    drawGrid(
      canvas,
      dataRef.current,
      cellWidth,
      cellHeight,
      viewport.scrollLeft,
      viewport.scrollTop,
      viewport.clientWidth,
      viewport.clientHeight,
      peakRow,
      activeCell.current,
      selectedRange.current,
      t("spreadsheet.linked"),
      readSpreadsheetTheme()
    );
  }

  function ensureActiveCellVisible(row: number, col: number) {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const cellLeft = col * cellWidth;
    const cellTop = row * cellHeight;
    const cellRight = cellLeft + cellWidth;
    const cellBottom = cellTop + cellHeight;

    let nextLeft = viewport.scrollLeft;
    let nextTop = viewport.scrollTop;

    if (cellLeft < viewport.scrollLeft) {
      nextLeft = cellLeft;
    } else if (cellRight > viewport.scrollLeft + viewport.clientWidth) {
      nextLeft = cellRight - viewport.clientWidth;
    }

    if (cellTop < viewport.scrollTop) {
      nextTop = cellTop;
    } else if (cellBottom > viewport.scrollTop + viewport.clientHeight) {
      nextTop = cellBottom - viewport.clientHeight;
    }

    if (nextLeft !== viewport.scrollLeft || nextTop !== viewport.scrollTop) {
      viewport.scrollTo({ left: Math.max(0, nextLeft), top: Math.max(0, nextTop) });
      requestAnimationFrame(() => {
        drawCurrentGrid();
      });
      return;
    }

    drawCurrentGrid();
  }

  useEffect(() => {
    dataRef.current = data;
    drawCurrentGrid();
  }, [data, cellWidth, cellHeight, peakRow, themeName, t]);

  useEffect(() => {
    if (!resizable) {
      setViewportSize({ width: viewportWidth, height: viewportHeight });
      return;
    }

    setViewportSize((previous) => clampViewportSize(previous.width, previous.height));
  }, [resizable, viewportHeight, viewportWidth]);

  useEffect(() => {
    if (!resizable) {
      return;
    }

    const parent = shellRef.current?.parentElement;
    if (!parent) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setViewportSize((previous) => clampViewportSize(previous.width, previous.height));
    });

    observer.observe(parent);
    return () => {
      observer.disconnect();
    };
  }, [resizable]);

  useEffect(() => {
    if (!focusRow || !focusCol) {
      return;
    }

    activeCell.current = { r: focusRow, c: focusCol };
    selectionAnchor.current = { r: focusRow, c: focusCol };
    selectedRange.current = {
      start: { r: focusRow, c: focusCol },
      end: { r: focusRow, c: focusCol }
    };
    const viewport = viewportRef.current;
    if (viewport) {
      const targetLeft = Math.max(focusCol * cellWidth - viewport.clientWidth / 2 + cellWidth * 0.5, 0);
      const targetTop = Math.max(focusRow * cellHeight - viewport.clientHeight / 2 + cellHeight * 0.5, 0);
      viewport.scrollTo({ left: targetLeft, top: targetTop, behavior: "smooth" });
    }
    drawCurrentGrid();
  }, [focusRow, focusCol, cellWidth, cellHeight, revision, peakRow, themeName, t]);

  useEffect(() => {
    drawCurrentGrid();
  }, [revision, themeName, t]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleScroll = () => {
      drawCurrentGrid();
    };

    const resizeObserver = new ResizeObserver(() => {
      drawCurrentGrid();
    });

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [cellWidth, cellHeight, peakRow, revision, themeName, t]);

  function getCanvasPosition(event: React.MouseEvent<HTMLCanvasElement>) {
    return getCanvasPositionFromClient(event.clientX, event.clientY);
  }

  function getCanvasPositionFromClient(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: viewport.scrollLeft + clientX - rect.left,
      y: viewport.scrollTop + clientY - rect.top
    };
  }

  // 命中測試：根據 offsetX/Y 算出 row, col
  function hitTestCell(x: number, y: number) {
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    return { row, col };
  }

  function clampToBodyCell(row: number, col: number): GridCell {
    return {
      r: Math.min(Math.max(row, 1), dataRef.current.rows),
      c: Math.min(Math.max(col, 1), dataRef.current.cols)
    };
  }

  function updateSelection(target: GridCell, preserveAnchor: boolean) {
    const nextCell = clampToBodyCell(target.r, target.c);
    activeCell.current = nextCell;

    if (!preserveAnchor || !selectionAnchor.current) {
      selectionAnchor.current = nextCell;
    }

    selectedRange.current = {
      start: selectionAnchor.current,
      end: nextCell
    };
  }

  async function copySelectedRangeToClipboard() {
    const text = buildClipboardText(dataRef.current, selectedRange.current);
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
    }
  }

  function applyTypedValue(text: string) {
    const origin = getRangeOrigin(selectedRange.current, activeCell.current);
    if (!origin) {
      return;
    }

    if (selectedRange.current && normalizeRange(selectedRange.current)) {
      clearRange(dataRef.current, selectedRange.current);
    }

    dataRef.current.cells[cellKey(origin.r, origin.c)] = text;
    updateSelection(origin, false);
    drawCurrentGrid();
  }

  function handlePasteText(text: string) {
    const origin = getRangeOrigin(selectedRange.current, activeCell.current);
    if (!origin || !text) {
      return;
    }

    const nextRange = applyPastedText(dataRef.current, origin, text);
    if (!nextRange) {
      return;
    }

    activeCell.current = nextRange.end;
    selectionAnchor.current = nextRange.start;
    selectedRange.current = nextRange;
    ensureActiveCellVisible(nextRange.end.r, nextRange.end.c);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const position = getCanvasPosition(e);
    if (!position) {
      return;
    }

    const { row, col } = hitTestCell(position.x, position.y);
    if (row > 0 && col > 0 && row <= dataRef.current.rows && col <= dataRef.current.cols) {
      isPointerSelecting.current = true;
      updateSelection({ r: row, c: col }, e.shiftKey);
      canvasRef.current?.focus();
      drawCurrentGrid();
    }
  }

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!isPointerSelecting.current) {
        return;
      }

      const position = getCanvasPositionFromClient(event.clientX, event.clientY);
      if (!position) {
        return;
      }

      const hit = hitTestCell(position.x, position.y);
      updateSelection({ r: hit.row, c: hit.col }, true);
      drawCurrentGrid();
    }

    function handleMouseUp() {
      isPointerSelecting.current = false;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      if (document.activeElement !== canvasRef.current) {
        return;
      }

      const active = activeCell.current;
      if (!active) return;
      const { r, c } = active;
      const key = cellKey(r, c);
      const accelerator = e.ctrlKey || e.metaKey;

      if (accelerator && !e.altKey) {
        const lower = e.key.toLowerCase();

        if (lower === "c") {
          await copySelectedRangeToClipboard();
          e.preventDefault();
          return;
        }

        if (lower === "v") {
          try {
            const text = await navigator.clipboard.readText();
            handlePasteText(text);
          } catch (error) {
            console.error(error);
          }
          e.preventDefault();
          return;
        }

        if (lower === "a") {
          const nextRange = {
            start: { r: 1, c: 1 },
            end: { r: dataRef.current.rows, c: dataRef.current.cols }
          };
          selectionAnchor.current = nextRange.start;
          selectedRange.current = nextRange;
          activeCell.current = nextRange.end;
          drawCurrentGrid();
          e.preventDefault();
          return;
        }
      }

      // 僅允許內容格
      if (r <= 0 || c <= 0) return;
      if (e.key.length === 1 && !accelerator && !e.altKey) {
        applyTypedValue(e.key);
        e.preventDefault();
      } else if (e.key === "Backspace") {
        const normalized = normalizeRange(selectedRange.current);
        if (normalized && (normalized.top !== normalized.bottom || normalized.left !== normalized.right)) {
          clearRange(dataRef.current, selectedRange.current);
          drawCurrentGrid();
          e.preventDefault();
          return;
        }

        let prev = dataRef.current.cells[key] ?? "";
        if (typeof prev !== "string" && typeof prev !== "number") prev = "";
        const newVal = String(prev).slice(0, -1);
        dataRef.current.cells[key] = newVal;
        drawCurrentGrid();
        e.preventDefault();
      } else if (e.key === "Delete") {
        clearRange(dataRef.current, selectedRange.current);
        drawCurrentGrid();
        e.preventDefault();
      } else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Tab" ||
        e.key === "Enter"
      ) {
        let nextRow = r;
        let nextCol = c;

        switch (e.key) {
          case "ArrowUp":
            nextRow -= 1;
            break;
          case "ArrowDown":
          case "Enter":
            nextRow += 1;
            break;
          case "ArrowLeft":
            nextCol -= 1;
            break;
          case "ArrowRight":
          case "Tab":
            nextCol += 1;
            break;
        }

        nextRow = Math.min(Math.max(nextRow, 1), dataRef.current.rows);
        nextCol = Math.min(Math.max(nextCol, 1), dataRef.current.cols);

        updateSelection({ r: nextRow, c: nextCol }, e.shiftKey);
        ensureActiveCellVisible(nextRow, nextCol);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    async function handlePaste(event: ClipboardEvent) {
      if (document.activeElement !== canvasRef.current) {
        return;
      }

      const text = event.clipboardData?.getData("text/plain") ?? "";
      if (!text) {
        return;
      }

      handlePasteText(text);
      event.preventDefault();
    }

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  function handleResizePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!resizable) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = viewportRef.current?.clientWidth ?? viewportSize.width;
    const startHeight = viewportRef.current?.clientHeight ?? viewportSize.height;
    const previousUserSelect = document.body.style.userSelect;
    const resizeHandle = event.currentTarget;

    setIsResizing(true);
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = startWidth + (moveEvent.clientX - startX);
      const nextHeight = startHeight + (moveEvent.clientY - startY);
      setViewportSize((previous) => {
        const nextSize = clampViewportSize(nextWidth, nextHeight);
        if (previous.width === nextSize.width && previous.height === nextSize.height) {
          return previous;
        }

        return nextSize;
      });
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = previousUserSelect;
      if (resizeHandle.hasPointerCapture(event.pointerId)) {
        resizeHandle.releasePointerCapture(event.pointerId);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  }

  return (
    <div
      ref={shellRef}
      className={`spreadsheet-grid-shell${resizable ? " is-resizable" : ""}${isResizing ? " is-resizing" : ""}`}
      style={resizable ? undefined : { maxWidth: viewportWidth }}
    >
      <div className="spreadsheet-grid-toolbar">
        <span>{t("spreadsheet.toolbarTitle")}</span>
        {focusRow ? <span className="spreadsheet-focus-chip">{t("spreadsheet.focusRow", { row: focusRow })}</span> : null}
      </div>
      <div
        ref={viewportRef}
        className="spreadsheet-grid-viewport"
        style={{ width: viewportSize.width, height: viewportSize.height }}
      >
        <div
          className="spreadsheet-grid-stage"
          style={{
            width: (data.rows >= 0 ? (data.cols + 1) * cellWidth : cellWidth),
            height: (data.rows >= 0 ? (data.rows + 1) * cellHeight : cellHeight)
          }}
        >
          <canvas
            ref={canvasRef}
            className="spreadsheet-grid"
            aria-label={t("spreadsheet.ariaLabel")}
            tabIndex={0}
            onMouseDown={handleMouseDown}
            style={{ outline: "none" }}
          />
        </div>
      </div>
      {resizable ? (
        <button
          type="button"
          className="spreadsheet-grid-resize-handle"
          aria-label={t("spreadsheet.resizeHandle")}
          title={t("spreadsheet.resizeHandle")}
          onPointerDown={handleResizePointerDown}
        />
      ) : null}
    </div>
  );
}

export function createDemoSpreadsheetData(t?: (key: string) => string): SpreadsheetGridData {
  const translate = t ?? ((key: string) => key);

  return {
    rows: 24,
    cols: 12,
    cells: {
      [cellKey(1, 1)]: translate("spreadsheet.demo.time"),
      [cellKey(1, 2)]: translate("spreadsheet.demo.sensorA"),
      [cellKey(1, 3)]: translate("spreadsheet.demo.sensorB"),
      [cellKey(2, 1)]: "00:00",
      [cellKey(2, 2)]: 12.4,
      [cellKey(2, 3)]: 11.9,
      [cellKey(3, 1)]: "00:01",
      [cellKey(3, 2)]: {
        kind: "pointer",
        opId: "7f0c5ef1-30cb-4e59-9e2f-1624e8ce0f2a"
      },
      [cellKey(3, 3)]: {
        kind: "pointer",
        opId: "9ac5f0a8-8f6f-49b7-a98e-3a843910cde7"
      },
      [cellKey(4, 1)]: "00:02",
      [cellKey(4, 2)]: 12.6,
      [cellKey(4, 3)]: 12.2
    }
  };
}

export function useDemoSpreadsheetData() {
  const { t } = useTranslation();
  return useMemo(() => createDemoSpreadsheetData(t), [t]);
}
