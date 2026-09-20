import type { SpreadsheetTheme, CellRange } from "../types";
import { normalizeRange } from "../utils";

export function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  selectedRange: CellRange | null,
  cellWidth: number,
  cellHeight: number,
  theme: SpreadsheetTheme
): void {
  const normalized = normalizeRange(selectedRange);
  if (!normalized) return;

  ctx.save();
  ctx.strokeStyle = theme.canvasSelection;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    normalized.left * cellWidth + 1.5,
    normalized.top * cellHeight + 1.5,
    (normalized.right - normalized.left + 1) * cellWidth - 3,
    (normalized.bottom - normalized.top + 1) * cellHeight - 3
  );
  ctx.restore();
}
