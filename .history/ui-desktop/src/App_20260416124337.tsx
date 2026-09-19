import { useEffect, useMemo, useState } from "react";
import { ScientificChart } from "./components/OfficeCanvas/ScientificChart";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import MatrixDashboard from "./components/MatrixDashboard";
import NoteEditor from "./components/NoteEditor";
import StarGraph, { type StarGraphEdge, type StarGraphNode } from "./components/StarGraph";
import SpreadsheetGrid, {
  type CellPointer,
  createDemoSpreadsheetData,
  type SpreadsheetGridData
} from "./components/OfficeCanvas/SpreadsheetGrid";

type PeakResult = { index: number; voltage: number; current: number };

type GraphNodeSnapshot = {
  id: string;
  label: string;
  properties: Record<string, string>;
  content?: unknown;
};

type GraphStateSnapshot = {
  nodes: GraphNodeSnapshot[];
  edges: Array<{ id: string; from: string; to: string; label: string }>;
  deleted_edges: string[];
  op_count: number;
};

type GraphUpdatedPayload = string | { kind?: string; op_ids?: string[]; label?: string };

type NoteDocument = {
  title: string;
  content: string;
};

type WorkspaceView = "spreadsheet" | "note";

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

function normalizeGraphNodeType(properties: Record<string, string>): string {
  if (typeof properties.type === "string" && properties.type.trim()) {
    return properties.type.trim().toLowerCase();
  }

  if (typeof properties.ingest_format === "string" && properties.ingest_format.trim()) {
    return properties.ingest_format.trim().toLowerCase();
  }

  return "instrument_data";
}

function parseContentObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseNoteDocument(node: GraphNodeSnapshot): NoteDocument {
  const contentObject = parseContentObject(node.content);
  const title =
    typeof contentObject?.title === "string" && contentObject.title.trim()
      ? contentObject.title
      : node.label || "Untitled Note";

  return {
    title,
    content: typeof contentObject?.content === "string" ? contentObject.content : ""
  };
}

function resolveSpreadsheetAnchor(node: GraphNodeSnapshot): number {
  const rawAnchor = Number(node.properties.grid_anchor_row ?? 2);
  return Number.isFinite(rawAnchor) && rawAnchor >= 2 ? rawAnchor : 2;
}

