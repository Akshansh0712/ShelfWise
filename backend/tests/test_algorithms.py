import networkx as nx
from app.algorithms import bfs, dfs, astar


def example():
    graph = nx.Graph()
    graph.add_weighted_edges_from(
        [("S", "A", 10), ("A", "T", 10), ("S", "B", 1), ("B", "C", 1), ("C", "T", 1)]
    )
    return graph


def test_bfs_shortest_number_of_edges():
    result = bfs.search(example(), "S", "T")
    assert result["path"] == ["S", "A", "T"]
    assert result["total_cost"] == 20


def test_astar_minimum_weight():
    result = astar.search(example(), "S", "T")
    assert result["path"] == ["S", "B", "C", "T"]
    assert result["total_cost"] == 3


def test_dfs_and_trace():
    result = dfs.search(example(), "S", "T")
    assert result["path"][0] == "S" and result["path"][-1] == "T"
    assert result["trace"][-1]["current"] == "T"


def test_astar_uses_admissible_coordinate_heuristic():
    from app.graph import make_graph

    graph = make_graph()
    scale = astar.heuristic_scale(graph)
    assert scale > 0
    for target in graph.nodes:
        distances = nx.single_source_dijkstra_path_length(
            graph, target, weight="weight"
        )
        for node, distance in distances.items():
            estimate = astar.heuristic(graph, node, target, scale)
            assert estimate <= distance + 1e-9
            result = astar.search(graph, node, target)
            assert abs(result["total_cost"] - distance) < 1e-9
            assert abs(result["trace"][0]["h"] - estimate) < 1e-9
            assert result["trace"][-1]["h"] == 0


def test_astar_falls_back_to_zero_without_coordinates():
    graph = example()
    assert astar.heuristic_scale(graph) == 0
    assert astar.search(graph, "S", "T")["total_cost"] == 3
