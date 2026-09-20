import { useEffect, useRef } from "react";
// @ts-ignore
import { Parser } from "hot-formula-parser";
import type { SpreadsheetGridData } from "./types";
import { cellKey } from "./utils";

export function useFormulaEngine(data: SpreadsheetGridData) {
  const parserRef = useRef<Parser | null>(null);

  // Initialize parser
  if (!parserRef.current) {
    parserRef.current = new Parser();
  }

  const parser = parserRef.current;

  // We must update the value getter callback whenever data changes, 
  // so the parser can resolve ranges (like A1:A10) to the latest data.
  useEffect(() => {
    parser.on("callCellValue", (cellCoord: any, done: any) => {
      // hot-formula-parser uses 0-based indexing for rows and columns
      // Our SpreadsheetGrid uses 1-based indexing for data, where row 0/col 0 is the header.
      // So cellCoord.row.index = 0 means row 1 in our data.
      const r = cellCoord.row.index + 1;
      const c = cellCoord.column.index + 1;

      const val = data.cells[cellKey(r, c)];
      
      if (typeof val === "number") {
        done(val);
      } else if (typeof val === "string") {
        const num = Number(val);
        done(Number.isNaN(num) ? val : num);
      } else if (val && typeof val === "object" && "kind" in val && val.kind === "formula") {
        done(val.cachedValue ?? 0);
      } else {
        done(0); // empty cell defaults to 0 in math
      }
    });

    parser.on("callRangeValue", (startCellCoord: any, endCellCoord: any, done: any) => {
      const startR = startCellCoord.row.index + 1;
      const startC = startCellCoord.column.index + 1;
      const endR = endCellCoord.row.index + 1;
      const endC = endCellCoord.column.index + 1;

      const fragment = [];
      for (let r = startR; r <= endR; r++) {
        const rowData = [];
        for (let c = startC; c <= endC; c++) {
          const val = data.cells[cellKey(r, c)];
          if (typeof val === "number") {
            rowData.push(val);
          } else if (typeof val === "string") {
            const num = Number(val);
            rowData.push(Number.isNaN(num) ? val : num);
          } else if (val && typeof val === "object" && "kind" in val && val.kind === "formula") {
            rowData.push(val.cachedValue ?? 0);
          } else {
            rowData.push(0);
          }
        }
        fragment.push(rowData);
      }
      done(fragment);
    });

    return () => {
      parser.off("callCellValue");
      parser.off("callRangeValue");
    };
  }, [data]);

  // Evaluate a formula string (e.g. "SUM(A1:B2)")
  const evaluate = (expression: string): number | string | null => {
    const result = parser.parse(expression);
    if (result.error) {
      return `#${result.error}`; // e.g. #DIV/0!, #NAME?
    }
    return result.result;
  };

  return { evaluate, parser };
}
