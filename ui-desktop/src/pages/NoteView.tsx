import { invoke } from "@tauri-apps/api/core";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout/legacy";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeGraphNodeType, parseNoteDocument, type GraphStateSnapshot } from "../app/labflow";
import { PAGE_GRID_BREAKPOINTS, PAGE_GRID_COLS, usePageGrid } from "../app/usePageGrid";
import RichMarkdownEditor from "../components/RichMarkdownEditor";
import { useTranslation } from "../i18n";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_NOTEVIEW_LAYOUT: Layout = [
  { i: "notes-sidebar", x: 0, y: 0, w: 3, h: 12, minW: 3, minH: 5 },
  { i: "notes-editor",  x: 3, y: 0, w: 9, h: 12, minW: 5, minH: 6 }
];

type GraphNoteRecord = {
  id: string;
  title: string;
  content: string;
  updatedAt: string | null;
};

type NoteViewProps = {
  graph: GraphStateSnapshot | null;
};

function formatUpdatedAt(value: string, language: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "zh-TW" ? "zh-TW" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

const NOTE_AUTOSAVE_DELAY_MS = 500;

export default function NoteView({ graph }: NoteViewProps) {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    layouts: noteViewLayouts,
    handleLayoutChange: handleNoteViewLayoutChange,
    handleLayoutCommit: handleNoteViewLayoutCommit
  } =
    usePageGrid("noteview-layout", DEFAULT_NOTEVIEW_LAYOUT);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const [editorColorMode, setEditorColorMode] = useState<"dark" | "light">(() => {
    if (typeof document === "undefined") {
      return "dark";
    }

    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  });

  const notes = useMemo<GraphNoteRecord[]>(() => {
    return (graph?.nodes ?? [])
      .filter((node) => normalizeGraphNodeType(node.properties) === "note")
      .map((node) => {
        const document = parseNoteDocument(node, t("notes.newNoteTitle"));
        const updatedAt =
          node.properties.updated_at ||
          node.properties.updatedAt ||
          node.properties.modified_at ||
          node.properties.created_at ||
          null;

        return {
          id: node.id,
          title: document.title,
          content: document.content,
          updatedAt
        };
      });
  }, [graph, t]);

  const activeNote = useMemo(() => {
    if (id) {
      return notes.find((note) => note.id === id) ?? null;
    }

    return notes[0] ?? null;
  }, [id, notes]);

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const persistNote = useCallback(async (nodeId: string, title: string, content: string) => {
    setSavePending(true);
    setSaveError(null);

    try {
      await invoke("update_note_node", {
        nodeId,
        title,
        content
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSavePending(false);
    }
  }, []);

  const scheduleSave = useCallback(
    (nodeId: string, title: string, content: string) => {
      clearSaveTimer();
      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        void persistNote(nodeId, title, content);
      }, NOTE_AUTOSAVE_DELAY_MS);
    },
    [clearSaveTimer, persistNote]
  );

  useEffect(() => {
    if (!activeNote && !notes.length) {
      return;
    }

    if (id && activeNote) {
      return;
    }

    if (!id && activeNote) {
      navigate(`/notes/${activeNote.id}`, { replace: true });
    }
  }, [activeNote, id, navigate, notes.length]);

  useEffect(() => {
    clearSaveTimer();
    setSaveError(null);
    setDraftTitle(activeNote?.title ?? "");
    setDraftContent(activeNote?.content ?? "");
  }, [activeNote?.content, activeNote?.id, activeNote?.title, clearSaveTimer]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const syncColorMode = () => {
      setEditorColorMode(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    };

    syncColorMode();

    const observer = new MutationObserver(syncColorMode);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      clearSaveTimer();
    };
  }, [clearSaveTimer]);

  const handleCreateNote = async () => {
    setSaveError(null);

    try {
      const noteId = await invoke<string>("create_note_node", {
        title: t("notes.newNoteTitle"),
        content: ""
      });
      navigate(`/notes/${noteId}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    clearSaveTimer();

    try {
      await invoke("delete_node", { nodeId: noteId });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
      return;
    }

    const nextNote = notes.find((note) => note.id !== noteId);
    navigate(nextNote ? `/notes/${nextNote.id}` : "/notes", { replace: true });
  };

  const handleTitleChange = (value: string) => {
    if (!activeNote) {
      return;
    }

    setDraftTitle(value);
    scheduleSave(activeNote.id, value, draftContent);
  };

  const handleContentChange = (value: string) => {
    if (!activeNote) {
      return;
    }

    setDraftContent(value);
    scheduleSave(activeNote.id, draftTitle, value);
  };

  return (
    <section className="page-shell notes-page">
      <div className="page-hero app-surface">
        <div>
          <p className="eyebrow">{t("notes.eyebrow")}</p>
          <h2>{t("notes.title")}</h2>
          <p>{t("notes.description")}</p>
        </div>
        <div className="page-hero-actions">
          <button type="button" className="secondary-button" onClick={() => void handleCreateNote()}>
            <Plus aria-hidden={true} className="toolbar-control-icon" />
            <span>{t("notes.create")}</span>
          </button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="page-grid"
        layouts={noteViewLayouts}
        breakpoints={PAGE_GRID_BREAKPOINTS}
        cols={PAGE_GRID_COLS}
        rowHeight={72}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType={null}
        isResizable={true}
        isDraggable={true}
        resizeHandles={["n", "s", "e", "w", "ne", "nw", "se", "sw"]}
        draggableHandle=".grid-drag-handle"
        onLayoutChange={handleNoteViewLayoutChange}
        onDragStop={handleNoteViewLayoutCommit}
        onResizeStop={handleNoteViewLayoutCommit}
      >
        <div key="notes-sidebar" className="page-grid-item">
          <div className="grid-drag-handle" />
          <div className="page-grid-item-body">
            <aside className="notes-sidebar app-surface">
              <div className="notes-sidebar-header">
                <div>
                  <p className="eyebrow">{t("notes.listEyebrow")}</p>
                  <h3>{t("notes.listTitle")}</h3>
                </div>
                <button type="button" className="ghost-button" onClick={() => void handleCreateNote()}>
                  <Plus aria-hidden={true} className="toolbar-control-icon" />
                  <span>{t("notes.newShort")}</span>
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="notes-empty-state">
                  <FilePenLine aria-hidden={true} />
                  <h4>{t("notes.emptyTitle")}</h4>
                  <p>{t("notes.emptyDescription")}</p>
                </div>
              ) : (
                <div className="notes-list" role="list">
                  {notes.map((note) => {
                    const isActive = note.id === activeNote?.id;

                    return (
                      <button
                        key={note.id}
                        type="button"
                        className={`notes-list-item${isActive ? " is-active" : ""}`}
                        onClick={() => navigate(`/notes/${note.id}`)}
                      >
                        <div className="notes-list-item-topline">
                          <strong>{note.title || t("notes.newNoteTitle")}</strong>
                          {note.updatedAt ? <span>{formatUpdatedAt(note.updatedAt, language)}</span> : null}
                        </div>
                        <p>{note.content.trim() || t("notes.emptyContentPreview")}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        </div>

        <div key="notes-editor" className="page-grid-item">
          <div className="grid-drag-handle" />
          <div className="page-grid-item-body">
            <section className="notes-editor-shell app-surface">
              {activeNote ? (
                <div className="notes-editor-stack">
                  <div className="notes-editor-header">
                    <div>
                      <p className="eyebrow">{t("notes.editorEyebrow")}</p>
                      <h3>{t("notes.editorTitle")}</h3>
                      <p>{t("notes.editorDescription")}</p>
                      {saveError ? <p className="error">{saveError}</p> : null}
                      {savePending ? <p>{t("app.toolbar.syncing")}</p> : null}
                    </div>
                    <button type="button" className="ghost-button" onClick={() => void handleDeleteNote(activeNote.id)}>
                      <Trash2 aria-hidden={true} className="toolbar-control-icon" />
                      <span>{t("notes.delete")}</span>
                    </button>
                  </div>

                  <label className="note-editor-field">
                    <span>{t("notes.titleLabel")}</span>
                    <input
                      className="note-title-input"
                      value={draftTitle}
                      onChange={(event) => handleTitleChange(event.target.value)}
                      placeholder={t("notes.titlePlaceholder")}
                    />
                  </label>

                  <div data-color-mode={editorColorMode} className={`notes-markdown-shell is-${editorColorMode}`}>
                    <RichMarkdownEditor
                      value={draftContent}
                      onChange={handleContentChange}
                      placeholder={t("notes.contentPlaceholder")}
                      theme={editorColorMode}
                    />
                  </div>
                </div>
              ) : (
                <section className="page-empty app-surface">
                  <h3>{t("notes.emptyTitle")}</h3>
                  <p>{t("notes.emptyDescription")}</p>
                  {saveError ? <p className="error">{saveError}</p> : null}
                  <button type="button" className="primary-button" onClick={() => void handleCreateNote()}>
                    {t("notes.create")}
                  </button>
                </section>
              )}
            </section>
          </div>
        </div>
      </ResponsiveGridLayout>
    </section>
  );
}