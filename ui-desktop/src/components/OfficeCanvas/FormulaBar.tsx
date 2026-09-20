// ─── SpreadsheetGrid v2 Formula Bar ──────────────────────────────────────────
// Displays the active cell address and its formula/value, like Excel's Fx bar.

import { useEffect, useRef, useState } from "react";
import type { GridCell, CellValue } from "./types";
import { isCellFormula, isCellPointer } from "./types";
import { colToLetter } from "./utils";

type FormulaBarProps = {
  activeCell: GridCell | null;
  getCellValue: (row: number, col: number) => CellValue;
  onSubmit: (row: number, col: number, value: string) => void;
};

function formatCellAddress(cell: GridCell | null): string {
  if (!cell) return "";
  return `${colToLetter(cell.c)}${cell.r}`;
}

function getEditableText(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (isCellFormula(value)) return `=${value.expression}`;
  if (isCellPointer(value)) return `[Linked: ${value.opId.slice(0, 8)}]`;
  return "";
}

export default function FormulaBar({ activeCell, getCellValue, onSubmit }: FormulaBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Sync input value when active cell changes
  useEffect(() => {
    if (!activeCell || isEditing) return;
    const value = getCellValue(activeCell.r, activeCell.c);
    setInputValue(getEditableText(value));
  }, [activeCell, getCellValue, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeCell) {
        onSubmit(activeCell.r, activeCell.c, inputValue);
        setIsEditing(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (activeCell) {
        const value = getCellValue(activeCell.r, activeCell.c);
        setInputValue(getEditableText(value));
      }
      setIsEditing(false);
      // Return focus to canvas
      const canvas = document.querySelector<HTMLCanvasElement>(".spreadsheet-grid");
      canvas?.focus();
    }
  };

  return (
    <div className="spreadsheet-formula-bar">
      <div className="spreadsheet-formula-bar-address">
        {formatCellAddress(activeCell)}
      </div>
      <div className="spreadsheet-formula-bar-fx">
        <span className="spreadsheet-formula-bar-fx-label">f(x)</span>
        <input
          ref={inputRef}
          type="text"
          className="spreadsheet-formula-bar-input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsEditing(true);
          }}
          onFocus={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          placeholder="= ..."
        />
      </div>
    </div>
  );
}
