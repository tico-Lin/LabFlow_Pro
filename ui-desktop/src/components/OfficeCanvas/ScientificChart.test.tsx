import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ScientificChart } from "./ScientificChart";

vi.mock("../../i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock WebGL contexts and ResizeObserver to prevent test crashes
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === "webgl" || contextId === "webgl2") {
      return {
        viewport: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        createBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        STATIC_DRAW: 0x88e4,
        ARRAY_BUFFER: 0x8892,
        COLOR_BUFFER_BIT: 0x00004000,
        DEPTH_BUFFER_BIT: 0x00000100,
      } as unknown as WebGLRenderingContext;
    }
    return null;
  }) as any;

  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("ScientificChart Performance", () => {
  it("renders 100,000 points binary stream smoothly without React re-render lag", () => {
    const DATA_SIZE = 100_000 * 2; // x and y for each point
    const massiveData = new Float32Array(DATA_SIZE);

    // Fill with dummy data
    for (let i = 0; i < DATA_SIZE; i++) {
      massiveData[i] = Math.random();
    }

    const start = performance.now();

    const { container } = render(
      <ScientificChart data={massiveData} width={1000} height={400} />,
    );

    const end = performance.now();
    const duration = end - start;

    console.log(
      `[UI Render] 100,000 point Float32Array chart rendered in: ${duration.toFixed(2)} ms`,
    );

    // It should render very fast (e.g. < 150ms in JSDOM) because the Float32Array bypasses React's deep diffing.
    expect(duration).toBeLessThan(150);
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
