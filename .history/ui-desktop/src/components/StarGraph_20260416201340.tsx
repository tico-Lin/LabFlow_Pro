import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "../i18n";

export type StarGraphNode = {
  id: string;
  label: string;
  type: string;
};

export type StarGraphEdge = {
  source_id: string;
  target_id: string;
  label: string;
};

type StarGraphProps = {
  nodes: StarGraphNode[];
  edges: StarGraphEdge[];
  height?: number;
  onNodeSelect?: (nodeId: string) => void;
  onNoteCreated?: (nodeId: string) => void;
  onGraphChanged?: () => void | Promise<void>;
  onError?: (message: string) => void;
};

type SimNode = StarGraphNode & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

type DragState = {
  nodeId: string;
  pointerX: number;
  pointerY: number;
};

type LinkState = {
  sourceNodeId: string;
  pointerX: number;
  pointerY: number;
  targetNodeId: string | null;
};

const DEFAULT_HEIGHT = 520;
const NODE_RADIUS = 20;
const EDGE_LENGTH = 140;
const REPULSION_STRENGTH = 16000;
const SPRING_STRENGTH = 0.0035;
const CENTERING_STRENGTH = 0.0018;
const DAMPING = 0.9;
const MAX_SPEED = 7;
const BOUNDARY_PADDING = 28;

