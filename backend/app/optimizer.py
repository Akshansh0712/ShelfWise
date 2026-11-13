from .algorithms import astar, bfs, dfs

SEARCH = {"astar": astar.search, "bfs": bfs.search, "dfs": dfs.search}


def collect(graph, start, books, algorithm):
    """Nearest-neighbor initialization followed by bounded 2-opt local search."""
    shelves = {book["shelf_id"] for book in books}
    remaining = set(shelves)
    order, current = [], start
    while remaining:
        candidates = [
            (astar.search(graph, current, shelf), shelf) for shelf in sorted(remaining)
        ]
        candidates = [
            (route, shelf) for route, shelf in candidates if route is not None
        ]
        if not candidates:
            return None
        _, current = min(candidates, key=lambda item: (item[0]["total_cost"], item[1]))
        order.append(current)
        remaining.remove(current)

    cache = {}

    def evaluate(sequence):
        path, legs, seen, actual_order, current = [start], [], set(), [], start
        if start in shelves:
            seen.add(start)
            actual_order.append(start)
        for shelf in sequence:
            if shelf in seen:
                continue
            key = (current, shelf)
            if key not in cache:
                cache[key] = SEARCH[algorithm](graph, current, shelf)
            leg = cache[key]
            if leg is None:
                return None
            path.extend(leg["path"][1:])
            legs.append(leg)
            for node in leg["path"]:
                if node in shelves and node not in seen:
                    seen.add(node)
                    actual_order.append(node)
            current = shelf
        return {
            "collection_order": actual_order,
            "path": path,
            "legs": legs,
            "total_cost": sum(leg["total_cost"] for leg in legs),
        }

    best = evaluate(order)
    if best is None:
        return None
    # Bound work on larger requests; each accepted reversal strictly lowers actual leg cost.
    evaluations = 0
    improved = True
    while improved and evaluations < 2000:
        improved = False
        for left in range(len(order)):
            for right in range(left + 1, len(order)):
                candidate_order = (
                    order[:left] + order[left : right + 1][::-1] + order[right + 1 :]
                )
                candidate = evaluate(candidate_order)
                evaluations += 1
                if (
                    candidate is not None
                    and candidate["total_cost"] < best["total_cost"] - 1e-9
                ):
                    order, best, improved = candidate_order, candidate, True
                    break
                if evaluations >= 2000:
                    break
            if improved or evaluations >= 2000:
                break
    best["books_by_shelf"] = {
        shelf: [book["id"] for book in books if book["shelf_id"] == shelf]
        for shelf in best["collection_order"]
    }
    best["method"] = (
        "Nearest-neighbor with bounded 2-opt local search; not guaranteed globally optimal."
    )
    return best
