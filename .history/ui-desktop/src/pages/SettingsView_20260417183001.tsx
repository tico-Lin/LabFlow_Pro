import { Cpu, Globe2, MoonStar, Palette, Zap } from "lucide-react";
import { useMemo } from "react";
import type { ThemeName } from "../app/labflow";
import { useTranslation, type Language } from "../i18n";

type SettingsViewProps = {
  theme: ThemeName;
  language: Language;
  onThemeChange: (theme: ThemeName) => void;
  onLanguageChange: (language: Language) => void;
};

type SettingsSectionKey = "language" | "appearance" | "performance";

export default function SettingsView({
  theme,
  language,
  onThemeChange,
  onLanguageChange
}: SettingsViewProps) {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        key: "language" as const,
        icon: Globe2,
        title: t("settings.sections.language.title"),
        description: t("settings.sections.language.description")
      },
      {
        key: "appearance" as const,
        icon: Palette,
        title: t("settings.sections.appearance.title"),
        description: t("settings.sections.appearance.description")
      },
      {
        key: "performance" as const,
        icon: Zap,
        title: t("settings.sections.performance.title"),
        description: t("settings.sections.performance.description")
      }
    ],
    [t]
  );

  return (
    <section className="page-shell settings-page">
      <div className="page-hero app-surface">
        <div>
          <p className="eyebrow">{t("settings.eyebrow")}</p>
          <h2>{t("settings.title")}</h2>
          <p>{t("settings.description")}</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-nav app-surface">
          <div className="settings-nav-header">
            <p className="eyebrow">{t("settings.nav.eyebrow")}</p>
            <h3>{t("settings.nav.title")}</h3>
            <p>{t("settings.nav.description")}</p>
          </div>

          <nav className="settings-nav-list" aria-label={t("settings.nav.title")}>
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <a key={section.key} href={`#${section.key}`} className="settings-nav-link">
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{section.title}</strong>
                    <span>{section.description}</span>
                  </div>
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="settings-content">
          <section id="language" className="settings-panel app-surface">
            <div className="settings-panel-header">
              <div>
                <p className="eyebrow">{t("settings.sections.language.kicker")}</p>
                <h3>{t("settings.sections.language.title")}</h3>
                <p>{t("settings.sections.language.body")}</p>
              </div>
              <Globe2 aria-hidden="true" className="settings-panel-icon" />
            </div>

            <label className="settings-field">
              <span>{t("common.language")}</span>
              <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
                <option value="zh-TW">{t("common.languages.zh-TW")}</option>
                <option value="en">{t("common.languages.en")}</option>
              </select>
            </label>
          </section>

          <section id="appearance" className="settings-panel app-surface">
            <div className="settings-panel-header">
              <div>
                <p className="eyebrow">{t("settings.sections.appearance.kicker")}</p>
                <h3>{t("settings.sections.appearance.title")}</h3>
                <p>{t("settings.sections.appearance.body")}</p>
              </div>
              <MoonStar aria-hidden="true" className="settings-panel-icon" />
            </div>

            <div className="settings-option-grid">
              <button
                type="button"
                className={`settings-choice-card${theme === "dark" ? " is-active" : ""}`}
                onClick={() => onThemeChange("dark")}
              >
                <strong>{t("common.themes.dark")}</strong>
                <span>{t("settings.theme.darkDescription")}</span>
              </button>
              <button
                type="button"
                className={`settings-choice-card${theme === "light" ? " is-active" : ""}`}
                onClick={() => onThemeChange("light")}
              >
                <strong>{t("common.themes.light")}</strong>
                <span>{t("settings.theme.lightDescription")}</span>
              </button>
            </div>
          </section>

          <section id="performance" className="settings-panel app-surface">
            <div className="settings-panel-header">
              <div>
                <p className="eyebrow">{t("settings.sections.performance.kicker")}</p>
                <h3>{t("settings.sections.performance.title")}</h3>
                <p>{t("settings.sections.performance.body")}</p>
              </div>
              <Cpu aria-hidden="true" className="settings-panel-icon" />
            </div>

            <div className="settings-metric-grid">
              <article className="settings-metric-card">
                <span>{t("settings.performance.renderMode.label")}</span>
                <strong>{t("settings.performance.renderMode.value")}</strong>
                <p>{t("settings.performance.renderMode.description")}</p>
              </article>
              <article className="settings-metric-card">
                <span>{t("settings.performance.pipeline.label")}</span>
                <strong>{t("settings.performance.pipeline.value")}</strong>
                <p>{t("settings.performance.pipeline.description")}</p>
              </article>
              <article className="settings-metric-card">
                <span>{t("settings.performance.syncPolicy.label")}</span>
                <strong>{t("settings.performance.syncPolicy.value")}</strong>
                <p>{t("settings.performance.syncPolicy.description")}</p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}