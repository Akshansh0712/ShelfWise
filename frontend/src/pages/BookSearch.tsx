import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { Book } from "../types";

export function BookSearch({
  query,
  setQuery,
  filtered,
  catalog,
}: {
  query: string;
  setQuery: (value: string) => void;
  filtered: Book[];
  catalog: ReactNode;
}) {
  return (
    <>
      <div className="page-intro">
        <span className="eyebrow">DISCOVER</span>
        <h2>Your next chapter is waiting.</h2>
        <p>
          Search our catalogue, explore the shelves, and add books to your
          collection route.
        </p>
      </div>
      <div className="searchbox">
        <Search size={19} />
        <input
          placeholder="Search title, author, or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="result-count">{filtered.length} books found</div>
      {catalog}
    </>
  );
}
