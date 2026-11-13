import type { ReactNode } from "react";
import { Route as RouteIcon } from "lucide-react";
import type { Algorithm, Book, Collection, Location } from "../types";

export function CollectionPlanner({
  books,
  selected,
  toggle,
  start,
  changeStart,
  locations,
  algorithm,
  changeAlgorithm,
  labels,
  collect,
  collection,
  map,
}: {
  books: Book[];
  selected: number[];
  toggle: (id: number) => void;
  start: string;
  changeStart: (value: string) => void;
  locations: Location[];
  algorithm: Algorithm;
  changeAlgorithm: (value: Algorithm) => void;
  labels: Record<Algorithm, string>;
  collect: () => Promise<void>;
  collection: Collection | null;
  map: ReactNode;
}) {
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">PLAN YOUR VISIT</span>
        <h2>One trip, more discoveries.</h2>
        <p>Select available books to create a practical collection route.</p>
      </div>
      <div className="planner-grid">
        <div className="panel">
          <h3>Choose your books</h3>
          {books.map((b) => (
            <label className="check-row" key={b.id}>
              <input
                type="checkbox"
                disabled={!b.available}
                checked={selected.includes(b.id)}
                onChange={() => toggle(b.id)}
              />
              <span>
                <strong>{b.title}</strong>
                <small>
                  {b.author} · {b.shelf_id}
                </small>
              </span>
              <em>{b.available ? "Available" : "Unavailable"}</em>
            </label>
          ))}
          <label className="field">
            STARTING POINT
            <select value={start} onChange={(e) => changeStart(e.target.value)}>
              {locations.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            ALGORITHM
            <select
              value={algorithm}
              onChange={(e) => changeAlgorithm(e.target.value as Algorithm)}
            >
              {Object.entries(labels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            className="primary wide"
            disabled={!selected.length}
            onClick={collect}
          >
            <RouteIcon size={16} /> Plan collection route
          </button>
        </div>
        <div className="panel">
          <h3>Collection route</h3>
          {collection ? (
            <>
              <p>{collection.method}</p>
              <div className="metric">
                <span>Total movement cost</span>
                <strong>{collection.total_cost}</strong>
              </div>
              <div className="route-list">
                {collection.collection_order.map((s, i) => (
                  <div key={s}>
                    <span>{i + 1}</span>
                    <div>
                      <strong>{s}</strong>
                      <small>
                        {collection.books_by_shelf[s]
                          .map((id) => books.find((b) => b.id === id)?.title)
                          .join(", ")}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mini-map">{map}</div>
            </>
          ) : (
            <p>
              Select books to see your suggested collection order and route.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
