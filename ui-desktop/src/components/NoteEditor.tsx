import { useTranslation } from "../i18n";

type NoteEditorProps = {
  title: string;
  content: string;
  saving?: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void | Promise<void>;
  onClose?: () => void;
};

export default function NoteEditor({
  title,
  content,
  saving = false,
  onTitleChange,
  onContentChange,
  onSave,
  onClose
}: NoteEditorProps) {
  const { t } = useTranslation();

  return (
    <section className="note-editor-shell">
      <div className="note-editor-header">
        <div>
          <h3>{t("note.editorTitle")}</h3>
          <p>{t("note.editorDescription")}</p>
        </div>
        {onClose && (
          <button type="button" className="ghost-button" onClick={onClose}>
            {t("note.backToGrid")}
          </button>
        )}
      </div>
      <div className="note-editor-form">
        <label className="note-editor-field">
          <span>{t("note.titleLabel")}</span>
          <input
            className="note-title-input"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={t("note.titlePlaceholder")}
          />
        </label>
        <label className="note-editor-field">
          <span>{t("note.contentLabel")}</span>
          <textarea
            className="note-textarea"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder={t("note.contentPlaceholder")}
          />
        </label>
        <div className="note-editor-actions">
          <button type="button" className="primary-button" onClick={() => void onSave()} disabled={saving}>
            {saving ? t("note.saving") : t("note.save")}
          </button>
        </div>
      </div>
    </section>
  );
}