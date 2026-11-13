import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Graph, Route } from "../types";

export function LibraryMap({
  selectors,
  map,
  node,
  graph,
  route,
  openAnalysis,
}: {
  selectors: ReactNode;
  map: ReactNode;
  node: string;
  graph: Graph | null;
  route: Route | null;
  openAnalysis: () => void;
}) {
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">NAVIGATE</span>
        <h2>Find your way around.</h2>
        <p>
          Choose a destination and see the search unfold across the library.
        </p>
      </div>
      {selectors}
      <div className="map-grid">
        <div className="panel map-panel">
          <div className="panel-heading">
            <div>
              <h3>Library map</h3>
              <p>Click a location to inspect it. Scroll to zoom.</p>
            </div>
            <span className="pill">INTERACTIVE</span>
          </div>
          {map}
          {node && (
            <div className="node-detail">
              Selected:{" "}
              <strong>{graph?.nodes.find((n) => n.id === node)?.label}</strong>{" "}
              · {node}{" "}
              {graph?.nodes.find((n) => n.id === node)?.blocked &&
                "· Restricted or closed"}
            </div>
          )}
        </div>
        <div className="panel details">
          <span className="eyebrow">ROUTE INSIGHTS</span>
          <h3>{route ? "Your route is ready" : "Ready when you are"}</h3>
          {route ? (
            <>
              <div className="metric">
                <span>Movement cost</span>
                <strong>{route.total_cost}</strong>
              </div>
              <div className="metric">
                <span>Locations explored</span>
                <strong>{route.explored_nodes.length}</strong>
              </div>
              <div className="metric">
                <span>Execution time</span>
                <strong>{route.execution_time_ms.toFixed(2)} ms</strong>
              </div>
              <div className="route-list">
                {route.path.map((n, i) => (
                  <div key={i}>
                    <span>{i + 1}</span>
                    {graph?.nodes.find((x) => x.id === n)?.label || n}
                  </div>
                ))}
              </div>
              <button className="secondary" onClick={() => openAnalysis()}>
                Inspect search steps <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <p>
              Choose a start, destination and algorithm to calculate a route.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
