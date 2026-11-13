import { ArrowRight, BookOpen } from "lucide-react";
import type { Book } from "../types";

export function BookCatalog({
  books,
  selected,
  onLocate,
  onToggle,
}: {
  books: Book[];
  selected: number[];
  onLocate: (book: Book) => void;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="book-grid">
      {books.map((b, i) => (
        <article className="book-card" key={b.id}>
          <div className={"cover cover" + (i % 4)}>
            <BookOpen size={25} />
            <span>{b.category}</span>
          </div>
          <div className="book-content">
            <div className="book-top">
              <span className="eyebrow">{b.category}</span>
              <span className={"status " + (!b.available ? "unavailable" : "")}>
                {b.available ? "Available" : "Unavailable"}
              </span>
            </div>
            <h3>{b.title}</h3>
            <p>{b.author}</p>
            <div className="book-location">
              {b.section_id} <span>·</span> {b.shelf_id}
            </div>
            <div className="book-actions">
              <button disabled={!b.available} onClick={() => onLocate(b)}>
                Locate <ArrowRight size={14} />
              </button>
              <button disabled={!b.available} onClick={() => onToggle(b.id)}>
                {selected.includes(b.id) ? "Remove" : "Add to list"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
