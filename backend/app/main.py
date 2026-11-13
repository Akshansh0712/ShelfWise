import os
import secrets
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from . import database
from .config import allowed_origins
from .graph import make_graph
from .optimizer import SEARCH, collect
from .schemas import RouteRequest, CollectRequest, Constraints, RouteResponse


@asynccontextmanager
async def lifespan(app):
    database.initialize()
    yield


app = FastAPI(title="ShelfWise API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/books")
def list_books():
    return database.books()


@app.get("/api/books/search")
def search_books(q: str = ""):
    return database.books(q)


@app.get("/api/library/graph")
def graph_data():
    graph = make_graph(database.get_constraints(), include_blocked=True)
    return {
        "nodes": [{"id": n, **d} for n, d in graph.nodes(data=True)],
        "edges": [
            {"source": a, "target": b, **d} for a, b, d in graph.edges(data=True)
        ],
    }


def validated_graph(start, destination=None):
    graph = make_graph(database.get_constraints())
    if start not in graph or (destination is not None and destination not in graph):
        raise HTTPException(400, "Location does not exist or is inaccessible.")
    return graph


@app.post("/api/routes/find", response_model=RouteResponse)
def find_route(request: RouteRequest):
    graph = validated_graph(request.start, request.destination)
    route = SEARCH[request.algorithm](graph, request.start, request.destination)
    if route is None:
        raise HTTPException(404, "No route exists between those locations.")
    return route


@app.post("/api/routes/collect")
def collect_route(request: CollectRequest):
    graph = validated_graph(request.start)
    by_id = {book["id"]: book for book in database.books()}
    if len(set(request.book_ids)) != len(request.book_ids):
        raise HTTPException(400, "Duplicate book IDs are not allowed.")
    if any(book_id not in by_id for book_id in request.book_ids):
        raise HTTPException(404, "A selected book does not exist.")
    selected = [by_id[book_id] for book_id in request.book_ids]
    if any(not book["available"] for book in selected):
        raise HTTPException(400, "A selected book is unavailable.")
    if any(book["shelf_id"] not in graph for book in selected):
        raise HTTPException(400, "A selected book is in an inaccessible location.")
    route = collect(graph, request.start, selected, request.algorithm)
    if route is None:
        raise HTTPException(404, "A selected shelf cannot be reached.")
    return route


def require_admin(x_admin_token: str):
    token = os.getenv("SHELFWISE_ADMIN_TOKEN")
    if not token or not secrets.compare_digest(token, x_admin_token):
        raise HTTPException(403, "Valid administrator token required.")


@app.get("/api/library/constraints", response_model=Constraints)
def read_constraints(x_admin_token: str = Header(default="")):
    require_admin(x_admin_token)
    return Constraints(**database.get_constraints())


@app.post("/api/library/constraints")
def update_constraints(request: Constraints, x_admin_token: str = Header(default="")):
    require_admin(x_admin_token)
    graph = make_graph(include_blocked=True)
    if any(node not in graph for node in request.closed_nodes):
        raise HTTPException(400, "Unknown location.")
    for edge in list(request.inaccessible_edges) + [
        item.edge for item in request.crowded_edges
    ]:
        if not graph.has_edge(*edge):
            raise HTTPException(400, "Unknown aisle.")
    database.set_constraints(request.model_dump())
    return {"status": "updated"}
