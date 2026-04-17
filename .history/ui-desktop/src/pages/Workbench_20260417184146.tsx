import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  buildAnalysisModules,
  formatMetadataLabel,
  formatMetadataValue,
  type AnalysisModule,
  type ThemeName
} from "../app/labflow";
import { ScientificChart } from "../components/OfficeCanvas/ScientificChart";
import SpreadsheetGrid, { type SpreadsheetGridData } from "../components/OfficeCanvas/SpreadsheetGrid";
import { useTranslation } from "../i18n";

type AnalysisModuleFormState = Record<string, string>;

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
  onLoadNode
}: WorkbenchProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const closeTimerRef = useRef<number | null>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const analysisModules = useMemo(() => buildAnalysisModules(t), [t]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("find-max-peak");
  const [moduleForm, setModuleForm] = useState<AnalysisModuleFormState>(() => {
    const initialModule = buildAnalysisModules(t)[0];

    return Object.fromEntries(
      initialModule.parameters.map((parameter) => [parameter.key, String(parameter.defaultValue)])
    );
  });

  const selectedModule = useMemo<AnalysisModule | undefined>(
    () => analysisModules.find((module) => module.id === selectedModuleId),
    [analysisModules, selectedModuleId]
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
    return {
      selectedModule: selectedModule
        ? {
            id: selectedModule.id,
            name: selectedModule.name,
            supportedFormats: selectedModule.supportedFormats
          }
        : null,
      parameters: (selectedModule?.parameters ?? []).reduce<Record<string, string | number | boolean>>((accumulator, parameter) => {
        const rawValue = moduleForm[parameter.key] ?? String(parameter.defaultValue);

        if (parameter.type === "number") {
          accumulator[parameter.key] = Number(rawValue);
          return accumulator;
        }

        if (parameter.type === "boolean") {
          accumulator[parameter.key] = rawValue === "true";
          return accumulator;
        }

        accumulator[parameter.key] = rawValue;
        return accumulator;
      }, {})
    };
  };

  const handleRunAnalysisModule = () => {
    const payload = buildModulePayload();
    console.log(payload);

    closeAnalysisModal();
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);

    const nextModule = analysisModules.find((module) => module.id === moduleId);
    if (!nextModule) {
      return;
    }

    setModuleForm(
      Object.fromEntries(nextModule.parameters.map((parameter) => [parameter.key, String(parameter.defaultValue)]))
    );
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
        <div className={`modal-backdrop analysis-modal-overlay${isModalOpen ? " is-open" : ""}`} onClick={closeAnalysisModal}>
          <div
            className={`modal-content analysis-modal${isModalOpen ? " is-open" : ""}`}
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
                  onChange={(event) => handleModuleSelect(event.target.value)}
                >
                  {analysisModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="analysis-modal-parameter-group">
                <div>
                  <h4>{t("workbench.modal.parametersTitle")}</h4>
                  <p>{t("workbench.modal.parametersDescription")}</p>
                </div>

                {selectedModule?.parameters.length ? (
                  <div className="analysis-modal-field-grid">
                    {selectedModule.parameters.map((parameter) => (
                      <label key={parameter.key} className="analysis-modal-field">
                        <span>{parameter.name}</span>
                        <input
                          type={parameter.type === "number" ? "number" : "text"}
                          step={parameter.type === "number" ? "0.1" : undefined}
                          value={moduleForm[parameter.key] ?? String(parameter.defaultValue)}
                          onChange={(event) => updateModuleField(parameter.key, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="analysis-modal-empty-state">
                    <p>{t("workbench.modal.noParameters")}</p>
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