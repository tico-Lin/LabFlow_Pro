import { useEffect, useMemo, useRef } from "react";
import { listen } from "@tauri-apps/api/event";

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
  viewportWidth: number,
  viewportHeight: number
): void {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewportWidth * dpr);
  canvas.height = Math.floor(viewportHeight * dpr);
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);

  const visibleRows = Math.min(data.rows, Math.floor(viewportHeight / cellHeight));
  const visibleCols = Math.min(data.cols, Math.floor(viewportWidth / cellWidth));

  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  ctx.fillStyle = "#131e34";
  ctx.fillRect(0, 0, viewportWidth, cellHeight);
  ctx.fillRect(0, 0, cellWidth, viewportHeight);

  ctx.strokeStyle = "#24314d";
  ctx.lineWidth = 1;

  for (let row = 0; row <= visibleRows; row += 1) {
    const y = row * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(visibleCols * cellWidth, y);
    ctx.stroke();
  }

  for (let col = 0; col <= visibleCols; col += 1) {
    const x = col * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, visibleRows * cellHeight);
    ctx.stroke();
  }

  ctx.textBaseline = "middle";
  ctx.font = "12px Segoe UI";
  ctx.fillStyle = "#d1d9eb";

  for (let col = 1; col < visibleCols; col += 1) {
    const label = String.fromCharCode(64 + col);
    ctx.fillText(label, col * cellWidth + 8, cellHeight * 0.5);
  }

  for (let row = 1; row < visibleRows; row += 1) {
    ctx.fillText(String(row), 8, row * cellHeight + cellHeight * 0.5);
  }

  for (let row = 1; row < visibleRows; row += 1) {
    for (let col = 1; col < visibleCols; col += 1) {
      const key = cellKey(row, col);
      const value = data.cells[key] ?? null;
      const x = col * cellWidth;
      const y = row * cellHeight;

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
    }
  }
}

export default function SpreadsheetGrid({
  data,
  cellWidth = 100,
  cellHeight = 28,
  viewportWidth = 620,
  viewportHeight = 308,
  peakRow = null
}: SpreadsheetGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 持久資料快照
  const dataRef = useRef<SpreadsheetGridData>(data);
  // 髒格座標集合
  const invalidatedCells = useRef<Set<string>>(new Set());
  // rAF 防抖 id
  const rafId = useRef<number | null>(null);
  // 選取中的格子
  const activeCell = useRef<{ r: number; c: number } | null>(null);

  // 初始化全畫面
  useEffect(() => {
    dataRef.current = data;
    const canvas = canvasRef.current;
    if (canvas) {
      drawGrid(canvas, data, cellWidth, cellHeight, viewportWidth, viewportHeight);
    }
  }, [data, cellWidth, cellHeight, viewportWidth, viewportHeight]);

  // 髒矩形局部重繪，支援 activeCell 藍色選取框
  function drawDirtyCells() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grid = dataRef.current;
    const active = activeCell.current;
    for (const key of invalidatedCells.current) {
      // key: "row:col"
      const [row, col] = key.split(":").map(Number);
      const x = col * cellWidth;
      const y = row * cellHeight;
      // 清除該格
      ctx.clearRect(x, y, cellWidth, cellHeight);
      // 若為峰值列，整列底色標示
      if (peakRow && row === peakRow && col > 0) {
        ctx.save();
        ctx.fillStyle = "#fffbe6"; // 淡黃色
        ctx.fillRect(x, y, cellWidth, cellHeight);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = row === 0 || col === 0 ? "#131e34" : "#0b1220";
        ctx.fillRect(x, y, cellWidth, cellHeight);
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = "#24314d";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      ctx.restore();
      // 標頭
      ctx.textBaseline = "middle";
      ctx.font = "12px Segoe UI";
      ctx.fillStyle = "#d1d9eb";
      if (row === 0 && col > 0) {
        const label = String.fromCharCode(64 + col);
        ctx.fillText(label, x + 8, y + cellHeight * 0.5);
      } else if (col === 0 && row > 0) {
        ctx.fillText(String(row), x + 8, y + cellHeight * 0.5);
      } else if (row > 0 && col > 0) {
        // 內容
        const value = grid.cells[key] ?? null;
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
        // 若為 activeCell，畫藍色選取框
        if (active && active.r === row && active.c === col) {
          ctx.save();
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
          ctx.restore();
        }
      }
    }
    invalidatedCells.current.clear();
  }
  // 命中測試：根據 offsetX/Y 算出 row, col
  function hitTestCell(offsetX: number, offsetY: number) {
    const col = Math.floor(offsetX / cellWidth);
    const row = Math.floor(offsetY / cellHeight);
    return { row, col };
  }

  // 滑鼠點擊事件：更新 activeCell 並觸發重繪
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { offsetX, offsetY } = e.nativeEvent;
    const { row, col } = hitTestCell(offsetX, offsetY);
    // 只允許選取內容格
    if (row > 0 && col > 0 && row < dataRef.current.rows && col < dataRef.current.cols) {
      activeCell.current = { r: row, c: col };
      invalidatedCells.current.add(cellKey(row, col));
      scheduleDrawDirty();
    }
  }

  // 鍵盤輸入事件：支援字母/數字與 Backspace
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const active = activeCell.current;
      if (!active) return;
      const { r, c } = active;
      const key = cellKey(r, c);
      // 僅允許內容格
      if (r <= 0 || c <= 0) return;
      // 僅處理單字母/數字/Backspace
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        let prev = dataRef.current.cells[key] ?? "";
        if (typeof prev !== "string" && typeof prev !== "number") prev = "";
        const newVal = String(prev) + e.key;
        dataRef.current.cells[key] = newVal;
        invalidatedCells.current.add(key);
        scheduleDrawDirty();
        e.preventDefault();
      } else if (e.key === "Backspace") {
        let prev = dataRef.current.cells[key] ?? "";
        if (typeof prev !== "string" && typeof prev !== "number") prev = "";
        const newVal = String(prev).slice(0, -1);
        dataRef.current.cells[key] = newVal;
        invalidatedCells.current.add(key);
        scheduleDrawDirty();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // rAF 防抖觸發
  function scheduleDrawDirty() {
    if (rafId.current !== null) return;
    rafId.current = window.requestAnimationFrame(() => {
      drawDirtyCells();
      rafId.current = null;
    });
  }

  // 事件監聽，僅更新髒格與資料快照
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    listen<{ op_ids?: string[] }>("graph-updated", (event) => {
      const opIds = event.payload?.op_ids ?? [];
      if (!opIds.length) return;
      // 只更新 6:2, 7:2, ...
      const grid = dataRef.current;
      let changed = false;
      opIds.forEach((opId, idx) => {
        const row = 6 + idx;
        const col = 2;
        const key = `${row}:${col}`;
        // 更新資料快照
        if (!grid.cells[key] || (typeof grid.cells[key] === "object" && (grid.cells[key] as CellPointer).opId !== opId)) {
          grid.cells[key] = { kind: "pointer", opId };
          invalidatedCells.current.add(key);
          changed = true;
        }
      });
      if (changed) scheduleDrawDirty();
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="spreadsheet-grid"
      aria-label="Office canvas spreadsheet grid"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      style={{ outline: "none" }}
    />
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
