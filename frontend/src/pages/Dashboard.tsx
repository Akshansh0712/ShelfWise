import type { ReactNode } from "react";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Compass,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";
import type { Book, Graph } from "../types";

export function Dashboard({
  books,
  graph,
  query,
  setQuery,
  catalog,
  openSearch,
}: {
  books: Book[];
  graph: Graph | null;
  query: string;
  setQuery: (value: string) => void;
  catalog: ReactNode;
  openSearch: () => void;
}) {
  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-kicker">
            <Sparkles size={15} /> YOUR LIBRARY, REIMAGINED
          </div>
          <h2>
            Every great read
            <br />
            starts with a path.
          </h2>
          <p>Find Books. Discover Paths. Collect Smarter.</p>
          <button onClick={() => openSearch()}>
            Explore the collection <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <Compass size={125} strokeWidth={0.7} />
          <span>DISCOVER YOUR NEXT STORY</span>
        </div>
      </section>
      <div className="stats">
        <div>
          <span className="stat-icon">
            <BookOpen size={20} />
          </span>
          <div>
            <small>IN THE CATALOGUE</small>
            <strong>{books.length}</strong>
            <p>Total books</p>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <Layers size={20} />
          </span>
          <div>
            <small>EXPLORE BY SUBJECT</small>
            <strong>
              {graph?.nodes.filter(
                (n) => n.kind === "section" && n.id !== "HALL",
              ).length || 0}
            </strong>
            <p>Library sections</p>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <BookMarked size={20} />
          </span>
          <div>
            <small>READY TO DISCOVER</small>
            <strong>{books.filter((b) => b.available).length}</strong>
            <p>Available books</p>
          </div>
        </div>
      </div>
      <div className="section-head">
        <div>
          <span className="eyebrow">THE COLLECTION</span>
          <h2>Find something wonderful</h2>
          <p>Search by title, author, or subject.</p>
        </div>
        <button className="text-button" onClick={() => openSearch()}>
          View all books <ArrowRight size={16} />
        </button>
      </div>
      <div className="searchbox">
        <Search size={19} />
        <input
          placeholder="Search the collection..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {catalog}
    </>
  );
}
