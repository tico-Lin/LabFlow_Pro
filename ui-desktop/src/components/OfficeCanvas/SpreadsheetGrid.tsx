import React, { useCallback } from "react";
import DataEditor, {
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";
import type { SpreadsheetGridData } from "./types";

export type { CellPointer, SpreadsheetGridData } from "./types";

// Phase A: Setup & Architecture (Virtualization with 1,000,000 rows)
// We use glide-data-grid for zero DOM lag Canvas rendering.

export interface SpreadsheetGridProps {
  data?: SpreadsheetGridData;
  rows?: number;
  cols?: number;
  themeName?: string;
  revision?: number;
  peakRow?: number | null;
  focusRow?: number | null;
  focusCol?: number | null;
  resizable?: boolean;
  fillContainer?: boolean;
}

export function createDemoSpreadsheetData(t: (key: string) => string): SpreadsheetGridData {
  return {
    rows: 100,
    cols: 3,
    cells: {
      "1:1": t("spreadsheet.demo.time"),
      "1:2": t("spreadsheet.demo.sensorA"),
      "1:3": t("spreadsheet.demo.sensorB"),
      "2:1": 0,
      "2:2": 0,
      "2:3": 0,
      "3:1": 1,
      "3:2": 0,
      "3:3": 0
    }
  };
}

export default function SpreadsheetGrid({ data, rows = 1_000_000, cols = 50 }: SpreadsheetGridProps) {
  const gridRows = data?.rows ?? rows;
  const gridCols = data?.cols ?? cols;

  // 1. Define Columns
  const columns: GridColumn[] = React.useMemo(() => {
    const colsArray: GridColumn[] = [];
    for (let i = 0; i < gridCols; i++) {
      colsArray.push({
        title: `Col ${i + 1}`,
        width: 100,
      });
    }
    return colsArray;
  }, [gridCols]);

  // 2. Mock Data / Fetching Logic
  // For Phase A, we prove virtualization by dynamically generating cell data on the fly.
  const getData = useCallback(
    ([col, row]: Item): GridCell => {
      return {
        kind: GridCellKind.Text,
        data: data?.cells[`${row + 1}:${col + 1}`] == null
          ? `R${row + 1}C${col + 1}`
          : String(data.cells[`${row + 1}:${col + 1}`]),
        displayData: data?.cells[`${row + 1}:${col + 1}`] == null
          ? `R${row + 1}C${col + 1}`
          : String(data.cells[`${row + 1}:${col + 1}`]),
        allowOverlay: true,
      };
    },
    [data]
  );

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "500px", border: "1px solid #ccc" }}>
      <DataEditor
        getCellContent={getData}
        columns={columns}
        rows={gridRows}
        smoothScrollX={true}
        smoothScrollY={true}
        // Essential for dark mode / custom themes in the future
        theme={{
          bgCell: "#ffffff",
          textDark: "#333333",
          borderColor: "#e0e0e0",
        }}
      />
    </div>
  );
}
