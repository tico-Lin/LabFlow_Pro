import { Box, FlaskConical, Waves } from "lucide-react";
import { useMemo } from "react";
import { buildAnalysisModules, type AnalysisModule } from "../app/labflow";
import { useTranslation } from "../i18n";

type ModuleRecord = AnalysisModule & {
  badge: string;
  icon: typeof FlaskConical;
};

export default function ModulesView() {
  const { t } = useTranslation();

  const modules = useMemo<ModuleRecord[]>(
    () =>
      buildAnalysisModules(t).map((module) => ({
        ...module,
        badge: module.id === "find-max-peak" ? t("modules.badges.analysis") : t("modules.badges.test"),
        icon: module.id === "find-max-peak" ? FlaskConical : Waves
      })),
    [t]
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
            <strong>{modules.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-card-label">{t("modules.stats.ready")}</span>
            <strong>{modules.length}</strong>
          </div>
        </div>
      </section>

      <div className="modules-grid">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <article key={module.id} className="module-card app-surface">
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
            </article>
          );
        })}
      </div>
    </section>
  );
}