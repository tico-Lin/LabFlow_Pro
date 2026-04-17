import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { createDemoSpreadsheetData, type CellPointer, type SpreadsheetGridData } from "./components/OfficeCanvas/SpreadsheetGrid";
import Dashboard from "./pages/Dashboard";
import GraphView from "./pages/GraphView";
import Workbench from "./pages/Workbench";
import { useTranslation, type Language } from "./i18n";
import en from "./i18n/en";
import zhTW from "./i18n/zh-TW";
import {
  buildDataCards,
  buildSpreadsheetFromPayload,
  getGraphNodeLabel,
  normalizeGraphNodeType,
  parseInstrumentPayload,
  parseNoteDocument,
  resolveSpreadsheetAnchor,
  type GraphStateSnapshot,
  type GraphUpdatedPayload,
  type NoteDocument,
  type PeakResult,
  type ThemeName
} from "./app/labflow";
import type { StarGraphEdge, StarGraphNode } from "./components/StarGraph";

const THEME_STORAGE_KEY = "labflow.theme";

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

function SidebarIcon({ kind }: { kind: "dashboard" | "workbench" | "graph" }) {
  if (kind === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="10" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="16" width="6" height="4" rx="1.5" />
      </svg>
    );
  }

  if (kind === "workbench") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5h16v13H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 9.5h8M8 13h5M8 16.5h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="6" cy="8" r="1.7" />
      <circle cx="18" cy="7" r="1.7" />
      <circle cx="17" cy="17" r="1.7" />
      <circle cx="7" cy="18" r="1.7" />
      <path d="M8 8.8 10.2 10.4M13.8 10.2 16.3 8.1M14 13.8 16 16M10.2 13.6 8.1 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const { t, language, changeLanguage } = useTranslation();
  const [theme, setTheme] = useState<ThemeName>(() => getInitialTheme());
  const [snapshot, setSnapshot] = useState<GraphStateSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialGrid = useMemo(() => createDemoSpreadsheetData(t), [t]);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetGridData>(initialGrid);
  const [revision, setRevision] = useState(0);
  const [peakRow, setPeakRow] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ x: number; y: number }>>([]);
  const [peakIndex, setPeakIndex] = useState<number | undefined>(undefined);
  const [instrumentFormat, setInstrumentFormat] = useState<string>(() => t("common.unknown"));
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<NoteDocument>({ title: "", content: "" });
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
        knownDemoHeaders.has(String(prev.cells["1:1"])) &&
        knownDemoHeaders.has(String(prev.cells["1:2"])) &&
        knownDemoHeaders.has(String(prev.cells["1:3"]));

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

  const fetchState = useCallback(async (): Promise<GraphStateSnapshot | null> => {
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
  }, []);

  const applyInstrumentContent = useCallback(
    (content: unknown, fallbackLabel: string) => {
      const parsed = parseInstrumentPayload(content, fallbackLabel, t("common.unknown"));
      if (!parsed) {
        throw new Error(t("errors.noPlotData"));
      }

      setInstrumentFormat(parsed.instrumentFormat);
      setMetadata(parsed.metadata);
      setChartData(parsed.chartData);
      setSpreadsheetData((prev) =>
        buildSpreadsheetFromPayload(
          prev,
          parsed.instrumentFormat,
          parsed.metadata,
          parsed.xValues,
          parsed.yValues,
          t
        )
      );
      setPeakIndex(undefined);
      setPeakRow(null);
      setRevision((prev) => prev + 1);
      setError(null);
    },
    [t]
  );

  const loadNodeIntoWorkbench = useCallback(
    (nodeId: string) => {
      const targetNode = snapshot?.nodes.find((node) => node.id === nodeId);
      if (!targetNode) {
        return false;
      }

      setSelectedNodeId(nodeId);

      if (normalizeGraphNodeType(targetNode.properties) === "note") {
        setNoteDraft(parseNoteDocument(targetNode, t("note.untitled")));
        return false;
      }

      applyInstrumentContent(targetNode.content, targetNode.label || t("common.unknown"));
      setFocusedRow(resolveSpreadsheetAnchor(targetNode));
      return true;
    },
    [applyInstrumentContent, snapshot, t]
  );

  useEffect(() => {
    let activeUnlisten: null | (() => void) = null;

    const setupListener = async () => {
      activeUnlisten = await listen<GraphUpdatedPayload>("graph-updated", (event) => {
        try {
          if (typeof event.payload === "string") {
            applyInstrumentContent(event.payload, t("common.unknown"));
            void fetchState();
            return;
          }

          if (typeof event.payload?.label === "string") {
            applyInstrumentContent(event.payload.label, t("common.unknown"));
            void fetchState();
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
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    };

    void setupListener();
    void fetchState();

    return () => {
      if (activeUnlisten) {
        activeUnlisten();
      }
    };
  }, [applyInstrumentContent, fetchState, t]);

  const selectedGraphNode = useMemo(() => {
    if (!snapshot || !selectedNodeId) {
      return null;
    }

    return snapshot.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [snapshot, selectedNodeId]);

  useEffect(() => {
    if (!selectedGraphNode) {
      return;
    }

    if (normalizeGraphNodeType(selectedGraphNode.properties) === "note") {
      setNoteDraft(parseNoteDocument(selectedGraphNode, t("note.untitled")));
      return;
    }

    setFocusedRow(resolveSpreadsheetAnchor(selectedGraphNode));
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

  const metadataEntries = useMemo(() => {
    if (!metadata) {
      return [] as Array<[string, unknown]>;
    }

    return Object.entries(metadata);
  }, [metadata]);

  const dataCards = useMemo(
    () => buildDataCards(snapshot?.nodes ?? [], t("common.unknown")),
    [snapshot, t]
  );

  const selectedGraphNodeLabel = useMemo(() => {
    if (!selectedGraphNode) {
      return null;
    }

    return getGraphNodeLabel(selectedGraphNode, t("note.untitled"));
  }, [selectedGraphNode, t]);

  const selectedGraphNodeType = useMemo(() => {
    if (!selectedGraphNode) {
      return null;
    }

    return normalizeGraphNodeType(selectedGraphNode.properties);
  }, [selectedGraphNode]);

  const selectedGraphNodeTypeLabel = useMemo(() => {
    if (!selectedGraphNodeType) {
      return null;
    }

    return t(`graph.nodeTypes.${selectedGraphNodeType}`) === `graph.nodeTypes.${selectedGraphNodeType}`
      ? t("graph.nodeTypes.unknown")
      : t(`graph.nodeTypes.${selectedGraphNodeType}`);
  }, [selectedGraphNodeType, t]);

  const importInstrumentData = useCallback(async () => {
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
  }, []);

  const saveSelectedNote = useCallback(async () => {
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
  }, [fetchState, noteDraft.content, noteDraft.title, selectedNodeId]);

  const analyzePeak = useCallback(async () => {
    const voltages: number[] = [];
    const currents: number[] = [];
    const nextChartData: Array<{ x: number; y: number }> = [];

    for (let row = 2; row <= spreadsheetData.rows; row += 1) {
      const voltage = spreadsheetData.cells[`${row}:1`];
      const current = spreadsheetData.cells[`${row}:2`];
      if (typeof voltage === "number" && typeof current === "number") {
        voltages.push(voltage);
        currents.push(current);
        nextChartData.push({ x: voltage, y: current });
      }
    }

    setChartData(nextChartData);
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [spreadsheetData, t]);

  const commitAnalysis = useCallback(async () => {
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
  }, [chartData, fetchState, peakIndex]);

  const handleGraphNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleGraphNodeActivate = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);

      const targetNode = snapshot?.nodes.find((node) => node.id === nodeId);
      if (!targetNode) {
        return { type: "unknown" as const };
      }

      if (normalizeGraphNodeType(targetNode.properties) === "note") {
        setNoteDraft(parseNoteDocument(targetNode, t("note.untitled")));
        return { type: "note" as const };
      }

      try {
        applyInstrumentContent(targetNode.content, targetNode.label || t("common.unknown"));
        setFocusedRow(resolveSpreadsheetAnchor(targetNode));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }

      return { type: "data" as const };
    },
    [applyInstrumentContent, snapshot, t]
  );

  const handleNoteCreated = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setNoteDraft({ title: t("note.untitled"), content: "" });
    },
    [t]
  );

  const handleNodeDeleted = useCallback(
    (nodeId: string) => {
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId]
  );

  return (
    <div className="app-frame">
      <aside className="app-sidebar-nav">
        <div className="sidebar-nav-group">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-button${isActive ? " is-active" : ""}`} aria-label={t("app.navigation.dashboard")}>
            <SidebarIcon kind="dashboard" />
          </NavLink>
          <NavLink to="/workbench" className={({ isActive }) => `sidebar-nav-button${isActive ? " is-active" : ""}`} aria-label={t("app.navigation.workbench")}>
            <SidebarIcon kind="workbench" />
          </NavLink>
          <NavLink to="/graph" className={({ isActive }) => `sidebar-nav-button${isActive ? " is-active" : ""}`} aria-label={t("app.navigation.graphView")}>
            <SidebarIcon kind="graph" />
          </NavLink>
        </div>
      </aside>

      <div className="app-stage-shell">
        <header className="app-stage-toolbar">
          <div className="toolbar-brand">
            <p className="eyebrow">{t("app.brand.eyebrow")}</p>
            <h1>{t("app.brand.title")}</h1>
            <p>{t("app.brand.description")}</p>
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            >
              {t("common.theme")}: {theme === "dark" ? t("common.themes.dark") : t("common.themes.light")}
            </button>
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
            <button type="button" onClick={() => void fetchState()} disabled={loading} className="ghost-button">
              {loading ? t("app.toolbar.syncing") : t("app.toolbar.syncGraph")}
            </button>
          </div>
        </header>

        <main className="app-route-stage">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  cards={dataCards}
                  loading={loading}
                  ingestLoading={ingestLoading}
                  onImport={importInstrumentData}
                  onRefresh={fetchState}
                />
              }
            />
            <Route
              path="/workbench"
              element={
                <Workbench
                  theme={theme}
                  spreadsheetData={spreadsheetData}
                  revision={revision}
                  peakRow={peakRow}
                  focusedRow={focusedRow}
                  chartData={chartData}
                  peakIndex={peakIndex}
                  instrumentFormat={instrumentFormat}
                  metadataEntries={metadataEntries}
                  selectedNodeId={selectedNodeId}
                  selectedNodeLabel={selectedGraphNodeLabel}
                  onLoadNode={loadNodeIntoWorkbench}
                  onAnalyze={analyzePeak}
                  onCommit={commitAnalysis}
                />
              }
            />
            <Route
              path="/workbench/:id"
              element={
                <Workbench
                  theme={theme}
                  spreadsheetData={spreadsheetData}
                  revision={revision}
                  peakRow={peakRow}
                  focusedRow={focusedRow}
                  chartData={chartData}
                  peakIndex={peakIndex}
                  instrumentFormat={instrumentFormat}
                  metadataEntries={metadataEntries}
                  selectedNodeId={selectedNodeId}
                  selectedNodeLabel={selectedGraphNodeLabel}
                  onLoadNode={loadNodeIntoWorkbench}
                  onAnalyze={analyzePeak}
                  onCommit={commitAnalysis}
                />
              }
            />
            <Route
              path="/graph"
              element={
                <GraphView
                  snapshot={snapshot}
                  theme={theme}
                  graphNodes={graphNodes}
                  graphEdges={graphEdges}
                  selectedNodeId={selectedNodeId}
                  selectedNodeLabel={selectedGraphNodeLabel}
                  selectedNodeType={selectedGraphNodeType}
                  selectedNodeTypeLabel={selectedGraphNodeTypeLabel}
                  noteDraft={noteDraft}
                  noteSaving={noteSaving}
                  onSelectNode={handleGraphNodeSelect}
                  onActivateNode={handleGraphNodeActivate}
                  onNoteCreated={handleNoteCreated}
                  onNodeDeleted={handleNodeDeleted}
                  onRefresh={fetchState}
                  onError={(message) => setError(message)}
                  onTitleChange={(value) => setNoteDraft((prev) => ({ ...prev, title: value }))}
                  onContentChange={(value) => setNoteDraft((prev) => ({ ...prev, content: value }))}
                  onSaveNote={saveSelectedNote}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {error && <pre className="error app-global-error">{error}</pre>}
      </div>
    </div>
  );
}
