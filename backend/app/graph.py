import networkx as nx

LOCATIONS = [
    ("ENTRANCE", "Entrance", "entrance", 0, 220),
    ("HALL", "Main hall", "section", 180, 220),
    ("FICTION", "Fiction", "section", 380, 40),
    ("SCIENCE", "Science", "section", 380, 220),
    ("HISTORY", "History", "section", 380, 400),
    ("SHELF_A1", "Shelf A1", "shelf", 610, 0),
    ("SHELF_A2", "Shelf A2", "shelf", 610, 90),
    ("SHELF_B1", "Shelf B1", "shelf", 610, 220),
    ("SHELF_C1", "Shelf C1", "shelf", 610, 350),
    ("ARCHIVE", "Restricted archive", "restricted", 610, 450),
]
EDGES = [
    ("ENTRANCE", "HALL", 8),
    ("HALL", "FICTION", 9),
    ("HALL", "SCIENCE", 7),
    ("HALL", "HISTORY", 9),
    ("FICTION", "SCIENCE", 6),
    ("SCIENCE", "HISTORY", 6),
    ("FICTION", "SHELF_A1", 5),
    ("FICTION", "SHELF_A2", 4),
    ("SCIENCE", "SHELF_B1", 5),
    ("HISTORY", "SHELF_C1", 5),
    ("HISTORY", "ARCHIVE", 5),
]


def make_graph(constraints=None, include_blocked=False):
    constraints = constraints or {}
    graph = nx.Graph()
    blocked = set(constraints.get("closed_nodes", [])) | {"ARCHIVE"}
    for node, label, kind, x, y in LOCATIONS:
        graph.add_node(node, label=label, kind=kind, x=x, y=y, blocked=node in blocked)
    inaccessible = {
        frozenset(edge) for edge in constraints.get("inaccessible_edges", [])
    }
    crowded = {
        frozenset(item["edge"]): item["multiplier"]
        for item in constraints.get("crowded_edges", [])
    }
    for a, b, distance in EDGES:
        edge = frozenset((a, b))
        graph.add_edge(
            a, b, weight=distance * crowded.get(edge, 1), blocked=edge in inaccessible
        )
    if not include_blocked:
        graph.remove_nodes_from(blocked)
        graph.remove_edges_from(
            [(a, b) for a, b, d in graph.edges(data=True) if d["blocked"]]
        )
    return graph
