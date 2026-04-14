import { useEffect, useMemo, useRef, useState } from "react";

export enum RenderTier {
  L1_Skeleton = "L1_Skeleton",
  L2_Tooling = "L2_Tooling",
  L3_Advanced = "L3_Advanced"
}

type Capability = {
  tier: RenderTier;
  setTier: (tier: RenderTier) => void;
};

export function useHardwareCapability(): Capability {
  const [tier, setTier] = useState<RenderTier>(() => {
    if (typeof window === "undefined") {
      return RenderTier.L2_Tooling;
    }

    const preset = window.localStorage.getItem("labflow.renderTier");
    if (preset === RenderTier.L1_Skeleton || preset === RenderTier.L2_Tooling || preset === RenderTier.L3_Advanced) {
      return preset;
    }

    return RenderTier.L2_Tooling;
  });

  const updateTier = (next: RenderTier) => {
    setTier(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("labflow.renderTier", next);
    }
  };

  return { tier, setTier: updateTier };
}

type GraphCard = {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string[];
};

type GridCardProps = {
  card: GraphCard;
  tier: RenderTier;
};

function L2CanvasChart({ points }: { points: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    const barGap = 12;
    const barWidth = Math.max(12, (width - barGap * (points.length + 1)) / points.length);

    points.forEach((_, idx) => {
      const value = 24 + ((idx * 17) % 62);
      const x = barGap + idx * (barWidth + barGap);
      const y = height - value - 20;
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(x, y, barWidth, value);
    });
  }, [points]);

  return <canvas ref={canvasRef} className="tier-canvas" width={380} height={140} />;
}

function L3WebGLStarMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) {
      setFallback(true);
      return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.03, 0.06, 0.13, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);

  if (fallback) {
    return <div className="tier-fallback">WebGL unavailable, fallback to L2 canvas.</div>;
  }

  return <canvas ref={canvasRef} className="tier-canvas" width={420} height={170} />;
}

function GridCard({ card, tier }: GridCardProps) {
  const tabletSpan = card.w >= 8 ? 6 : card.w >= 4 ? 3 : 2;

  // 修正 TS2353: 允許自訂 CSS 變數
  const style = {
    ["--x"]: card.x,
    ["--y"]: card.y,
    ["--w"]: card.w,
    ["--h"]: card.h,
    ["--tablet-span"]: tabletSpan,
  } as React.CSSProperties;

  return (
    <article className="matrix-card" style={style}>
      <header>
        <h3>{card.title}</h3>
        <span>{tier}</span>
      </header>

      {tier === RenderTier.L1_Skeleton && (
        <ul className="tier-list">
          {card.content.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {tier === RenderTier.L2_Tooling && <L2CanvasChart points={card.content} />}

      {tier === RenderTier.L3_Advanced && <L3WebGLStarMap />}
    </article>
  );
}

export default function MatrixDashboard() {
  const { tier, setTier } = useHardwareCapability();

  const cards = useMemo<GraphCard[]>(
    () => [
      {
        id: "A1",
        title: "Topological Delta Stream",
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        content: ["Node churn", "Edge entropy", "Replica lag", "Conflict rate"]
      },
      {
        id: "B1",
        title: "Consensus Control Plane",
        x: 6,
        y: 0,
        w: 6,
        h: 4,
        content: ["Election horizon", "Clock skew", "State transfer", "Checkpoint"]
      },
      {
        id: "C1",
        title: "Star Graph Focus",
        x: 0,
        y: 4,
        w: 8,
        h: 5,
        content: ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E"]
      },
      {
        id: "D1",
        title: "Agent Runtime Lanes",
        x: 8,
        y: 4,
        w: 4,
        h: 5,
        content: ["L1 skeleton", "L2 tooling", "L3 advanced", "IPC health"]
      }
    ],
    []
  );

  return (
    <section className="matrix-dashboard">
      <div className="dashboard-header">
        <h2>Symmetric Triple-Tier Matrix</h2>
        <div className="tier-switcher">
          <label htmlFor="tier-select">Hardware Tier</label>
          <select
            id="tier-select"
            value={tier}
            onChange={(event) => setTier(event.target.value as RenderTier)}
          >
            <option value={RenderTier.L1_Skeleton}>L1 Skeleton</option>
            <option value={RenderTier.L2_Tooling}>L2 Tooling</option>
            <option value={RenderTier.L3_Advanced}>L3 Advanced</option>
          </select>
        </div>
      </div>

      <div className="virtual-grid" role="list">
        {cards.map((card) => (
          <GridCard key={card.id} card={card} tier={tier} />
        ))}
      </div>
    </section>
  );
}
