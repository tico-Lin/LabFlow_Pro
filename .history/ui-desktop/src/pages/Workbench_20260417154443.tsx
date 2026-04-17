import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildSpreadsheetFromPayload, formatMetadataLabel, formatMetadataValue, type ThemeName } from "../app/labflow";
import { ScientificChart } from "../components/OfficeCanvas/ScientificChart";
import SpreadsheetGrid, { type SpreadsheetGridData } from "../components/OfficeCanvas/SpreadsheetGrid";
import { useTranslation } from "../i18n";

const EMPTY_SPREADSHEET_DATA: SpreadsheetGridData = {
  rows: 100,
  cols: 26,
  cells: []
};

const DEFAULT_GRID_VIEWPORT = {
  width: 620,
  height: 308
};

const DEFAULT_CHART_SIZE = {
  width: 960,
  height: 360
};

function isSpreadsheetReady(data: SpreadsheetGridData | null | undefined): data is SpreadsheetGridData {
  return Boolean(data && data.rows > 0 && data.cols > 0);
}

function useMeasuredSize<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  fallback: { width: number; height: number }
) {
  const [size, setSize] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const measure = () => {
      setSize({
        width: Math.max(Math.round(element.clientWidth), fallback.width),
        height: Math.max(Math.round(element.clientHeight), fallback.height)
      });
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback.height, fallback.width, ref]);

  return size;
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
  const spreadsheetStageRef = useRef<HTMLDivElement>(null);
  const chartStageRef = useRef<HTMLDivElement>(null);
  const gridViewport = useMeasuredSize(spreadsheetStageRef, DEFAULT_GRID_VIEWPORT);
  const chartViewport = useMeasuredSize(chartStageRef, DEFAULT_CHART_SIZE);

  const safeChartData = useMemo(
    () => chartData.filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y)),
    [chartData]
  );

  const safeSpreadsheetData = useMemo(() => {
    if (isSpreadsheetReady(spreadsheetData)) {
      return spreadsheetData;
    }

    if (safeChartData.length > 0) {
      return buildSpreadsheetFromPayload(
        EMPTY_SPREADSHEET_DATA,
        instrumentFormat,
        null,
        safeChartData.map((point) => point.x),
        safeChartData.map((point) => point.y),
        t
      );
    }

    return EMPTY_SPREADSHEET_DATA;
  }, [instrumentFormat, safeChartData, spreadsheetData, t]);

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
          <div ref={spreadsheetStageRef} className="workbench-grid-stage">
            <SpreadsheetGrid
              data={safeSpreadsheetData}
              themeName={theme}
              revision={revision}
              peakRow={peakRow}
              focusRow={focusedRow}
              focusCol={1}
              viewportWidth={gridViewport.width}
              viewportHeight={gridViewport.height}
            />
          </div>
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
          <div ref={chartStageRef} className="workbench-chart-stage">
            <ScientificChart
              data={safeChartData.length > 0 ? safeChartData : []}
              instrumentFormat={instrumentFormat}
              peakIndex={peakIndex}
              themeName={theme}
              width={chartViewport.width}
              height={chartViewport.height}
            />
          </div>
        </section>
      </div>
    </section>
  );
}