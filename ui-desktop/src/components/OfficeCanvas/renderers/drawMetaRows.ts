import type { SpreadsheetTheme, SpreadsheetGridData, ColumnMeta, MetaRowKey } from "../types";
import { META_ROW_KEYS, META_ROW_COUNT, createDefaultColumnMeta } from "../types";

/** Row labels displayed in col 0 of the meta area */
const META_ROW_DISPLAY_LABELS: Record<MetaRowKey, string> = {
  longName: "Long Name",
  units: "Units",
  comments: "Comments",
  role: "Role",
  formula: "F(x)",
};

/** Role badge colors */
const ROLE_COLORS: Record<string, string> = {
  X: "#3b82f6",
  Y: "#22c55e",
  Z: "#a855f7",
  XErr: "#f59e0b",
  YErr: "#ef4444",
  Label: "#64748b",
  None: "",
};

export function drawMetaRows(
  ctx: CanvasRenderingContext2D,
  data: SpreadsheetGridData,
  cellWidth: number,
  metaRowHeight: number,
  scrollLeft: number,
  viewportWidth: number,
  startCol: number,
  endCol: number,
  theme: SpreadsheetTheme
): void {
  const totalMetaHeight = META_ROW_COUNT * metaRowHeight;

  // Background for entire meta area
  ctx.fillStyle = theme.canvasMetaBg;
  ctx.fillRect(0, 0, viewportWidth, totalMetaHeight);

  // Draw each meta row
  for (let metaIdx = 0; metaIdx < META_ROW_COUNT; metaIdx++) {
    const rowKey = META_ROW_KEYS[metaIdx];
    const y = metaIdx * metaRowHeight;

    // Col 0 label (sticky)
    ctx.fillStyle = theme.canvasMetaLabelBg;
    ctx.fillRect(0, y, cellWidth, metaRowHeight);
    ctx.fillStyle = theme.canvasMetaText;
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(META_ROW_DISPLAY_LABELS[rowKey], 8, y + metaRowHeight * 0.5);

    // Horizontal border
    ctx.strokeStyle = theme.canvasMetaBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + metaRowHeight);
    ctx.lineTo(viewportWidth, y + metaRowHeight);
    ctx.stroke();

    // Data columns
    ctx.save();
    ctx.translate(-scrollLeft, 0);

    for (let col = startCol; col <= endCol; col++) {
      const colMeta: Partial<ColumnMeta> | undefined = data.columnMeta?.[col];
      const meta = colMeta ? { ...createDefaultColumnMeta(), ...colMeta } : createDefaultColumnMeta();
      const cx = col * cellWidth;
      const value = meta[rowKey] ?? "";

      // Cell background
      ctx.fillStyle = theme.canvasMetaBg;
      ctx.fillRect(cx, y, cellWidth, metaRowHeight);

      // Vertical grid line
      ctx.strokeStyle = theme.canvasMetaBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + cellWidth, y);
      ctx.lineTo(cx + cellWidth, y + metaRowHeight);
      ctx.stroke();

      // Render value
      if (rowKey === "role" && value && value !== "None") {
        // Draw role badge
        const badgeColor = ROLE_COLORS[value] || theme.canvasMetaText;
        const textWidth = ctx.measureText(value).width;
        const badgeWidth = textWidth + 12;
        const badgeX = cx + 6;
        const badgeY = y + (metaRowHeight - 18) / 2;

        ctx.fillStyle = badgeColor;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, 18, 4);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = badgeColor;
        ctx.font = "bold 11px 'Segoe UI', sans-serif";
        ctx.fillText(value, badgeX + 6, y + metaRowHeight * 0.5);
      } else if (rowKey === "formula" && value) {
        // Draw formula with monospace font
        ctx.fillStyle = "#60a5fa";
        ctx.font = "italic 11px 'Cascadia Code', 'Consolas', monospace";
        ctx.fillText(String(value), cx + 8, y + metaRowHeight * 0.5);
      } else {
        ctx.fillStyle = theme.canvasMetaText;
        ctx.font = "11px 'Segoe UI', sans-serif";
        ctx.fillText(String(value), cx + 8, y + metaRowHeight * 0.5);
      }
    }

    ctx.restore();
  }

  // Bottom separator (thick line between meta area and data area)
  ctx.strokeStyle = theme.canvasSelection;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, totalMetaHeight);
  ctx.lineTo(viewportWidth, totalMetaHeight);
  ctx.stroke();
}

export function getMetaRowHeight(): number {
  return 24;
}

export function getTotalMetaHeight(): number {
  return META_ROW_COUNT * getMetaRowHeight();
}
