import ToastUIEditor, { type Editor as ToastEditorInstance, type EditorOptions } from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import { useEffect, useRef } from "react";

import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "../i18n";

type RichMarkdownEditorProps = {
  nodeId?: string;
  value: string;
  placeholder: string;
  theme: "dark" | "light";
  onChange: (value: string) => void;
};

const toolbarItems: NonNullable<EditorOptions["toolbarItems"]> = [
  ["heading", "bold", "italic", "strike"],
  ["hr", "quote"],
  ["ul", "ol", "task", "indent", "outdent"],
  ["table", "link", "image"],
  ["code", "codeblock"]
];

export default function RichMarkdownEditor({ nodeId, value, placeholder, theme, onChange }: RichMarkdownEditorProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastEditorInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const nodeIdRef = useRef(nodeId);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    nodeIdRef.current = nodeId;
  }, [nodeId]);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const editor = new ToastUIEditor({
      el: hostRef.current,
      initialValue: value,
      initialEditType: "wysiwyg",
      previewStyle: "vertical",
      hideModeSwitch: true,
      usageStatistics: false,
      autofocus: false,
      height: "640px",
      minHeight: "640px",
      placeholder,
      toolbarItems,
      theme: theme === "dark" ? "dark" : undefined,
      events: {
        change: () => {
          const newMarkdown = editor.getMarkdown();
          onChangeRef.current(newMarkdown);
          
          if (nodeIdRef.current) {
            // Emitting full text as a delta for Phase 1 simulation
            invoke("apply_text_delta", {
              nodeId: nodeIdRef.current,
              posId: Date.now().toString(),
              text: newMarkdown
            }).catch(console.error);
          }
        }
      }
    });

    editorRef.current = editor;

    // Load the WASM module for high-performance rendering (Markdown + LaTeX)
    const initWasmEngine = async () => {
      try {
        // Mock loading of WASM parser
        console.log(t("editor.info.loading_wasm") || "Loading WASM LaTeX/Markdown engine...");
        // const wasm = await import('wasm-latex-markdown');
        // await wasm.init();
      } catch (err) {
        console.error(t("editor.error.failed_wasm") || "Failed to load WASM engine", err);
      }
    };
    void initWasmEngine();

    return () => {
      editorRef.current = null;
      editor.destroy();
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, [placeholder, theme]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const currentValue = editor.getMarkdown();
    if (currentValue !== value) {
      editor.setMarkdown(value, false);
    }
  }, [value]);

  return <div className="rich-markdown-editor" ref={hostRef} />;
}