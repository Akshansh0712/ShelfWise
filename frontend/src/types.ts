export type Algorithm = "bfs" | "dfs" | "astar";
export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  shelf_id: string;
  section_id: string;
  available: boolean;
}
export interface Location {
  id: string;
  label: string;
  kind: string;
  x: number;
  y: number;
  blocked: boolean;
}
export interface Edge {
  source: string;
  target: string;
  weight: number;
  blocked: boolean;
}
export interface Graph {
  nodes: Location[];
  edges: Edge[];
}
export interface Step {
  current: string;
  open_list: string[];
  closed_list: string[];
  g?: number;
  h?: number;
  f?: number;
}
export interface Route {
  algorithm: Algorithm;
  path: string[];
  total_cost: number;
  explored_nodes: string[];
  open_list: string[];
  closed_list: string[];
  execution_time_ms: number;
  trace: Step[];
}
export interface Collection {
  collection_order: string[];
  books_by_shelf: Record<string, number[]>;
  path: string[];
  total_cost: number;
  legs: Route[];
  method: string;
}

export interface Constraints {
  closed_nodes: string[];
  inaccessible_edges: [string, string][];
  crowded_edges: { edge: [string, string]; multiplier: number }[];
}
