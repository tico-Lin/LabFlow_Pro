import React, { useRef, useEffect } from 'react';

export interface ScientificChartProps {
  data: { x: number; y: number }[];
  peakIndex?: number;
  width: number;
  height: number;
}

// const AXIS_COLOR = '#888'; // 已移除未使用變數
const GRID_COLOR = '#eee';
const LINE_COLOR = '#1976d2';
const PEAK_CIRCLE_COLOR = '#d32f2f';
const PEAK_LABEL_BG = 'rgba(255,255,255,0.85)';

function drawChart(
  ctx: CanvasRenderingContext2D,
  data: { x: number; y: number }[],
  peakIndex: number | undefined,
  width: number,
  height: number,
  dpr: number
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (!data.length) {
    ctx.restore();
    return;
  }

  // 計算 min/max
  const xVals = data.map((d) => d.x);
  const yVals = data.map((d) => d.y);
  const xMin = Math.min(...xVals);
  const xMax = Math.max(...xVals);
  const yMin = Math.min(...yVals);
  const yMax = Math.max(...yVals);

  // 邊界
  const padding = 40 * dpr;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  // 縮放
  const scaleX = chartW / (xMax - xMin || 1);
  const scaleY = chartH / (yMax - yMin || 1);

  // 畫輔助線
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  // X軸
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  // Y軸
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(padding, padding);
  ctx.stroke();

  // 畫折線
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  data.forEach((pt, i) => {
    const px = padding + (pt.x - xMin) * scaleX;
    const py = height - padding - (pt.y - yMin) * scaleY;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  ctx.stroke();

  // 畫峰值
  if (
    typeof peakIndex === 'number' &&
    peakIndex >= 0 &&
    peakIndex < data.length
  ) {
    const pt = data[peakIndex];
    const px = padding + (pt.x - xMin) * scaleX;
    const py = height - padding - (pt.y - yMin) * scaleY;
    ctx.save();
    ctx.strokeStyle = PEAK_CIRCLE_COLOR;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(px, py, 8 * dpr, 0, 2 * Math.PI);
    ctx.stroke();
    // 標籤
    const label = `(${pt.x}, ${pt.y})`;
    ctx.font = `${14 * dpr}px sans-serif`;
    const textW = ctx.measureText(label).width;
    const labelX = px + 12 * dpr;
    const labelY = py - 8 * dpr;
    ctx.fillStyle = PEAK_LABEL_BG;
    ctx.fillRect(labelX - 2 * dpr, labelY - 14 * dpr, textW + 4 * dpr, 18 * dpr);
    ctx.fillStyle = PEAK_CIRCLE_COLOR;
    ctx.fillText(label, labelX, labelY);
    ctx.restore();
  }

  ctx.restore();
}

export const ScientificChart: React.FC<ScientificChartProps> = ({
  data,
  peakIndex,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawChart(ctx, data, peakIndex, canvas.width, canvas.height, dpr);
    }
  }, [data, peakIndex, width, height]);

  return <canvas ref={canvasRef} />;
};
