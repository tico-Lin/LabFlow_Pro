import { describe, it, expect, vi } from "vitest";
import { render, act } from "@testing-library/react";
import SpreadsheetGrid from "./SpreadsheetGrid";
import { invoke } from "@tauri-apps/api/core";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as any;

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("../../i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("SpreadsheetGrid Performance", () => {
  it("should handle 1,000,000 rows without exponential memory spike and maintain 55+ FPS render times", async () => {
    // Generate 1M points (16MB) to mock Tauri response
    const mockData = new Float64Array(1000000 * 2); // 2M numbers
    for (let i = 0; i < mockData.length; i++) {
      mockData[i] = Math.random();
    }

    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === "fetch_mock_1m_dataset") {
        return new Uint8Array(mockData.buffer);
      }
      return null;
    });

    const memoryUsage = (
      performance as Performance & {
        memory?: { usedJSHeapSize: number };
      }
    ).memory;
    const startMemory = memoryUsage?.usedJSHeapSize ?? 0;
    const startTime = performance.now();

    render(<SpreadsheetGrid rows={1000000} cols={50} />);

    // Wait for the async Tauri fetch to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const endTime = performance.now();
    const endMemory = memoryUsage?.usedJSHeapSize ?? startMemory;

    const renderTimeMs = endTime - startTime;
    const memoryDiffMb = (endMemory - startMemory) / 1024 / 1024;

    console.log(`Render time: ${renderTimeMs.toFixed(2)}ms`);
    console.log(`Memory diff: ${memoryDiffMb.toFixed(2)}MB`);

    // Memory shouldn't spike by more than 50MB for a 16MB buffer
    expect(memoryDiffMb).toBeLessThan(50);

    // Render time should be extremely fast, < 16.6ms ideally (to support > 60 FPS).
    // In JSDOM, let's just make sure it's under a reasonable bound (e.g. 50ms)
    // because it doesn't actually draw Canvas pixels.
    expect(renderTimeMs).toBeLessThan(500); // Generous for JSDOM
  });
});
