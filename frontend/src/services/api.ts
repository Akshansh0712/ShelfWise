import type {
  Algorithm,
  Book,
  Collection,
  Constraints,
  Graph,
  Route,
} from "../types";
const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(base + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Request failed.",
    );
  }
  return response.json() as Promise<T>;
}
export const api = {
  books: () => request<Book[]>("/api/books"),
  graph: () => request<Graph>("/api/library/graph"),
  constraints: (token: string) =>
    request<Constraints>("/api/library/constraints", {
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    }),
  saveConstraints: (token: string, constraints: Constraints) =>
    request<{ status: string }>("/api/library/constraints", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(constraints),
    }),
  route: (start: string, destination: string, algorithm: Algorithm) =>
    request<Route>("/api/routes/find", {
      method: "POST",
      body: JSON.stringify({ start, destination, algorithm }),
    }),
  collect: (start: string, book_ids: number[], algorithm: Algorithm) =>
    request<Collection>("/api/routes/collect", {
      method: "POST",
      body: JSON.stringify({ start, book_ids, algorithm }),
    }),
};
