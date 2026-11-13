import type { ReactNode } from "react";
import { Play, RotateCcw } from "lucide-react";
import { AlgorithmComparison } from "../components/AlgorithmComparison";
import type { Algorithm, Graph, Location, Route, Step } from "../types";

export function AlgorithmAnalysis({
  graph,
  locations,
  start,
  destination,
  route,
  map,
  labels,
  step,
  setStep,
  setPlaying,
  current,
  openMap,
}: {
  graph: Graph | null;
  locations: Location[];
  start: string;
  destination: string;
  route: Route | null;
  map: ReactNode;
  labels: Record<Algorithm, string>;
  step: number;
  setStep: (value: number) => void;
  setPlaying: (value: boolean) => void;
  current: Step | undefined;
  openMap: () => void;
}) {
  return (
    <>
      <AlgorithmComparison
        key={graph ? JSON.stringify(graph) : "loading"}
        locations={locations}
        start={start}
        destination={destination}
      />
      <div className="page-intro">
        <span className="eyebrow">UNDER THE HOOD</span>
        <h2>See how the search thinks.</h2>
        <p>
          Explore the real execution trace returned by the selected algorithm.
        </p>
      </div>
      {!route ? (
        <div className="panel">
          <p>Calculate a route on the library map first.</p>
          <button className="secondary" onClick={() => openMap()}>
            Open library map
          </button>
        </div>
      ) : (
        <div className="map-grid">
          <div className="panel map-panel">{map}</div>
          <div className="panel details">
            <span className="eyebrow">{labels[route.algorithm]}</span>
            <h3>Execution trace</h3>
            <p>
              {route.algorithm === "bfs"
                ? "BFS minimizes the number of edges, not necessarily distance."
                : route.algorithm === "dfs"
                  ? "DFS explores a branch deeply and does not guarantee the shortest route."
                  : "A* uses a scaled straight-line distance heuristic to estimate the remaining cost."}
            </p>
            <div className="trace-actions">
              <button
                className="secondary"
                onClick={() => {
                  setStep(-1);
                  setPlaying(true);
                }}
              >
                <Play size={15} /> Play trace
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setPlaying(false);
                  setStep(-1);
                }}
              >
                <RotateCcw size={15} /> Reset
              </button>
            </div>
            <label className="field">
              STEP {step < 0 ? "FINAL" : step + 1} / {route.trace.length}
              <input
                type="range"
                min="-1"
                max={route.trace.length - 1}
                value={step}
                onChange={(e) => {
                  setPlaying(false);
                  setStep(Number(e.target.value));
                }}
              />
            </label>
            <div className="metric">
              <span>Current</span>
              <strong>{current?.current || "Complete"}</strong>
            </div>
            {current?.h != null && (
              <div className="metric">
                <span>g / h / f</span>
                <strong>
                  {current.g?.toFixed(2)} / {current.h.toFixed(2)} /{" "}
                  {current.f?.toFixed(2)}
                </strong>
              </div>
            )}
            <h4>Open list</h4>
            <p className="node-list">
              {(current?.open_list || route.open_list).join(" → ") || "Empty"}
            </p>
            <h4>Closed list</h4>
            <p className="node-list">
              {(current?.closed_list || route.closed_list).join(" → ") ||
                "Empty"}
            </p>
            <div className="metric">
              <span>Cost / explored</span>
              <strong>
                {route.total_cost} / {route.explored_nodes.length}
              </strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
