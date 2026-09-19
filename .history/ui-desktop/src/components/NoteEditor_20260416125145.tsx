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
  return (
    <section className="note-editor-shell">
      <div className="note-editor-header">
        <div>
          <h3>Note Editor</h3>
          <p>雙擊星圖上的筆記節點可直接開啟，內容會回寫到 Rust CRDT。</p>
        </div>
        {onClose && (
          <button type="button" className="ghost-button" onClick={onClose}>
            返回表格
          </button>
        )}
      </div>
      <div className="note-editor-form">
        <label className="note-editor-field">
          <span>標題</span>
          <input
            className="note-title-input"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Untitled Note"
          />
        </label>
        <label className="note-editor-field">
          <span>內容</span>
          <textarea
            className="note-textarea"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="在這裡輸入研究筆記、假設、實驗備註..."
          />
        </label>
        <div className="note-editor-actions">
          <button type="button" className="primary-button" onClick={() => void onSave()} disabled={saving}>
            {saving ? "儲存中..." : "儲存筆記"}
          </button>
        </div>
      </div>
    </section>
  );
}