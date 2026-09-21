import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RichMarkdownEditor from "./RichMarkdownEditor";
import { invoke } from "@tauri-apps/api/core";

// Mock Tauri API
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve()),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

describe("RichMarkdownEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders AST returned by the engine", async () => {
    const mockAst = {
      nodes: [
        { type: "Text", content: "Hello " },
        { type: "InlineMath", expression: "E=mc^2" },
      ],
    };

    (invoke as any).mockResolvedValueOnce(mockAst);

    render(
      <RichMarkdownEditor
        nodeId="node-123"
        value="Hello $E=mc^2$"
        placeholder="Type here..."
        theme="dark"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId("editor-textarea")).toBeInTheDocument();

    // Wait for AST to be fetched and rendered
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("get_ast", { node_id: "node-123" });
    });

    expect(screen.getByTestId("ast-node-text")).toHaveTextContent("Hello");
    expect(screen.getByTestId("ast-node-inlinemath")).toHaveTextContent(
      "$E=mc^2$",
    );
  });

  it("calls insert_text command on input", async () => {
    const onChangeMock = vi.fn();
    (invoke as any).mockResolvedValueOnce({ nodes: [] }); // For initial fetch

    render(
      <RichMarkdownEditor
        nodeId="node-123"
        value=""
        placeholder="Type here..."
        theme="dark"
        onChange={onChangeMock}
      />,
    );

    const textarea = screen.getByTestId("editor-textarea");
    fireEvent.change(textarea, { target: { value: "New content" } });

    expect(onChangeMock).toHaveBeenCalledWith("New content");

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith(
        "insert_text",
        expect.objectContaining({
          nodeId: "node-123",
          text: "New content",
        }),
      );
    });
  });
});
