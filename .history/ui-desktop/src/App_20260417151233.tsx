import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { Activity, Database, Languages, Network, RefreshCw, Settings, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const SIDEBAR_TOOLTIP_DELAY_MS = 3000;

type SidebarItemKey = "dashboard" | "workbench" | "graph";

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  showTooltip: boolean;
  onTooltipOpen: () => void;
  onTooltipClose: () => void;
};

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

function SidebarNavItem({
  to,
  label,
  icon: Icon,
  showTooltip,
  onTooltipOpen,
  onTooltipClose
}: SidebarNavItemProps) {
  return (
    <div className="sidebar-nav-item" onMouseEnter={onTooltipOpen} onMouseLeave={onTooltipClose}>
      <NavLink
        to={to}
        className={({ isActive }: { isActive: boolean }) => `sidebar-nav-button${isActive ? " is-active" : ""}`}
        aria-label={label}
        onClick={onTooltipClose}
      >
        <Icon aria-hidden={true} />
      </NavLink>
      {showTooltip ? (
        <div className="sidebar-tooltip" role="tooltip">
          {label}
        </div>
      ) : null}
    </div>
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
  const [visibleTooltip, setVisibleTooltip] = useState<SidebarItemKey | null>(null);
  const tooltipTimersRef = useRef<Partial<Record<SidebarItemKey, number>>>({});

  const sidebarItems = useMemo(
    () => [
      { key: "dashboard" as const, to: "/dashboard", label: t("app.navigation.dashboard"), icon: Database },
      { key: "workbench" as const, to: "/workbench", label: t("app.navigation.workbench"), icon: Activity },
      { key: "graph" as const, to: "/graph", label: t("app.navigation.graphView"), icon: Network }
    ],
    [t]
  );

  const clearTooltipTimer = useCallback((key: SidebarItemKey) => {
    const timerId = tooltipTimersRef.current[key];
    if (timerId) {
      window.clearTimeout(timerId);
      delete tooltipTimersRef.current[key];
    }
  }, []);

  const handleSidebarMouseEnter = useCallback(
    (key: SidebarItemKey) => {
      clearTooltipTimer(key);
      setVisibleTooltip(null);
      tooltipTimersRef.current[key] = window.setTimeout(() => {
        setVisibleTooltip(key);
      }, SIDEBAR_TOOLTIP_DELAY_MS);
    },
    [clearTooltipTimer]
  );

  const handleSidebarMouseLeave = useCallback(
    (key: SidebarItemKey) => {
      clearTooltipTimer(key);
      setVisibleTooltip((current) => (current === key ? null : current));
    },
    [clearTooltipTimer]
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      Object.values(tooltipTimersRef.current).forEach((timerId) => {
        if (timerId) {
          window.clearTimeout(timerId);
        }
      });
    };
  }, []);

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
          {sidebarItems.map((item) => (
            <SidebarNavItem
              key={item.key}
              to={item.to}
              label={item.label}
              icon={item.icon}
              showTooltip={visibleTooltip === item.key}
              onTooltipOpen={() => handleSidebarMouseEnter(item.key)}
              onTooltipClose={() => handleSidebarMouseLeave(item.key)}
            />
          ))}
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
              <Settings aria-hidden="true" className="toolbar-control-icon" />
              <span>{t("common.theme")}: {theme === "dark" ? t("common.themes.dark") : t("common.themes.light")}</span>
            </button>
            <label className="toolbar-language-select">
              <Languages aria-hidden="true" className="toolbar-control-icon" />
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
              <RefreshCw aria-hidden="true" className={`toolbar-control-icon${loading ? " is-spinning" : ""}`} />
              <span>{loading ? t("app.toolbar.syncing") : t("app.toolbar.syncGraph")}</span>
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
