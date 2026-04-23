import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Archive,
  FileAudio2,
  FileCode2,
  FileImage,
  FileText,
  FileVideo2,
  HardDrive,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout/legacy";
import { normalizeGraphNodeType, type GraphNodeSnapshot, type GraphStateSnapshot } from "../app/labflow";
import { PAGE_GRID_BREAKPOINTS, PAGE_GRID_COLS, usePageGrid } from "../app/usePageGrid";
import { useTranslation } from "../i18n";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_ASSETHUB_LAYOUT: Layout = [
  { i: "assets", x: 0, y: 0, w: 12, h: 10 }
];

type AssetHubViewProps = {
  graph: GraphStateSnapshot | null;
  onRefresh: () => void | Promise<unknown>;
};

function resolveFileIcon(extension: string): LucideIcon {
  const ext = extension.toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "tif", "tiff"].includes(ext)) {
    return FileImage;
  }

  if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) {
    return FileAudio2;
  }

  if (["mp4", "mov", "mkv", "avi", "webm", "wmv"].includes(ext)) {
    return FileVideo2;
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(ext)) {
    return Archive;
  }

  if (["rs", "py", "ts", "tsx", "js", "jsx", "json", "toml", "yaml", "yml", "go", "c", "cpp", "h", "hpp", "java", "kt", "swift", "md"].includes(ext)) {
    return FileCode2;
  }

  if (["txt", "csv", "log", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    return FileText;
  }

  return HardDrive;
}

function parseFileNode(node: GraphNodeSnapshot): {
  name: string;
  hash: string;
  extension: string;
  sizeBytes: number;
} {
  const name = typeof node.properties.title === "string" && node.properties.title.trim()
    ? node.properties.title
    : node.label;

  const hash = typeof node.properties.hash === "string" ? node.properties.hash : "";
  const extension = typeof node.properties.extension === "string" ? node.properties.extension : "";
  const sizeRaw = Number(node.properties.size ?? 0);

  return {
    name,
    hash,
    extension,
    sizeBytes: Number.isFinite(sizeRaw) && sizeRaw >= 0 ? sizeRaw : 0
  };
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return "0 KB";
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function AssetHubView({ graph, onRefresh }: AssetHubViewProps) {
  const { t } = useTranslation();
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { layouts: assetHubLayouts, handleLayoutChange: handleAssetHubLayoutChange } =
    usePageGrid("assethub-layout", DEFAULT_ASSETHUB_LAYOUT);

  const fileNodes = useMemo(
    () => (graph?.nodes ?? []).filter((node) => normalizeGraphNodeType(node.properties) === "file"),
    [graph]
  );

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    try {
      const selectedPath = await open({
        multiple: false,
        directory: false
      });

      if (!selectedPath || Array.isArray(selectedPath)) {
        return;
      }

      await invoke<string>("import_raw_file", { sourcePath: selectedPath });
      await onRefresh();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : String(importError));
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="page-shell asset-hub-page">
      <div className="page-hero app-surface asset-hub-hero">
        <div>
          <p className="eyebrow">{t("assetHub.eyebrow")}</p>
          <h2>{t("assetHub.title")}</h2>
          <p>{t("assetHub.description")}</p>
        </div>
        <div className="page-hero-actions">
          <button type="button" className="primary-button asset-hub-import-button" onClick={() => void handleImport()} disabled={importing}>
            {importing ? t("assetHub.importing") : t("assetHub.import")}
          </button>
          <button type="button" className="ghost-button" onClick={() => void onRefresh()}>
            {t("assetHub.refresh")}
          </button>
        </div>
      </div>

      {error ? <pre className="error">{error}</pre> : null}

      <ResponsiveGridLayout
        className="page-grid"
        layouts={assetHubLayouts}
        breakpoints={PAGE_GRID_BREAKPOINTS}
        cols={PAGE_GRID_COLS}
        rowHeight={72}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        draggableHandle=".grid-drag-handle"
        onLayoutChange={handleAssetHubLayoutChange}
      >
        <div key="assets" className="page-grid-item">
          <div className="grid-drag-handle" />
          <div className="page-grid-item-body">
            {fileNodes.length === 0 ? (
              <section className="page-empty app-surface asset-hub-empty">
                <h3>{t("assetHub.emptyTitle")}</h3>
                <p>{t("assetHub.emptyDescription")}</p>
              </section>
            ) : (
              <section className="asset-grid" aria-label={t("assetHub.gridAriaLabel")}>
                {fileNodes.map((node) => {
                  const file = parseFileNode(node);
                  const iconExtension = file.extension || "bin";
                  const Icon = resolveFileIcon(iconExtension);

                  return (
                    <article key={node.id} className="app-surface asset-file-card">
                      <div className="asset-file-card-head">
                        <span className="asset-file-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <div className="asset-file-meta">
                          <h3>{file.name || t("assetHub.fileCard.untitled")}</h3>
                          <p>.{iconExtension}</p>
                        </div>
                      </div>

                      <dl className="asset-file-stats">
                        <div>
                          <dt>{t("assetHub.fileCard.size")}</dt>
                          <dd>{formatFileSize(file.sizeBytes)}</dd>
                        </div>
                        <div>
                          <dt>{t("assetHub.fileCard.hash")}</dt>
                          <dd>{file.hash ? file.hash.slice(0, 8) : t("common.unknown")}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </section>
            )}
          </div>
        </div>
      </ResponsiveGridLayout>
    </section>
  );
}
