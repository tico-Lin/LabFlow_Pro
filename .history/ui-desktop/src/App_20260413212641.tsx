import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import MatrixDashboard from "./components/MatrixDashboard";
import SpreadsheetGrid, {
  type CellPointer,
  createDemoSpreadsheetData,
  type SpreadsheetGridData
} from "./components/OfficeCanvas/SpreadsheetGrid";

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
        <SpreadsheetGrid data={spreadsheetData} revision={revision} />
      </section>
      <button onClick={fetchState} disabled={loading}>
        {loading ? "讀取中..." : "Fetch Graph State"}
      </button>
      {error && <pre className="error">{error}</pre>}
      {snapshot && <pre>{JSON.stringify(snapshot, null, 2)}</pre>}
    </main>
  );
}
