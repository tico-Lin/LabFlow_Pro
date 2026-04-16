import { useEffect, useMemo, useState } from "react";
import { ScientificChart } from "./components/OfficeCanvas/ScientificChart";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import MatrixDashboard from "./components/MatrixDashboard";
import SpreadsheetGrid, {
  type CellPointer,
  createDemoSpreadsheetData,
  type SpreadsheetGridData
} from "./components/OfficeCanvas/SpreadsheetGrid";

type PeakResult = { index: number; voltage: number; current: number };

type GraphStateSnapshot = {
  nodes: Array<{ id: string; label: string; properties: Record<string, string> }>;
  edges: Array<{ id: string; from: string; to: string; label: string }>;
  deleted_edges: string[];
  op_count: number;
};

type GraphUpdatedPayload = string | { op_ids?: string[]; label?: string };

type InstrumentDataPayload = {
  instrument_format?: string;
  metadata?: any;
  data?: {
    x?: unknown[];
    y?: unknown[];
  };
};

function normalizeInstrumentFormat(format?: string): string {
  if (!format) {
    return "Unknown";
  }

  const normalized = format.trim().toLowerCase();
  if (normalized === "cv") {
    return "CV";
  }
  if (normalized === "xrd") {
    return "XRD";
  }
  if (!normalized) {
    return "Unknown";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getAxisLabels(instrumentFormat: string, metadata: any): { x: string; y: string } {
  if (instrumentFormat === "CV") {
    return { x: "Voltage (V)", y: "Current (A)" };
  }
  if (instrumentFormat === "XRD") {
    return { x: "2Theta", y: "Intensity" };
  }

  return {
    x: typeof metadata?.x_label === "string" ? metadata.x_label : "X Axis",
    y: typeof metadata?.y_label === "string" ? metadata.y_label : "Y Axis"
  };
}

function toNumericArray(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isFinite(value));
}

function buildSpreadsheetFromPayload(
  source: SpreadsheetGridData,
  instrumentFormat: string,
  metadata: any,
  xValues: number[],
  yValues: number[]
): SpreadsheetGridData {
  const cells: SpreadsheetGridData["cells"] = {};
  const axisLabels = getAxisLabels(instrumentFormat, metadata);
  const pointCount = Math.min(xValues.length, yValues.length);

  cells["1:1"] = axisLabels.x;
  cells["1:2"] = axisLabels.y;
  cells["1:3"] = "Graph Op";

  for (let index = 0; index < pointCount; index += 1) {
    const row = index + 2;
    cells[`${row}:1`] = xValues[index];
    cells[`${row}:2`] = yValues[index];
  }

  return {
    rows: Math.max(source.rows, pointCount + 2),
    cols: source.cols,
    cells
  };
}

function formatMetadataLabel(key: string): string {
  const labelMap: Record<string, string> = {
    parser: "Parser",
    scan_rate: "掃描速率",
    x_label: "X 軸",
    y_label: "Y 軸"
  };

  if (labelMap[key]) {
    return labelMap[key];
  }

  return key
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatMetadataValue(value: unknown): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "N/A";
  }

  return JSON.stringify(value);
}