function createSeed(id: string): number {
  let hash = 2166136261;

  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededUnit(seed: number): number {
  return (seed % 10000) / 10000;
}

function getNodeColor(type: string): { fill: string; stroke: string; glow: string } {
  switch (type) {
    case "agent_analysis":
      return { fill: "#ffb84d", stroke: "#ff7a00", glow: "rgba(255, 122, 0, 0.28)" };
    case "note":
      return { fill: "#f5d0fe", stroke: "#a21caf", glow: "rgba(162, 28, 175, 0.24)" };
    case "cv":
      return { fill: "#6ee7b7", stroke: "#0f766e", glow: "rgba(16, 185, 129, 0.25)" };
    case "xrd":
      return { fill: "#93c5fd", stroke: "#1d4ed8", glow: "rgba(37, 99, 235, 0.24)" };
    case "instrument_data":
      return { fill: "#a7f3d0", stroke: "#047857", glow: "rgba(5, 150, 105, 0.24)" };
    default:
      return { fill: "#d8b4fe", stroke: "#7c3aed", glow: "rgba(124, 58, 237, 0.22)" };
  }
}

function measureViewport(element: HTMLDivElement | null, fallbackHeight: number): ViewportSize {
  const width = Math.max(element?.clientWidth ?? 0, 320);
  return { width, height: fallbackHeight };
}

function buildSimulationNodes(
  nodes: StarGraphNode[],
  previousNodes: SimNode[],
  viewport: ViewportSize
): SimNode[] {
  const previousById = new Map(previousNodes.map((node) => [node.id, node]));
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;
  const orbitX = Math.max(viewport.width * 0.28, 80);
  const orbitY = Math.max(viewport.height * 0.22, 64);

  return nodes.map((node, index) => {
    const existing = previousById.get(node.id);
    if (existing) {
      return {
        ...existing,
        label: node.label,
        type: node.type
      };
    }

    const seed = createSeed(node.id);
    const angle = seededUnit(seed) * Math.PI * 2;
    const radialJitter = 0.72 + seededUnit(seed >>> 3) * 0.35;
    const laneOffset = (index % 5) * 8;

    return {
      ...node,
      x: centerX + Math.cos(angle) * orbitX * radialJitter + laneOffset,
      y: centerY + Math.sin(angle) * orbitY * radialJitter - laneOffset,
      vx: 0,
      vy: 0,
      radius: NODE_RADIUS
    };
  });
}

function getPointerPosition(event: MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function findNodeAtPosition(
  pointerX: number,
  pointerY: number,
  nodes: SimNode[],
  excludeId?: string
) {
  return [...nodes]
    .reverse()
    .find(
      (node) =>
        node.id !== excludeId && Math.hypot(pointerX - node.x, pointerY - node.y) <= node.radius + 6
    );
}

function drawArrow(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  radius: number
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const tipX = endX - ux * radius;
  const tipY = endY - uy * radius;
  const arrowSize = 8;
  const normalX = -uy;
  const normalY = ux;

  context.beginPath();
  context.moveTo(tipX, tipY);
  context.lineTo(
    tipX - ux * arrowSize + normalX * (arrowSize * 0.65),
    tipY - uy * arrowSize + normalY * (arrowSize * 0.65)
  );
  context.lineTo(
    tipX - ux * arrowSize - normalX * (arrowSize * 0.65),
    tipY - uy * arrowSize - normalY * (arrowSize * 0.65)
  );
  context.closePath();
  context.fill();
}

function drawTooltip(
  context: CanvasRenderingContext2D,
  node: SimNode,
  viewport: ViewportSize,
  subtitle: string
) {
  const title = node.label;
  const paddingX = 14;
  const paddingY = 10;
  const lineGap = 6;
  const offsetX = 24;
  const offsetY = -18;

  context.save();
  context.textAlign = "left";
  context.textBaseline = "top";

  context.font = "600 14px Arial, sans-serif";
  const titleWidth = context.measureText(title).width;
  context.font = "12px Arial, sans-serif";
  const subtitleWidth = context.measureText(subtitle).width;

  const tooltipWidth = Math.max(titleWidth, subtitleWidth) + paddingX * 2;
  const tooltipHeight = 14 + 12 + paddingY * 2 + lineGap;

  let tooltipX = node.x + node.radius + offsetX;
  let tooltipY = node.y + offsetY;

  if (tooltipX + tooltipWidth > viewport.width - 12) {
    tooltipX = node.x - node.radius - offsetX - tooltipWidth;
  }
  if (tooltipY + tooltipHeight > viewport.height - 12) {
    tooltipY = viewport.height - tooltipHeight - 12;
  }
  if (tooltipY < 12) {
    tooltipY = 12;
  }

  context.fillStyle = "rgba(9, 14, 24, 0.9)";
  context.beginPath();
  context.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 12);
  context.fill();

  context.strokeStyle = "rgba(148, 163, 184, 0.35)";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#f8fafc";
  context.font = "600 14px Arial, sans-serif";
  context.fillText(title, tooltipX + paddingX, tooltipY + paddingY);

  context.fillStyle = "rgba(226, 232, 240, 0.9)";
  context.font = "12px Arial, sans-serif";
  context.fillText(subtitle, tooltipX + paddingX, tooltipY + paddingY + 14 + lineGap);
  context.restore();
}

export function StarGraph({
  nodes,
  edges,
  height = DEFAULT_HEIGHT,
  onNodeSelect,
  onNoteCreated,
  onGraphChanged,
  onError
}: StarGraphProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<StarGraphEdge[]>(edges);
  const dragRef = useRef<DragState | null>(null);
  const linkRef = useRef<LinkState | null>(null);
  const hoveredNodeId = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>({ width: 320, height });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [linkingNodeId, setLinkingNodeId] = useState<string | null>(null);

  const nodeCountLabel = useMemo(() => t("graph.nodeCount", { count: nodes.length }), [nodes.length, t]);

  const reportError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    onError?.(message);
  };

  const notifyGraphChanged = async () => {
    if (onGraphChanged) {
      await onGraphChanged();
    }
  };

  useEffect(() => {
    setViewport(measureViewport(containerRef.current, height));

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      setViewport(measureViewport(container, height));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [height]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    nodesRef.current = buildSimulationNodes(nodes, nodesRef.current, viewport);
  }, [nodes, viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let disposed = false;
    let lastTimestamp = 0;

    const renderFrame = (timestamp: number) => {
      if (disposed) {
        return;
      }

      const currentViewport = viewport;
      const dpr = window.devicePixelRatio || 1;
      const bitmapWidth = Math.max(1, Math.floor(currentViewport.width * dpr));
      const bitmapHeight = Math.max(1, Math.floor(currentViewport.height * dpr));

      if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
        canvas.width = bitmapWidth;
        canvas.height = bitmapHeight;
        canvas.style.width = `${currentViewport.width}px`;
        canvas.style.height = `${currentViewport.height}px`;
      }

      const deltaScale = lastTimestamp === 0 ? 1 : Math.min((timestamp - lastTimestamp) / 16.67, 2.5);
      lastTimestamp = timestamp;

      const simNodes = nodesRef.current;
      const simEdges = edgesRef.current;
      const nodeById = new Map(simNodes.map((node) => [node.id, node]));
      const centerX = currentViewport.width / 2;
      const centerY = currentViewport.height / 2;
      const dragState = dragRef.current;
      const linkState = linkRef.current;

      for (let index = 0; index < simNodes.length; index += 1) {
        const node = simNodes[index];
        let forceX = (centerX - node.x) * CENTERING_STRENGTH;
        let forceY = (centerY - node.y) * CENTERING_STRENGTH;

        for (let otherIndex = index + 1; otherIndex < simNodes.length; otherIndex += 1) {
          const other = simNodes[otherIndex];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distSq = Math.max(dx * dx + dy * dy, 64);
          const dist = Math.sqrt(distSq);
          const repulsion = REPULSION_STRENGTH / distSq;
          const rx = (dx / dist) * repulsion;
          const ry = (dy / dist) * repulsion;

          forceX -= rx;
          forceY -= ry;
          other.vx += rx * deltaScale;
          other.vy += ry * deltaScale;
        }

        node.vx += forceX * deltaScale;
        node.vy += forceY * deltaScale;
      }

      for (const edge of simEdges) {
        const source = nodeById.get(edge.source_id);
        const target = nodeById.get(edge.target_id);
        if (!source || !target) {
          continue;
        }

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const stretch = distance - EDGE_LENGTH;
        const springForce = stretch * SPRING_STRENGTH;
        const sx = (dx / distance) * springForce * deltaScale;
        const sy = (dy / distance) * springForce * deltaScale;

        source.vx += sx;
        source.vy += sy;
        target.vx -= sx;
        target.vy -= sy;
      }

      for (const node of simNodes) {
        const isDragging = dragState?.nodeId === node.id;
        node.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, node.vx * DAMPING));
        node.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, node.vy * DAMPING));

        if (isDragging && dragState) {
          node.x = dragState.pointerX;
          node.y = dragState.pointerY;
          node.vx = 0;
          node.vy = 0;
        } else {
          node.x += node.vx * deltaScale;
          node.y += node.vy * deltaScale;
        }

        const minX = BOUNDARY_PADDING;
        const maxX = currentViewport.width - BOUNDARY_PADDING;
        const minY = BOUNDARY_PADDING;
        const maxY = currentViewport.height - BOUNDARY_PADDING;

        if (node.x < minX) {
          node.x = minX;
          node.vx *= -0.2;
        } else if (node.x > maxX) {
          node.x = maxX;
          node.vx *= -0.2;
        }

        if (node.y < minY) {
          node.y = minY;
          node.vy *= -0.2;
        } else if (node.y > maxY) {
          node.y = maxY;
          node.vy *= -0.2;
        }
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const background = context.createLinearGradient(0, 0, currentViewport.width, currentViewport.height);
      background.addColorStop(0, "#07111f");
      background.addColorStop(0.55, "#0d1b31");
      background.addColorStop(1, "#132847");
      context.fillStyle = background;
      context.fillRect(0, 0, currentViewport.width, currentViewport.height);

      for (let starIndex = 0; starIndex < 42; starIndex += 1) {
        const seed = createSeed(`field-${starIndex}`);
        const x = seededUnit(seed) * currentViewport.width;
        const y = seededUnit(seed >>> 2) * currentViewport.height;
        const size = 0.8 + seededUnit(seed >>> 4) * 1.9;
        context.beginPath();
        context.fillStyle = `rgba(255, 255, 255, ${0.18 + seededUnit(seed >>> 5) * 0.45})`;
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }

      context.lineWidth = 1.4;
      context.strokeStyle = "rgba(148, 163, 184, 0.42)";
      context.fillStyle = "rgba(191, 219, 254, 0.9)";
      context.font = "12px 'Segoe UI', sans-serif";

      for (const edge of simEdges) {
        const source = nodeById.get(edge.source_id);
        const target = nodeById.get(edge.target_id);
        if (!source || !target) {
          continue;
        }

        context.beginPath();
        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
        context.stroke();
        drawArrow(context, source.x, source.y, target.x, target.y, target.radius + 2);

        if (edge.label) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          const labelWidth = Math.min(Math.max(context.measureText(edge.label).width + 12, 36), 120);

          context.fillStyle = "rgba(8, 15, 29, 0.8)";
          context.beginPath();
          context.roundRect(midX - labelWidth / 2, midY - 11, labelWidth, 22, 11);
          context.fill();

          context.fillStyle = "#cbd5e1";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(edge.label, midX, midY + 0.5, labelWidth - 10);
        }
      }

      if (linkState) {
        const sourceNode = nodeById.get(linkState.sourceNodeId);
        if (sourceNode) {
          context.save();
          context.strokeStyle = "rgba(250, 204, 21, 0.95)";
          context.lineWidth = 2.5;
          context.setLineDash([9, 6]);
          context.beginPath();
          context.moveTo(sourceNode.x, sourceNode.y);
          context.lineTo(linkState.pointerX, linkState.pointerY);
          context.stroke();
          context.restore();
        }
      }

      context.textAlign = "center";
      context.textBaseline = "middle";

      for (const node of simNodes) {
        const palette = getNodeColor(node.type);
        const isHovered = hoveredNodeId.current === node.id;

        context.beginPath();
        context.fillStyle = palette.glow;
        context.arc(node.x, node.y, node.radius + (isHovered ? 13 : 9), 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = palette.fill;
        context.strokeStyle = palette.stroke;
        context.lineWidth =
          draggingNodeId === node.id || linkingNodeId === node.id || isHovered ? 3 : 2;
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      }

      if (hoveredNodeId.current) {
        const hoveredNode = nodeById.get(hoveredNodeId.current);
        if (hoveredNode) {
          const palette = getNodeColor(hoveredNode.type);
          const translatedType = t(`graph.nodeTypes.${hoveredNode.type}`) === `graph.nodeTypes.${hoveredNode.type}`
            ? t("graph.nodeTypes.unknown")
            : t(`graph.nodeTypes.${hoveredNode.type}`);

          context.save();
          context.beginPath();
          context.strokeStyle = palette.stroke;
          context.lineWidth = 3;
          context.arc(hoveredNode.x, hoveredNode.y, hoveredNode.radius + 6, 0, Math.PI * 2);
          context.stroke();
          context.restore();

          drawTooltip(
            context,
            hoveredNode,
            currentViewport,
            t("graph.tooltipType", { type: translatedType })
          );
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draggingNodeId, linkingNodeId, viewport, t]);

  const handlePointerDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const pointer = getPointerPosition(event, canvas);
    const targetNode = findNodeAtPosition(pointer.x, pointer.y, nodesRef.current);

    if (!targetNode) {
      return;
    }

    if (event.altKey) {
      linkRef.current = {
        sourceNodeId: targetNode.id,
        pointerX: pointer.x,
        pointerY: pointer.y,
        targetNodeId: null
      };
      setLinkingNodeId(targetNode.id);
      return;
    }

    dragRef.current = {
      nodeId: targetNode.id,
      pointerX: pointer.x,
      pointerY: pointer.y
    };
    targetNode.x = pointer.x;
    targetNode.y = pointer.y;
    targetNode.vx = 0;
    targetNode.vy = 0;
    setDraggingNodeId(targetNode.id);
  };

  const handlePointerMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const pointer = getPointerPosition(event, canvas);
    const hoveredNode = findNodeAtPosition(pointer.x, pointer.y, nodesRef.current);
    hoveredNodeId.current = hoveredNode?.id ?? null;

    const linkState = linkRef.current;
    if (linkState) {
      linkState.pointerX = pointer.x;
      linkState.pointerY = pointer.y;
      const targetNode = findNodeAtPosition(pointer.x, pointer.y, nodesRef.current, linkState.sourceNodeId);
      linkState.targetNodeId = targetNode?.id ?? null;
      return;
    }

    const dragState = dragRef.current;
    if (!dragState) {
      return;
    }

    dragState.pointerX = pointer.x;
    dragState.pointerY = pointer.y;

    const activeNode = nodesRef.current.find((node) => node.id === dragState.nodeId);
    if (activeNode) {
      activeNode.x = pointer.x;
      activeNode.y = pointer.y;
      activeNode.vx = 0;
      activeNode.vy = 0;
    }
  };

  const releaseDrag = (event?: MouseEvent<HTMLCanvasElement>) => {
    const linkState = linkRef.current;
    if (linkState) {
      let targetNode = linkState.targetNodeId
        ? nodesRef.current.find((node) => node.id === linkState.targetNodeId) ?? null
        : null;

      if (!targetNode && event && canvasRef.current) {
        const pointer = getPointerPosition(event, canvasRef.current);
        targetNode = findNodeAtPosition(pointer.x, pointer.y, nodesRef.current, linkState.sourceNodeId) ?? null;
      }

      linkRef.current = null;
      setLinkingNodeId(null);

      if (targetNode && targetNode.id !== linkState.sourceNodeId) {
        void (async () => {
          try {
            await invoke("link_nodes", {
              fromId: linkState.sourceNodeId,
              toId: targetNode.id
            });
            await notifyGraphChanged();
          } catch (error) {
            reportError(error);
          }
        })();
      }
      return;
    }

    dragRef.current = null;
    setDraggingNodeId(null);
  };

  const handlePointerLeave = () => {
    hoveredNodeId.current = null;
    releaseDrag();
  };

  const handleDoubleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const pointer = getPointerPosition(event, canvas);
    const targetNode = findNodeAtPosition(pointer.x, pointer.y, nodesRef.current);

    if (targetNode) {
      onNodeSelect?.(targetNode.id);
      return;
    }

    void (async () => {
      try {
        const nodeId = await invoke<string>("create_note_node");
        onNoteCreated?.(nodeId);
        onNodeSelect?.(nodeId);
        await notifyGraphChanged();
      } catch (error) {
        reportError(error);
      }
    })();
  };

  return (
    <div className="star-graph-shell" ref={containerRef}>
      <div className="star-graph-header">
        <div>
          <h3>{t("graph.title")}</h3>
          <p>{t("graph.instructions")}</p>
        </div>
        <span className="star-graph-badge">{nodeCountLabel}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="star-graph-canvas"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={(event) => releaseDrag(event)}
        onMouseLeave={handlePointerLeave}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: draggingNodeId ? "grabbing" : linkingNodeId ? "crosshair" : "grab" }}
      />
    </div>
  );
}

export default StarGraph;