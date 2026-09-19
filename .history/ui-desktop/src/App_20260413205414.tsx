import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type GraphStateSnapshot = {
  nodes: Array<{ id: string; label: string; properties: Record<string, string> }>;
  edges: Array<{ id: string; from: string; to: string; label: string }>;
  deleted_edges: string[];
  op_count: number;
};

export default function App() {
  const [snapshot, setSnapshot] = useState<GraphStateSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="app-shell">
      <h1>LabFlow Desktop Shell</h1>
      <p>透過 Tauri IPC 取得 core-engine CRDT 星圖 snapshot。</p>
      <button onClick={fetchState} disabled={loading}>
        {loading ? "讀取中..." : "Fetch Graph State"}
      </button>
      {error && <pre className="error">{error}</pre>}
      {snapshot && <pre>{JSON.stringify(snapshot, null, 2)}</pre>}
    </main>
  );
}
