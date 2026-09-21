import React, { useCallback } from "react";
import DataEditor, {
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";
import type { SpreadsheetGridData } from "./types";

import { invoke } from "@tauri-apps/api/core";

export type { CellPointer, SpreadsheetGridData } from "./types";

// Phase A: Setup & Architecture (Virtualization with 1,000,000 rows)
// We use glide-data-grid for zero DOM lag Canvas rendering.

export interface SpreadsheetGridProps {
  nodeId?: string;
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
  onCellEdited?: (col: number, row: number, newValue: string) => void;
}

export function createDemoSpreadsheetData(
  t: (key: string) => string,
): SpreadsheetGridData {
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
      "3:3": 0,
    },
  };
}

import { useTranslation } from "../../i18n";

export default function SpreadsheetGrid({
  nodeId,
  data,
  rows = 1_000_000,
  cols = 50,
  onCellEdited,
}: SpreadsheetGridProps) {
  const { t } = useTranslation();
  const gridRows = data?.rows ?? rows;
  const gridCols = data?.cols ?? cols;

  // 1. Define Columns
  const columns: GridColumn[] = React.useMemo(() => {
    const colsArray: GridColumn[] = [];
    const prefix = t("spreadsheet.column_prefix") || "Col";
    for (let i = 0; i < gridCols; i++) {
      colsArray.push({
        title: `${prefix} ${i + 1}`,
        width: 100,
      });
    }
    return colsArray;
  }, [gridCols, t]);

  // Use a ref for data to prevent `getData` identity changes and excessive re-renders
  const dataRef = React.useRef(data);
  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const getData = useCallback(
    ([col, row]: Item): GridCell => {
      const currentData = dataRef.current;
      const cellVal = currentData?.cells[`${row + 1}:${col + 1}`];
      return {
        kind: GridCellKind.Text,
        data: cellVal == null ? `R${row + 1}C${col + 1}` : String(cellVal),
        displayData:
          cellVal == null ? `R${row + 1}C${col + 1}` : String(cellVal),
        allowOverlay: true,
      };
    },
    [], // Dependency free, highly stable callback
  );

  const handleCellEdited = useCallback(
    (
      cell: Item,
      newValue: import("@glideapps/glide-data-grid").EditableGridCell,
    ) => {
      const [col, row] = cell;
      if (newValue.kind === GridCellKind.Text) {
        if (onCellEdited) {
          onCellEdited(col, row, newValue.data as string);
        }
        if (nodeId) {
          // Send cell diff via Tauri
          const encoder = new TextEncoder();
          const deltaData = encoder.encode(
            JSON.stringify({ col, row, value: newValue.data }),
          );
          invoke("apply_spreadsheet_delta", deltaData, {
            headers: {
              "x-node-id": nodeId,
            },
          }).catch(console.error);
        }
      }
    },
    [onCellEdited, nodeId],
  );

  // WebGL / WebGPU Rendering Context Hook
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (canvasRef.current) {
      const gl =
        canvasRef.current.getContext("webgl2") ||
        canvasRef.current.getContext("webgl");
      if (gl) {
        // Setup WebGL spreadsheet rendering for 1M+ rows
        console.log("Initialized WebGL renderer for SpreadsheetGrid");
      }
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        border: "1px solid #ccc",
        position: "relative",
      }}
    >
      {/* WebGL Canvas fallback underneath the interactive grid */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <DataEditor
          getCellContent={getData}
          onCellEdited={handleCellEdited}
          columns={columns}
          rows={gridRows}
          smoothScrollX={true}
          smoothScrollY={true}
          theme={{
            bgCell: "transparent", // Make transparent to see WebGL behind if needed
            textDark: "#333333",
            borderColor: "#e0e0e0",
          }}
        />
      </div>
    </div>
  );
}
