import { useEffect, useRef } from "react";
// @ts-ignore
import SmilesDrawer from "smiles-drawer";

export interface ChemDrawCanvasProps {
  smiles: string;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
}

import { useTranslation } from "../../i18n";

export function ChemDrawCanvas({ smiles, width = 400, height = 300, theme = "light" }: ChemDrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize the drawer
    const options = {
      width,
      height,
      themes: {
        dark: {
          C: "#fff",
          O: "#e74c3c",
          N: "#3498db",
          F: "#2ecc71",
          CL: "#1abc9c",
          BR: "#d35400",
          I: "#9b59b6",
          P: "#f39c12",
          S: "#f1c40f",
          B: "#e67e22",
          SI: "#95a5a6",
          H: "#fff",
          BACKGROUND: "#1e1e1e"
        },
        light: {
          C: "#222",
          O: "#e74c3c",
          N: "#3498db",
          F: "#2ecc71",
          CL: "#1abc9c",
          BR: "#d35400",
          I: "#9b59b6",
          P: "#f39c12",
          S: "#f1c40f",
          B: "#e67e22",
          SI: "#95a5a6",
          H: "#222",
          BACKGROUND: "#fff"
        }
      }
    };

    const smilesDrawer = new SmilesDrawer.Drawer(options);

    SmilesDrawer.parse(
      smiles,
      (tree: any) => {
        if (canvasRef.current) {
          smilesDrawer.draw(tree, canvasRef.current, theme, false);
        }
      },
      (err: any) => {
        console.error(t("chemdraw.error.parse_smiles") + ":", err);
      }
    );
  }, [smiles, width, height, theme, t]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
}

export default ChemDrawCanvas;
