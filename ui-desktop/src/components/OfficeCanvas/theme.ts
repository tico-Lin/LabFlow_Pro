// ─── SpreadsheetGrid v2 Theme Reader ─────────────────────────────────────────

import type { SpreadsheetTheme } from "./types";

export function readSpreadsheetTheme(): SpreadsheetTheme {
  const styles = getComputedStyle(document.documentElement);

  const get = (prop: string, fallback: string): string => {
    const val = styles.getPropertyValue(prop).trim();
    return val || fallback;
  };

  return {
    canvasBg: get("--canvas-grid-bg", "#0b1220"),
    canvasHeaderBg: get("--canvas-grid-header-bg", "#131e34"),
    canvasGrid: get("--canvas-grid-line", "#24314d"),
    canvasText: get("--canvas-grid-text", "#d1d9eb"),
    canvasHighlight: get("--canvas-grid-highlight", "#fff7d6"),
    canvasHighlightText: get("--canvas-grid-highlight-text", "#1f2937"),
    canvasLinked: get("--canvas-grid-linked", "#f8bf4d"),
    canvasSelection: get("--canvas-grid-selection", "#2563eb"),
    // New tokens for Origin Pro metadata rows
    canvasMetaBg: get("--canvas-grid-meta-bg", "#1a2744"),
    canvasMetaBorder: get("--canvas-grid-meta-border", "#2e4470"),
    canvasMetaText: get("--canvas-grid-meta-text", "#8fa8cc"),
    canvasMetaLabelBg: get("--canvas-grid-meta-label-bg", "#162038"),
    canvasFillHandle: get("--canvas-grid-fill-handle", "#2563eb"),
  };
}

