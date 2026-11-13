import { useState } from "react";
import { api } from "../services/api";
import type { Algorithm, Location, Route } from "../types";

const algorithms: Algorithm[] = ["bfs", "dfs", "astar"];
const names: Record<Algorithm, string> = {
  bfs: "BFS",
  dfs: "DFS",
  astar: "A*",
};

export function AlgorithmComparison({
  locations,
  start,
  destination,
}: {
  locations: Location[];
  start: string;
  destination: string;
}) {
  const [results, setResults] = useState<Route[]>([]);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(destination);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function compare() {
    setLoading(true);
    setResults([]);
    setError("");
    try {
      setResults(
        await Promise.all(
          algorithms.map((algorithm) => api.route(from, to, algorithm)),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel comparison">
      <span className="eyebrow">SIDE-BY-SIDE</span>
      <h3>Compare search algorithms</h3>
      <p>Run all three algorithms between the same accessible locations.</p>
      <div className="comparison-controls">
        <label className="field">
          START
          <select
            disabled={loading}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setResults([]);
            }}
          >
            {locations.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          DESTINATION
          <select
            disabled={loading}
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setResults([]);
            }}
          >
            {locations.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="primary"
          disabled={loading || !locations.length}
          onClick={compare}
        >
          {loading ? "Comparing…" : "Compare algorithms"}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {results.length > 0 && (
        <div className="comparison-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Cost</th>
                <th>Explored</th>
                <th>Time</th>
                <th>Path</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.algorithm}>
                  <td>{names[r.algorithm]}</td>
                  <td>{r.total_cost}</td>
                  <td>{r.explored_nodes.length}</td>
                  <td>{r.execution_time_ms.toFixed(2)} ms</td>
                  <td>{r.path.join(" → ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
