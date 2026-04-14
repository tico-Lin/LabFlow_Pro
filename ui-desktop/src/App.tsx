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

  useEffect(() => {
    let activeUnlisten: null | (() => void) = null;

    const setupListener = async () => {
      activeUnlisten = await listen<{ op_ids?: string[] }>("graph-updated", (event) => {
        const opIds = event.payload?.op_ids ?? [];
        if (!opIds.length) {
          return;
        }

        setSpreadsheetData((prev) => {
          const cells = { ...prev.cells };
          opIds.forEach((opId, index) => {
            const row = 6 + index;
            const col = 2;
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

  // 監控 spreadsheetData，轉換 B, C 欄為 chartData
  useEffect(() => {
    const arr: { x: number; y: number }[] = [];
    for (let row = 2; row <= spreadsheetData.rows; row++) {
      const v = spreadsheetData.cells[`${row}:2`];
      const c = spreadsheetData.cells[`${row}:3`];
      if (typeof v === "number" && typeof c === "number") {
        arr.push({ x: v, y: c });
      }
    }
    setChartData(arr);
  }, [spreadsheetData]);

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
            // 取 B, C 欄（col=2,3）所有數值（假設 row 2 開始為數據）
            const voltages: number[] = [];
            const currents: number[] = [];
            const chartArr: { x: number; y: number }[] = [];
            for (let row = 2; row <= spreadsheetData.rows; row++) {
              const v = spreadsheetData.cells[`${row}:2`];
              const c = spreadsheetData.cells[`${row}:3`];
              if (typeof v === "number" && typeof c === "number") {
                voltages.push(v);
                currents.push(c);
                chartArr.push({ x: v, y: c });
              }
            }
            setChartData(chartArr);
            if (voltages.length === 0 || currents.length === 0) {
              setError("B、C 欄沒有可用數據");
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
        <SpreadsheetGrid data={spreadsheetData} revision={revision} peakRow={peakRow} />
        {/* Chart 放在 SpreadsheetGrid 下方 */}
        <div style={{ marginTop: 24 }}>
          <ScientificChart
            data={chartData}
            peakIndex={peakIndex}
            width={600}
            height={260}
          />
          {/* Approve & Commit to Graph 按鈕 */}
          {chartData.length > 0 && typeof peakIndex === 'number' && (
            <button
              className="primary-button"
              style={{ marginTop: 16 }}
              onClick={async () => {
                if (typeof peakIndex !== 'number' || !chartData[peakIndex]) return;
                const { x: voltage, y: current } = chartData[peakIndex];
                setError(null);
                try {
                  await invoke('commit_agent_analysis', {
                    peakIndex: peakIndex,
                    voltage,
                    current,
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
