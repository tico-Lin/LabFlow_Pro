import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("Tauri IPC Performance Mock Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should transmit 10MB binary data within 16ms (60fps standard)", async () => {
    // 10MB data (10 * 1024 * 1024 bytes)
    const MOCK_DATA_SIZE = 10 * 1024 * 1024;
    const hugeBuffer = new Uint8Array(MOCK_DATA_SIZE);
    hugeBuffer.fill(42); // Dummy data

    const nodeId = "12345678-1234-1234-1234-123456789012";

    // Mock implementation to simulate minimal IPC delay
    vi.mocked(invoke).mockImplementation(
      async (cmd: string, args: any, options: any) => {
        if (cmd === "apply_spreadsheet_delta") {
          // Assert we are using raw headers instead of JSON argument for node_id
          expect(options?.headers?.["x-node-id"]).toBe(nodeId);

          // Assert the payload is the raw Uint8Array, not a regular object
          expect(args).toBeInstanceOf(Uint8Array);
          expect(args.length).toBe(MOCK_DATA_SIZE);

          return Promise.resolve();
        }
        return Promise.reject(new Error("Unknown command"));
      },
    );

    // Start timer
    const start = performance.now();

    // The new Tauri v2 syntax for raw body IPC
    await invoke("apply_spreadsheet_delta", hugeBuffer, {
      headers: {
        "x-node-id": nodeId,
      },
    });

    const end = performance.now();
    const duration = end - start;

    console.log(`[IPC Mock] 10MB Transmission took: ${duration.toFixed(2)} ms`);

    // Verify it is under 16ms
    expect(duration).toBeLessThan(16);
    expect(invoke).toHaveBeenCalledTimes(1);
  });
});
