import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { Activity, Blocks, Database, FilePenLine, Network, Settings, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { createDemoSpreadsheetData, type CellPointer, type SpreadsheetGridData } from "./components/OfficeCanvas/SpreadsheetGrid";
import Dashboard from "./pages/Dashboard";
import GraphView from "./pages/GraphView";
import ModuleDetailView from "./pages/ModuleDetailView";
import ModulesView from "./pages/ModulesView";
import NoteView from "./pages/NoteView";
import SettingsView from "./pages/SettingsView";
import Workbench from "./pages/Workbench";
import { useTranslation } from "./i18n";
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
  type ThemeName
} from "./app/labflow";
import type { StarGraphEdge, StarGraphNode } from "./components/StarGraph";

const THEME_STORAGE_KEY = "labflow.theme";
const LOCAL_NOTES_STORAGE_KEY = "labflow.local-notes";
const APP_PREFERENCES_STORAGE_KEY = "labflow.preferences";
const SIDEBAR_EXPAND_DELAY_MS = 3000;
const DATA_PARSE_WARNING_MESSAGE = "資料解析警告";

type SidebarItemKey = "dashboard" | "notes" | "workbench" | "graph" | "modules" | "settings";

type AppPreferences = {
  startupPage: SidebarItemKey;
  autoSyncGraph: boolean;
  pinSidebar: boolean;
};

type LocalNoteRecord = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  expanded: boolean;
  onNavigate: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

function readInitialLocalNotes(): LocalNoteRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_NOTES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is LocalNoteRecord => isRecord(entry))
      .map((entry) => ({
        id: typeof entry.id === "string" ? entry.id : "",
        title: typeof entry.title === "string" ? entry.title : "",
        content: typeof entry.content === "string" ? entry.content : "",
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date(0).toISOString()
      }))
      .filter((entry) => entry.id);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function readInitialPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return { startupPage: "dashboard", autoSyncGraph: true, pinSidebar: false };
  }

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return { startupPage: "dashboard", autoSyncGraph: true, pinSidebar: false };
    }

    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    const validPages: SidebarItemKey[] = ["dashboard", "notes", "workbench", "graph", "modules", "settings"];

    return {
      startupPage: validPages.includes(parsed.startupPage as SidebarItemKey)
        ? (parsed.startupPage as SidebarItemKey)
        : "dashboard",
      autoSyncGraph: parsed.autoSyncGraph ?? true,
      pinSidebar: parsed.pinSidebar ?? false
    };
  } catch (error) {
    console.error(error);
    return { startupPage: "dashboard", autoSyncGraph: true, pinSidebar: false };
  }
}

