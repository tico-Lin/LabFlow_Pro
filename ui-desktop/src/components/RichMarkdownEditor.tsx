import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCrdtDoc } from "../app/useCrdtDoc";

type AstNode =
  | { type: "Text"; content: string }
  | { type: "InlineMath"; expression: string }
  | { type: "BlockMath"; expression: string }
  | { type: "Chemical"; format: string; payload: string };

type MarkdownAst = { nodes: AstNode[] };

type RichMarkdownEditorProps = {
  nodeId?: string;
  value?: string;
  placeholder: string;
  theme: "dark" | "light";
  onChange?: (value: string) => void; // Maintained for backward compatibility with outer components
};

export default function RichMarkdownEditor({
  nodeId = "default-doc-id",
  value = "",
  placeholder,
  theme,
  onChange,
}: RichMarkdownEditorProps) {
  const [ast, setAst] = useState<MarkdownAst | null>(null);

  // Hook strictly defines the Model-View relationship. The component itself holds no independent long-lived state.
  const { textValue, handleLocalChange } = useCrdtDoc(nodeId, value);

  useEffect(() => {
    if (onChange) {
      onChange(textValue);
    }
  }, [textValue, onChange]);

  useEffect(() => {
    const fetchAst = async () => {
      try {
        const fetchedAst = await invoke<MarkdownAst>("get_ast", {
          node_id: nodeId,
        });
        setAst(fetchedAst);
      } catch (err) {
        // console.error("Failed to fetch AST", err);
      }
    };

    fetchAst();

    const unlisten = listen("graph-updated", () => {
      fetchAst();
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [nodeId]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleLocalChange(e.target.value);
  };

  return (
    <div
      className={`rich-markdown-editor theme-${theme}`}
      style={{ display: "flex", gap: "1rem", height: "640px" }}
    >
      <textarea
        data-testid="editor-textarea"
        style={{
          flex: 1,
          resize: "none",
          padding: "1rem",
          background: "transparent",
          color: "inherit",
        }}
        value={textValue}
        placeholder={placeholder}
        onChange={handleInput}
      />
      <div
        data-testid="ast-preview"
        className="ast-preview"
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #333",
          padding: "1rem",
        }}
      >
        {ast ? (
          ast.nodes.map((node, i) => {
            switch (node.type) {
              case "Text":
                return (
                  <span key={i} style={{ whiteSpace: "pre-wrap" }}>
                    {node.content}
                  </span>
                );
              case "InlineMath":
                return (
                  <span key={i} className="math inline">
                    ${node.expression}$
                  </span>
                );
              case "BlockMath":
                return (
                  <div key={i} className="math block">
                    $${node.expression}$$
                  </div>
                );
              case "Chemical":
                return (
                  <div key={i} className="chemical">
                    [Structure: {node.payload}]
                  </div>
                );
              default:
                return null;
            }
          })
        ) : (
          <div style={{ color: "#888", fontStyle: "italic" }}>
            AST Preview...
          </div>
        )}
      </div>
    </div>
  );
}
