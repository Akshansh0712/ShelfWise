from time import perf_counter


def finish(graph, algorithm, path, closed, opened, trace, started):
    return {
        "algorithm": algorithm,
        "path": path,
        "total_cost": sum(graph[a][b]["weight"] for a, b in zip(path, path[1:])),
        "explored_nodes": closed,
        "open_list": opened,
        "closed_list": closed,
        "trace": trace,
        "execution_time_ms": (perf_counter() - started) * 1000,
    }


def reconstruct(parent, node):
    path = [node]
    while node in parent:
        node = parent[node]
        path.append(node)
    return path[::-1]
