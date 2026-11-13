import heapq
import itertools
import math
from time import perf_counter
from .common import finish, reconstruct


def heuristic_scale(graph):
    """Lower bound on cost per coordinate unit; zero if coordinates are incomplete."""
    if any("x" not in data or "y" not in data for _, data in graph.nodes(data=True)):
        return 0.0
    ratios = []
    for a, b, data in graph.edges(data=True):
        distance = math.hypot(
            graph.nodes[a]["x"] - graph.nodes[b]["x"],
            graph.nodes[a]["y"] - graph.nodes[b]["y"],
        )
        if distance:
            ratios.append(data["weight"] / distance)
    return min(ratios, default=0.0)


def heuristic(graph, node, destination, scale):
    if scale == 0:
        return 0.0
    return scale * math.hypot(
        graph.nodes[node]["x"] - graph.nodes[destination]["x"],
        graph.nodes[node]["y"] - graph.nodes[destination]["y"],
    )


def search(graph, start, destination):
    started = perf_counter()
    scale = heuristic_scale(graph)
    counter = itertools.count()
    initial_h = heuristic(graph, start, destination, scale)
    heap = [(initial_h, next(counter), 0.0, start)]
    costs, parent, closed, trace, settled = {start: 0.0}, {}, [], [], set()
    while heap:
        _, _, cost, node = heapq.heappop(heap)
        if node in settled or cost != costs[node]:
            continue
        settled.add(node)
        closed.append(node)
        h = heuristic(graph, node, destination, scale)
        if node != destination:
            for neighbor, data in graph[node].items():
                new_cost = cost + data["weight"]
                if new_cost < costs.get(neighbor, float("inf")):
                    costs[neighbor], parent[neighbor] = new_cost, node
                    priority = new_cost + heuristic(graph, neighbor, destination, scale)
                    heapq.heappush(heap, (priority, next(counter), new_cost, neighbor))
        opened = [
            n for _, _, g, n in sorted(heap) if n not in settled and g == costs[n]
        ]
        trace.append(
            {
                "current": node,
                "open_list": opened,
                "closed_list": closed.copy(),
                "g": cost,
                "h": h,
                "f": cost + h,
            }
        )
        if node == destination:
            return finish(
                graph,
                "astar",
                reconstruct(parent, node),
                closed,
                opened,
                trace,
                started,
            )
    return None
