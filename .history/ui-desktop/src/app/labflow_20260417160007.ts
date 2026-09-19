import type { SpreadsheetGridData } from "../components/OfficeCanvas/SpreadsheetGrid";

export type ThemeName = "dark" | "light";

export type PeakResult = { index: number; voltage: number; current: number };

export type GraphNodeSnapshot = {
  id: string;
  label: string;
  properties: Record<string, string>;
  content?: unknown;
};

export type GraphStateSnapshot = {
  nodes: GraphNodeSnapshot[];
  deleted_nodes?: string[];
  edges: Array<{ id: string; from: string; to: string; label: string }>;
  deleted_edges: string[];
  op_count: number;
};

export type GraphUpdatedPayload = string | { kind?: string; op_ids?: string[]; label?: string };

export type NoteDocument = {
  title: string;
  content: string;
};

export type InstrumentDataPayload = {
  instrument_format?: string;
  metadata?: unknown;
  x?: unknown;
  y?: unknown;
  data?: {
    instrument_format?: string;
    metadata?: unknown;
    x?: unknown;
    y?: unknown;
  };
  result?: {
    instrument_format?: string;
    metadata?: unknown;
    data?: {
      instrument_format?: string;
      metadata?: unknown;
      x?: unknown;
      y?: unknown;
    };
  };
};

export type DataCardRecord = {
  id: string;
  title: string;
  type: string;
  instrumentFormat: string;
  primaryValue: string;
  metadataPreview: string[];
};

export function normalizeInstrumentFormat(format: string | undefined, fallbackLabel: string): string {
  if (!format) {
    return fallbackLabel;
  }

  const normalized = format.trim().toLowerCase();
  if (normalized === "cv") {
    return "CV";
  }
  if (normalized === "xrd") {
    return "XRD";
  }
  if (!normalized) {
    return fallbackLabel;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getAxisLabels(
  instrumentFormat: string,
  metadata: Record<string, unknown> | null,
  t: (key: string) => string
): { x: string; y: string } {
  if (instrumentFormat === "CV") {
    return { x: t("chartLabels.cv.x"), y: t("chartLabels.cv.y") };
  }
  if (instrumentFormat === "XRD") {
    return { x: t("chartLabels.xrd.x"), y: t("chartLabels.xrd.y") };
  }

  return {
    x: typeof metadata?.x_label === "string" ? metadata.x_label : t("chartLabels.default.x"),
    y: typeof metadata?.y_label === "string" ? metadata.y_label : t("chartLabels.default.y")
  };
}

function toNumericArray(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isFinite(value));
}

export function buildSpreadsheetFromPayload(
  source: SpreadsheetGridData,
  instrumentFormat: string,
  metadata: Record<string, unknown> | null,
  xValues: number[],
  yValues: number[],
  t: (key: string) => string
): SpreadsheetGridData {
  const cells: SpreadsheetGridData["cells"] = {};
  const axisLabels = getAxisLabels(instrumentFormat, metadata, t);
  const pointCount = Math.min(xValues.length, yValues.length);

  cells["1:1"] = axisLabels.x;
  cells["1:2"] = axisLabels.y;
  cells["1:3"] = t("app.instrument.graphOp");

  for (let index = 0; index < pointCount; index += 1) {
    const row = index + 2;
    cells[`${row}:1`] = xValues[index];
    cells[`${row}:2`] = yValues[index];
  }

  return {
    rows: Math.max(source.rows, pointCount + 2),
    cols: source.cols,
    cells
  };
}

export function formatMetadataLabel(key: string, t: (key: string) => string): string {
  const labelMap: Record<string, string> = {
    parser: t("metadata.parser"),
    scan_rate: t("metadata.scan_rate"),
    x_label: t("metadata.x_label"),
    y_label: t("metadata.y_label")
  };

  if (labelMap[key]) {
    return labelMap[key];
  }

  return key
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatMetadataValue(value: unknown, naLabel: string): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return naLabel;
  }

  return JSON.stringify(value);
}

export function normalizeGraphNodeType(properties: Record<string, string>): string {
  if (typeof properties.type === "string" && properties.type.trim()) {
    return properties.type.trim().toLowerCase();
  }

  if (typeof properties.ingest_format === "string" && properties.ingest_format.trim()) {
    return properties.ingest_format.trim().toLowerCase();
  }

  return "instrument_data";
}

