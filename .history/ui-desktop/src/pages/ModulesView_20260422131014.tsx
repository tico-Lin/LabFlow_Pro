import { invoke } from "@tauri-apps/api/core";
import { Box, FlaskConical, LoaderCircle, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseAnalysisModules, type AnalysisModule } from "../app/labflow";
import { useTranslation } from "../i18n";

type ModuleRecord = AnalysisModule & {
  badge: string;
  icon: typeof FlaskConical;
};

export default function ModulesView() {
  const { t } = useTranslation();
  const [analysisModules, setAnalysisModules] = useState<AnalysisModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [modulesError, setModulesError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadModules = async () => {
      setIsLoadingModules(true);
      setModulesError(null);

      try {
        const payload = await invoke<string>("fetch_analysis_modules");
        if (!isActive) {
          return;
        }

        setAnalysisModules(parseAnalysisModules(payload));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAnalysisModules([]);
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

  const moduleRecords = useMemo<ModuleRecord[]>(
    () =>
      analysisModules.map((module) => ({
        ...module,
        badge: module.id === "find_max_peak" ? t("modules.badges.analysis") : t("modules.badges.test"),
        icon: module.id === "find_max_peak" ? FlaskConical : Waves
      })),
    [analysisModules, t]
  );

  return (
    <section className="page-shell modules-page">
      <div className="page-hero app-surface">
        <div>
          <p className="eyebrow">{t("modules.eyebrow")}</p>
          <h2>{t("modules.title")}</h2>
          <p>{t("modules.description")}</p>
        </div>
      </div>

      <section className="modules-overview app-surface">
        <div>
          <p className="eyebrow">{t("modules.catalog.eyebrow")}</p>
          <h3>{t("modules.catalog.title")}</h3>
          <p>{t("modules.catalog.description")}</p>
        </div>
        <div className="modules-overview-stats">
          <div className="summary-card">
            <span className="summary-card-label">{t("modules.stats.total")}</span>
            <strong>{isLoadingModules ? "--" : moduleRecords.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-card-label">{t("modules.stats.ready")}</span>
            <strong>{isLoadingModules ? "--" : moduleRecords.length}</strong>
          </div>
        </div>
      </section>

      {isLoadingModules ? (
        <div className="modules-loading-panel app-surface" role="status" aria-live="polite">
          <LoaderCircle aria-hidden="true" className="modules-loading-spinner" />
          <div>
            <p className="eyebrow">{t("common.loading")}</p>
            <h3>{t("modules.catalog.title")}</h3>
            <p>{t("modules.catalog.description")}</p>
          </div>
          <div className="modules-loading-skeleton-grid" aria-hidden="true">
            <span className="modules-loading-skeleton-card" />
            <span className="modules-loading-skeleton-card" />
            <span className="modules-loading-skeleton-card" />
          </div>
        </div>
      ) : modulesError ? (
        <div className="page-empty app-surface">
          <p className="eyebrow">{t("modules.catalog.eyebrow")}</p>
          <h3>{t("modules.catalog.title")}</h3>
          <p>{modulesError}</p>
        </div>
      ) : (
        <div className="modules-grid">
          {moduleRecords.map((module) => {
            const Icon = module.icon;

            return (
              <Link key={module.id} to={`/modules/${module.id}`} className="module-card-link">
                <article className="module-card app-surface">
                  <div className="module-card-topline">
                    <span className="module-card-badge">{module.badge}</span>
                    <Box aria-hidden="true" className="module-card-outline-icon" />
                  </div>

                  <div className="module-card-heading">
                    <span className="module-card-icon-shell">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{module.name}</h3>
                      <p>{module.description}</p>
                    </div>
                  </div>

                  <div className="module-card-section">
                    <span className="module-card-label">{t("modules.labels.formats")}</span>
                    <div className="module-chip-row">
                      {module.supportedFormats.map((format) => (
                        <span key={`${module.id}-${format}`} className="metadata-chip">
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="module-card-section">
                    <span className="module-card-label">{t("modules.labels.parameters")}</span>
                    <div className="module-chip-row">
                      {module.parameters.map((parameter) => (
                        <span key={`${module.id}-${parameter.key}`} className="metadata-chip">
                          {parameter.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="module-card-footer">
                    <span>{t("modules.actions.viewDetails")}</span>
                    <span className="module-card-link-pill">/modules/{module.id}</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}