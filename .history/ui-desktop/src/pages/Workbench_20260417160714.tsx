import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatMetadataLabel, formatMetadataValue, type ThemeName } from "../app/labflow";
import { ScientificChart } from "../components/OfficeCanvas/ScientificChart";
import SpreadsheetGrid, { type SpreadsheetGridData } from "../components/OfficeCanvas/SpreadsheetGrid";
import { useTranslation } from "../i18n";

type WorkbenchProps = {
  theme: ThemeName;
  spreadsheetData: SpreadsheetGridData;
  revision: number;
  peakRow: number | null;
  focusedRow: number | null;
  chartData: Array<{ x: number; y: number }>;
  peakIndex?: number;
  instrumentFormat: string;
  metadataEntries: Array<[string, unknown]>;
  emptyNotice: string | null;
  selectedNodeId: string | null;
  selectedNodeLabel: string | null;
  onLoadNode: (nodeId: string) => boolean;
  onAnalyze: () => void | Promise<void>;
  onCommit: () => void | Promise<void>;
};

export default function Workbench({
  theme,
  spreadsheetData,
  revision,
  peakRow,
  focusedRow,
  chartData,
  peakIndex,
  instrumentFormat,
  metadataEntries,
  emptyNotice,
  selectedNodeId,
  selectedNodeLabel,
  onLoadNode,
  onAnalyze,
  onCommit
}: WorkbenchProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      onLoadNode(id);
    }
  }, [id, onLoadNode]);

  return (
    <section className="page-shell workbench-page">
      <div className="page-hero app-surface">
        <div>
          <p className="eyebrow">{t("workbench.eyebrow")}</p>
          <h2>{t("workbench.title")}</h2>
          <p>{t("workbench.description")}</p>
        </div>
        <div className="page-hero-actions">
          <button type="button" className="primary-button" onClick={() => void onAnalyze()}>
            {t("app.toolbar.analyzePeak")}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={!selectedNodeId}
            onClick={() => navigate("/graph")}
          >
            {t("workbench.openGraph")}
          </button>
        </div>
      </div>

      <div className="workbench-content-grid">
        <section className="office-canvas-shell app-surface workbench-panel">
          <div className="instrument-summary">
            <div>
              <strong>{t("app.instrument.currentFormat")}</strong>
              <span>{instrumentFormat}</span>
            </div>
            <div>
              <strong>{t("workbench.currentDataset")}</strong>
              <span>{selectedNodeLabel ?? t("workbench.noDataset")}</span>
            </div>
            <div className="metadata-list">
              {metadataEntries.length > 0 ? (
                metadataEntries.map(([key, value]) => (
                  <span key={key} className="metadata-chip">
                    {formatMetadataLabel(key, t)}: {formatMetadataValue(value, t("common.na"))}
                  </span>
                ))
              ) : (
                <span className="metadata-chip">{t("app.instrument.noMetadata")}</span>
              )}
            </div>
          </div>
          {emptyNotice ? (
            <div className="selection-banner workbench-empty-notice" role="status">
              {emptyNotice}
            </div>
          ) : null}
          <SpreadsheetGrid
            data={spreadsheetData}
            themeName={theme}
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
              <button type="button" className="primary-button" onClick={() => void onCommit()}>
                {t("app.chart.commit")}
              </button>
            )}
          </div>
          <ScientificChart
            data={chartData}
            instrumentFormat={instrumentFormat}
            peakIndex={peakIndex}
            themeName={theme}
            width={960}
            height={360}
          />
        </section>
      </div>
    </section>
  );
}