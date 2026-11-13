from fastapi.testclient import TestClient
from app import database
from app.main import app


def test_endpoints_and_constraints(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DB", tmp_path / "test.db")
    monkeypatch.setenv("SHELFWISE_ADMIN_TOKEN", "test-secret")
    with TestClient(app) as client:
        books = client.get("/api/books").json()
        assert len(books) == 7
        assert (
            client.get("/api/books/search", params={"q": "hawking"}).json()[0]["title"]
            == "A Brief History of Time"
        )
        route = client.post(
            "/api/routes/find",
            json={"start": "ENTRANCE", "destination": "SHELF_B1", "algorithm": "astar"},
        )
        assert route.status_code == 200 and route.json()["path"][-1] == "SHELF_B1"
        assert (
            client.post(
                "/api/routes/collect",
                json={"start": "ENTRANCE", "book_ids": [3], "algorithm": "astar"},
            ).status_code
            == 400
        )
        assert (
            client.post(
                "/api/library/constraints", json={"closed_nodes": ["SCIENCE"]}
            ).status_code
            == 403
        )
        assert (
            client.post(
                "/api/library/constraints",
                headers={"X-Admin-Token": "test-secret"},
                json={"closed_nodes": ["SCIENCE"]},
            ).status_code
            == 200
        )
        assert (
            client.post(
                "/api/routes/find",
                json={
                    "start": "ENTRANCE",
                    "destination": "SHELF_B1",
                    "algorithm": "astar",
                },
            ).status_code
            == 404
        )
        assert (
            client.post(
                "/api/routes/find",
                json={
                    "start": "ENTRANCE",
                    "destination": "ARCHIVE",
                    "algorithm": "astar",
                },
            ).status_code
            == 400
        )


def test_admin_read_write_and_crowd_constraints(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DB", tmp_path / "test-admin.db")
    monkeypatch.setenv("SHELFWISE_ADMIN_TOKEN", "test-secret")
    with TestClient(app) as client:
        assert client.get("/api/library/constraints").status_code == 403
        headers = {"X-Admin-Token": "test-secret"}
        assert (
            client.get("/api/library/constraints", headers=headers).json()[
                "closed_nodes"
            ]
            == []
        )
        settings = {
            "closed_nodes": [],
            "inaccessible_edges": [["HALL", "FICTION"]],
            "crowded_edges": [{"edge": ["HALL", "SCIENCE"], "multiplier": 3}],
        }
        assert (
            client.post(
                "/api/library/constraints", headers=headers, json=settings
            ).status_code
            == 200
        )
        assert (
            client.get("/api/library/constraints", headers=headers).json() == settings
        )
        graph = client.get("/api/library/graph").json()
        aisle = next(
            edge
            for edge in graph["edges"]
            if {edge["source"], edge["target"]} == {"HALL", "SCIENCE"}
        )
        assert aisle["weight"] == 21
        assert client.post(
            "/api/routes/find",
            json={"start": "ENTRANCE", "destination": "FICTION", "algorithm": "astar"},
        ).json()["path"] != ["ENTRANCE", "HALL", "FICTION"]
