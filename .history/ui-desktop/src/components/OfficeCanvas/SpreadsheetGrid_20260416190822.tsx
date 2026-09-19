import { useEffect, useMemo, useRef } from "react";

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

type SpreadsheetGridProps = {
  data: SpreadsheetGridData;
  cellWidth?: number;
  cellHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  revision?: number;
  peakRow?: number | null;
  focusRow?: number | null;
  focusCol?: number | null;
};

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function isCellPointer(value: CellValue): value is CellPointer {
  return typeof value === "object" && value !== null && value.kind === "pointer";
}

function drawPointerBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const radius = Math.max(2, size * 0.24);
  const cx = x + size * 0.5;
  const cy = y + size * 0.5;

  ctx.save();
  ctx.strokeStyle = "#f59e0b";
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
  peakRow: number | null,
  activeCell: { r: number; c: number } | null
): void {
  const dpr = window.devicePixelRatio || 1;
  const totalWidth = (data.cols + 1) * cellWidth;
  const totalHeight = (data.rows + 1) * cellHeight;

  canvas.width = Math.floor(totalWidth * dpr);
  canvas.height = Math.floor(totalHeight * dpr);
  canvas.style.width = `${totalWidth}px`;
  canvas.style.height = `${totalHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, totalWidth, totalHeight);

  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  ctx.fillStyle = "#131e34";
  ctx.fillRect(0, 0, totalWidth, cellHeight);
  ctx.fillRect(0, 0, cellWidth, totalHeight);

  ctx.strokeStyle = "#24314d";
  ctx.lineWidth = 1;

  for (let row = 0; row <= data.rows; row += 1) {
    const y = row * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(totalWidth, y);
    ctx.stroke();
  }

  for (let col = 0; col <= data.cols; col += 1) {
    const x = col * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, totalHeight);
    ctx.stroke();
  }

  ctx.textBaseline = "middle";
  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#d1d9eb";

  for (let col = 1; col <= data.cols; col += 1) {
    const label = String.fromCharCode(64 + col);
    ctx.fillText(label, col * cellWidth + 8, cellHeight * 0.5);
  }

  for (let row = 1; row <= data.rows; row += 1) {
    ctx.fillText(String(row), 8, row * cellHeight + cellHeight * 0.5);
  }

  for (let row = 1; row <= data.rows; row += 1) {
    for (let col = 1; col <= data.cols; col += 1) {
      const key = cellKey(row, col);
      const value = data.cells[key] ?? null;
      const x = col * cellWidth;
      const y = row * cellHeight;

      if (peakRow && row === peakRow) {
        ctx.fillStyle = "#fff7d6";
        ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
      }

      if (isCellPointer(value)) {
        drawPointerBadge(ctx, x + 6, y + 6, Math.min(cellWidth, cellHeight) - 12);
        ctx.fillStyle = "#f8bf4d";
        ctx.font = "11px Segoe UI";
        ctx.fillText("linked", x + 22, y + cellHeight * 0.5);
        ctx.fillStyle = "#d1d9eb";
        ctx.font = "12px Segoe UI";
      } else if (value !== null) {
        const text = String(value);
        ctx.fillText(text, x + 8, y + cellHeight * 0.5);
      }

      if (activeCell && activeCell.r === row && activeCell.c === col) {
        ctx.save();
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1.5, y + 1.5, cellWidth - 3, cellHeight - 3);
        ctx.restore();
      }
    }
  }
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  data: SpreadsheetGridData,
  cellWidth: number,
  cellHeight: number,
  peakRow: number | null,
  active: { r: number; c: number } | null,
  row: number,
  col: number
): void {
  const x = col * cellWidth;
  const y = row * cellHeight;

  if (row === 0 && col === 0) {
    ctx.fillStyle = "#131e34";
    ctx.fillRect(x, y, cellWidth, cellHeight);
  } else if (row === 0) {
    ctx.fillStyle = "#131e34";
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = "#d1d9eb";
    ctx.font = "12px Segoe UI";
    ctx.textBaseline = "middle";
    ctx.fillText(String.fromCharCode(64 + col), x + 8, y + cellHeight * 0.5);
  } else if (col === 0) {
    ctx.fillStyle = "#131e34";
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = "#d1d9eb";
    ctx.font = "12px Segoe UI";
    ctx.textBaseline = "middle";
    ctx.fillText(String(row), x + 8, y + cellHeight * 0.5);
  } else {
    ctx.fillStyle = peakRow && row === peakRow ? "#fff7d6" : "#0b1220";
    ctx.fillRect(x, y, cellWidth, cellHeight);

    const value = data.cells[cellKey(row, col)] ?? null;
    ctx.fillStyle = "#d1d9eb";
    ctx.font = "12px Segoe UI";
    ctx.textBaseline = "middle";

    if (isCellPointer(value)) {
      drawPointerBadge(ctx, x + 6, y + 6, Math.min(cellWidth, cellHeight) - 12);
      ctx.fillStyle = "#f8bf4d";
      ctx.font = "11px Segoe UI";
      ctx.fillText("linked", x + 22, y + cellHeight * 0.5);
      ctx.fillStyle = "#d1d9eb";
      ctx.font = "12px Segoe UI";
    } else if (value !== null) {
      ctx.fillText(String(value), x + 8, y + cellHeight * 0.5);
    }

    if (active && active.r === row && active.c === col) {
      ctx.save();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1.5, y + 1.5, cellWidth - 3, cellHeight - 3);
      ctx.restore();
    }
  }

  ctx.strokeStyle = "#24314d";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellWidth, cellHeight);
}

export default function SpreadsheetGrid({
  data,
  cellWidth = 100,
  cellHeight = 28,
  viewportWidth = 620,
  viewportHeight = 308,
  revision = 0,
  peakRow = null,
  focusRow = null,
  focusCol = 1
}: SpreadsheetGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // 持久資料快照
  const dataRef = useRef<SpreadsheetGridData>(data);
  // 選取中的格子
  const activeCell = useRef<{ r: number; c: number } | null>(null);
  const invalidatedCells = useRef<Set<string>>(new Set());

  function drawCurrentGrid() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    drawGrid(canvas, dataRef.current, cellWidth, cellHeight, peakRow, activeCell.current);
  }

  function drawDirtyCells() {
    const canvas = canvasRef.current;
    if (!canvas || invalidatedCells.current.size === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.save();
    for (const key of invalidatedCells.current) {
      const [rowText, colText] = key.split(":");
      const row = Number(rowText);
      const col = Number(colText);
      if (!Number.isFinite(row) || !Number.isFinite(col)) {
        continue;
      }

      drawCell(ctx, dataRef.current, cellWidth, cellHeight, peakRow, activeCell.current, row, col);
    }
    ctx.restore();
    invalidatedCells.current.clear();
  }

  function invalidateCell(row: number, col: number) {
    if (row <= 0 || col <= 0) {
      return;
    }

    if (row > dataRef.current.rows || col > dataRef.current.cols) {
      return;
    }

    invalidatedCells.current.add(cellKey(row, col));
  }

  useEffect(() => {
    dataRef.current = data;
    drawCurrentGrid();
  }, [data, cellWidth, cellHeight, peakRow]);

  useEffect(() => {
    if (!focusRow || !focusCol) {
      return;
    }

    activeCell.current = { r: focusRow, c: focusCol };
    const viewport = viewportRef.current;
    if (viewport) {
      const targetLeft = Math.max(focusCol * cellWidth - viewport.clientWidth / 2 + cellWidth * 0.5, 0);
      const targetTop = Math.max(focusRow * cellHeight - viewport.clientHeight / 2 + cellHeight * 0.5, 0);
      viewport.scrollTo({ left: targetLeft, top: targetTop, behavior: "smooth" });
    }
    drawCurrentGrid();
  }, [focusRow, focusCol, cellWidth, cellHeight, revision, peakRow]);

  useEffect(() => {
    drawCurrentGrid();
  }, [revision]);

  function getCanvasPosition(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // 命中測試：根據 offsetX/Y 算出 row, col
  function hitTestCell(x: number, y: number) {
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    return { row, col };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const position = getCanvasPosition(e);
    if (!position) {
      return;
    }

    const { row, col } = hitTestCell(position.x, position.y);
    if (row > 0 && col > 0 && row <= dataRef.current.rows && col <= dataRef.current.cols) {
      const previous = activeCell.current;
      if (previous) {
        invalidateCell(previous.r, previous.c);
      }
      activeCell.current = { r: row, c: col };
      invalidateCell(row, col);
      drawDirtyCells();
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const active = activeCell.current;
      if (!active) return;
      const { r, c } = active;
      const key = cellKey(r, c);
      // 僅允許內容格
      if (r <= 0 || c <= 0) return;
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        let prev = dataRef.current.cells[key] ?? "";
        if (typeof prev !== "string" && typeof prev !== "number") prev = "";
        const newVal = String(prev) + e.key;
        dataRef.current.cells[key] = newVal;
        drawCurrentGrid();
        e.preventDefault();
      } else if (e.key === "Backspace") {
        let prev = dataRef.current.cells[key] ?? "";
        if (typeof prev !== "string" && typeof prev !== "number") prev = "";
        const newVal = String(prev).slice(0, -1);
        dataRef.current.cells[key] = newVal;
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

        invalidateCell(r, c);
        activeCell.current = { r: nextRow, c: nextCol };
        invalidateCell(nextRow, nextCol);
        drawDirtyCells();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="spreadsheet-grid-shell" style={{ maxWidth: viewportWidth }}>
      <div className="spreadsheet-grid-toolbar">
        <span>Spreadsheet Canvas</span>
        {focusRow ? <span className="spreadsheet-focus-chip">定位到第 {focusRow} 列</span> : null}
      </div>
      <div
        ref={viewportRef}
        className="spreadsheet-grid-viewport"
        style={{ width: viewportWidth, height: viewportHeight }}
      >
        <canvas
          ref={canvasRef}
          className="spreadsheet-grid"
          aria-label="Office canvas spreadsheet grid"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          style={{ outline: "none" }}
        />
      </div>
    </div>
  );
}

export function createDemoSpreadsheetData(): SpreadsheetGridData {
  return {
    rows: 24,
    cols: 12,
    cells: {
      [cellKey(1, 1)]: "time",
      [cellKey(1, 2)]: "sensor_A",
      [cellKey(1, 3)]: "sensor_B",
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
  return useMemo(() => createDemoSpreadsheetData(), []);
}
