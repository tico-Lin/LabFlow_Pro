import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "katex/dist/katex.min.css";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import rehypeKatex from "rehype-katex";
import { useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useTranslation } from "../i18n";

type LocalNoteRecord = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type NoteViewProps = {
  notes: LocalNoteRecord[];
  activeNoteId: string | null;
  onCreateNote: () => string;
  onSelectNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, updates: { title?: string; content?: string }) => void;
  onDeleteNote: (noteId: string) => void;
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

export default function NoteView({ notes, activeNoteId, onCreateNote, onSelectNote, onUpdateNote, onDeleteNote }: NoteViewProps) {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [editorColorMode, setEditorColorMode] = useState<"dark" | "light">(() => {
    if (typeof document === "undefined") {
      return "dark";
    }

    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  });

  const activeNote = useMemo(() => {
    if (id) {
      return notes.find((note) => note.id === id) ?? null;
    }

    if (activeNoteId) {
      return notes.find((note) => note.id === activeNoteId) ?? null;
    }

    return notes[0] ?? null;
  }, [activeNoteId, id, notes]);

  useEffect(() => {
    if (!activeNote && !notes.length) {
      return;
    }

    if (id && activeNote) {
      onSelectNote(activeNote.id);
      return;
    }

    if (!id && activeNote) {
      onSelectNote(activeNote.id);
      navigate(`/notes/${activeNote.id}`, { replace: true });
    }
  }, [activeNote, id, navigate, notes.length, onSelectNote]);

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

  const formulaCommand = useMemo(
    () =>
      commands.group([
        {
          name: "inlineFormula",
          keyCommand: "inlineFormula",
          buttonProps: { "aria-label": t("notes.inlineFormula") },
          icon: <span className="md-toolbar-token">ƒx</span>,
          execute: (_state, api) => {
            api.replaceSelection("$formula$");
          }
        },
        {
          name: "blockFormula",
          keyCommand: "blockFormula",
          buttonProps: { "aria-label": t("notes.blockFormula") },
          icon: <span className="md-toolbar-token">∑</span>,
          execute: (_state, api) => {
            api.replaceSelection("$$\nformula\n$$");
          }
        }
      ]),
    [t]
  );

  const markdownPreviewOptions = useMemo(
    () => ({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex]
    }),
    []
  );

  const handleCreateNote = () => {
    const noteId = onCreateNote();
    navigate(`/notes/${noteId}`);
  };

  const handleDeleteNote = (noteId: string) => {
    onDeleteNote(noteId);
    const nextNote = notes.find((note) => note.id !== noteId);
    navigate(nextNote ? `/notes/${nextNote.id}` : "/notes", { replace: true });
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
          <button type="button" className="secondary-button" onClick={handleCreateNote}>
            <Plus aria-hidden={true} className="toolbar-control-icon" />
            <span>{t("notes.create")}</span>
          </button>
        </div>
      </div>

      <div className="notes-layout">
        <aside className="notes-sidebar app-surface">
          <div className="notes-sidebar-header">
            <div>
              <p className="eyebrow">{t("notes.listEyebrow")}</p>
              <h3>{t("notes.listTitle")}</h3>
            </div>
            <button type="button" className="ghost-button" onClick={handleCreateNote}>
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
                    onClick={() => {
                      onSelectNote(note.id);
                      navigate(`/notes/${note.id}`);
                    }}
                  >
                    <div className="notes-list-item-topline">
                      <strong>{note.title || t("notes.newNoteTitle")}</strong>
                      <span>{formatUpdatedAt(note.updatedAt, language)}</span>
                    </div>
                    <p>{note.content.trim() || t("notes.emptyContentPreview")}</p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="notes-editor-shell app-surface">
          {activeNote ? (
            <div className="notes-editor-stack">
              <div className="notes-editor-header">
                <div>
                  <p className="eyebrow">{t("notes.editorEyebrow")}</p>
                  <h3>{t("notes.editorTitle")}</h3>
                  <p>{t("notes.editorDescription")}</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => handleDeleteNote(activeNote.id)}>
                  <Trash2 aria-hidden={true} className="toolbar-control-icon" />
                  <span>{t("notes.delete")}</span>
                </button>
              </div>

              <label className="note-editor-field">
                <span>{t("notes.titleLabel")}</span>
                <input
                  className="note-title-input"
                  value={activeNote.title}
                  onChange={(event) => onUpdateNote(activeNote.id, { title: event.target.value })}
                  placeholder={t("notes.titlePlaceholder")}
                />
              </label>

              <div data-color-mode={editorColorMode} className={`notes-markdown-shell is-${editorColorMode}`}>
                <div className="notes-markdown-workspace">
                  <section className="notes-markdown-pane notes-markdown-pane-editor">
                    <div className="notes-markdown-pane-header">
                      <p className="eyebrow">Markdown Source</p>
                      <span>{t("notes.contentPlaceholder")}</span>
                    </div>
                    <MDEditor
                      value={activeNote.content}
                      onChange={(value) => onUpdateNote(activeNote.id, { content: value ?? "" })}
                      textareaProps={{ placeholder: t("notes.contentPlaceholder") }}
                      preview="edit"
                      visibleDragbar={false}
                      height={560}
                      commands={[
                        commands.bold,
                        commands.italic,
                        commands.strikethrough,
                        commands.hr,
                        commands.title,
                        commands.divider,
                        commands.link,
                        commands.quote,
                        commands.code,
                        commands.codeBlock,
                        commands.image,
                        commands.divider,
                        commands.unorderedListCommand,
                        commands.orderedListCommand,
                        commands.checkedListCommand,
                        commands.divider,
                        formulaCommand,
                        commands.divider,
                        commands.fullscreen
                      ]}
                      previewOptions={markdownPreviewOptions}
                    />
                  </section>

                  <section className="notes-markdown-pane notes-markdown-pane-preview">
                    <div className="notes-markdown-pane-header">
                      <p className="eyebrow">Rendered Preview</p>
                      <span>Markdown 會在這裡即時解譯</span>
                    </div>
                    <div className="notes-markdown-preview-surface">
                      <MDEditor.Markdown source={activeNote.content} {...markdownPreviewOptions} />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <section className="page-empty app-surface">
              <h3>{t("notes.emptyTitle")}</h3>
              <p>{t("notes.emptyDescription")}</p>
              <button type="button" className="primary-button" onClick={handleCreateNote}>
                {t("notes.create")}
              </button>
            </section>
          )}
        </section>
      </div>
    </section>
  );
}