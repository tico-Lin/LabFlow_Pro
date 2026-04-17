import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
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
type ChartPoint = { x: number; y: number };
type AnalysisResultState = {
  summary: string;
  pointCount: number | null;
};

function parseAnalysisChartData(value: unknown): ChartPoint[] | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as { data?: { x?: unknown; y?: unknown } };
  const xValues = payload.data?.x;
  const yValues = payload.data?.y;
  if (!Array.isArray(xValues) || !Array.isArray(yValues)) {
    return null;
  }

  const pointCount = Math.min(xValues.length, yValues.length);
  const nextData: ChartPoint[] = [];
  for (let index = 0; index < pointCount; index += 1) {
    const x = typeof xValues[index] === "number" ? xValues[index] : Number(xValues[index]);
    const y = typeof yValues[index] === "number" ? yValues[index] : Number(yValues[index]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      nextData.push({ x, y });
    }
  }

  return nextData.length ? nextData : null;
}

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
  const analysisModules = useMemo(() => buildAnalysisModules(t), [t]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("find_max_peak");
  const [moduleForm, setModuleForm] = useState<AnalysisModuleFormState>(() => {
    const initialModule = buildAnalysisModules(t)[0];

    return Object.fromEntries(
      initialModule.parameters.map((parameter) => [parameter.key, String(parameter.defaultValue)])
    );
  });
  const [analysisResultData, setAnalysisResultData] = useState<ChartPoint[] | null>(null);
  const [analysisResultState, setAnalysisResultState] = useState<AnalysisResultState | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  const selectedModule = useMemo<AnalysisModule | undefined>(
    () => analysisModules.find((module) => module.id === selectedModuleId),
    [analysisModules, selectedModuleId]
  );

  useEffect(() => {
    if (id) {
      onLoadNode(id);
    }
  }, [id, onLoadNode]);

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

  const handleRunAnalysisModule = async () => {
    if (!selectedModule) {
      return;
    }

    setIsRunningAnalysis(true);
    setAnalysisError(null);

    try {
      const response = await invoke<string>("run_analysis_module", {
        moduleId: selectedModule.id,
        params: JSON.stringify(buildModulePayload().parameters),
        data: JSON.stringify(chartData)
      });
      const parsed = JSON.parse(response) as unknown;
      const nextAnalysisData = parseAnalysisChartData(parsed);
      setAnalysisResultData(nextAnalysisData);
      setAnalysisResultState({
        summary: JSON.stringify(parsed),
        pointCount: nextAnalysisData?.length ?? null
      });
    } catch (error) {
      setAnalysisResultData(null);
      setAnalysisResultState(null);
      setAnalysisError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setAnalysisError(null);
    setAnalysisResultState(null);

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
        <div className="workbench-main-column">
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
              analysisResultData={analysisResultData}
              instrumentFormat={instrumentFormat}
              peakIndex={peakIndex}
              themeName={theme}
              width={960}
              height={360}
            />
          </section>
        </div>

        <aside className="analysis-inspector app-surface" aria-labelledby="analysis-panel-title">
          <div className="analysis-inspector-header">
            <p className="eyebrow">{t("workbench.modal.eyebrow")}</p>
            <h3 id="analysis-panel-title">{t("workbench.modal.title")}</h3>
            <p>{t("workbench.modal.description")}</p>
          </div>

          <div className="analysis-inspector-body">
            <label className="analysis-panel-field">
              <span>{t("workbench.modal.moduleLabel")}</span>
              <select value={selectedModuleId} onChange={(event) => handleModuleSelect(event.target.value)}>
                {analysisModules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="analysis-panel-section">
              <div>
                <h4>{t("workbench.modal.parametersTitle")}</h4>
                <p>{t("workbench.modal.parametersDescription")}</p>
              </div>

              {selectedModule?.parameters.length ? (
                <div className="analysis-panel-field-grid">
                  {selectedModule.parameters.map((parameter) => (
                    <label key={parameter.key} className="analysis-panel-field">
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
                <div className="analysis-panel-empty-state">
                  <p>{t("workbench.modal.noParameters")}</p>
                </div>
              )}
            </div>

            {analysisError ? (
              <div className="analysis-panel-status is-error" role="alert">
                <p>{analysisError}</p>
              </div>
            ) : null}

            {analysisResultState ? (
              <div className="analysis-panel-status">
                <p>{selectedModule?.name}</p>
                <strong>{analysisResultState.pointCount ?? "-"}</strong>
                <span>{analysisResultState.pointCount ? t("app.chart.title") : analysisResultState.summary}</span>
              </div>
            ) : null}
          </div>

          <div className="analysis-inspector-footer">
            <button
              type="button"
              className="primary-button"
              disabled={isRunningAnalysis}
              onClick={() => void handleRunAnalysisModule()}
            >
              {isRunningAnalysis ? `${t("workbench.modal.run")}...` : t("workbench.modal.run")}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}