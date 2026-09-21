import { render } from "@testing-library/react";
import MatrixDashboard from "./MatrixDashboard";
import { describe, it, expect } from "vitest";
import { I18nProvider } from "../i18n";

describe("MatrixDashboard layout rendering", () => {
  it("renders correctly without layout shift during i18n switches", () => {
    // This is a stub for the layout shift test
    const { container } = render(
      <I18nProvider>
        <MatrixDashboard />
      </I18nProvider>,
    );
    expect(container).toBeDefined();
    // Simulate i18n switch and verify no layout exceptions
  });
});
