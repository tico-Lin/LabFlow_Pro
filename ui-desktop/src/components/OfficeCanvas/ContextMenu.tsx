// ─── SpreadsheetGrid v2 Context Menu ─────────────────────────────────────────

import { useEffect, useRef } from "react";
import type { ContextMenuState, ContextMenuAction } from "./types";

type ContextMenuProps = {
  state: ContextMenuState;
  onAction: (action: ContextMenuAction) => void;
  onClose: () => void;
};

const MENU_ITEMS: Array<{
  action: ContextMenuAction;
  label: string;
  separator?: boolean;
}> = [
  { action: "insertColumn", label: "插入欄位 (Insert Column)" },
  { action: "deleteColumn", label: "刪除欄位 (Delete Column)", separator: true },
  { action: "setRoleX", label: "設為 X 欄" },
  { action: "setRoleY", label: "設為 Y 欄" },
  { action: "setRoleZ", label: "設為 Z 欄" },
  { action: "setRoleNone", label: "設為 None (無角色)", separator: true },
  { action: "clearContent", label: "清除內容 (Clear Content)" },
  { action: "applyFormulaToColumn", label: "套用公式到整欄 (Apply Formula)" },
];

export default function ContextMenu({ state, onAction, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state?.visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [state?.visible, onClose]);

  if (!state?.visible) return null;

  return (
    <div
      ref={menuRef}
      className="spreadsheet-context-menu"
      style={{
        position: "fixed",
        left: state.x,
        top: state.y,
        zIndex: 9999,
      }}
    >
      {MENU_ITEMS.map((item) => (
        <div key={item.action}>
          <button
            type="button"
            className="spreadsheet-context-menu-item"
            onClick={() => {
              onAction(item.action);
              onClose();
            }}
          >
            {item.label}
          </button>
          {item.separator && <div className="spreadsheet-context-menu-separator" />}
        </div>
      ))}
    </div>
  );
}
