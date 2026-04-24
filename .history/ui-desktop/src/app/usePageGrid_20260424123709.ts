import { useCallback, useMemo, useState } from "react";
import type { Layout, LayoutItem } from "react-grid-layout/legacy";

function isBasicLayoutItem(value: unknown): value is LayoutItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<LayoutItem>;
  return (
    typeof item.i === "string" &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.w === "number" &&
    typeof item.h === "number"
  );
}

function normalizeLayout(next: unknown, defaults: Layout): Layout {
  if (!Array.isArray(next)) {
    return defaults;
  }

  const parsed = next.filter(isBasicLayoutItem);
  if (!parsed.length) {
    return defaults;
  }

  const parsedById = new Map(parsed.map((item) => [item.i, item]));

  return defaults.map((baseItem) => {
    const current = parsedById.get(baseItem.i);
    if (!current) {
      return baseItem;
    }

    const minW = baseItem.minW ?? current.minW;
    const minH = baseItem.minH ?? current.minH;
    const maxW = baseItem.maxW ?? current.maxW;
    const maxH = baseItem.maxH ?? current.maxH;

    const normalizedW = Math.max(minW ?? 1, current.w);
    const normalizedH = Math.max(minH ?? 1, current.h);

    return {
      ...current,
      minW,
      minH,
      maxW,
      maxH,
      w: typeof maxW === "number" ? Math.min(normalizedW, maxW) : normalizedW,
      h: typeof maxH === "number" ? Math.min(normalizedH, maxH) : normalizedH
    };
  });
}

/**
 * Persistent grid layout hook.
 * Loads layout from localStorage on mount, and persists on drag/resize commit.
 */
export function usePageGrid(storageKey: string, defaultLayout: Layout) {
  const [layout, setLayout] = useState<Layout>(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultLayout;
    try {
      const parsed = JSON.parse(raw) as unknown;
      return normalizeLayout(parsed, defaultLayout);
    } catch {
      return defaultLayout;
    }
  });

  const layouts = useMemo(
    () => ({ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }),
    [layout]
  );

  const handleLayoutChange = useCallback((next: Layout) => {
    setLayout(normalizeLayout(next, defaultLayout));
  }, [defaultLayout]);

  const handleLayoutCommit = useCallback(
    (next: Layout) => {
      const normalized = normalizeLayout(next, defaultLayout);
      setLayout(normalized);
      window.localStorage.setItem(storageKey, JSON.stringify(normalized));
    },
    [defaultLayout, storageKey]
  );

  return { layout, layouts, handleLayoutChange, handleLayoutCommit } as const;
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
