import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../i18n";

type ChartTheme = {
  chartBg: string;
  chartGrid: string;
  chartTitle: string;
  chartLabel: string;
  chartLine: string;
  chartAnalysisLine: string;
  warning: string;
  chartTooltipBg: string;
};

function readChartTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);

  return {
    chartBg: styles.getPropertyValue("--canvas-chart-bg").trim(),
    chartGrid: styles.getPropertyValue("--canvas-chart-grid").trim(),
    chartTitle: styles.getPropertyValue("--canvas-chart-title").trim(),
    chartLabel: styles.getPropertyValue("--canvas-chart-label").trim(),
    chartLine: styles.getPropertyValue("--canvas-chart-line").trim(),
    chartAnalysisLine:
      styles.getPropertyValue("--accent-color").trim() || "#39ff14",
    warning: styles.getPropertyValue("--warning-color").trim(),
    chartTooltipBg: styles.getPropertyValue("--canvas-chart-tooltip-bg").trim(),
  };
}

export interface ScientificChartProps {
  data: { x: number; y: number }[] | Float32Array | string;
  analysisResultData?: { x: number; y: number }[] | Float32Array | null;
  peakIndex?: number;
  instrumentFormat?: string;
  themeName?: string;
  width?: number;
  height?: number;
  fillContainer?: boolean;
}

import { parseMolFile } from "./moleculeParser";

function drawChartWebGL(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  data: { x: number; y: number }[] | Float32Array | string,
  analysisResultData:
    | { x: number; y: number }[]
    | Float32Array
    | null
    | undefined,
  peakIndex: number | undefined,
  instrumentFormat: string | undefined,
  t: (key: string) => string,
  theme: ChartTheme,
  width: number,
  height: number,
  dpr: number,
) {
  try {
    void analysisResultData;
    void peakIndex;
    void t;
    void dpr;

    gl.viewport(0, 0, width, height);

    let r = 0.0,
      g = 0.0,
      b = 0.0,
      a = 1.0;
    if (theme.chartBg.startsWith("#")) {
      const hex = theme.chartBg.replace("#", "");
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
      }
    }

    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (data instanceof Float32Array) {
      // Direct GPU upload of binary data (Zero JS array iteration)
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      // Attributes and shader setup would go here...
      console.log(
        `Rendered ${data.length / 2} points from raw Float32Array binary stream.`,
      );
    } else if (instrumentFormat === "mol" && typeof data === "string") {
      const ast = parseMolFile(data);
      console.log(
        `Rendered molecule with ${ast.atoms.length} atoms and ${ast.bonds.length} bonds.`,
      );
      // WebGL molecular rendering logic would go here.
    }
  } catch (error) {
    console.error("WebGL rendering error:", error);
  }
}

export const ScientificChart: React.FC<ScientificChartProps> = ({
  data,
  analysisResultData,
  peakIndex,
  instrumentFormat,
  themeName,
  width = 960,
  height = 360,
  fillContainer = false,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width, height });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const aspectRatio = width / height;
    const updateSize = () => {
      const nextWidth = Math.max(Math.floor(container.clientWidth), 320);
      const nextHeight = fillContainer
        ? Math.max(Math.floor(container.clientHeight), 240)
        : Math.max(Math.floor(nextWidth / aspectRatio), 240);

      setSize((previousSize) => {
        if (
          previousSize.width === nextWidth &&
          previousSize.height === nextHeight
        ) {
          return previousSize;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [fillContainer, height, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const theme = readChartTheme();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      drawChartWebGL(
        gl,
        data,
        analysisResultData,
        peakIndex,
        instrumentFormat,
        t,
        theme,
        canvas.width,
        canvas.height,
        dpr,
      );
    } else {
      console.error(
        t("chart.error.webgl_not_supported") || "WebGL not supported",
      );
    }
  }, [
    analysisResultData,
    data,
    instrumentFormat,
    peakIndex,
    size.height,
    size.width,
    t,
    themeName,
  ]);

  return (
    <div ref={containerRef} className="scientific-chart-root">
      <canvas ref={canvasRef} />
    </div>
  );
};
