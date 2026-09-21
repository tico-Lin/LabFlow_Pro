import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

type AstNode =
  | { type: "Text"; content: string }
  | { type: "InlineMath"; expression: string }
  | { type: "BlockMath"; expression: string }
  | { type: "Chemical"; format: string; payload: string };

type MarkdownAst = { nodes: AstNode[] };

type RichMarkdownEditorProps = {
  nodeId?: string;
  value: string;
  placeholder: string;
  theme: "dark" | "light";
  onChange: (value: string) => void;
};

export default function RichMarkdownEditor({
  nodeId,
  value,
  placeholder,
  theme,
  onChange,
}: RichMarkdownEditorProps) {
  const [ast, setAst] = useState<MarkdownAst | null>(null);

  useEffect(() => {
    if (!nodeId) return;

    const fetchAst = async () => {
      try {
        const fetchedAst = await invoke<MarkdownAst>("get_ast", {
          node_id: nodeId,
        });
        setAst(fetchedAst);
      } catch (err) {
        console.error("Failed to fetch AST", err);
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
    const newText = e.target.value;
    onChange(newText);

    if (nodeId) {
      invoke("insert_text", {
        nodeId,
        posId: Date.now().toString(),
        text: newText,
      }).catch(console.error);
    }
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
        value={value}
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
                  <span key={i} data-testid={`ast-node-text`}>
                    {node.content}
                  </span>
                );
              case "InlineMath":
                return (
                  <span
                    key={i}
                    className="math inline"
                    data-testid={`ast-node-inlinemath`}
                  >
                    ${node.expression}$
                  </span>
                );
              case "BlockMath":
                return (
                  <div
                    key={i}
                    className="math block"
                    data-testid={`ast-node-blockmath`}
                  >
                    $${node.expression}$$
                  </div>
                );
              case "Chemical":
                return (
                  <div
                    key={i}
                    className="chemical"
                    data-testid={`ast-node-chemical`}
                  >
                    [{node.format}: {node.payload}]
                  </div>
                );
              default:
                return null;
            }
          })
        ) : (
          <div data-testid="loading-indicator">Loading AST...</div>
        )}
      </div>
    </div>
  );
}
