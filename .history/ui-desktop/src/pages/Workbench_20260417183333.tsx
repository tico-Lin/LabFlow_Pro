import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatMetadataLabel, formatMetadataValue, type ThemeName } from "../app/labflow";
import { ScientificChart } from "../components/OfficeCanvas/ScientificChart";
import SpreadsheetGrid, { type SpreadsheetGridData } from "../components/OfficeCanvas/SpreadsheetGrid";
import { useTranslation } from "../i18n";

type AnalysisModuleId = "find-max-peak" | "generate-sine-wave";

type AnalysisModuleFormState = {
  threshold: string;
  frequency: string;
  amplitude: string;
};

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
  selectedNodeId,
  selectedNodeLabel,
  onLoadNode,
  onAnalyze,
  onCommit
}: WorkbenchProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const closeTimerRef = useRef<number | null>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<AnalysisModuleId>("find-max-peak");
  const [moduleForm, setModuleForm] = useState<AnalysisModuleFormState>({
    threshold: "0.8",
    frequency: "1",
    amplitude: "1"
  });

  const moduleOptions = useMemo(
    () => [
      { id: "find-max-peak" as const, label: t("modules.items.findMaxPeak.title") },
      { id: "generate-sine-wave" as const, label: t("modules.items.generateSineWave.title") }
    ],
    [t]
  );

  useEffect(() => {
    if (id) {
      onLoadNode(id);
    }
  }, [id, onLoadNode]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openAnalysisModal = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsModalMounted(true);
    window.requestAnimationFrame(() => {
      setIsModalOpen(true);
    });
  };

  const closeAnalysisModal = () => {
    setIsModalOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setIsModalMounted(false);
      closeTimerRef.current = null;
    }, 220);
  };

  const updateModuleField = (field: keyof AnalysisModuleFormState, value: string) => {
    setModuleForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildModulePayload = () => {
    if (selectedModuleId === "find-max-peak") {
      return {
        moduleId: selectedModuleId,
        params: {
          threshold: Number(moduleForm.threshold)
        }
      };
    }

    return {
      moduleId: selectedModuleId,
      params: {
        frequency: Number(moduleForm.frequency),
        amplitude: Number(moduleForm.amplitude)
      }
    };
  };

  const handleRunAnalysisModule = async () => {
    const payload = buildModulePayload();
    console.log(JSON.stringify(payload, null, 2));

    if (payload.moduleId === "find-max-peak") {
      await onAnalyze();
    }

    closeAnalysisModal();
  };

  return (
    <section className="page-shell workbench-page">
      <div className="page-hero app-surface">
        <div>
          <p className="eyebrow">{t("workbench.eyebrow")}</p>
          <h2>{t("workbench.title")}</h2>
          <p>{t("workbench.description")}</p>
        </div>
        <div className="page-hero-actions">
          <button type="button" className="primary-button" onClick={openAnalysisModal}>
            {t("workbench.runModule")}
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

      {isModalMounted ? (
        <div className={`analysis-modal-overlay${isModalOpen ? " is-open" : ""}`} onClick={closeAnalysisModal}>
          <div
            className={`analysis-modal${isModalOpen ? " is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="analysis-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="analysis-modal-header">
              <div>
                <p className="eyebrow">{t("workbench.modal.eyebrow")}</p>
                <h3 id="analysis-modal-title">{t("workbench.modal.title")}</h3>
                <p>{t("workbench.modal.description")}</p>
              </div>
            </div>

            <div className="analysis-modal-body">
              <label className="analysis-modal-field">
                <span>{t("workbench.modal.moduleLabel")}</span>
                <select
                  value={selectedModuleId}
                  onChange={(event) => setSelectedModuleId(event.target.value as AnalysisModuleId)}
                >
                  {moduleOptions.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="analysis-modal-parameter-group">
                <div>
                  <h4>{t("workbench.modal.parametersTitle")}</h4>
                  <p>{t("workbench.modal.parametersDescription")}</p>
                </div>

                {selectedModuleId === "find-max-peak" ? (
                  <label className="analysis-modal-field">
                    <span>{t("modules.items.findMaxPeak.parameters.threshold")}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={moduleForm.threshold}
                      onChange={(event) => updateModuleField("threshold", event.target.value)}
                    />
                  </label>
                ) : (
                  <div className="analysis-modal-field-grid">
                    <label className="analysis-modal-field">
                      <span>{t("modules.items.generateSineWave.parameters.frequency")}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={moduleForm.frequency}
                        onChange={(event) => updateModuleField("frequency", event.target.value)}
                      />
                    </label>
                    <label className="analysis-modal-field">
                      <span>{t("modules.items.generateSineWave.parameters.amplitude")}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={moduleForm.amplitude}
                        onChange={(event) => updateModuleField("amplitude", event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-modal-footer">
              <button type="button" className="ghost-button" onClick={closeAnalysisModal}>
                {t("workbench.modal.cancel")}
              </button>
              <button type="button" className="primary-button" onClick={() => void handleRunAnalysisModule()}>
                {t("workbench.modal.run")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}