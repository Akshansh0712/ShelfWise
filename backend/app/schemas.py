from typing import Literal
from pydantic import BaseModel, Field

Algorithm = Literal["bfs", "dfs", "astar"]


class RouteRequest(BaseModel):
    start: str
    destination: str
    algorithm: Algorithm = "astar"


class CollectRequest(BaseModel):
    start: str
    book_ids: list[int] = Field(min_length=1, max_length=50)
    algorithm: Algorithm = "astar"


class CrowdedEdge(BaseModel):
    edge: tuple[str, str]
    multiplier: float = Field(ge=1, le=100)


class Constraints(BaseModel):
    closed_nodes: list[str] = []
    inaccessible_edges: list[tuple[str, str]] = []
    crowded_edges: list[CrowdedEdge] = []


class SearchStep(BaseModel):
    current: str
    open_list: list[str]
    closed_list: list[str]
    g: float | None = None
    h: float | None = None
    f: float | None = None


class RouteResponse(BaseModel):
    algorithm: Algorithm
    path: list[str]
    total_cost: float
    explored_nodes: list[str]
    open_list: list[str]
    closed_list: list[str]
    execution_time_ms: float
    trace: list[SearchStep]