export function parseContentObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function parseNoteDocument(node: GraphNodeSnapshot, fallbackTitle: string): NoteDocument {
  const contentObject = parseContentObject(node.content);
  const title =
    typeof contentObject?.title === "string" && contentObject.title.trim()
      ? contentObject.title
      : node.label || fallbackTitle;

  return {
    title,
    content: typeof contentObject?.content === "string" ? contentObject.content : ""
  };
}

export function resolveSpreadsheetAnchor(node: GraphNodeSnapshot): number {
  const rawAnchor = Number(node.properties.grid_anchor_row ?? 2);
  return Number.isFinite(rawAnchor) && rawAnchor >= 2 ? rawAnchor : 2;
}

export function getGraphNodeLabel(node: GraphNodeSnapshot, fallbackTitle: string): string {
  if (normalizeGraphNodeType(node.properties) === "note") {
    return parseNoteDocument(node, fallbackTitle).title;
  }

  return node.label;
}

export function parseInstrumentPayload(
  value: unknown,
  fallbackLabel: string,
  unknownLabel: string
): {
  instrumentFormat: string;
  metadata: Record<string, unknown> | null;
  xValues: number[];
  yValues: number[];
  chartData: Array<{ x: number; y: number }>;
} | null {
  let payload: InstrumentDataPayload | undefined;

  if (typeof value === "string") {
    try {
      payload = JSON.parse(value) as InstrumentDataPayload;
    } catch {
      console.error("Payload parse failed:", value);
      return null;
    }
  } else {
    payload = value as InstrumentDataPayload | undefined;
  }

  const axisCandidates = [payload, payload?.data, payload?.result?.data];
  let xValues: number[] = [];
  let yValues: number[] = [];

  for (const candidate of axisCandidates) {
    const nextXValues = toNumericArray(candidate?.x);
    const nextYValues = toNumericArray(candidate?.y);

    if (Math.min(nextXValues.length, nextYValues.length) > 0) {
      xValues = nextXValues;
      yValues = nextYValues;
      break;
    }
  }

  const metadataCandidates = [payload?.metadata, payload?.data?.metadata, payload?.result?.metadata, payload?.result?.data?.metadata];
  const metadata = metadataCandidates.map((entry) => parseContentObject(entry)).find((entry) => entry !== null) ?? null;
  const instrumentFormatCandidates = [
    payload?.instrument_format,
    payload?.data?.instrument_format,
    payload?.result?.instrument_format,
    payload?.result?.data?.instrument_format
  ];
  const instrumentFormat = normalizeInstrumentFormat(
    instrumentFormatCandidates.find((entry) => typeof entry === "string" && entry.trim()),
    fallbackLabel || unknownLabel
  );
  const pointCount = Math.min(xValues.length, yValues.length);

  if (pointCount === 0) {
    console.error("Payload parse failed:", payload);
    return null;
  }

  return {
    instrumentFormat,
    metadata,
    xValues,
    yValues,
    chartData: Array.from({ length: pointCount }, (_, index) => ({
      x: xValues[index],
      y: yValues[index]
    }))
  };
}

function pickPrimaryValue(node: GraphNodeSnapshot, metadata: Record<string, unknown> | null): string {
  const keys = [
    "timestamp",
    "time",
    "acquired_at",
    "created_at",
    "datetime",
    "date",
    "sample_id",
    "experiment_id",
    "run_id",
    "id"
  ];

  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return node.id;
}

export function buildDataCards(nodes: GraphNodeSnapshot[], unknownLabel: string): DataCardRecord[] {
  const cards = nodes.map((node) => {
    const type = normalizeGraphNodeType(node.properties);
    const contentObject = parseContentObject(node.content);
    const metadata = parseContentObject(contentObject?.metadata);
    const instrumentFormat = normalizeInstrumentFormat(
      typeof contentObject?.instrument_format === "string" ? contentObject.instrument_format : node.properties.ingest_format,
      node.label || unknownLabel
    );

    const title = type === "note" ? parseNoteDocument(node, unknownLabel).title : node.label || unknownLabel;
    const metadataPreview = metadata
      ? Object.entries(metadata)
          .slice(0, 3)
          .map(([key, value]) => `${key}: ${typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}`)
      : [node.id];

    return {
      id: node.id,
      title,
      type,
      instrumentFormat,
      primaryValue: pickPrimaryValue(node, metadata),
      metadataPreview
    };
  });

  return cards.sort((left, right) => {
    const leftWeight = left.type === "instrument_data" ? 0 : left.type === "note" ? 2 : 1;
    const rightWeight = right.type === "instrument_data" ? 0 : right.type === "note" ? 2 : 1;
    return leftWeight - rightWeight;
  });
}