function createLocalNoteId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function deriveNoteTitle(content: string, fallbackTitle: string): string {
  const firstMeaningfulLine = content
    .split(/\r?\n/u)
    .map((line) => line.replace(/^#+\s*/u, "").trim())
    .find(Boolean);

  return firstMeaningfulLine ? firstMeaningfulLine.slice(0, 64) : fallbackTitle;
}

function SidebarNavItem({
  to,
  label,
  icon: Icon,
  expanded,
  onNavigate
}: SidebarNavItemProps) {
  return (
    <div className="sidebar-nav-item">
      <NavLink
        to={to}
        className={({ isActive }: { isActive: boolean }) => `sidebar-nav-button${isActive ? " is-active" : ""}${expanded ? " is-expanded" : ""}`}
        aria-label={label}
        onClick={onNavigate}
      >
        <Icon aria-hidden={true} />
        <span className={`sidebar-nav-label${expanded ? " is-visible" : ""}`}>{label}</span>
      </NavLink>
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
  const [localNotes, setLocalNotes] = useState<LocalNoteRecord[]>(() => readInitialLocalNotes());
  const [activeLocalNoteId, setActiveLocalNoteId] = useState<string | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [preferences, setPreferences] = useState<AppPreferences>(() => readInitialPreferences());
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebarTimerRef = useRef<number | null>(null);

  const reportDataParseWarning = useCallback((error: unknown) => {
    console.error(error);

    const detail =
      error instanceof Error && error.message && error.message !== DATA_PARSE_WARNING_MESSAGE
        ? `: ${error.message}`
        : "";

    setError(`${DATA_PARSE_WARNING_MESSAGE}${detail}`);
  }, []);

  const sidebarItems = useMemo(
    () => [
      { key: "dashboard" as const, to: "/dashboard", label: t("app.navigation.dashboard"), icon: Database },
      { key: "notes" as const, to: "/notes", label: t("app.navigation.notes"), icon: FilePenLine },
      { key: "workbench" as const, to: "/workbench", label: t("app.navigation.workbench"), icon: Activity },
      { key: "graph" as const, to: "/graph", label: t("app.navigation.graphView"), icon: Network },
      { key: "modules" as const, to: "/modules", label: t("app.navigation.modules"), icon: Blocks },
      { key: "settings" as const, to: "/settings", label: t("app.navigation.settings"), icon: Settings }
    ],
    [t]
  );

  const clearSidebarTimer = useCallback(() => {
    const timerId = sidebarTimerRef.current;
    if (timerId) {
      window.clearTimeout(timerId);
      sidebarTimerRef.current = null;
    }
  }, []);

  const handleSidebarMouseEnter = useCallback(() => {
    clearSidebarTimer();

    if (preferences.pinSidebar) {
      setSidebarExpanded(true);
      return;
    }

    sidebarTimerRef.current = window.setTimeout(() => {
      setSidebarExpanded(true);
      sidebarTimerRef.current = null;
    }, SIDEBAR_EXPAND_DELAY_MS);
  }, [clearSidebarTimer, preferences.pinSidebar]);

  const handleSidebarMouseLeave = useCallback(() => {
    clearSidebarTimer();
    if (!preferences.pinSidebar) {
      setSidebarExpanded(false);
    }
  }, [clearSidebarTimer, preferences.pinSidebar]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(LOCAL_NOTES_STORAGE_KEY, JSON.stringify(localNotes));
  }, [localNotes]);

  useEffect(() => {
    window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    setSidebarExpanded(preferences.pinSidebar);
  }, [preferences.pinSidebar]);

  useEffect(() => {
    if (activeLocalNoteId && localNotes.some((note) => note.id === activeLocalNoteId)) {
      return;
    }

    setActiveLocalNoteId(localNotes[0]?.id ?? null);
  }, [activeLocalNoteId, localNotes]);

  useEffect(() => {
    return () => {
      clearSidebarTimer();
    };
  }, [clearSidebarTimer]);

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
      try {
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

        return true;
      } catch (error) {
        reportDataParseWarning(error);
        return false;
      }
    },
    [reportDataParseWarning, t]
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

      const didApply = applyInstrumentContent(targetNode.content, targetNode.label || t("common.unknown"));
      if (!didApply) {
        return false;
      }

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

          const payload: Record<string, unknown> | null = isRecord(event.payload) ? event.payload : null;
          const resultPayload = isRecord(payload?.result) ? payload.result : null;

          if (resultPayload) {
            const resultData = isRecord(resultPayload.data) ? resultPayload.data : null;
            const xValues = resultData?.x;
            const yValues = resultData?.y;

            if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length === 0 || yValues.length === 0) {
              throw new Error(DATA_PARSE_WARNING_MESSAGE);
            }

            applyInstrumentContent(resultPayload, t("common.unknown"));
            void fetchState();
            return;
          }

          if (typeof payload?.label === "string") {
            applyInstrumentContent(payload.label, t("common.unknown"));
            void fetchState();
            return;
          }

          const eventKind = typeof payload?.kind === "string" ? payload.kind : "graph_changed";
          const opIds = Array.isArray(payload?.op_ids) ? payload.op_ids : [];
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
          reportDataParseWarning(err);
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
  }, [applyInstrumentContent, fetchState, reportDataParseWarning, t]);

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

  const createQuickNote = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        return null;
      }

      const nextNote: LocalNoteRecord = {
        id: createLocalNoteId(),
        title: deriveNoteTitle(trimmedContent, t("notes.newNoteTitle")),
        content: trimmedContent,
        updatedAt: new Date().toISOString()
      };

      setLocalNotes((prev) => [nextNote, ...prev]);
      setActiveLocalNoteId(nextNote.id);
      return nextNote.id;
    },
    [t]
  );

  const createEmptyLocalNote = useCallback(() => {
    const nextNote: LocalNoteRecord = {
      id: createLocalNoteId(),
      title: t("notes.newNoteTitle"),
      content: "",
      updatedAt: new Date().toISOString()
    };

    setLocalNotes((prev) => [nextNote, ...prev]);
    setActiveLocalNoteId(nextNote.id);
    return nextNote.id;
  }, [t]);

  const updateLocalNote = useCallback(
    (noteId: string, updates: Partial<Pick<LocalNoteRecord, "title" | "content">>) => {
      setLocalNotes((prev) =>
        prev
          .map((note) => {
            if (note.id !== noteId) {
              return note;
            }

            const nextContent = updates.content ?? note.content;
            const nextTitleSource = updates.title ?? note.title;
            const nextTitle = nextTitleSource.trim() ? nextTitleSource : deriveNoteTitle(nextContent, t("notes.newNoteTitle"));

            return {
              ...note,
              title: nextTitle,
              content: nextContent,
              updatedAt: new Date().toISOString()
            };
          })
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      );
    },
    [t]
  );

  const selectLocalNote = useCallback((noteId: string) => {
    setActiveLocalNoteId(noteId);
  }, []);

  const deleteLocalNote = useCallback(
    (noteId: string) => {
      setLocalNotes((prev) => prev.filter((note) => note.id !== noteId));
      setActiveLocalNoteId((current) => (current === noteId ? null : current));
    },
    []
  );

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
        const didApply = applyInstrumentContent(targetNode.content, targetNode.label || t("common.unknown"));
        if (!didApply) {
          return { type: "data" as const };
        }

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
                  onSaveQuickNote={createQuickNote}
                />
              }
            />
            <Route
              path="/notes"
              element={
                <NoteView
                  notes={localNotes}
                  activeNoteId={activeLocalNoteId}
                  onCreateNote={createEmptyLocalNote}
                  onSelectNote={selectLocalNote}
                  onUpdateNote={updateLocalNote}
                  onDeleteNote={deleteLocalNote}
                />
              }
            />
            <Route
              path="/notes/:id"
              element={
                <NoteView
                  notes={localNotes}
                  activeNoteId={activeLocalNoteId}
                  onCreateNote={createEmptyLocalNote}
                  onSelectNote={selectLocalNote}
                  onUpdateNote={updateLocalNote}
                  onDeleteNote={deleteLocalNote}
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
            <Route
              path="/modules"
              element={<ModulesView />}
            />
            <Route
              path="/modules/:id"
              element={<ModuleDetailView />}
            />
            <Route
              path="/settings"
              element={
                <SettingsView
                  theme={theme}
                  language={language}
                  onThemeChange={setTheme}
                  onLanguageChange={changeLanguage}
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
