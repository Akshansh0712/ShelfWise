import os
import sqlite3
from pathlib import Path

DB = Path(
    os.environ.get(
        "SHELFWISE_DB", Path(__file__).resolve().parent.parent / "shelfwise.db"
    )
)
SEED = [
    ("The Great Gatsby", "F. Scott Fitzgerald", "Fiction", "SHELF_A1", "FICTION", 1),
    ("Pride and Prejudice", "Jane Austen", "Fiction", "SHELF_A2", "FICTION", 1),
    ("Dune", "Frank Herbert", "Fiction", "SHELF_A1", "FICTION", 0),
    ("A Brief History of Time", "Stephen Hawking", "Science", "SHELF_B1", "SCIENCE", 1),
    ("The Selfish Gene", "Richard Dawkins", "Science", "SHELF_B1", "SCIENCE", 1),
    ("Sapiens", "Yuval Noah Harari", "History", "SHELF_C1", "HISTORY", 1),
    ("The Silk Roads", "Peter Frankopan", "History", "SHELF_C1", "HISTORY", 1),
]


def connect():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    return db


def initialize():
    with connect() as db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, category TEXT NOT NULL, shelf_id TEXT NOT NULL, section_id TEXT NOT NULL, available INTEGER NOT NULL)"
        )
        db.execute(
            "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
        )
        if not db.execute("SELECT COUNT(*) FROM books").fetchone()[0]:
            db.executemany(
                "INSERT INTO books (title,author,category,shelf_id,section_id,available) VALUES (?,?,?,?,?,?)",
                SEED,
            )


def books(query=""):
    with connect() as db:
        term = "%" + query.lower() + "%"
        rows = db.execute(
            "SELECT * FROM books WHERE lower(title) LIKE ? OR lower(author) LIKE ? OR lower(category) LIKE ? ORDER BY title",
            (term, term, term),
        ).fetchall()
        return [{**dict(row), "available": bool(row["available"])} for row in rows]


def get_constraints():
    import json

    with connect() as db:
        row = db.execute(
            "SELECT value FROM settings WHERE key='constraints'"
        ).fetchone()
        return json.loads(row[0]) if row else {}


def set_constraints(value):
    import json

    with connect() as db:
        db.execute(
            "INSERT OR REPLACE INTO settings (key,value) VALUES ('constraints',?)",
            (json.dumps(value),),
        )