export default function App() {
  const [snapshot, setSnapshot] = useState<GraphStateSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialGrid = useMemo(() => createDemoSpreadsheetData(), []);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetGridData>(initialGrid);
  const [revision, setRevision] = useState(0);
  const [peakRow, setPeakRow] = useState<number | null>(null);
  // chartData: {x, y}[]
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [peakIndex, setPeakIndex] = useState<number | undefined>(undefined);
  const [instrumentFormat, setInstrumentFormat] = useState<string>("Unknown");
  const [metadata, setMetadata] = useState<any>(null);

  const metadataEntries = useMemo(() => {
    if (!metadata || typeof metadata !== "object") {
      return [] as Array<[string, unknown]>;
    }

    return Object.entries(metadata as Record<string, unknown>);
  }, [metadata]);

  useEffect(() => {
    let activeUnlisten: null | (() => void) = null;

    const applyInstrumentPayload = (rawPayload: string) => {
      const parsed = JSON.parse(rawPayload) as InstrumentDataPayload;
      const nextFormat = normalizeInstrumentFormat(parsed.instrument_format);
      const nextMetadata = parsed.metadata ?? null;
      const xValues = toNumericArray(parsed.data?.x);
      const yValues = toNumericArray(parsed.data?.y);
      const pointCount = Math.min(xValues.length, yValues.length);

      if (pointCount === 0) {
        throw new Error("Rust payload 沒有可繪製的 x / y 數據");
      }

      const nextChartData = Array.from({ length: pointCount }, (_, index) => ({
        x: xValues[index],
        y: yValues[index]
      }));

      setInstrumentFormat(nextFormat);
      setMetadata(nextMetadata);
      setChartData(nextChartData);
      setSpreadsheetData((prev) =>
        buildSpreadsheetFromPayload(prev, nextFormat, nextMetadata, xValues, yValues)
      );
      setPeakIndex(undefined);
      setPeakRow(null);
      setRevision((prev) => prev + 1);
      setError(null);
    };

    const setupListener = async () => {
      activeUnlisten = await listen<GraphUpdatedPayload>("graph-updated", (event) => {
        if (typeof event.payload === "string") {
          try {
            applyInstrumentPayload(event.payload);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
          return;
        }

        if (typeof event.payload?.label === "string") {
          try {
            applyInstrumentPayload(event.payload.label);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
          return;
        }

        const opIds = event.payload?.op_ids ?? [];
        if (!opIds.length) {
          return;
        }

        setSpreadsheetData((prev) => {
          const cells = { ...prev.cells };
          opIds.forEach((opId, index) => {
            const row = 6 + index;
            const col = 3;
            const key = `${row}:${col}`;
            const pointer: CellPointer = { kind: "pointer", opId };
            cells[key] = pointer;
          });

          return { ...prev, cells };
        });

        setRevision((prev) => prev + 1);
      });
    };

    void setupListener();

    return () => {
      if (activeUnlisten) {
        activeUnlisten();
      }
    };
  }, []);

  const fetchState = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await invoke<GraphStateSnapshot>("fetch_graph_state");
      setSnapshot(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const simulateIngestion = async () => {
    setIngestLoading(true);
    setError(null);
    try {
      await invoke("simulate_data_ingestion");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIngestLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <h1>LabFlow Desktop Shell</h1>
      <p>透過 Tauri IPC 取得 core-engine CRDT 星圖 snapshot。</p>
      <MatrixDashboard />
      <section className="office-canvas-shell">
        <h2>Office Scientific Canvas Sandbox</h2>
        <p>CellPointer 指向 CRDT OpId 時會顯示關聯圖標，代表可由核心資料更新觸發重繪。</p>
        <button onClick={simulateIngestion} disabled={ingestLoading} className="secondary-button">
          {ingestLoading ? "匯入中..." : "模擬匯入儀器數據"}
        </button>
        <button
          onClick={async () => {
            // 取 A, B 欄（col=1,2）所有數值（假設 row 2 開始為數據）
            const voltages: number[] = [];
            const currents: number[] = [];
            const chartArr: { x: number; y: number }[] = [];
            for (let row = 2; row <= spreadsheetData.rows; row++) {
              const v = spreadsheetData.cells[`${row}:1`];
              const c = spreadsheetData.cells[`${row}:2`];
              if (typeof v === "number" && typeof c === "number") {
                voltages.push(v);
                currents.push(c);
                chartArr.push({ x: v, y: c });
              }
            }
            setChartData(chartArr);
            if (voltages.length === 0 || currents.length === 0) {
              setError("A、B 欄沒有可用數據");
              return;
            }
            try {
              const result = await invoke<PeakResult>("analyze_cv_data", { voltages, currents });
              setPeakRow(result.index !== undefined ? result.index + 2 : null); // row index 對應資料列
              setPeakIndex(result.index !== undefined ? result.index : undefined);
              setRevision((r) => r + 1);
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
          className="primary-button"
        >
          分析峰值 (Find Peak)
        </button>
        <div className="instrument-summary">
          <div>
            <strong>目前格式：</strong>
            <span>{instrumentFormat}</span>
          </div>
          <div className="metadata-list">
            {metadataEntries.length > 0 ? (
              metadataEntries.map(([key, value]) => (
                <span key={key} className="metadata-chip">
                  {formatMetadataLabel(key)}：{formatMetadataValue(value)}
                </span>
              ))
            ) : (
              <span className="metadata-chip">尚未收到 Metadata</span>
            )}
          </div>
        </div>
        <SpreadsheetGrid data={spreadsheetData} revision={revision} peakRow={peakRow} />
        <div className="chart-shell">
          <ScientificChart
            data={chartData}
            instrumentFormat={instrumentFormat}
            peakIndex={peakIndex}
            width={620}
            height={280}
          />
          {chartData.length > 0 && typeof peakIndex === "number" && (
            <button
              className="primary-button"
              style={{ marginTop: 16 }}
              onClick={async () => {
                if (typeof peakIndex !== "number" || !chartData[peakIndex]) return;
                const { x: voltage, y: current } = chartData[peakIndex];
                setError(null);
                try {
                  await invoke("commit_agent_analysis", {
                    peakIndex: peakIndex,
                    voltage,
                    current
                  });
                  await fetchState();
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                }
              }}
            >
              確認並寫入星圖 (Approve & Commit to Graph)
            </button>
          )}
        </div>
      </section>
      <button onClick={fetchState} disabled={loading}>
        {loading ? "讀取中..." : "Fetch Graph State"}
      </button>
      {error && <pre className="error">{error}</pre>}
      {snapshot && <pre>{JSON.stringify(snapshot, null, 2)}</pre>}
    </main>
  );
}
