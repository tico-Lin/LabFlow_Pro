import { useEffect, useMemo, useState } from "react";
import { ScientificChart } from "./components/OfficeCanvas/ScientificChart";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import MatrixDashboard from "./components/MatrixDashboard";
import NoteEditor from "./components/NoteEditor";
import StarGraph, { type StarGraphEdge, type StarGraphNode } from "./components/StarGraph";
import SpreadsheetGrid, {
  type CellPointer,
  createDemoSpreadsheetData,
  type SpreadsheetGridData
} from "./components/OfficeCanvas/SpreadsheetGrid";
import { useTranslation, type Language } from "./i18n";
import en from "./i18n/en";
import zhTW from "./i18n/zh-TW";

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

function normalizeInstrumentFormat(format?: string, fallbackLabel: string): string {
  if (!format) {
    return fallbackLabel;
  }

  const normalized = format.trim().toLowerCase();
  if (normalized === "cv") {
    return "CV";
  }
  if (normalized === "xrd") {
    return "XRD";
  }
  if (!normalized) {
    return fallbackLabel;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getAxisLabels(
  instrumentFormat: string,
  metadata: any,
  t: (key: string) => string
): { x: string; y: string } {
  if (instrumentFormat === "CV") {
    return { x: t("chartLabels.cv.x"), y: t("chartLabels.cv.y") };
  }
  if (instrumentFormat === "XRD") {
    return { x: t("chartLabels.xrd.x"), y: t("chartLabels.xrd.y") };
  }

  return {
    x: typeof metadata?.x_label === "string" ? metadata.x_label : t("chartLabels.default.x"),
    y: typeof metadata?.y_label === "string" ? metadata.y_label : t("chartLabels.default.y")
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
  yValues: number[],
  t: (key: string) => string
): SpreadsheetGridData {
  const cells: SpreadsheetGridData["cells"] = {};
  const axisLabels = getAxisLabels(instrumentFormat, metadata, t);
  const pointCount = Math.min(xValues.length, yValues.length);

  cells["1:1"] = axisLabels.x;
  cells["1:2"] = axisLabels.y;
  cells["1:3"] = t("app.instrument.graphOp");

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

function formatMetadataLabel(key: string, t: (key: string) => string): string {
  const labelMap: Record<string, string> = {
    parser: t("metadata.parser"),
    scan_rate: t("metadata.scan_rate"),
    x_label: t("metadata.x_label"),
    y_label: t("metadata.y_label")
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

function formatMetadataValue(value: unknown, naLabel: string): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return naLabel;
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

function parseNoteDocument(node: GraphNodeSnapshot, fallbackTitle: string): NoteDocument {
  const contentObject = parseContentObject(node.content);
  const title =
    typeof contentObject?.title === "string" && contentObject.title.trim()
      ? contentObject.title
      : node.label || fallbackTitle;

  return {
    title,
    content: typeof contentObject?.content === "string" ? contentObject.content : ""
  };
}

function resolveSpreadsheetAnchor(node: GraphNodeSnapshot): number {
  const rawAnchor = Number(node.properties.grid_anchor_row ?? 2);
  return Number.isFinite(rawAnchor) && rawAnchor >= 2 ? rawAnchor : 2;
}

function getGraphNodeLabel(node: GraphNodeSnapshot, fallbackTitle: string): string {
  if (normalizeGraphNodeType(node.properties) === "note") {
    return parseNoteDocument(node, fallbackTitle).title;
  }

  return node.label;
}

export default function App() {
  const { t, language, changeLanguage } = useTranslation();
  const [snapshot, setSnapshot] = useState<GraphStateSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialGrid = useMemo(() => createDemoSpreadsheetData(t), [t]);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetGridData>(initialGrid);
  const [revision, setRevision] = useState(0);
  const [peakRow, setPeakRow] = useState<number | null>(null);
  // chartData: {x, y}[]
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [peakIndex, setPeakIndex] = useState<number | undefined>(undefined);
  const [instrumentFormat, setInstrumentFormat] = useState<string>(() => t("common.unknown"));
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

  useEffect(() => {
    setSpreadsheetData((prev) => {
      const demoGrid = createDemoSpreadsheetData(t);
      const knownDemoHeaders = new Set<string>([
        en.spreadsheet.demo.time,
        en.spreadsheet.demo.sensorA,
        en.spreadsheet.demo.sensorB,
        zhTW.spreadsheet.demo.time,
        zhTW.spreadsheet.demo.sensorA,
        zhTW.spreadsheet.demo.sensorB,
        t("spreadsheet.demo.time"),
        t("spreadsheet.demo.sensorA"),
        t("spreadsheet.demo.sensorB")
      ]);
      const isDemoGrid =
        typeof prev.cells["1:1"] === "string" &&
        typeof prev.cells["1:2"] === "string" &&
        typeof prev.cells["1:3"] === "string" &&
        knownDemoHeaders.has(prev.cells["1:1"]) &&
        knownDemoHeaders.has(prev.cells["1:2"]) &&
        knownDemoHeaders.has(prev.cells["1:3"]);

      if (!chartData.length && isDemoGrid) {
        return demoGrid;
      }

      return prev;
    });

    setInstrumentFormat((prev) => {
      if (
        prev === en.common.unknown ||
        prev === zhTW.common.unknown ||
        prev === t("common.unknown")
      ) {
        return t("common.unknown");
      }

      return prev;
    });
  }, [chartData.length, t]);

  const selectedGraphNodeLabel = useMemo(() => {
    if (!selectedGraphNode) {
      return null;
    }

    return normalizeGraphNodeType(selectedGraphNode.properties) === "note"
      ? parseNoteDocument(selectedGraphNode, t("note.untitled")).title
      : selectedGraphNode.label;
  }, [selectedGraphNode, t]);

  const selectedGraphNodeTypeLabel = useMemo(() => {
    if (!selectedGraphNode) {
      return null;
    }

    const type = normalizeGraphNodeType(selectedGraphNode.properties);
    return t(`graph.nodeTypes.${type}`) === `graph.nodeTypes.${type}`
      ? t("graph.nodeTypes.unknown")
      : t(`graph.nodeTypes.${type}`);
  }, [selectedGraphNode, t]);

  const graphNodes = useMemo<StarGraphNode[]>(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.nodes.map((node) => ({
      id: node.id,
      label: getGraphNodeLabel(node, t("note.untitled")),
      type: normalizeGraphNodeType(node.properties)
    }));
  }, [snapshot, t]);

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
      const nextFormat = normalizeInstrumentFormat(parsed.instrument_format, t("common.unknown"));
      const nextMetadata = parsed.metadata ?? null;
      const xValues = toNumericArray(parsed.data?.x);
      const yValues = toNumericArray(parsed.data?.y);
      const pointCount = Math.min(xValues.length, yValues.length);

      if (pointCount === 0) {
        throw new Error(t("errors.noPlotData"));
      }

      const nextChartData = Array.from({ length: pointCount }, (_, index) => ({
        x: xValues[index],
        y: yValues[index]
      }));

      setInstrumentFormat(nextFormat);
      setMetadata(nextMetadata);
      setChartData(nextChartData);
      setSpreadsheetData((prev) =>
        buildSpreadsheetFromPayload(prev, nextFormat, nextMetadata, xValues, yValues, t)
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
  }, [t]);

  useEffect(() => {
    if (!selectedGraphNode) {
      return;
    }

    if (normalizeGraphNodeType(selectedGraphNode.properties) === "note") {
      setNoteDraft(parseNoteDocument(selectedGraphNode, t("note.untitled")));
      setWorkspaceView("note");
      return;
    }

    setFocusedRow(resolveSpreadsheetAnchor(selectedGraphNode));
  }, [selectedGraphNode, t]);

  const importInstrumentData = async () => {
    setIngestLoading(true);
    setError(null);
    try {
      const selectedPath = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Experimental Data",
            extensions: ["csv", "txt", "asc"]
          }
        ]
      });

      if (!selectedPath || Array.isArray(selectedPath)) {
        return;
      }

      const content = await readTextFile(selectedPath);
      await invoke("ingest_real_data", { rawText: content });
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
      setNoteDraft(parseNoteDocument(targetNode, t("note.untitled")));
      setWorkspaceView("note");
      return;
    }

    setFocusedRow(resolveSpreadsheetAnchor(targetNode));
    setWorkspaceView("spreadsheet");
  };

  const handleNoteCreated = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setWorkspaceView("note");
    setNoteDraft({ title: t("note.untitled"), content: "" });
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

  const analyzePeak = async () => {
    const voltages: number[] = [];
    const currents: number[] = [];
    const chartArr: { x: number; y: number }[] = [];

    for (let row = 2; row <= spreadsheetData.rows; row += 1) {
      const voltage = spreadsheetData.cells[`${row}:1`];
      const current = spreadsheetData.cells[`${row}:2`];
      if (typeof voltage === "number" && typeof current === "number") {
        voltages.push(voltage);
        currents.push(current);
        chartArr.push({ x: voltage, y: current });
      }
    }

    setChartData(chartArr);
    if (voltages.length === 0 || currents.length === 0) {
      setError(t("errors.noSpreadsheetData"));
      return;
    }

    try {
      const result = await invoke<PeakResult>("analyze_cv_data", { voltages, currents });
      const nextPeakRow = result.index !== undefined ? result.index + 2 : null;
      setPeakRow(nextPeakRow);
      setFocusedRow(nextPeakRow);
      setPeakIndex(result.index !== undefined ? result.index : undefined);
      setRevision((prev) => prev + 1);
      setWorkspaceView("spreadsheet");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <main className="app-shell">
      <header className="app-toolbar">
        <div className="toolbar-brand">
          <p className="eyebrow">{t("app.brand.eyebrow")}</p>
          <h1>{t("app.brand.title")}</h1>
          <p>{t("app.brand.description")}</p>
        </div>
        <div className="toolbar-actions">
          <label className="toolbar-language-select">
            <span>{t("common.language")}</span>
            <select
              value={language}
              onChange={(event) => changeLanguage(event.target.value as Language)}
              aria-label={t("common.language")}
            >
              <option value="zh-TW">{t("common.languages.zh-TW")}</option>
              <option value="en">{t("common.languages.en")}</option>
            </select>
          </label>
          <button onClick={importInstrumentData} disabled={ingestLoading} className="secondary-button">
            {ingestLoading ? t("app.toolbar.importing") : t("app.toolbar.import")}
          </button>
          <button onClick={() => void analyzePeak()} className="primary-button">
            {t("app.toolbar.analyzePeak")}
          </button>
          <button onClick={() => void fetchState()} disabled={loading} className="ghost-button">
            {loading ? t("app.toolbar.syncing") : t("app.toolbar.syncGraph")}
          </button>
        </div>
      </header>

      <div className="app-grid">
        <aside className="app-sidebar app-surface">
          <div className="panel-heading">
            <p className="eyebrow">{t("app.sidebar.eyebrow")}</p>
            <h2>{t("app.sidebar.title")}</h2>
            <p>{t("app.sidebar.description")}</p>
          </div>
          {selectedGraphNode && (
            <div className="selection-banner sidebar-selection-banner">
              <strong>{t("app.sidebar.currentSelection")}</strong>
              <span>{selectedGraphNodeLabel}</span>
              <span className="metadata-chip">{selectedGraphNodeTypeLabel}</span>
            </div>
          )}
          <MatrixDashboard />
        </aside>

        <section className="app-main">
          <div className="workspace-header app-surface">
            <div>
              <p className="eyebrow">{t("app.mainView.eyebrow")}</p>
              <h2>{t("app.mainView.title")}</h2>
              <p>{t("app.mainView.description")}</p>
            </div>
            <div className="view-switcher">
              <button
                type="button"
                className={workspaceView === "spreadsheet" ? "primary-button is-active" : "ghost-button"}
                onClick={() => setWorkspaceView("spreadsheet")}
              >
                {t("app.mainView.spreadsheet")}
              </button>
              <button
                type="button"
                className={workspaceView === "note" ? "primary-button is-active" : "ghost-button"}
                onClick={() => setWorkspaceView("note")}
                disabled={!selectedGraphNode || normalizeGraphNodeType(selectedGraphNode.properties) !== "note"}
              >
                {t("app.mainView.note")}
              </button>
            </div>
          </div>

          {workspaceView === "spreadsheet" ? (
            <>
              <section className="office-canvas-shell app-surface workbench-panel">
                <div className="instrument-summary">
                  <div>
                    <strong>{t("app.instrument.currentFormat")}</strong>
                    <span>{instrumentFormat}</span>
                  </div>
                  <div className="metadata-list">
                    {metadataEntries.length > 0 ? (
                      metadataEntries.map(([key, value]) => (
                        <span key={key} className="metadata-chip">
                          {formatMetadataLabel(key, t)}：{formatMetadataValue(value, t("common.na"))}
                        </span>
                      ))
                    ) : (
                      <span className="metadata-chip">{t("app.instrument.noMetadata")}</span>
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
              </section>
              <section className="chart-shell app-surface workbench-panel">
                <div className="panel-heading compact-panel-heading">
                  <div>
                    <p className="eyebrow">{t("app.chart.eyebrow")}</p>
                    <h3>{t("app.chart.title")}</h3>
                    <p>{t("app.chart.description")}</p>
                  </div>
                  {chartData.length > 0 && typeof peakIndex === "number" && (
                    <button
                      className="primary-button"
                      onClick={async () => {
                        if (typeof peakIndex !== "number" || !chartData[peakIndex]) {
                          return;
                        }

                        const { x: voltage, y: current } = chartData[peakIndex];
                        setError(null);
                        try {
                          await invoke("commit_agent_analysis", {
                            peakIndex,
                            voltage,
                            current
                          });
                          await fetchState();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : String(err));
                        }
                      }}
                    >
                      {t("app.chart.commit")}
                    </button>
                  )}
                </div>
                <ScientificChart
                  data={chartData}
                  instrumentFormat={instrumentFormat}
                  peakIndex={peakIndex}
                  width={960}
                  height={360}
                />
              </section>
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
            <section className="note-empty-state app-surface">
              <h3>{t("app.noteEmpty.title")}</h3>
              <p>{t("app.noteEmpty.description")}</p>
            </section>
          )}

          {error && <pre className="error">{error}</pre>}
        </section>

        <aside className="app-right-panel app-surface">
          <div className="graph-panel-header">
            <div>
              <p className="eyebrow">{t("app.rightPanel.eyebrow")}</p>
              <h2>{t("app.rightPanel.title")}</h2>
              <p>{t("app.rightPanel.description")}</p>
            </div>
            {snapshot && (
              <div className="graph-stats">
                <span>{t("app.graphStats.nodes", { count: graphNodes.length })}</span>
                <span>{t("app.graphStats.edges", { count: graphEdges.length })}</span>
                <span>{t("app.graphStats.operations", { count: snapshot.op_count })}</span>
              </div>
            )}
          </div>
          {snapshot ? (
            <StarGraph
              nodes={graphNodes}
              edges={graphEdges}
              onNodeSelect={handleGraphNodeSelect}
              onNoteCreated={handleNoteCreated}
              onGraphChanged={async () => {
                await fetchState();
              }}
              onError={(message) => setError(message)}
            />
          ) : (
            <section className="note-empty-state graph-empty-state">
              <h3>{t("app.graphEmpty.title")}</h3>
              <p>{t("app.graphEmpty.description")}</p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
