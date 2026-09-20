// ─── SpreadsheetGrid v2 Type Definitions ─────────────────────────────────────
// Extracted from SpreadsheetGrid.tsx and extended with Origin Pro + Excel types.

// ─── Theme ───────────────────────────────────────────────────────────────────

export type SpreadsheetTheme = {
  canvasBg: string;
  canvasHeaderBg: string;
  canvasGrid: string;
  canvasText: string;
  canvasHighlight: string;
  canvasHighlightText: string;
  canvasLinked: string;
  canvasSelection: string;
  canvasMetaBg: string;
  canvasMetaBorder: string;
  canvasMetaText: string;
  canvasMetaLabelBg: string;
  canvasFillHandle: string;
};

// ─── CRDT Cell Pointer ───────────────────────────────────────────────────────

export type UUID = string;

export type CellPointer = {
  kind: "pointer";
  opId: UUID;
};

// ─── Cell Formula (Excel-style) ──────────────────────────────────────────────

export type CellFormula = {
  kind: "formula";
  expression: string;
  cachedValue: string | number | null;
};

// ─── Cell Value ──────────────────────────────────────────────────────────────

export type CellValue = string | number | CellPointer | CellFormula | null;

// ─── Column Role (Origin Pro) ────────────────────────────────────────────────

export type ColumnRole = "X" | "Y" | "Z" | "XErr" | "YErr" | "Label" | "None";

// ─── Column Metadata (Origin Pro frozen header rows) ─────────────────────────

export type ColumnMeta = {
  longName: string;
  units: string;
  comments: string;
  role: ColumnRole;
  formula: string;
};

// ─── Meta Row Identifiers ────────────────────────────────────────────────────

export const META_ROW_LABELS = ["Long Name", "Units", "Comments", "Role", "F(x)"] as const;
export type MetaRowKey = "longName" | "units" | "comments" | "role" | "formula";
export const META_ROW_KEYS: MetaRowKey[] = ["longName", "units", "comments", "role", "formula"];
export const META_ROW_COUNT = META_ROW_KEYS.length;

// ─── Grid Data ───────────────────────────────────────────────────────────────

export type SpreadsheetGridData = {
  rows: number;
  cols: number;
  cells: Record<string, CellValue>;
  columnMeta?: Record<number, Partial<ColumnMeta>>;
};

// ─── Grid Coordinates ────────────────────────────────────────────────────────

export type GridCell = {
  r: number;
  c: number;
};

export type CellRange = {
  start: GridCell;
  end: GridCell;
};

// ─── Component Props ─────────────────────────────────────────────────────────

export type SpreadsheetGridProps = {
  data: SpreadsheetGridData;
  cellWidth?: number;
  cellHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  themeName?: string;
  revision?: number;
  peakRow?: number | null;
  focusRow?: number | null;
  focusCol?: number | null;
  resizable?: boolean;
  fillContainer?: boolean;
  onColumnMetaChange?: (col: number, key: MetaRowKey, value: string) => void;
  onFormulaSubmit?: (col: number, formula: string) => void;
  onCellFormulaSubmit?: (row: number, col: number, expression: string) => void;
};

// ─── Context Menu ────────────────────────────────────────────────────────────

export type ContextMenuAction =
  | "insertColumn"
  | "deleteColumn"
  | "setRoleX"
  | "setRoleY"
  | "setRoleZ"
  | "setRoleNone"
  | "clearContent"
  | "applyFormulaToColumn";

export type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
  targetCol: number;
  targetRow: number;
} | null;

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isCellPointer(value: CellValue): value is CellPointer {
  return typeof value === "object" && value !== null && (value as CellPointer).kind === "pointer";
}

export function isCellFormula(value: CellValue): value is CellFormula {
  return typeof value === "object" && value !== null && (value as CellFormula).kind === "formula";
}

// ─── Default Column Meta ─────────────────────────────────────────────────────

export function createDefaultColumnMeta(): ColumnMeta {
  return {
    longName: "",
    units: "",
    comments: "",
    role: "None",
    formula: "",
  };
}

export const ALL_COLUMN_ROLES: ColumnRole[] = ["X", "Y", "Z", "XErr", "YErr", "Label", "None"];

