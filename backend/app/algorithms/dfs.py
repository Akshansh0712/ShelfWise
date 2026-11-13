from time import perf_counter
from .common import finish, reconstruct


def search(graph, start, destination):
    started = perf_counter()
    stack, seen, parent, closed, trace = [start], {start}, {}, [], []
    while stack:
        node = stack.pop()
        closed.append(node)
        if node != destination:
            for neighbor in reversed(list(graph.neighbors(node))):
                if neighbor not in seen:
                    seen.add(neighbor)
                    parent[neighbor] = node
                    stack.append(neighbor)
        trace.append(
            {
                "current": node,
                "open_list": list(reversed(stack)),
                "closed_list": closed.copy(),
            }
        )
        if node == destination:
            return finish(
                graph,
                "dfs",
                reconstruct(parent, node),
                closed,
                list(reversed(stack)),
                trace,
                started,
            )
    return None
