import {
  Background,
  Controls,
  ReactFlow,
  type Node,
  type Edge as FlowEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Graph } from "../types";

export function LibraryGraph({
  graph,
  path,
  explored,
  current,
  start,
  destination,
  onSelect,
}: {
  graph: Graph;
  path: string[];
  explored: string[];
  current?: string;
  start: string;
  destination: string;
  onSelect: (id: string) => void;
}) {
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label },
    className: [
      "location",
      n.blocked ? "blocked" : "",
      explored.includes(n.id) ? "explored" : "",
      path.includes(n.id) ? "route" : "",
      n.id === start ? "start" : "",
      n.id === destination ? "destination" : "",
      n.id === current ? "current" : "",
    ].join(" "),
  }));
  const edges: FlowEdge[] = graph.edges.map((e) => {
    const active = path.some(
      (v, i) =>
        i > 0 &&
        ((path[i - 1] === e.source && v === e.target) ||
          (path[i - 1] === e.target && v === e.source)),
    );
    return {
      id: e.source + "-" + e.target,
      source: e.source,
      target: e.target,
      label: String(e.weight),
      style: {
        stroke: active ? "#db8b47" : e.blocked ? "#c7cecb" : "#9baea7",
        strokeWidth: active ? 4 : 2,
        strokeDasharray: e.blocked ? "5 5" : undefined,
      },
      labelStyle: { fontSize: 11, fill: "#61746f" },
    };
  });
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodesDraggable={false}
      onNodeClick={(_, node) => onSelect(node.id)}
    >
      <Background color="#dfe8e3" gap={24} />
      <Controls />
    </ReactFlow>
  );
}
