import math
import networkx as nx
from app.algorithms import astar
from app.optimizer import collect


def test_two_opt_improves_nearest_neighbor():
    points = [(14, 19), (11, 8), (4, 5), (27, 21), (0, 10)]
    graph = nx.Graph()
    for i, (x, y) in enumerate(points):
        graph.add_node(str(i), x=x, y=y)
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            graph.add_edge(str(i), str(j), weight=math.dist(points[i], points[j]))
    remaining = set(map(str, range(1, 5)))
    current, initial_cost = "0", 0
    while remaining:
        route, shelf = min(
            ((astar.search(graph, current, s), s) for s in remaining),
            key=lambda item: (item[0]["total_cost"], item[1]),
        )
        initial_cost += route["total_cost"]
        current = shelf
        remaining.remove(shelf)
    books = [{"id": int(s), "shelf_id": s} for s in map(str, range(1, 5))]
    result = collect(graph, "0", books, "astar")
    assert result["total_cost"] < initial_cost
    assert set(result["collection_order"]) == {book["shelf_id"] for book in books}
    assert result["total_cost"] == sum(
        graph[a][b]["weight"] for a, b in zip(result["path"], result["path"][1:])
    )


def test_multiple_books_on_same_shelf_and_start_shelf():
    graph = nx.Graph()
    graph.add_edge("A", "B", weight=3)
    books = [
        {"id": 1, "shelf_id": "A"},
        {"id": 2, "shelf_id": "A"},
        {"id": 3, "shelf_id": "B"},
    ]
    result = collect(graph, "A", books, "astar")
    assert result["collection_order"] == ["A", "B"]
    assert result["books_by_shelf"]["A"] == [1, 2]
    assert result["total_cost"] == 3
