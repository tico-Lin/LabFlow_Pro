// ─── SpreadsheetGrid v2 Utility Functions ────────────────────────────────────

import type {
  CellValue,
  CellRange,
  GridCell,
  SpreadsheetGridData,
} from "./types";
import { isCellPointer } from "./types";

// ─── Cell Key ────────────────────────────────────────────────────────────────

export function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

// ─── Column Letter Conversion ────────────────────────────────────────────────

export function colToLetter(col: number): string {
  let letter = "";
  let n = col;
  while (n > 0) {
    n -= 1;
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26);
  }
  return letter || "A";
}

export function letterToCol(letter: string): number {
  let col = 0;
  for (const char of letter.toUpperCase()) {
    col = col * 26 + (char.charCodeAt(0) - 64);
  }
  return col;
}

// ─── Range Helpers ───────────────────────────────────────────────────────────

export function normalizeRange(
  range: CellRange | null
): { top: number; bottom: number; left: number; right: number } | null {
  if (!range) return null;

  return {
    top: Math.min(range.start.r, range.end.r),
    bottom: Math.max(range.start.r, range.end.r),
    left: Math.min(range.start.c, range.end.c),
    right: Math.max(range.start.c, range.end.c),
  };
}

export function isCellInRange(row: number, col: number, range: CellRange | null): boolean {
  const normalized = normalizeRange(range);
  if (!normalized) return false;

  return (
    row >= normalized.top &&
    row <= normalized.bottom &&
    col >= normalized.left &&
    col <= normalized.right
  );
}

export function getRangeOrigin(
  range: CellRange | null,
  fallback: GridCell | null
): GridCell | null {
  const normalized = normalizeRange(range);
  if (!normalized) return fallback;

  return { r: normalized.top, c: normalized.left };
}

// ─── Cell Text ───────────────────────────────────────────────────────────────

export function getRenderableCellText(value: CellValue): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (isCellPointer(value)) {
    return "";
  }

  // CellFormula — display cached value
  if (typeof value === "object" && "kind" in value && value.kind === "formula") {
    const cached = value.cachedValue;
    if (cached === null || cached === undefined) return "";
    return typeof cached === "number" ? (Number.isFinite(cached) ? String(cached) : "") : String(cached);
  }

  return "";
}

// ─── Clipboard ───────────────────────────────────────────────────────────────

export function buildClipboardText(data: SpreadsheetGridData, range: CellRange | null): string {
  const normalized = normalizeRange(range);
  if (!normalized) return "";

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

export function parsePastedCellValue(raw: string): CellValue {
  const value = raw.trim();
  if (!value) return "";

  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return raw;
}

export function applyPastedText(
  data: SpreadsheetGridData,
  origin: GridCell,
  text: string
): CellRange | null {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const normalizedLines = lines.filter(
    (line, index) => index < lines.length - 1 || line.length > 0
  );

  if (normalizedLines.length === 0) return null;

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
    end: { r: maxRow, c: maxCol },
  };
}

// ─── Range Operations ────────────────────────────────────────────────────────

export function clearRange(data: SpreadsheetGridData, range: CellRange | null): void {
  const normalized = normalizeRange(range);
  if (!normalized) return;

  for (let row = normalized.top; row <= normalized.bottom; row += 1) {
    for (let col = normalized.left; col <= normalized.right; col += 1) {
      data.cells[cellKey(row, col)] = "";
    }
  }
}

// ─── Stress Test Data Generator ──────────────────────────────────────────────

export function createStressTestData(rows: number, cols: number): SpreadsheetGridData {
  const cells: Record<string, CellValue> = {};

  // Header row
  for (let c = 1; c <= cols; c++) {
    cells[cellKey(1, c)] = colToLetter(c);
  }

  // Data rows — only generate visible-range data on demand via cellKey lookup.
  // For stress testing, we pre-populate a sparse subset to prove virtualization.
  const sampleRows = Math.min(rows, 1000);
  for (let r = 2; r <= sampleRows; r++) {
    for (let c = 1; c <= cols; c++) {
      cells[cellKey(r, c)] = Math.round(Math.random() * 10000) / 100;
    }
  }

  return { rows, cols, cells };
}
