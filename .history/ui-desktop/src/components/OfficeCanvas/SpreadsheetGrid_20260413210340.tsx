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
  revision = 0
}: SpreadsheetGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    drawGrid(canvas, data, cellWidth, cellHeight, viewportWidth, viewportHeight);
  }, [data, cellWidth, cellHeight, viewportWidth, viewportHeight, revision]);

  return <canvas ref={canvasRef} className="spreadsheet-grid" aria-label="Office canvas spreadsheet grid" />;
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
