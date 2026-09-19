import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DataCardRecord } from "../app/labflow";
import { useTranslation } from "../i18n";

type DashboardProps = {
  cards: DataCardRecord[];
  noteCount: number;
  nodeCount: number;
  edgeCount: number;
  loading: boolean;
  ingestLoading: boolean;
  autoSyncGraph: boolean;
  onImport: () => void | Promise<void>;
  onRefresh: () => void | Promise<unknown>;
  onSaveQuickNote: (content: string) => string | null;
};

export default function Dashboard({
  cards,
  noteCount,
  nodeCount,
  edgeCount,
  loading,
  ingestLoading,
  autoSyncGraph,
  onImport,
  onRefresh,
  onSaveQuickNote
}: DashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [livePulse, setLivePulse] = useState(0);
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    let unlisten: null | (() => void) = null;

    const bind = async () => {
      unlisten = await listen("graph-updated", () => {
        setLivePulse((prev) => prev + 1);
        if (autoSyncGraph) {
          void onRefresh();
        }
      });
    };

    void bind();
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [autoSyncGraph, onRefresh]);

  const handleQuickNoteSave = () => {
    const noteId = onSaveQuickNote(quickNote);
    if (!noteId) {
      return;
    }

    setQuickNote("");
    navigate(`/notes/${noteId}`);
  };

  return (
    <section className="page-shell dashboard-page">
      <div className="page-hero app-surface">
        <div>
          <p className="eyebrow">{t("dashboard.eyebrow")}</p>
          <h2>{t("dashboard.title")}</h2>
          <p>{t("dashboard.description")}</p>
        </div>
        <div className="page-hero-actions">
          <button type="button" className="secondary-button" onClick={() => void onImport()} disabled={ingestLoading}>
            {ingestLoading ? t("app.toolbar.importing") : t("app.toolbar.import")}
          </button>
          <button type="button" className="ghost-button" onClick={() => void onRefresh()} disabled={loading}>
            {loading ? t("app.toolbar.syncing") : t("app.toolbar.syncGraph")}
          </button>
        </div>
      </div>

      <section className="quick-note-panel app-surface">
        <div className="quick-note-panel-header">
          <div>
            <p className="eyebrow">{t("notes.quickNoteEyebrow")}</p>
            <h3>{t("notes.quickNoteTitle")}</h3>
            <p>{t("notes.quickNoteDescription")}</p>
          </div>
          <button type="button" className="primary-button" onClick={handleQuickNoteSave} disabled={!quickNote.trim()}>
            {t("notes.quickNoteSave")}
          </button>
        </div>
        <textarea
          className="quick-note-input"
          value={quickNote}
          onChange={(event) => setQuickNote(event.target.value)}
          placeholder={t("notes.quickNotePlaceholder")}
          aria-label={t("notes.quickNoteTitle")}
        />
      </section>

      <div className="dashboard-summary-row">
        <div className="summary-card app-surface">
          <span className="summary-card-label">{t("dashboard.cardCount")}</span>
          <strong>{cards.length}</strong>
        </div>
        <div className="summary-card app-surface">
          <span className="summary-card-label">{t("dashboard.noteCount")}</span>
          <strong>{noteCount}</strong>
        </div>
        <div className="summary-card app-surface">
          <span className="summary-card-label">{t("dashboard.graphCoverage")}</span>
          <strong>{nodeCount}</strong>
          <p>{t("dashboard.graphCoverageDetail", { edges: edgeCount })}</p>
        </div>
        <div className="summary-card app-surface">
          <span className="summary-card-label">{t("dashboard.liveFeed")}</span>
          <strong>{livePulse > 0 ? t("dashboard.liveConnected") : t("dashboard.liveIdle")}</strong>
          <p>{autoSyncGraph ? t("dashboard.autoSyncEnabled") : t("dashboard.autoSyncDisabled")}</p>
        </div>
      </div>

      <section className="dashboard-focus-panel app-surface">
        <div>
          <p className="eyebrow">{t("dashboard.focusEyebrow")}</p>
          <h3>{t("dashboard.focusTitle")}</h3>
          <p>{cards.length > 0 ? t("dashboard.focusReady") : t("dashboard.emptyDescription")}</p>
        </div>
        <div className="dashboard-focus-actions">
          <button type="button" className="ghost-button" onClick={() => navigate("/workbench")}>{t("dashboard.openWorkbench")}</button>
          <button type="button" className="ghost-button" onClick={() => navigate("/graph")}>{t("dashboard.openGraph")}</button>
        </div>
      </section>
    </section>
  );
}