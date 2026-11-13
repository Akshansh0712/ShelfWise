from app.graph import make_graph


def test_constraints_affect_graph():
    graph = make_graph(
        {
            "closed_nodes": ["SCIENCE"],
            "inaccessible_edges": [["HALL", "FICTION"]],
            "crowded_edges": [{"edge": ["HALL", "HISTORY"], "multiplier": 2}],
        }
    )
    assert "SCIENCE" not in graph and "ARCHIVE" not in graph
    assert not graph.has_edge("HALL", "FICTION")
    assert graph["HALL"]["HISTORY"]["weight"] == 18
