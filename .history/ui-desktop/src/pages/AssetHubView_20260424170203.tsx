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
  Pencil,
  X,
  type LucideIcon
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout/legacy";
import { useNavigate } from "react-router-dom";
import { normalizeGraphNodeType, type GraphNodeSnapshot, type GraphStateSnapshot } from "../app/labflow";
import { PAGE_GRID_BREAKPOINTS, PAGE_GRID_COLS, usePageGrid } from "../app/usePageGrid";
import { useTranslation } from "../i18n";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_ASSETHUB_LAYOUT: Layout = [
  { i: "assets", x: 0, y: 0, w: 12, h: 10, minW: 4, minH: 4 }
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
  tags: string[];
  remark: string;
} {
  const name = typeof node.properties.title === "string" && node.properties.title.trim()
    ? node.properties.title
    : node.label;

  const hash = typeof node.properties.hash === "string" ? node.properties.hash : "";
  const extension = typeof node.properties.extension === "string" ? node.properties.extension : "";
  const sizeRaw = Number(node.properties.size ?? 0);

  let tags: string[] = [];
  if (typeof node.properties.tags === "string" && node.properties.tags.trim()) {
    try {
      const parsed = JSON.parse(node.properties.tags) as unknown;
      if (Array.isArray(parsed)) {
        tags = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      // ignore malformed
    }
  }

  const remark = typeof node.properties.remark === "string" ? node.properties.remark : "";

  return {
    name,
    hash,
    extension,
    sizeBytes: Number.isFinite(sizeRaw) && sizeRaw >= 0 ? sizeRaw : 0,
    tags,
    remark
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

type EditTarget = {
  nodeId: string;
  tags: string[];
  remark: string;
};

type MetadataEditModalProps = {
  target: EditTarget;
  onClose: () => void;
  onSaved: () => void;
};

function MetadataEditModal({ target, onClose, onSaved }: MetadataEditModalProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<string[]>(target.tags);
  const [tagInput, setTagInput] = useState("");
  const [remark, setRemark] = useState(target.remark);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await invoke("update_file_metadata", {
        nodeId: target.nodeId,
        tags,
        remark
      });
      onSaved();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="metadata-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={t("assetHub.editModal.title")}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="metadata-modal app-surface">
        <div className="metadata-modal-header">
          <h3>{t("assetHub.editModal.title")}</h3>
          <button
            type="button"
            className="icon-button"
            aria-label={t("assetHub.editModal.close")}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="metadata-modal-body">
          <label className="form-label" htmlFor="tag-input">
            {t("assetHub.editModal.tagsLabel")}
          </label>
          <div
            className="tag-input-area"
            role="button"
            tabIndex={-1}
            onClick={() => tagInputRef.current?.focus()}
            onKeyDown={() => { /* handled by inner input */ }}
          >
            {tags.map((tag) => (
              <span key={tag} className="tag-badge">
                {tag}
                <button
                  type="button"
                  className="tag-badge-remove"
                  aria-label={`${t("assetHub.editModal.removeTag")} ${tag}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              id="tag-input"
              ref={tagInputRef}
              className="tag-input-field"
              type="text"
              value={tagInput}
              placeholder={tags.length === 0 ? t("assetHub.editModal.tagsPlaceholder") : ""}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
          <p className="form-hint">{t("assetHub.editModal.tagsHint")}</p>

          <label className="form-label" htmlFor="remark-input">
            {t("assetHub.editModal.remarkLabel")}
          </label>
          <textarea
            id="remark-input"
            className="form-textarea"
            rows={4}
            value={remark}
            placeholder={t("assetHub.editModal.remarkPlaceholder")}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        {saveError ? <p className="form-error">{saveError}</p> : null}

        <div className="metadata-modal-footer">
          <button type="button" className="ghost-button" onClick={onClose} disabled={saving}>
            {t("assetHub.editModal.cancel")}
          </button>
          <button type="button" className="primary-button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? t("assetHub.editModal.saving") : t("assetHub.editModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssetHubView({ graph, onRefresh }: AssetHubViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    layouts: assetHubLayouts,
    handleLayoutChange: handleAssetHubLayoutChange,
    handleLayoutCommit: handleAssetHubLayoutCommit
  } =
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
        useCSSTransforms={true}
        compactType={null}
        isResizable={true}
        isDraggable={true}
        resizeHandles={["n", "s", "e", "w", "ne", "nw", "se", "sw"]}
        draggableHandle=".grid-drag-handle"
        onLayoutChange={handleAssetHubLayoutChange}
        onDragStop={handleAssetHubLayoutCommit}
        onResizeStop={handleAssetHubLayoutCommit}
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
                  const isPdf = iconExtension.toLowerCase() === "pdf";

                  return (
                    <article
                      key={node.id}
                      className={`app-surface asset-file-card${isPdf ? " is-clickable" : ""}`}
                      role={isPdf ? "button" : undefined}
                      tabIndex={isPdf ? 0 : undefined}
                      onClick={isPdf ? () => navigate(`/workbench?fileId=${encodeURIComponent(node.id)}`) : undefined}
                      onKeyDown={
                        isPdf
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate(`/workbench?fileId=${encodeURIComponent(node.id)}`);
                              }
                            }
                          : undefined
                      }
                    >
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
