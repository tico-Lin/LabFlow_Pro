import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DataCardRecord } from "../app/labflow";
import { useTranslation } from "../i18n";

type DashboardProps = {
  cards: DataCardRecord[];
  loading: boolean;
  ingestLoading: boolean;
  onImport: () => void | Promise<void>;
  onRefresh: () => void | Promise<unknown>;
  onSaveQuickNote: (content: string) => string | null;
};

export default function Dashboard({ cards, loading, ingestLoading, onImport, onRefresh, onSaveQuickNote }: DashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [livePulse, setLivePulse] = useState(0);
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    let unlisten: null | (() => void) = null;

    const bind = async () => {
      unlisten = await listen("graph-updated", () => {
        setLivePulse((prev) => prev + 1);
        void onRefresh();
      });
    };

    void bind();
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [onRefresh]);

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
          <span className="summary-card-label">{t("dashboard.liveFeed")}</span>
          <strong>{livePulse > 0 ? t("dashboard.liveConnected") : t("dashboard.liveIdle")}</strong>
        </div>
      </div>

      {cards.length === 0 ? (
        <section className="page-empty app-surface">
          <h3>{t("dashboard.emptyTitle")}</h3>
          <p>{t("dashboard.emptyDescription")}</p>
        </section>
      ) : (
        <div className="data-card-grid">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className="data-card app-surface"
              onClick={() => navigate(`/workbench/${card.id}`)}
            >
              <div className="data-card-topline">
                <span className="data-card-type">{card.instrumentFormat}</span>
                <span className="data-card-id">{card.primaryValue}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.id}</p>
              <div className="data-card-meta-list">
                {card.metadataPreview.map((item) => (
                  <span key={`${card.id}-${item}`} className="metadata-chip">
                    {item}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}