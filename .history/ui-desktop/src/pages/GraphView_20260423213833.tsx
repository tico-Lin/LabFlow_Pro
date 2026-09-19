import { Responsive, WidthProvider, type Layout } from "react-grid-layout/legacy";
import { useNavigate } from "react-router-dom";
import type { GraphStateSnapshot, NoteDocument, ThemeName } from "../app/labflow";
import { PAGE_GRID_BREAKPOINTS, PAGE_GRID_COLS, usePageGrid } from "../app/usePageGrid";
import NoteEditor from "../components/NoteEditor";
import StarGraph, { type StarGraphEdge, type StarGraphNode } from "../components/StarGraph";
import { useTranslation } from "../i18n";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_GRAPHVIEW_LAYOUT: Layout = [
  { i: "graph-stage", x: 0, y: 0, w: 8, h: 10 },
  { i: "graph-side",  x: 8, y: 0, w: 4, h: 10 }
];

type GraphViewProps = {
  snapshot: GraphStateSnapshot | null;
  theme: ThemeName;
  graphNodes: StarGraphNode[];
  graphEdges: StarGraphEdge[];
  selectedNodeId: string | null;
  selectedNodeLabel: string | null;
  selectedNodeType: string | null;
  selectedNodeTypeLabel: string | null;
  noteDraft: NoteDocument;
  noteSaving: boolean;
  onSelectNode: (nodeId: string) => void;
  onActivateNode: (nodeId: string) => { type: "note" | "data" | "unknown" };
  onNoteCreated: (nodeId: string) => void;
  onNodeDeleted: (nodeId: string) => void;
  onRefresh: () => void | Promise<unknown>;
  onError: (message: string) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSaveNote: () => void | Promise<void>;
};

export default function GraphView({
  snapshot,
  theme,
  graphNodes,
  graphEdges,
  selectedNodeId,
  selectedNodeLabel,
  selectedNodeType,
  selectedNodeTypeLabel,
  noteDraft,
  noteSaving,
  onSelectNode,
  onActivateNode,
  onNoteCreated,
  onNodeDeleted,
  onRefresh,
  onError,
  onTitleChange,
  onContentChange,
  onSaveNote
}: GraphViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    layouts: graphViewLayouts,
    handleLayoutChange: handleGraphViewLayoutChange,
    handleLayoutCommit: handleGraphViewLayoutCommit
  } =
    usePageGrid("graphview-layout", DEFAULT_GRAPHVIEW_LAYOUT);

  return (
    <section className="page-shell graph-page graph-page-fullscreen">
      <div className="page-hero app-surface graph-page-hero">
        <div>
          <p className="eyebrow">{t("graphView.eyebrow")}</p>
          <h2>{t("graphView.title")}</h2>
          <p>{t("graphView.description")}</p>
        </div>
        <div className="page-hero-actions">
          <button type="button" className="ghost-button" onClick={() => void onRefresh()}>
            {t("app.toolbar.syncGraph")}
          </button>
          {selectedNodeId && selectedNodeType !== "note" && (
            <button type="button" className="primary-button" onClick={() => navigate(`/workbench/${selectedNodeId}`)}>
              {t("graphView.openWorkbench")}
            </button>
          )}
        </div>
      </div>

      <ResponsiveGridLayout
        className="page-grid"
        layouts={graphViewLayouts}
        breakpoints={PAGE_GRID_BREAKPOINTS}
        cols={PAGE_GRID_COLS}
        rowHeight={72}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType={null}
        isResizable={true}
        isDraggable={true}
        resizeHandles={["se"]}
        draggableHandle=".grid-drag-handle"
        onLayoutChange={handleGraphViewLayoutChange}
        onDragStop={handleGraphViewLayoutCommit}
        onResizeStop={handleGraphViewLayoutCommit}
      >
        <div key="graph-stage" className="page-grid-item">
          <div className="grid-drag-handle" />
          <div className="page-grid-item-body page-grid-item-body--canvas">
            <section className="app-surface graph-stage-panel">
              <div className="graph-panel-header">
                <div>
                  <p className="eyebrow">{t("app.rightPanel.eyebrow")}</p>
                  <h2>{t("app.rightPanel.title")}</h2>
                  <p>{t("app.rightPanel.description")}</p>
                </div>
                {snapshot && (
                  <div className="graph-stats">
                    <span>{t("app.graphStats.nodes", { count: graphNodes.length })}</span>
                    <span>{t("app.graphStats.edges", { count: graphEdges.length })}</span>
                    <span>{t("app.graphStats.operations", { count: snapshot.op_count })}</span>
                  </div>
                )}
              </div>
              {snapshot ? (
                <StarGraph
                  nodes={graphNodes}
                  edges={graphEdges}
                  themeName={theme}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={onSelectNode}
                  onNodeActivate={(nodeId) => {
                    const result = onActivateNode(nodeId);
                    if (result.type === "data") {
                      navigate(`/workbench/${nodeId}`);
                    }
                  }}
                  onNoteCreated={onNoteCreated}
                  onNodeDeleted={onNodeDeleted}
                  onGraphChanged={async () => {
                    await onRefresh();
                  }}
                  onError={onError}
                />
              ) : (
                <section className="page-empty graph-empty-panel">
                  <h3>{t("app.graphEmpty.title")}</h3>
                  <p>{t("app.graphEmpty.description")}</p>
                </section>
              )}
            </section>
          </div>
        </div>

        <div key="graph-side" className="page-grid-item">
          <div className="grid-drag-handle" />
          <div className="page-grid-item-body">
            <aside className="app-surface graph-side-panel">
              {selectedNodeType === "note" ? (
                <NoteEditor
                  title={noteDraft.title}
                  content={noteDraft.content}
                  saving={noteSaving}
                  onTitleChange={onTitleChange}
                  onContentChange={onContentChange}
                  onSave={onSaveNote}
                />
              ) : (
                <div className="graph-side-summary">
                  <p className="eyebrow">{t("graphView.selectionEyebrow")}</p>
                  <h3>{selectedNodeLabel ?? t("graphView.selectionTitle")}</h3>
                  <p>{selectedNodeTypeLabel ?? t("graphView.selectionDescription")}</p>
                  {selectedNodeId && selectedNodeType !== "note" ? (
                    <button type="button" className="primary-button" onClick={() => navigate(`/workbench/${selectedNodeId}`)}>
                      {t("graphView.openWorkbench")}
                    </button>
                  ) : null}
                </div>
              )}
            </aside>
          </div>
        </div>
      </ResponsiveGridLayout>
    </section>
  );
}