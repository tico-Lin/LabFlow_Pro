import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n";

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
  const { t } = useTranslation();
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
    return <div className="tier-fallback">{t("matrix.fallback")}</div>;
  }

  return <canvas ref={canvasRef} className="tier-canvas" width={420} height={170} />;
}

function GridCard({ card, tier }: GridCardProps) {
  const tabletSpan = card.w >= 8 ? 6 : card.w >= 4 ? 3 : 2;
  const { t } = useTranslation();

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
        <span>{t(`matrix.tiers.${tier}`)}</span>
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
  const { t, tm } = useTranslation();
  const { tier, setTier } = useHardwareCapability();

  const cards = useMemo<GraphCard[]>(
    () => [
      {
        id: "A1",
        title: t("matrix.cards.topologicalDeltaStream.title"),
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        content: tm("matrix.cards.topologicalDeltaStream.items")
      },
      {
        id: "B1",
        title: t("matrix.cards.consensusControlPlane.title"),
        x: 6,
        y: 0,
        w: 6,
        h: 4,
        content: tm("matrix.cards.consensusControlPlane.items")
      },
      {
        id: "C1",
        title: t("matrix.cards.starGraphFocus.title"),
        x: 0,
        y: 4,
        w: 8,
        h: 5,
        content: tm("matrix.cards.starGraphFocus.items")
      },
      {
        id: "D1",
        title: t("matrix.cards.agentRuntimeLanes.title"),
        x: 8,
        y: 4,
        w: 4,
        h: 5,
        content: tm("matrix.cards.agentRuntimeLanes.items")
      }
    ],
    [t, tm]
  );

  return (
    <section className="matrix-dashboard">
      <div className="dashboard-header">
        <h2>{t("matrix.title")}</h2>
        <div className="tier-switcher">
          <label htmlFor="tier-select">{t("matrix.hardwareTier")}</label>
          <select
            id="tier-select"
            value={tier}
            onChange={(event) => setTier(event.target.value as RenderTier)}
          >
            <option value={RenderTier.L1_Skeleton}>{t("matrix.tiers.L1_Skeleton")}</option>
            <option value={RenderTier.L2_Tooling}>{t("matrix.tiers.L2_Tooling")}</option>
            <option value={RenderTier.L3_Advanced}>{t("matrix.tiers.L3_Advanced")}</option>
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
