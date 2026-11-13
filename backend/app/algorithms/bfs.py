from collections import deque
from time import perf_counter
from .common import finish, reconstruct


def search(graph, start, destination):
    started = perf_counter()
    queue, seen, parent, closed, trace = deque([start]), {start}, {}, [], []
    while queue:
        node = queue.popleft()
        closed.append(node)
        if node != destination:
            for neighbor in graph.neighbors(node):
                if neighbor not in seen:
                    seen.add(neighbor)
                    parent[neighbor] = node
                    queue.append(neighbor)
        trace.append(
            {"current": node, "open_list": list(queue), "closed_list": closed.copy()}
        )
        if node == destination:
            return finish(
                graph,
                "bfs",
                reconstruct(parent, node),
                closed,
                list(queue),
                trace,
                started,
            )
    return None
