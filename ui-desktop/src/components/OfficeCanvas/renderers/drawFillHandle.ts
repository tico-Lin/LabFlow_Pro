import type { SpreadsheetTheme, CellRange } from "../types";
import { normalizeRange } from "../utils";

export const FILL_HANDLE_SIZE = 6;

export function drawFillHandle(
  ctx: CanvasRenderingContext2D,
  selectedRange: CellRange | null,
  cellWidth: number,
  cellHeight: number,
  theme: SpreadsheetTheme
): void {
  const normalized = normalizeRange(selectedRange);
  if (!normalized) return;

  const handleX = (normalized.right + 1) * cellWidth - FILL_HANDLE_SIZE / 2;
  const handleY = (normalized.bottom + 1) * cellHeight - FILL_HANDLE_SIZE / 2;

  ctx.save();
  ctx.fillStyle = theme.canvasFillHandle;
  ctx.fillRect(handleX - FILL_HANDLE_SIZE / 2, handleY - FILL_HANDLE_SIZE / 2, FILL_HANDLE_SIZE, FILL_HANDLE_SIZE);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(handleX - FILL_HANDLE_SIZE / 2, handleY - FILL_HANDLE_SIZE / 2, FILL_HANDLE_SIZE, FILL_HANDLE_SIZE);
  ctx.restore();
}

export function hitTestFillHandle(
  x: number,
  y: number,
  selectedRange: CellRange | null,
  cellWidth: number,
  cellHeight: number
): boolean {
  const normalized = normalizeRange(selectedRange);
  if (!normalized) return false;

  const handleX = (normalized.right + 1) * cellWidth;
  const handleY = (normalized.bottom + 1) * cellHeight;
  const tolerance = FILL_HANDLE_SIZE + 2;

  return (
    Math.abs(x - handleX) <= tolerance &&
    Math.abs(y - handleY) <= tolerance
  );
}
