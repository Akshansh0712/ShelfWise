from fastapi.testclient import TestClient
from app import database
from app.config import allowed_origins
from app.main import app


def test_configured_origins_are_explicit(monkeypatch):
    monkeypatch.setenv("SHELFWISE_ALLOWED_ORIGINS", " https://shelfwise.example/ , https://other.example ")
    origins = allowed_origins()
    assert "https://shelfwise.example" in origins
    assert "https://other.example" in origins
    assert "http://localhost:5173" in origins
    assert "*" not in origins


def test_local_preflight_is_allowed(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DB", tmp_path / "cors-test.db")
    with TestClient(app) as client:
        response = client.options("/api/books", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        })
        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
