import { useEffect, useRef, useState } from "react";
import type { MetaRowKey } from "./types";
import { META_ROW_KEYS, ALL_COLUMN_ROLES } from "./types";

export interface MetaRowEditorState {
  col: number;
  metaRowIdx: number; // 0 to 4
  initialValue: string;
  rect: { x: number; y: number; w: number; h: number }; // Absolute DOM coordinates
}

interface MetaRowEditorProps {
  state: MetaRowEditorState | null;
  onCommit: (col: number, key: MetaRowKey, value: string) => void;
  onCancel: () => void;
}

export default function MetaRowEditor({ state, onCommit, onCancel }: MetaRowEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (state) {
      setValue(state.initialValue);
      // Use setTimeout to ensure the DOM node is rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
        selectRef.current?.focus();
      }, 0);
    }
  }, [state]);

  if (!state) return null;

  const rowKey = META_ROW_KEYS[state.metaRowIdx];
  const isRole = rowKey === "role";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onCommit(state.col, rowKey, value);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const commonStyle: React.CSSProperties = {
    position: "fixed",
    left: state.rect.x,
    top: state.rect.y,
    width: state.rect.w,
    height: state.rect.h,
    zIndex: 9999,
    outline: "2px solid var(--canvas-grid-selection)",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontSize: "11px",
    fontFamily: isRole ? "'Segoe UI', sans-serif" : (rowKey === "formula" ? "'Cascadia Code', monospace" : "'Segoe UI', sans-serif"),
    padding: "0 8px",
    background: "var(--canvas-grid-meta-bg)",
    color: "var(--canvas-grid-meta-text)",
  };

  if (isRole) {
    return (
      <select
        ref={selectRef}
        style={commonStyle}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onCommit(state.col, rowKey, e.target.value);
        }}
        onBlur={onCancel}
        onKeyDown={handleKeyDown}
      >
        {ALL_COLUMN_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      style={commonStyle}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(state.col, rowKey, value)}
      onKeyDown={handleKeyDown}
      placeholder={rowKey === "formula" ? "Col(A) * 2" : `Enter ${rowKey}...`}
    />
  );
}
