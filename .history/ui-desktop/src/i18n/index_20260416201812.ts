import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import en from "./en";
import zhTW from "./zh-TW";

export type Language = "en" | "zh-TW";

type TranslationParams = Record<string, string | number>;
type TranslationTree = Record<string, string | readonly string[] | TranslationTree>;

type I18nContextValue = {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, params?: TranslationParams) => string;
  tm: (key: string) => string[];
};

const STORAGE_KEY = "labflow.language";

const dictionaries: Record<Language, TranslationTree> = {
  en,
  "zh-TW": zhTW
};

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveValue(tree: TranslationTree, key: string): string | readonly string[] | undefined {
  const segments = key.split(".");
  let current: string | readonly string[] | TranslationTree | undefined = tree;

  for (const segment of segments) {
    if (!current || typeof current === "string" || Array.isArray(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return typeof current === "string" || Array.isArray(current) ? current : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => String(params[token] ?? ""));
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "zh-TW";
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "en" || saved === "zh-TW" ? saved : "zh-TW";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const activeDictionary = dictionaries[language];
      const fallbackDictionary = dictionaries.en;
      const raw = resolveValue(activeDictionary, key) ?? resolveValue(fallbackDictionary, key);

      if (typeof raw !== "string") {
        return key;
      }

      return interpolate(raw, params);
    },
    [language]
  );

  const tm = useCallback(
    (key: string) => {
      const activeDictionary = dictionaries[language];
      const fallbackDictionary = dictionaries.en;
      const raw = resolveValue(activeDictionary, key) ?? resolveValue(fallbackDictionary, key);

      return Array.isArray(raw) ? [...raw] : [];
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, changeLanguage, t, tm }),
    [language, changeLanguage, t, tm]
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }

  return context;
}