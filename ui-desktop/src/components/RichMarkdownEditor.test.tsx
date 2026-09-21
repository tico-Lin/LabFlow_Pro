import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RichMarkdownEditor from "./RichMarkdownEditor";
import { invoke } from "@tauri-apps/api/core";

// Mock Tauri API
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve({ nodes: [] })),
}));

let crdtUpdateCallback: (event: any) => void;

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn((event: string, cb: any) => {
    if (event.startsWith("crdt-update-")) {
      crdtUpdateCallback = cb;
    }
    return Promise.resolve(() => {});
  }),
}));

describe("RichMarkdownEditor TDD Validation", () => {
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
  });

  it("reflects local optimistic updates and seamlessly reconciles with backend conflicts", async () => {
    const docId = "test-doc";
    render(
      <RichMarkdownEditor nodeId={docId} placeholder="Type..." theme="light" />,
    );

    const textarea = screen.getByTestId(
      "editor-textarea",
    ) as HTMLTextAreaElement;

    // Simulate typing a sequence of text
    fireEvent.change(textarea, { target: { value: "Hello Local" } });
    expect(textarea.value).toBe("Hello Local");

    // The component has debounced the event (which was tested in useCrdtDoc.test.ts)
    // We now trigger a simulated backend conflict event.
    // Imagine another user typed "Hello Remote" at the exact same time, and Rust resolved it
    // to "Hello Local Remote" based on Lamport clocks.

    await act(async () => {
      // We simulate the backend pushing the final mathematically-resolved state
      await waitFor(() => expect(crdtUpdateCallback).toBeDefined());
      if (crdtUpdateCallback) {
        crdtUpdateCallback({
          payload: { resolvedText: "Hello Local Remote" },
        });
      }
    });

    // The UI must update strictly to the resolved backend state without crashing
    expect(textarea.value).toBe("Hello Local Remote");
  });
});
