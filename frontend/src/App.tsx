import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Map,
  Search,
  Sparkles,
  Layers,
  BookMarked,
  Navigation,
} from "lucide-react";
import { LibraryGraph } from "./components/LibraryGraph";
import { BookCatalog } from "./components/BookCatalog";
import { Dashboard } from "./pages/Dashboard";
import { BookSearch } from "./pages/BookSearch";
import { LibraryMap } from "./pages/LibraryMap";
import { CollectionPlanner } from "./pages/CollectionPlanner";
import { AlgorithmAnalysis } from "./pages/AlgorithmAnalysis";
import { ConstraintAdmin } from "./components/ConstraintAdmin";
import { api } from "./services/api";
import type { Algorithm, Book, Collection, Graph, Route } from "./types";

type Page =
  | "Dashboard"
  | "Book search"
  | "Library map"
  | "Collection planner"
  | "Algorithm analysis"
  | "Administration";
const pages: Page[] = [
  "Dashboard",
  "Book search",
  "Library map",
  "Collection planner",
  "Algorithm analysis",
  "Administration",
];
const icons = [LayoutDashboard, Search, Map, BookMarked, Layers, Layers];
const labels: Record<Algorithm, string> = {
  astar: "A* Search",
  bfs: "Breadth-first search",
  dfs: "Depth-first search",
};
export default function App() {
  const [page, setPage] = useState<Page>("Dashboard"),
    [books, setBooks] = useState<Book[]>([]),
    [graph, setGraph] = useState<Graph | null>(null),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<number[]>([]),
    [start, setStart] = useState("ENTRANCE"),
    [destination, setDestination] = useState("SHELF_A1"),
    [algorithm, setAlgorithm] = useState<Algorithm>("astar"),
    [route, setRoute] = useState<Route | null>(null),
    [collection, setCollection] = useState<Collection | null>(null),
    [step, setStep] = useState(-1),
    [playing, setPlaying] = useState(false),
    [error, setError] = useState(""),
    [node, setNode] = useState("");
  const collectionVersion = useRef(0);
  const routeVersion = useRef(0);

  function invalidateRoute() {
    routeVersion.current += 1;
    setRoute(null);
    setPlaying(false);
    setStep(-1);
  }

  async function refreshGraph() {
    const updated = await api.graph();
    invalidateCollection();
    invalidateRoute();
    setGraph(updated);
    const accessible = updated.nodes.filter((n) => !n.blocked);
    if (accessible.length) {
      if (!accessible.some((n) => n.id === start)) setStart(accessible[0].id);
      if (!accessible.some((n) => n.id === destination))
        setDestination(accessible[0].id);
    }
  }

  function invalidateCollection() {
    collectionVersion.current += 1;
    setCollection(null);
  }

  function changeStart(value: string) {
    invalidateCollection();
    invalidateRoute();
    setStart(value);
  }

  function changeAlgorithm(value: Algorithm) {
    invalidateCollection();
    invalidateRoute();
    setAlgorithm(value);
  }
  useEffect(() => {
    Promise.all([api.books(), api.graph()])
      .then(([b, g]) => {
        setBooks(b);
        setGraph(g);
      })
      .catch((e) => setError(e.message + " Ensure the backend is running."));
  }, []);
  useEffect(() => {
    if (!playing || !route) return;
    if (step >= route.trace.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 650);
    return () => clearTimeout(timer);
  }, [playing, step, route]);
  const filtered = useMemo(
    () =>
      books.filter((b) =>
        [b.title, b.author, b.category].some((v) =>
          v.toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    [books, query],
  );
  const locations = graph?.nodes.filter((n) => !n.blocked) || [];
  const current = step >= 0 ? route?.trace[step] : undefined;
  const mapPath =
    collection?.path ||
    (step < 0 || step === (route?.trace.length ?? 0) - 1 ? route?.path : []) ||
    [];
  const explored = current?.closed_list || route?.explored_nodes || [];
  async function find() {
    invalidateCollection();
    invalidateRoute();
    const version = routeVersion.current;
    try {
      setError("");
      const result = await api.route(start, destination, algorithm);
      if (version !== routeVersion.current) return;
      setRoute(result);
      setPage("Library map");
    } catch (e) {
      if (version === routeVersion.current) setError((e as Error).message);
    }
  }
  async function collect() {
    const version = ++collectionVersion.current;
    setCollection(null);
    try {
      setError("");
      invalidateRoute();
      const result = await api.collect(start, selected, algorithm);
      if (version !== collectionVersion.current) return;
      setCollection(result);
      setPage("Collection planner");
    } catch (e) {
      if (version === collectionVersion.current) setError((e as Error).message);
    }
  }
  function chooseBook(b: Book) {
    setDestination(b.shelf_id);
    setPage("Library map");
    invalidateRoute();
    invalidateCollection();
  }
  function toggle(id: number) {
    invalidateCollection();
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }
  const selectors = (
    <div className="selectors">
      <label>
        STARTING POINT
        <select value={start} onChange={(e) => changeStart(e.target.value)}>
          {locations.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        DESTINATION
        <select
          value={destination}
          onChange={(e) => {
            invalidateRoute();
            setDestination(e.target.value);
          }}
        >
          {locations.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        SEARCH ALGORITHM
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
      <button className="primary" onClick={find}>
        <Navigation size={16} /> Find route
      </button>
    </div>
  );
  const map = (
    <div className="map-wrap">
      {graph && (
        <LibraryGraph
          graph={graph}
          path={mapPath}
          explored={explored}
          current={current?.current}
          start={start}
          destination={destination}
          onSelect={setNode}
        />
      )}
      <div className="map-legend">
        <span>
          <i className="dot start-dot" /> Start
        </span>
        <span>
          <i className="dot route-dot" /> Route
        </span>
        <span>
          <i className="dot explored-dot" /> Explored
        </span>
        <span>
          <i className="dot blocked-dot" /> Restricted
        </span>
      </div>
    </div>
  );
  const catalog = (
    <BookCatalog
      books={filtered}
      selected={selected}
      onLocate={chooseBook}
      onToggle={toggle}
    />
  );
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <strong>ShelfWise</strong>
            <small>THE INTELLIGENT LIBRARY</small>
          </div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {pages.map((p, i) => {
            const Icon = icons[i];
            return (
              <button
                key={p}
                className={page === p ? "active" : ""}
                onClick={() => setPage(p)}
              >
                <Icon size={18} />
                {p}
                {p === "Collection planner" && selected.length > 0 && (
                  <b>{selected.length}</b>
                )}
              </button>
            );
          })}
        </nav>
        <div className="side-note">
          <Sparkles size={18} />
          <strong>A smarter way to explore.</strong>
          <p>Find your next read and the best path to get there.</p>
        </div>
        <div className="side-footer">
          ShelfWise <span>·</span> Library navigation
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="breadcrumb">WORKSPACE / {page.toUpperCase()}</span>
            <h1>{page}</h1>
          </div>
          <div className="header-badge">
            <span /> Library explorer
          </div>
        </header>
        {error && (
          <div className="error" role="alert">
            {error} <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}
        {page === "Dashboard" && (
          <Dashboard
            books={books}
            graph={graph}
            query={query}
            setQuery={setQuery}
            catalog={catalog}
            openSearch={() => setPage("Book search")}
          />
        )}
        {page === "Book search" && (
          <BookSearch
            query={query}
            setQuery={setQuery}
            filtered={filtered}
            catalog={catalog}
          />
        )}
        {page === "Library map" && (
          <LibraryMap
            selectors={selectors}
            map={map}
            node={node}
            graph={graph}
            route={route}
            openAnalysis={() => setPage("Algorithm analysis")}
          />
        )}
        {page === "Collection planner" && (
          <CollectionPlanner
            books={books}
            selected={selected}
            toggle={toggle}
            start={start}
            changeStart={changeStart}
            locations={locations}
            algorithm={algorithm}
            changeAlgorithm={changeAlgorithm}
            labels={labels}
            collect={collect}
            collection={collection}
            map={map}
          />
        )}
        {page === "Algorithm analysis" && (
          <AlgorithmAnalysis
            graph={graph}
            locations={locations}
            start={start}
            destination={destination}
            route={route}
            map={map}
            labels={labels}
            step={step}
            setStep={setStep}
            setPlaying={setPlaying}
            current={current}
            openMap={() => setPage("Library map")}
          />
        )}
        {page === "Administration" && graph && (
          <ConstraintAdmin graph={graph} onUpdated={refreshGraph} />
        )}
        <footer>
          Designed for discovery <span>·</span> ShelfWise
        </footer>
      </main>
    </div>
  );
}
