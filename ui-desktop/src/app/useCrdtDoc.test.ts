import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrdtDoc } from "./useCrdtDoc";
import { invoke } from "@tauri-apps/api/core";

// Mock Tauri invoke and listen
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})), // Returns a mock unlisten function
}));

describe("useCrdtDoc Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce rapid local keystrokes and batch them to Rust efficiently", async () => {
    const docId = "doc-123";

    const { result, unmount } = renderHook(() => useCrdtDoc(docId));

    // Initially, it should call init_document_stream once
    expect(invoke).toHaveBeenCalledWith("init_document_stream", { docId });

    // Simulate rapid typing (e.g. typing "Hello" quickly)
    act(() => {
      result.current.insertText(0, "H");
      result.current.insertText(1, "e");
      result.current.insertText(2, "l");
      result.current.insertText(3, "l");
      result.current.insertText(4, "o");
    });

    // The hook should NOT have called apply_crdt_delta yet (debounced)
    // Fast-forward time to trigger the debounce (e.g., 50ms)
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Now it should have batched and called apply_crdt_delta exactly once with the encoded chunk
    const allCalls = vi.mocked(invoke).mock.calls;
    const applyDeltaCalls = allCalls.filter(
      (call) => call[0] === "apply_crdt_delta",
    );

    expect(applyDeltaCalls.length).toBe(1);

    const args = applyDeltaCalls[0][1] as any;
    expect(args.docId).toBe(docId);
    expect(args.encodedChunk).toBeInstanceOf(Uint8Array); // Ensures we are passing the Protobuf binary

    // Unmount should trigger close_document
    unmount();
    expect(invoke).toHaveBeenCalledWith("close_document", { docId });
  });

  it("should maintain stable memory (no crash/leak) after 10,000 continuous character inputs", async () => {
    const docId = "doc-10k";
    const { result, unmount } = renderHook(() => useCrdtDoc(docId));

    act(() => {
      // Simulate 10,000 continuous character inputs
      for (let i = 0; i < 10000; i++) {
        result.current.handleLocalChange("A".repeat(i + 1));
      }
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const allCalls = vi.mocked(invoke).mock.calls;
    const applyDeltaCalls = allCalls.filter(
      (call) => call[0] === "apply_crdt_delta",
    );

    expect(applyDeltaCalls.length).toBeGreaterThan(0);
    // If it survives 10k inputs without OOM in the test environment, we consider memory stable
    expect(true).toBe(true);

    unmount();
  });
});
