import { invoke } from "@tauri-apps/api/core";
import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Responsive,
  WidthProvider,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts
} from "react-grid-layout/legacy";
import { useNavigate, useParams } from "react-router-dom";
import {
  buildAnalysisModuleFormState,
  formatMetadataLabel,
  formatMetadataValue,
  parsePluginManifests,
  type PluginManifest,
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

const ResponsiveGridLayout = WidthProvider(Responsive);
const WORKBENCH_LAYOUT_STORAGE_KEY = "workbench-layout-v2";
const DEFAULT_WORKBENCH_LAYOUT: Layout = [
  { i: "metadata",    x: 0, y: 0,  w: 12, h: 2 },
  { i: "spreadsheet", x: 0, y: 2,  w: 12, h: 5 },
  { i: "chart",       x: 0, y: 7,  w: 12, h: 6 }
];
const WORKBENCH_CARD_STYLE = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-color, var(--border))",
  borderRadius: "8px"
} as const;

const NUMBER_INPUT_PATTERN = /^-?\d*(?:[.,]\d*)?$/u;

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
  const [analysisModules, setAnalysisModules] = useState<PluginManifest[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [moduleForm, setModuleForm] = useState<AnalysisModuleFormState>({});
  const [analysisResultData, setAnalysisResultData] = useState<ChartPoint[] | null>(null);
  const [analysisResultState, setAnalysisResultState] = useState<AnalysisResultState | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [workbenchLayout, setWorkbenchLayout] = useState<Layout>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_WORKBENCH_LAYOUT;
    }

    const rawLayout = window.localStorage.getItem(WORKBENCH_LAYOUT_STORAGE_KEY);
    if (!rawLayout) {
      return DEFAULT_WORKBENCH_LAYOUT;
    }

    try {
      const parsedLayout = JSON.parse(rawLayout) as unknown;
      if (!Array.isArray(parsedLayout)) {
        return DEFAULT_WORKBENCH_LAYOUT;
      }

      const normalizedLayout = parsedLayout.filter((entry): entry is LayoutItem => {
        if (!entry || typeof entry !== "object") {
          return false;
        }

        const candidate = entry as Partial<LayoutItem>;
        return (
          typeof candidate.i === "string" &&
          typeof candidate.x === "number" &&
          typeof candidate.y === "number" &&
          typeof candidate.w === "number" &&
          typeof candidate.h === "number"
        );
      });

      return normalizedLayout.length ? normalizedLayout : DEFAULT_WORKBENCH_LAYOUT;
    } catch {
      return DEFAULT_WORKBENCH_LAYOUT;
    }
  });

  const selectedModule = useMemo<PluginManifest | undefined>(
    () => analysisModules.find((module) => module.id === selectedModuleId),
    [analysisModules, selectedModuleId]
  );
  const workbenchLayouts = useMemo<ResponsiveLayouts>(
    () => ({
      lg: workbenchLayout,
      md: workbenchLayout,
      sm: workbenchLayout,
      xs: workbenchLayout,
      xxs: workbenchLayout
    }),
    [workbenchLayout]
  );

  useEffect(() => {
    if (id) {
      onLoadNode(id);
    }
  }, [id, onLoadNode]);

  useEffect(() => {
    let isActive = true;

    const loadModules = async () => {
      setIsLoadingModules(true);
      setModulesError(null);

      try {
        const payload = await invoke<unknown>("get_available_plugins");
        const nextModules = parsePluginManifests(payload);
        if (!isActive) {
          return;
        }

        setAnalysisModules(nextModules);
        const initialModule = nextModules[0];
        setSelectedModuleId(initialModule?.id ?? "");
        setModuleForm(buildAnalysisModuleFormState(initialModule));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAnalysisModules([]);
        setSelectedModuleId("");
        setModuleForm({});
        setModulesError(error instanceof Error ? error.message : String(error));
      } finally {
        if (isActive) {
          setIsLoadingModules(false);
        }
      }
    };

    void loadModules();

    return () => {
      isActive = false;
    };
  }, []);

  const updateModuleField = (parameter: PluginManifest["parameters"][number], value: string) => {
    if (parameter.type === "number") {
      const normalizedValue = value.replace(/,/gu, ".");
      if (normalizedValue !== "" && !NUMBER_INPUT_PATTERN.test(normalizedValue)) {
        return;
      }

      setModuleForm((prev) => ({ ...prev, [parameter.key]: normalizedValue }));
      return;
    }

    setModuleForm((prev) => ({ ...prev, [parameter.key]: value }));
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
          const parsedValue = Number(rawValue);
          accumulator[parameter.key] = Number.isFinite(parsedValue)
            ? parsedValue
            : Number(parameter.defaultValue);
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
      const response = await invoke<string>("run_plugin_sandbox", {
        pluginId: selectedModule.id,
        params: JSON.stringify(buildModulePayload().parameters),
        blobHash: null
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

    setModuleForm(buildAnalysisModuleFormState(nextModule));
  };

  const handleWorkbenchLayoutChange = useCallback((layout: Layout) => {
    setWorkbenchLayout(layout);
  }, []);

  const handleWorkbenchLayoutCommit = useCallback((layout: Layout) => {
    setWorkbenchLayout(layout);
    window.localStorage.setItem(WORKBENCH_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  }, []);

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
          <ResponsiveGridLayout
            className="workbench-grid-layout"
            layouts={workbenchLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
            rowHeight={72}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            useCSSTransforms={true}
            compactType={null}
            isResizable={true}
            isDraggable={true}
            resizeHandles={["se"]}
            draggableHandle=".grid-drag-handle"
            onLayoutChange={handleWorkbenchLayoutChange}
            onDragStop={handleWorkbenchLayoutCommit}
            onResizeStop={handleWorkbenchLayoutCommit}
          >
            <div key="metadata" style={WORKBENCH_CARD_STYLE}>
              <div className="grid-drag-handle" />
              <div className="workbench-grid-item-body instrument-summary-card">
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
              </div>
            </div>

            <div key="spreadsheet" style={WORKBENCH_CARD_STYLE}>
              <div className="grid-drag-handle" />
              <div className="workbench-grid-item-body">
                <SpreadsheetGrid
                  data={spreadsheetData}
                  themeName={theme}
                  revision={revision}
                  peakRow={peakRow}
                  focusRow={focusedRow}
                  focusCol={1}
                  resizable={false}
                  fillContainer={true}
                />
              </div>
            </div>

            <div key="chart" style={WORKBENCH_CARD_STYLE}>
              <div className="grid-drag-handle" />
              <div className="chart-shell workbench-grid-item-body">
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
                  fillContainer={true}
                />
              </div>
            </div>
          </ResponsiveGridLayout>
        </div>

        <aside className="analysis-inspector app-surface" aria-labelledby="analysis-panel-title">
          <div className="analysis-inspector-header">
            <p className="eyebrow">{t("workbench.modal.eyebrow")}</p>
            <h3 id="analysis-panel-title">{t("workbench.modal.title")}</h3>
            <p>{t("workbench.modal.description")}</p>
          </div>

          <div className="analysis-inspector-body">
            {isLoadingModules ? (
              <div className="analysis-panel-loading" role="status" aria-live="polite">
                <LoaderCircle aria-hidden="true" className="modules-loading-spinner" />
                <p>{t("common.loading")}</p>
                <div className="analysis-panel-loading-skeleton" aria-hidden="true">
                  <span className="analysis-panel-loading-line is-wide" />
                  <span className="analysis-panel-loading-line" />
                  <span className="analysis-panel-loading-line" />
                </div>
              </div>
            ) : modulesError ? (
              <div className="analysis-panel-status is-error" role="alert">
                <p>{modulesError}</p>
              </div>
            ) : (
              <>
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
                          <div className="analysis-panel-field-label-row">
                            <span>{parameter.name}</span>
                            <span className="analysis-panel-field-hint">{parameter.type}</span>
                          </div>

                          <div className="analysis-panel-field-input-row">
                            {parameter.type === "boolean" ? (
                              <select
                                value={moduleForm[parameter.key] ?? String(parameter.defaultValue)}
                                onChange={(event) => updateModuleField(parameter, event.target.value)}
                              >
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                inputMode={parameter.type === "number" ? "decimal" : undefined}
                                placeholder={String(parameter.defaultValue)}
                                value={moduleForm[parameter.key] ?? String(parameter.defaultValue)}
                                onChange={(event) => updateModuleField(parameter, event.target.value)}
                              />
                            )}

                            <span className="analysis-panel-field-default">
                              {t("workbench.modal.defaultValue")}: {String(parameter.defaultValue)}
                            </span>
                          </div>

                          <div className="analysis-panel-field-meta">
                            {parameter.type === "number" ? (
                              <span className="analysis-panel-field-hint">{t("workbench.modal.numberOnlyHint")}</span>
                            ) : (
                              <span className="analysis-panel-field-hint">{t("workbench.modal.parameterHint")}</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="analysis-panel-empty-state">
                      <p>{t("workbench.modal.noParameters")}</p>
                    </div>
                  )}
                </div>
              </>
            )}

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
              disabled={isRunningAnalysis || isLoadingModules || !selectedModule}
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