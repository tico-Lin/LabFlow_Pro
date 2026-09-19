import React, { useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n';

type ChartTheme = {
  chartBg: string;
  chartGrid: string;
  chartTitle: string;
  chartLabel: string;
  chartLine: string;
  warning: string;
  chartTooltipBg: string;
};

function readChartTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);

  return {
    chartBg: styles.getPropertyValue('--canvas-chart-bg').trim(),
    chartGrid: styles.getPropertyValue('--canvas-chart-grid').trim(),
    chartTitle: styles.getPropertyValue('--canvas-chart-title').trim(),
    chartLabel: styles.getPropertyValue('--canvas-chart-label').trim(),
    chartLine: styles.getPropertyValue('--canvas-chart-line').trim(),
    warning: styles.getPropertyValue('--warning-color').trim(),
    chartTooltipBg: styles.getPropertyValue('--canvas-chart-tooltip-bg').trim()
  };
}

export interface ScientificChartProps {
  data: { x: number; y: number }[];
  peakIndex?: number;
  instrumentFormat?: string;
  themeName?: string;
  width: number;
  height: number;
}

function resolveChartLabels(instrumentFormat: string | undefined, t: (key: string) => string) {
  const normalized = instrumentFormat?.toLowerCase();

  if (normalized === 'cv') {
    return {
      title: t('chartLabels.cv.title'),
      x: t('chartLabels.cv.x'),
      y: t('chartLabels.cv.y')
    };
  }

  if (normalized === 'xrd') {
    return {
      title: t('chartLabels.xrd.title'),
      x: t('chartLabels.xrd.x'),
      y: t('chartLabels.xrd.y')
    };
  }

  return {
    title: t('chartLabels.default.title'),
    x: t('chartLabels.default.x'),
    y: t('chartLabels.default.y')
  };
}

function drawChart(
  ctx: CanvasRenderingContext2D,
  data: { x: number; y: number }[],
  peakIndex: number | undefined,
  instrumentFormat: string | undefined,
  t: (key: string) => string,
  theme: ChartTheme,
  width: number,
  height: number,
  dpr: number
) {
  try {
    const leftPadding = 52 * dpr;
    const rightPadding = 20 * dpr;
    const topPadding = 38 * dpr;
    const bottomPadding = 34 * dpr;
    const chartW = width - leftPadding - rightPadding;
    const chartH = height - topPadding - bottomPadding;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.chartBg;
    ctx.fillRect(0, 0, width, height);

    const labels = resolveChartLabels(instrumentFormat, t);

    ctx.fillStyle = theme.chartTitle;
    ctx.font = `${16 * dpr}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(labels.title, width / 2, 22 * dpr);

    ctx.fillStyle = theme.chartLabel;
    ctx.font = `${12 * dpr}px sans-serif`;
    ctx.fillText(labels.x, width / 2, height - 10 * dpr);
    ctx.save();
    ctx.translate(16 * dpr, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(labels.y, 0, 0);
    ctx.restore();

    ctx.strokeStyle = theme.chartGrid;
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(leftPadding, height - bottomPadding);
    ctx.lineTo(width - rightPadding, height - bottomPadding);
    ctx.moveTo(leftPadding, height - bottomPadding);
    ctx.lineTo(leftPadding, topPadding);
    ctx.stroke();

    const safeData = data.filter(
      (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y)
    );

    if (!safeData.length) {
      ctx.restore();
      return;
    }

    const xVals = safeData.map((d) => d.x);
    const yVals = safeData.map((d) => d.y);
    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);
    const yMin = Math.min(...yVals);
    const yMax = Math.max(...yVals);

    const scaleX = chartW / (xMax - xMin || 1);
    const scaleY = chartH / (yMax - yMin || 1);

    ctx.strokeStyle = theme.chartLine;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    safeData.forEach((pt, i) => {
      const px = leftPadding + (pt.x - xMin) * scaleX;
      const py = height - bottomPadding - (pt.y - yMin) * scaleY;
      if (!Number.isFinite(px) || !Number.isFinite(py)) {
        return;
      }

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });
    ctx.stroke();

    if (
      typeof peakIndex === 'number' &&
      peakIndex >= 0 &&
      peakIndex < data.length &&
      Number.isFinite(data[peakIndex]?.x) &&
      Number.isFinite(data[peakIndex]?.y)
    ) {
      const pt = data[peakIndex];
      const px = leftPadding + (pt.x - xMin) * scaleX;
      const py = height - bottomPadding - (pt.y - yMin) * scaleY;

      if (Number.isFinite(px) && Number.isFinite(py)) {
        ctx.save();
        ctx.strokeStyle = theme.warning;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.arc(px, py, 8 * dpr, 0, 2 * Math.PI);
        ctx.stroke();

        const label = `(${pt.x}, ${pt.y})`;
        ctx.font = `${14 * dpr}px sans-serif`;
        const textW = ctx.measureText(label).width;
        const labelX = px + 12 * dpr;
        const labelY = py - 8 * dpr;
        ctx.fillStyle = theme.chartTooltipBg;
        ctx.fillRect(labelX - 2 * dpr, labelY - 14 * dpr, textW + 4 * dpr, 18 * dpr);
        ctx.fillStyle = theme.warning;
        ctx.fillText(label, labelX, labelY);
        ctx.restore();
      }
    }

    ctx.restore();
  } catch (error) {
    console.error(error);
  }
}

export const ScientificChart: React.FC<ScientificChartProps> = ({
  data,
  peakIndex,
  instrumentFormat,
  themeName,
  width,
  height,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const safeWidth = Math.max(Math.floor(width), 1);
    const safeHeight = Math.max(Math.floor(height), 1);
    const theme = readChartTheme();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = safeWidth * dpr;
    canvas.height = safeHeight * dpr;
    canvas.style.width = `${safeWidth}px`;
    canvas.style.height = `${safeHeight}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawChart(ctx, data, peakIndex, instrumentFormat, t, theme, canvas.width, canvas.height, dpr);
    }
  }, [data, peakIndex, instrumentFormat, themeName, width, height, t]);

  return <canvas ref={canvasRef} />;
};
