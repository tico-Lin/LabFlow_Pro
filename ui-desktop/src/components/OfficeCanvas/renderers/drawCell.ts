import type { SpreadsheetTheme, CellRange, SpreadsheetGridData } from "../types";
import { isCellPointer, isCellFormula } from "../types";
import { cellKey, getRenderableCellText, isCellInRange, colToLetter } from "../utils";
import { drawPointerBadge } from "./drawPointerBadge";

export function drawCell(
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
    // Corner cell
    ctx.fillStyle = theme.canvasHeaderBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);
  } else if (row === 0) {
    // Column header - use letters A, B, C...
    ctx.fillStyle = theme.canvasHeaderBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = theme.canvasText;
    ctx.font = "bold 12px 'Segoe UI', sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(colToLetter(col), x + cellWidth * 0.5, y + cellHeight * 0.5);
    ctx.textAlign = "left";
  } else if (col === 0) {
    // Row header - use numbers 1, 2, 3...
    ctx.fillStyle = theme.canvasHeaderBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = theme.canvasText;
    ctx.font = "12px 'Segoe UI', sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(String(row), x + cellWidth * 0.5, y + cellHeight * 0.5);
    ctx.textAlign = "left";
  } else {
    // Data cell
    ctx.fillStyle = isHighlighted ? theme.canvasHighlight : theme.canvasBg;
    ctx.fillRect(x, y, cellWidth, cellHeight);

    // Selection overlay
    if (isCellInRange(row, col, selectedRange)) {
      ctx.save();
      ctx.fillStyle = theme.canvasSelection;
      ctx.globalAlpha = active && active.r === row && active.c === col ? 0.18 : 0.1;
      ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
      ctx.restore();
    }

    const value = data.cells[cellKey(row, col)] ?? null;
    ctx.fillStyle = baseTextColor;
    ctx.font = "12px 'Segoe UI', sans-serif";
    ctx.textBaseline = "middle";

    if (isCellPointer(value)) {
      drawPointerBadge(ctx, x + 6, y + 6, Math.min(cellWidth, cellHeight) - 12, theme);
      ctx.fillStyle = linkedTextColor;
      ctx.font = "11px 'Segoe UI', sans-serif";
      ctx.fillText(linkedLabel, x + 22, y + cellHeight * 0.5);
      ctx.fillStyle = baseTextColor;
      ctx.font = "12px 'Segoe UI', sans-serif";
    } else if (isCellFormula(value)) {
      // Show cached computed value for formulas
      const text = value.cachedValue !== null ? String(value.cachedValue) : "";
      if (text) {
        ctx.fillStyle = "#60a5fa"; // subtle blue for formula cells
        ctx.fillText(text, x + 8, y + cellHeight * 0.5);
        ctx.fillStyle = baseTextColor;
      }
    } else if (value !== null) {
      const text = getRenderableCellText(value);
      if (text) {
        ctx.fillText(text, x + 8, y + cellHeight * 0.5);
      }
    }

    // Active cell border
    if (active && active.r === row && active.c === col) {
      ctx.save();
      ctx.strokeStyle = theme.canvasSelection;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1.5, y + 1.5, cellWidth - 3, cellHeight - 3);
      ctx.restore();
    }
  }

  // Grid lines
  ctx.strokeStyle = theme.canvasGrid;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellWidth, cellHeight);
}
