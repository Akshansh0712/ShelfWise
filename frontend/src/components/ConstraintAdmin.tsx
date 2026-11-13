import { useState } from "react";
import { api } from "../services/api";
import type { Constraints, Graph } from "../types";

export function ConstraintAdmin({
  graph,
  onUpdated,
}: {
  graph: Graph;
  onUpdated: () => Promise<void>;
}) {
  const [token, setToken] = useState("");
  const [settings, setSettings] = useState<Constraints | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const edgeKey = (a: string, b: string) => [a, b].sort().join("|");
  async function load() {
    setBusy(true);
    setMessage("");
    try {
      setSettings(await api.constraints(token));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!settings) return;
    setBusy(true);
    setMessage("");
    try {
      await api.saveConstraints(token, settings);
      await onUpdated();
      setMessage("Constraints saved. Existing routes were cleared.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function toggleNode(id: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      closed_nodes: settings.closed_nodes.includes(id)
        ? settings.closed_nodes.filter((x) => x !== id)
        : [...settings.closed_nodes, id],
    });
  }
  function toggleEdge(a: string, b: string) {
    if (!settings) return;
    const key = edgeKey(a, b);
    const exists = settings.inaccessible_edges.some(
      ([x, y]) => edgeKey(x, y) === key,
    );
    setSettings({
      ...settings,
      inaccessible_edges: exists
        ? settings.inaccessible_edges.filter(([x, y]) => edgeKey(x, y) !== key)
        : [...settings.inaccessible_edges, [a, b]],
    });
  }
  function setMultiplier(a: string, b: string, value: number) {
    if (!settings) return;
    const other = settings.crowded_edges.filter(
      ({ edge: [x, y] }) => edgeKey(x, y) !== edgeKey(a, b),
    );
    setSettings({
      ...settings,
      crowded_edges:
        value === 1 ? other : [...other, { edge: [a, b], multiplier: value }],
    });
  }
  return (
    <section className="panel admin-panel">
      <span className="eyebrow">LIBRARY ADMINISTRATION</span>
      <h3>Manage constraints</h3>
      <p>
        Load the current settings before making changes. The archive remains
        restricted by default.
      </p>
      <label className="field">
        ADMINISTRATOR TOKEN
        <input
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setSettings(null);
            setMessage("");
          }}
          autoComplete="off"
        />
      </label>
      <button className="secondary" disabled={!token || busy} onClick={load}>
        Load settings
      </button>
      {message && <p role="status">{message}</p>}
      {settings && (
        <>
          <h4>Closed locations</h4>
          <div className="constraint-grid">
            {graph.nodes
              .filter((n) => n.kind !== "restricted")
              .map((n) => (
                <label key={n.id}>
                  <input
                    type="checkbox"
                    checked={settings.closed_nodes.includes(n.id)}
                    onChange={() => toggleNode(n.id)}
                  />{" "}
                  {n.label}
                </label>
              ))}
          </div>
          <h4>Aisles</h4>
          <p>
            Mark inaccessible paths or increase their movement cost for crowds.
          </p>
          {graph.edges
            .filter((e) => e.source !== "ARCHIVE" && e.target !== "ARCHIVE")
            .map((e) => (
              <div className="constraint-edge" key={e.source + "-" + e.target}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.inaccessible_edges.some(
                      ([a, b]) => edgeKey(a, b) === edgeKey(e.source, e.target),
                    )}
                    onChange={() => toggleEdge(e.source, e.target)}
                  />{" "}
                  {e.source} ↔ {e.target} blocked
                </label>
                <label>
                  Cost multiplier{" "}
                  <input
                    aria-label={`Crowd multiplier ${e.source} to ${e.target}`}
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={
                      settings.crowded_edges.find(
                        ({ edge: [a, b] }) =>
                          edgeKey(a, b) === edgeKey(e.source, e.target),
                      )?.multiplier ?? 1
                    }
                    onChange={(event) =>
                      setMultiplier(
                        e.source,
                        e.target,
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
              </div>
            ))}
          <button
            className="primary"
            disabled={
              busy ||
              settings.crowded_edges.some(
                (e) =>
                  !Number.isFinite(e.multiplier) ||
                  e.multiplier < 1 ||
                  e.multiplier > 100,
              )
            }
            onClick={save}
          >
            Save constraints
          </button>
        </>
      )}
    </section>
  );
}
