import { invoke } from "@tauri-apps/api/core";
import { Box, FlaskConical, LoaderCircle, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { parseAnalysisModules, type AnalysisModule } from "../app/labflow";
import { useTranslation } from "../i18n";

type ModuleRecord = AnalysisModule & {
  badge: string;
  icon: typeof FlaskConical;
};

function buildModuleRecord(module: AnalysisModule, t: (key: string) => string): ModuleRecord {
  return {
    ...module,
    badge: module.id === "find_max_peak" ? t("modules.badges.analysis") : t("modules.badges.test"),
    icon: module.id === "find_max_peak" ? FlaskConical : Waves
  };
}

export default function ModuleDetailView() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [modules, setModules] = useState<AnalysisModule[]>([]);
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

        setModules(parseAnalysisModules(payload));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setModules([]);
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

  const module = useMemo(() => {
    const matchedModule = modules.find((entry) => entry.id === id);
    return matchedModule ? buildModuleRecord(matchedModule, t) : null;
  }, [id, modules, t]);

  if (isLoadingModules) {
    return (
      <section className="page-shell module-detail-page">
        <div className="modules-loading-panel app-surface" role="status" aria-live="polite">
          <LoaderCircle aria-hidden="true" className="modules-loading-spinner" />
          <div>
            <p className="eyebrow">{t("common.loading")}</p>
            <h3>{t("modules.detail.profileTitle")}</h3>
            <p>{t("modules.detail.profileDescription")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (modulesError) {
    return (
      <section className="page-shell module-detail-page">
        <div className="page-empty app-surface module-detail-empty-state">
          <p className="eyebrow">{t("modules.detail.notFoundEyebrow")}</p>
          <h3>{t("modules.detail.notFoundTitle")}</h3>
          <p>{modulesError}</p>
          <Link to="/modules" className="ghost-button module-detail-back-link">
            {t("modules.detail.backToCatalog")}
          </Link>
        </div>
      </section>
    );
  }

  if (!module) {
    return (
      <section className="page-shell module-detail-page">
        <div className="page-empty app-surface module-detail-empty-state">
          <p className="eyebrow">{t("modules.detail.notFoundEyebrow")}</p>
          <h3>{t("modules.detail.notFoundTitle")}</h3>
          <p>{t("modules.detail.notFoundDescription")}</p>
          <Link to="/modules" className="ghost-button module-detail-back-link">
            {t("modules.detail.backToCatalog")}
          </Link>
        </div>
      </section>
    );
  }

  const Icon = module.icon;
  const schema = {
    runtime: "Python",
    input_formats: module.supportedFormats,
    parameters: module.parameters.map((parameter) => ({
      key: parameter.key,
      name: parameter.name,
      type: parameter.type,
      default: parameter.defaultValue
    }))
  };

  return (
    <section className="page-shell module-detail-page">
      <div className="page-hero app-surface module-detail-hero">
        <div className="module-detail-hero-copy">
          <Link to="/modules" className="ghost-button module-detail-back-link">
            {t("modules.detail.backToCatalog")}
          </Link>
          <p className="eyebrow">{t("modules.detail.eyebrow")}</p>
          <div className="module-detail-title-row">
            <span className="module-card-icon-shell module-detail-icon-shell">
              <Icon aria-hidden="true" />
            </span>
            <div>
              <span className="module-card-badge">{module.badge}</span>
              <h2>{module.name}</h2>
              <p>{module.description}</p>
            </div>
          </div>
        </div>

        <div className="module-detail-highlight-card">
          <span className="module-detail-highlight-label">{t("modules.detail.runtimeTitle")}</span>
          <strong>Python</strong>
          <p>{t("modules.detail.runtimeDescription")}</p>
        </div>
      </div>

      <div className="module-detail-layout">
        <section className="module-detail-main app-surface">
          <div className="module-detail-section-heading">
            <p className="eyebrow">{t("modules.detail.overviewEyebrow")}</p>
            <h3>{t("modules.detail.overviewTitle")}</h3>
            <p>{t("modules.detail.overviewDescription")}</p>
          </div>

          <div className="module-detail-fact-grid">
            <article className="module-detail-fact-card">
              <span>{t("modules.labels.formats")}</span>
              <strong>{module.supportedFormats.length}</strong>
              <p>{t("modules.detail.formatsSummary")}</p>
            </article>
            <article className="module-detail-fact-card">
              <span>{t("modules.detail.languageLabel")}</span>
              <strong>Python</strong>
              <p>{t("modules.detail.languageDescription")}</p>
            </article>
            <article className="module-detail-fact-card">
              <span>{t("modules.labels.parameters")}</span>
              <strong>{module.parameters.length}</strong>
              <p>{t("modules.detail.parametersSummary")}</p>
            </article>
          </div>

          <section className="module-detail-section">
            <div className="module-detail-section-heading">
              <h3>{t("modules.detail.capabilityTitle")}</h3>
              <p>{t("modules.detail.capabilityDescription")}</p>
            </div>
            <div className="module-detail-copy-block">
              <p>{module.description}</p>
            </div>
          </section>

          <section className="module-detail-section">
            <div className="module-detail-section-heading">
              <h3>{t("modules.detail.schemaTitle")}</h3>
              <p>{t("modules.detail.schemaDescription")}</p>
            </div>

            {module.parameters.length ? (
              <div className="module-parameter-schema-grid">
                {module.parameters.map((parameter) => (
                  <article key={parameter.key} className="module-parameter-schema-card">
                    <div>
                      <span className="module-detail-micro-label">{parameter.key}</span>
                      <h4>{parameter.name}</h4>
                    </div>
                    <dl className="module-parameter-schema-meta">
                      <div>
                        <dt>{t("modules.detail.parameterType")}</dt>
                        <dd>{parameter.type}</dd>
                      </div>
                      <div>
                        <dt>{t("modules.detail.parameterDefault")}</dt>
                        <dd>{String(parameter.defaultValue)}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <div className="analysis-panel-empty-state">
                <p>{t("workbench.modal.noParameters")}</p>
              </div>
            )}

            <pre className="module-schema-preview">{JSON.stringify(schema, null, 2)}</pre>
          </section>
        </section>

        <aside className="module-detail-side app-surface">
          <div className="module-detail-section-heading">
            <p className="eyebrow">{t("modules.detail.profileEyebrow")}</p>
            <h3>{t("modules.detail.profileTitle")}</h3>
            <p>{t("modules.detail.profileDescription")}</p>
          </div>

          <div className="module-detail-side-section">
            <span className="module-detail-side-label">{t("modules.detail.moduleId")}</span>
            <strong>{module.id}</strong>
          </div>

          <div className="module-detail-side-section">
            <span className="module-detail-side-label">{t("modules.labels.formats")}</span>
            <div className="module-chip-row">
              {module.supportedFormats.map((format) => (
                <span key={`${module.id}-${format}`} className="metadata-chip">
                  {format}
                </span>
              ))}
            </div>
          </div>

          <div className="module-detail-side-section">
            <span className="module-detail-side-label">{t("modules.detail.developmentLanguage")}</span>
            <div className="module-detail-runtime-pill">
              <Box aria-hidden="true" className="module-card-outline-icon" />
              <span>Python</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}