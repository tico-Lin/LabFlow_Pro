import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Workbench from "./Workbench";
import { invoke } from "@tauri-apps/api/core";
import { BrowserRouter } from "react-router-dom";

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

vi.mock("react-pdf", () => ({
  Document: () => <div>Mocked Document</div>,
  Page: () => <div>Mocked Page</div>,
  pdfjs: { GlobalWorkerOptions: { workerSrc: "" } },
}));

vi.mock("../i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("Workbench Runtime Disconnect Fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display a fallback Runtime Disconnected state when Python backend process is forcefully killed", async () => {
    // Mock get_available_plugins to return a valid module so we can select it
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === "get_available_plugins") {
        return JSON.stringify([
          {
            id: "test_plugin",
            name: "Test Plugin",
            description: "A test plugin",
            version: "1.0",
            author: "Test",
            engine: "python",
            execute_cmd: ["python", "agent.py"],
            supported_formats: [],
            parameters: [],
          },
        ]);
      }
      if (cmd === "run_plugin_sandbox") {
        // Simulate forcefully killed Python process
        return Promise.reject(
          new Error(
            "plugin 'test_plugin' execution failed: process exited with failure",
          ),
        );
      }
      return null;
    });

    const { getByRole } = render(
      <BrowserRouter>
        <Workbench
          graph={null}
          theme="light"
          spreadsheetData={{ rows: 10, cols: 2, cells: {} }}
          revision={1}
          peakRow={null}
          focusedRow={null}
          chartData={[]}
          instrumentFormat="CSV"
          metadataEntries={[]}
          selectedNodeId="node-1"
          selectedNodeLabel="Test Data"
          onLoadNode={() => true}
        />
      </BrowserRouter>,
    );

    // Wait for modules to load
    await waitFor(() => {
      const runBtn = getByRole("button", {
        name: /workbench.modal.run/,
      }) as HTMLButtonElement;
      expect(runBtn.disabled).toBe(false);
    });

    // Run the analysis module
    const runButton = getByRole("button", { name: /workbench.modal.run/ });

    await act(async () => {
      fireEvent.click(runButton);
    });

    // The UI should catch the failure and set isRuntimeDisconnected state.
    // We expect the fallback UI to show up.
    // Wait for the state update
    expect(
      await screen.findByRole("heading", { name: /Runtime Disconnected/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/The Python agent runtime crashed/i),
    ).toBeInTheDocument();
  });
});
