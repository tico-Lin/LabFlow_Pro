import { useCallback, useMemo, useState } from "react";
import type { Layout, LayoutItem } from "react-grid-layout/legacy";

/**
 * Persistent grid layout hook.
 * Loads layout from localStorage on mount, saves on every change.
 */
export function usePageGrid(storageKey: string, defaultLayout: Layout) {
  const [layout, setLayout] = useState<Layout>(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultLayout;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return defaultLayout;
      const validItems = (parsed as unknown[]).filter((e): e is LayoutItem => {
        if (!e || typeof e !== "object") return false;
        const c = e as Partial<LayoutItem>;
        return (
          typeof c.i === "string" &&
          typeof c.x === "number" &&
          typeof c.y === "number" &&
          typeof c.w === "number" &&
          typeof c.h === "number"
        );
      });
      return validItems.length === defaultLayout.length ? validItems : defaultLayout;
    } catch {
      return defaultLayout;
    }
  });

  const layouts = useMemo(
    () => ({ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }),
    [layout]
  );

  const handleLayoutChange = useCallback(
    (next: Layout) => {
      setLayout(next);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  return { layout, layouts, handleLayoutChange } as const;
}

/** Default breakpoints used across all pages */
export const PAGE_GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } as const;

/** All breakpoints share the same 12-column layout */
export const PAGE_GRID_COLS = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 } as const;

/** Grid item wrapper style for canvas/chart panels (fills container, no scroll) */
export const CANVAS_CARD_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-color, var(--border))",
  borderRadius: "8px",
};

/** Grid item wrapper style for content panels (scrollable) */
export const CONTENT_CARD_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-color, var(--border))",
  borderRadius: "8px",
};
