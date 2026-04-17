import ToastUIEditor, { type Editor as ToastEditorInstance, type EditorOptions } from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import { useEffect, useRef } from "react";

type RichMarkdownEditorProps = {
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

export default function RichMarkdownEditor({ value, placeholder, theme, onChange }: RichMarkdownEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ToastEditorInstance | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
          onChangeRef.current(editor.getMarkdown());
        }
      }
    });

    editorRef.current = editor;

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