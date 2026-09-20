// ─── SpreadsheetGrid v2 Main Draw Orchestrator ──────────────────────────────
// Coordinates all sub-renderers to paint the full grid onto a single Canvas.

import type {
  SpreadsheetTheme,
  SpreadsheetGridData,
  CellRange,
  GridCell,
} from "../types";
import { normalizeRange } from "../utils";
import { drawCell } from "./drawCell";
import { drawSelectionOverlay } from "./drawSelection";
import { drawFillHandle } from "./drawFillHandle";
import { drawMetaRows, getMetaRowHeight, getTotalMetaHeight } from "./drawMetaRows";

export interface DrawGridOptions {
  canvas: HTMLCanvasElement;
  data: SpreadsheetGridData;
  cellWidth: number;
  cellHeight: number;
  scrollLeft: number;
  scrollTop: number;
  viewportWidth: number;
  viewportHeight: number;
  peakRow: number | null;
  activeCell: GridCell | null;
  selectedRange: CellRange | null;
  fillTargetRange: CellRange | null;
  linkedLabel: string;
  theme: SpreadsheetTheme;
  showMetaRows: boolean;
}

export function drawGrid(options: DrawGridOptions): void {
  const {
    canvas,
    data,
    cellWidth,
    cellHeight,
    scrollLeft,
    scrollTop,
    viewportWidth,
    viewportHeight,
    peakRow,
    activeCell,
    selectedRange,
    fillTargetRange,
    linkedLabel,
    theme,
    showMetaRows,
  } = options;

  try {
    const dpr = window.devicePixelRatio || 1;
    const safeViewportWidth = Math.max(1, Math.floor(viewportWidth));
    const safeViewportHeight = Math.max(1, Math.floor(viewportHeight));

    canvas.width = Math.floor(safeViewportWidth * dpr);
    canvas.height = Math.floor(safeViewportHeight * dpr);
    canvas.style.width = `${safeViewportWidth}px`;
    canvas.style.height = `${safeViewportHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, safeViewportWidth, safeViewportHeight);

    // Background
    ctx.fillStyle = theme.canvasBg;
    ctx.fillRect(0, 0, safeViewportWidth, safeViewportHeight);

    // ── Compute meta area offset ─────────────────────────────────────────
    const metaRowHeight = getMetaRowHeight();
    const totalMetaHeight = showMetaRows ? getTotalMetaHeight() : 0;
    const dataAreaTop = totalMetaHeight;

    // ── Visible range (data rows) ────────────────────────────────────────
    const adjustedScrollTop = scrollTop;
    const startRow = Math.max(1, Math.floor(adjustedScrollTop / cellHeight));
    const endRow = Math.min(
      data.rows,
      Math.ceil((adjustedScrollTop + safeViewportHeight - dataAreaTop) / cellHeight)
    );
    const startCol = Math.max(1, Math.floor(scrollLeft / cellWidth));
    const endCol = Math.min(
      data.cols,
      Math.ceil((scrollLeft + safeViewportWidth) / cellWidth)
    );

    // ── Draw data cells (translated into data area) ──────────────────────
    ctx.save();
    ctx.translate(0, dataAreaTop);
    ctx.save();
    ctx.translate(-scrollLeft, -adjustedScrollTop);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        drawCell(
          ctx, data, cellWidth, cellHeight,
          peakRow, activeCell, selectedRange, linkedLabel,
          theme, row, col
        );
      }
    }

    // Selection overlay
    drawSelectionOverlay(ctx, selectedRange, cellWidth, cellHeight, theme);

    // Fill handle preview
    if (fillTargetRange) {
      const normFill = normalizeRange(fillTargetRange);
      if (normFill) {
        ctx.save();
        ctx.strokeStyle = theme.canvasSelection;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          normFill.left * cellWidth + 0.5,
          normFill.top * cellHeight + 0.5,
          (normFill.right - normFill.left + 1) * cellWidth - 1,
          (normFill.bottom - normFill.top + 1) * cellHeight - 1
        );
        ctx.restore();
      }
    }

    // Fill handle
    drawFillHandle(ctx, selectedRange, cellWidth, cellHeight, theme);

    ctx.restore(); // undo scroll translate

    // ── Sticky column headers (row 0) ────────────────────────────────────
    ctx.save();
    ctx.translate(-scrollLeft, 0);
    for (let col = startCol; col <= endCol; col += 1) {
      drawCell(
        ctx, data, cellWidth, cellHeight,
        peakRow, activeCell, selectedRange, linkedLabel,
        theme, 0, col
      );
    }
    ctx.restore();

    // ── Sticky row headers (col 0) ───────────────────────────────────────
    ctx.save();
    ctx.translate(0, -adjustedScrollTop);
    for (let row = startRow; row <= endRow; row += 1) {
      drawCell(
        ctx, data, cellWidth, cellHeight,
        peakRow, activeCell, selectedRange, linkedLabel,
        theme, row, 0
      );
    }
    ctx.restore();

    // ── Corner cell (0,0) ────────────────────────────────────────────────
    drawCell(
      ctx, data, cellWidth, cellHeight,
      peakRow, activeCell, selectedRange, linkedLabel,
      theme, 0, 0
    );

    ctx.restore(); // undo dataAreaTop translate

    // ── Draw Origin Pro metadata rows (frozen on top) ────────────────────
    if (showMetaRows && data.columnMeta) {
      drawMetaRows(
        ctx, data, cellWidth, metaRowHeight,
        scrollLeft, safeViewportWidth,
        startCol, endCol, theme
      );
    }
  } catch (error) {
    console.error("[SpreadsheetGrid] drawGrid error:", error);
  }
}