function getGraphNodeLabel(node: GraphNodeSnapshot): string {
  if (normalizeGraphNodeType(node.properties) === "note") {
    return parseNoteDocument(node).title;
  }

  return node.label;
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
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("spreadsheet");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<NoteDocument>({ title: "", content: "" });
  const [noteSaving, setNoteSaving] = useState(false);

  const metadataEntries = useMemo(() => {
    if (!metadata || typeof metadata !== "object") {
      return [] as Array<[string, unknown]>;
    }

    return Object.entries(metadata as Record<string, unknown>);
  }, [metadata]);

  const graphNodes = useMemo<StarGraphNode[]>(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.nodes.map((node) => ({
      id: node.id,
      label: getGraphNodeLabel(node),
      type: normalizeGraphNodeType(node.properties)
    }));
  }, [snapshot]);

  const graphEdges = useMemo<StarGraphEdge[]>(() => {
    if (!snapshot) {
      return [];
    }

    const deletedEdges = new Set(snapshot.deleted_edges);
    return snapshot.edges
      .filter((edge) => !deletedEdges.has(edge.id))
      .map((edge) => ({
        source_id: edge.from,
        target_id: edge.to,
        label: edge.label
      }));
  }, [snapshot]);

  const selectedGraphNode = useMemo(() => {
    if (!snapshot || !selectedNodeId) {
      return null;
    }

    return snapshot.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [snapshot, selectedNodeId]);

  const fetchState = async (): Promise<GraphStateSnapshot | null> => {
    setLoading(true);
    setError(null);
    try {
      const next = await invoke<GraphStateSnapshot>("fetch_graph_state");
      setSnapshot(next);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

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
            void fetchState();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
          return;
        }

        if (typeof event.payload?.label === "string") {
          try {
            applyInstrumentPayload(event.payload.label);
            void fetchState();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
          return;
        }

        const eventKind = event.payload?.kind ?? "graph_changed";
        const opIds = event.payload?.op_ids ?? [];
        if (eventKind === "analysis_commit" && opIds.length) {
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
        }

        void fetchState();
      });
    };

    void setupListener();
    void fetchState();

    return () => {
      if (activeUnlisten) {
        activeUnlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedGraphNode) {
      return;
    }

    if (normalizeGraphNodeType(selectedGraphNode.properties) === "note") {
      setNoteDraft(parseNoteDocument(selectedGraphNode));
      setWorkspaceView("note");
      return;
    }

    setFocusedRow(resolveSpreadsheetAnchor(selectedGraphNode));
  }, [selectedGraphNode]);

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

  const handleGraphNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);

    const targetNode = snapshot?.nodes.find((node) => node.id === nodeId);
    if (!targetNode) {
      return;
    }

    if (normalizeGraphNodeType(targetNode.properties) === "note") {
      setNoteDraft(parseNoteDocument(targetNode));
      setWorkspaceView("note");
      return;
    }

    setFocusedRow(resolveSpreadsheetAnchor(targetNode));
    setWorkspaceView("spreadsheet");
  };

  const handleNoteCreated = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setWorkspaceView("note");
    setNoteDraft({ title: "Untitled Note", content: "" });
  };

  const saveSelectedNote = async () => {
    if (!selectedNodeId) {
      return;
    }

    setNoteSaving(true);
    setError(null);
    try {
      await invoke("update_note_node", {
        nodeId: selectedNodeId,
        title: noteDraft.title,
        content: noteDraft.content
      });
      await fetchState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <main className="app-shell">
      <h1>LabFlow Desktop Shell</h1>
      <p>透過 Tauri IPC 取得 core-engine CRDT 星圖 snapshot。</p>
      <MatrixDashboard />
      <section className="office-canvas-shell">
        <div className="workspace-header">
          <div>
            <h2>Office Scientific Canvas Sandbox</h2>
            <p>資料節點會將畫面切到 Spreadsheet，筆記節點會開啟 NoteEditor。</p>
          </div>
          <div className="view-switcher">
            <button
              type="button"
              className={workspaceView === "spreadsheet" ? "primary-button is-active" : "ghost-button"}
              onClick={() => setWorkspaceView("spreadsheet")}
            >
              Spreadsheet
            </button>
            <button
              type="button"
              className={workspaceView === "note" ? "primary-button is-active" : "ghost-button"}
              onClick={() => setWorkspaceView("note")}
              disabled={!selectedGraphNode || normalizeGraphNodeType(selectedGraphNode.properties) !== "note"}
            >
              Note
            </button>
          </div>
        </div>
        <div className="office-canvas-actions">
          <button onClick={simulateIngestion} disabled={ingestLoading} className="secondary-button">
            {ingestLoading ? "匯入中..." : "模擬匯入儀器數據"}
          </button>
          <button
            onClick={async () => {
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
                setPeakRow(result.index !== undefined ? result.index + 2 : null);
                setFocusedRow(result.index !== undefined ? result.index + 2 : null);
                setPeakIndex(result.index !== undefined ? result.index : undefined);
                setRevision((r) => r + 1);
                setWorkspaceView("spreadsheet");
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              }
            }}
            className="primary-button"
          >
            分析峰值 (Find Peak)
          </button>
          <button onClick={() => void fetchState()} disabled={loading} className="ghost-button">
            {loading ? "同步中..." : "同步星圖狀態"}
          </button>
        </div>
        {selectedGraphNode && (
          <div className="selection-banner">
            <strong>目前選取：</strong>
            <span>{getGraphNodeLabel(selectedGraphNode)}</span>
            <span className="metadata-chip">{normalizeGraphNodeType(selectedGraphNode.properties)}</span>
          </div>
        )}
        {workspaceView === "spreadsheet" ? (
          <>
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
            <SpreadsheetGrid
              data={spreadsheetData}
              revision={revision}
              peakRow={peakRow}
              focusRow={focusedRow}
              focusCol={1}
            />
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
          </>
        ) : selectedGraphNode && normalizeGraphNodeType(selectedGraphNode.properties) === "note" ? (
          <NoteEditor
            title={noteDraft.title}
            content={noteDraft.content}
            saving={noteSaving}
            onTitleChange={(value) => setNoteDraft((prev) => ({ ...prev, title: value }))}
            onContentChange={(value) => setNoteDraft((prev) => ({ ...prev, content: value }))}
            onSave={saveSelectedNote}
            onClose={() => setWorkspaceView("spreadsheet")}
          />
        ) : (
          <section className="note-empty-state">
            <h3>尚未選取筆記節點</h3>
            <p>雙擊星圖空白建立新筆記，或雙擊既有筆記節點開啟編輯器。</p>
          </section>
        )}
      </section>
      {error && <pre className="error">{error}</pre>}
      {snapshot && (
        <section className="graph-panel">
          <div className="graph-panel-header">
            <div>
              <h2>Knowledge Graph 星圖</h2>
              <p>從 CRDT snapshot 解析節點與關係，透過 Canvas 即時模擬力導向佈局與手動血緣連線。</p>
            </div>
            <div className="graph-stats">
              <span>節點 {graphNodes.length}</span>
              <span>邊 {graphEdges.length}</span>
              <span>操作 {snapshot.op_count}</span>
            </div>
          </div>
          <StarGraph
            nodes={graphNodes}
            edges={graphEdges}
            onNodeSelect={handleGraphNodeSelect}
            onNoteCreated={handleNoteCreated}
            onGraphChanged={() => fetchState()}
            onError={(message) => setError(message)}
          />
        </section>
      )}
    </main>
  );
}
