# ShelfWise

### Find Books. Discover Paths. Collect Smarter.

ShelfWise is an intelligent library navigation and book discovery system. It combines a searchable catalogue with a graph-based map so visitors can locate books, explore routes, and see how classical AI search algorithms work.

Built as a B.Tech Computer Science demonstration and portfolio project, ShelfWise brings **BFS, DFS, and A\*** to a practical library use case. This repository contains a **single-library prototype** with sample data; the multi-library platform described in the roadmap is future work.

## What ShelfWise can do

- Search the sample catalogue by title, author, or category and view a book’s availability, section, and shelf.
- Explore an interactive library graph with zoom, pan, location details, and route highlighting.
- Calculate routes with BFS, DFS, or A*, and inspect explored nodes, open and closed lists, execution time, and a step-by-step trace.
- Compare all three algorithms side by side for the same start and destination.
- Select multiple available books and generate a collection route and suggested shelf order.
- Configure closed locations, blocked aisles, and crowd multipliers through a token-protected Administration screen.
- Store the sample catalogue and saved constraints in a local SQLite database.

## Current status

ShelfWise is deployed as a free, single-library portfolio demonstration.

- **Live website:** [Visit ShelfWise](https://shelfwise-web-abfx.onrender.com)
- **Backend check:** [View the sample book catalogue](https://shelfwise-api-xooj.onrender.com/api/books)
- **API documentation:** [Explore the API](https://shelfwise-api-xooj.onrender.com/docs)

The website supports book search, interactive library maps, BFS, DFS, A*,
algorithm comparison, and multi-book route planning.

The backend check links to an existing API endpoint; it is not a dedicated
health-check endpoint.

**Free-hosting limitations:** The backend may take time to wake after
inactivity. Saved SQLite changes, including library constraints, can be lost
when the backend restarts or redeploys. The sample catalogue will be seeded
again. The Administration page requires a token and is not currently enabled
on the deployed backend.

**Current scope:** ShelfWise uses a sample library. Multi-library accounts,
editable catalogues and maps, and persistent hosted storage are planned
future improvements.

## How it works

```text
React + TypeScript interface
        │  Search, map interaction, route requests
        ▼
FastAPI REST API
        │
        ├── SQLite catalogue and saved constraints
        └── NetworkX library graph
              ├── BFS
              ├── DFS
              ├── A*
              └── Multi-book collection planner
        │
        ▼
JSON route, cost, and search trace
        │
        ▼
React Flow map and algorithm analysis
```

Locations are graph nodes; walking paths are weighted edges. Books reference shelves, so multiple books can be located at the same node. The backend applies saved constraints to the graph before calculating a route.

### Search algorithms

| Algorithm | Behavior |
| --- | --- |
| **BFS** | Explores level by level and finds a path with the fewest edges. It does not necessarily minimize walking cost when edge weights differ. |
| **DFS** | Explores a branch deeply and returns a discovered path. It does not guarantee the shortest path. |
| **A\*** | Uses `f(n) = g(n) + h(n)` to search for a minimum-cost route over nonnegative edge weights. |

For A*, `g(n)` is the cost already travelled. The heuristic `h(n)` is the straight-line distance to the destination multiplied by the smallest edge-cost-to-geometric-distance ratio in the accessible graph. This estimate is admissible and consistent for the supported nonnegative weights. If coordinates are unavailable, the heuristic falls back to zero. The trace includes `g`, `h`, and `f` values.

### Collecting multiple books

The planner starts with a nearest-neighbor ordering and then uses a bounded 2-opt local search to improve the actual route cost for the selected algorithm. It respects inaccessible locations and paths and collects books passed along the way. This is a **heuristic**, not a guarantee of a globally optimal collection route. BFS and DFS legs may cost more than the shortest weighted paths.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Flow, Lucide React |
| Backend | Python, FastAPI, Pydantic |
| Graph and algorithms | NetworkX, separate BFS, DFS, and A* implementations |
| Storage | SQLite |
| Tests | pytest, Playwright |

## Project structure

```text
ShelfWise/
├── backend/
│   ├── app/
│   │   ├── algorithms/       # BFS, DFS, A*, shared search utilities
│   │   ├── database.py       # SQLite connection and sample catalogue
│   │   ├── graph.py          # Sample locations, paths, and constraints
│   │   ├── main.py           # FastAPI routes
│   │   ├── optimizer.py      # Multi-book collection planner
│   │   └── schemas.py        # Pydantic models
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable map, catalogue, and admin controls
│   │   ├── pages/            # Dashboard, search, map, planner, analysis
│   │   ├── services/         # Backend API calls
│   │   ├── App.tsx           # Shared state and page coordination
│   │   └── types.ts
│   ├── tests/                # Playwright browser tests
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Run locally

### Prerequisites

- Python **3.12** is the version tested for this project.
- Node.js 20 or newer and npm.
- Google Chrome to run the configured browser tests.

Install Python from [python.org](https://www.python.org/downloads/windows/) and Node.js from [nodejs.org](https://nodejs.org/en/download) if they are not already installed. On Windows, enable **Add Python to PATH** during installation. The commands below use PowerShell and start from the project root.

### 1. Start the backend

```powershell
cd backend

py -3.12 -m venv .venv-local
.\.venv-local\Scripts\python.exe -m pip install -r requirements.txt
.\.venv-local\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`, with interactive API documentation at `http://127.0.0.1:8000/docs`. Keep this terminal open.

On first startup, the app creates `backend/shelfwise.db` and seeds the sample catalogue if the book table is empty. Sample records are defined in `backend/app/database.py`. Set `SHELFWISE_DB` before starting the backend to use a different SQLite file.

### 2. Start the frontend

Open a second PowerShell terminal at the project root:

```powershell
cd frontend

npm.cmd ci
npm.cmd run dev
```

Open the address printed by Vite, normally **http://localhost:5173**. Keep both terminals running. On macOS or Linux, use `npm` in place of `npm.cmd` and the appropriate Python virtual-environment executable.

By default the frontend connects to `http://localhost:8000`. Set `VITE_API_URL` before starting Vite if the API runs elsewhere. The backend’s development CORS configuration permits the local frontend origins on port 5173; a deployed frontend needs an appropriately configured API origin.

## Try ShelfWise

1. Open **Book search** and search by title, author, or category.
2. Choose **Locate** on an available book to select its shelf on the map.
3. Select a starting location and algorithm, then choose **Find route**.
4. Open **Algorithm analysis** to inspect the trace or compare algorithms.
5. Add several available books in **Collection planner** and calculate a collection route.
6. Use **Administration** to load and save library constraints after configuring an administrator token.

Changing route inputs clears the old displayed route; calculate again to see a route for the new inputs.

## Configure constraints

The sample archive is restricted by default. To use the Administration page, stop the backend and set a private token in the same terminal before starting it:

```powershell
$env:SHELFWISE_ADMIN_TOKEN = "replace-with-your-own-private-token"
.\.venv-local\Scripts\python.exe -m uvicorn app.main:app --reload
```

Open **Administration**, enter the same token, and choose **Load settings**. You can close locations, mark aisles inaccessible, and set crowd cost multipliers from 1 to 100. Saving replaces the current constraint set and clears displayed routes. The token is scoped to the terminal session; set it again when starting a new session.

The token is a **local demonstration mechanism**, not a complete authentication or authorization system. Do not put a real token in source control or use this mechanism as production multi-user security.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/books` | List books |
| GET | `/api/books/search?q=...` | Search titles, authors, and categories |
| GET | `/api/library/graph` | Get locations and weighted paths |
| POST | `/api/routes/find` | Calculate a single-destination route and trace |
| POST | `/api/routes/collect` | Calculate a multi-book collection route |
| GET | `/api/library/constraints` | Read constraints with an administrator token |
| POST | `/api/library/constraints` | Replace constraints with an administrator token |

For example:

```json
{
  "start": "ENTRANCE",
  "destination": "SHELF_A1",
  "algorithm": "astar"
}
```

Send this body to `POST /api/routes/find`. Constraint endpoints require an `X-Admin-Token` header matching `SHELFWISE_ADMIN_TOKEN`. See `/docs` for request schemas and response details.

## Testing

Run backend tests from the project root:

```powershell
cd backend
.\.venv-local\Scripts\python.exe -m pytest
```

With both servers running, run the browser suite in a second terminal:

```powershell
cd frontend
npm.cmd run test:e2e
```

The browser tests use Google Chrome and the local sample catalogue. The test that saves administrator constraints is skipped unless it is explicitly run against an isolated test backend with `SHELFWISE_TEST_ADMIN_TOKEN` configured. Do not point that test at a library database whose constraints you need to preserve.

To check a production frontend build:

```powershell
cd frontend
npm.cmd run build
```

## Current scope and persistence

- ShelfWise currently represents **one sample library**. Its locations and paths are defined in `backend/app/graph.py`; there is no interface yet for editing the map or managing the book catalogue.
- Books and saved constraints persist in the configured SQLite file. Selected books, search text, and displayed routes are temporary browser state and reset on refresh.
- Keep a backup of the database file if you need to preserve local data. A deployment must use persistent storage and a backup strategy; a local SQLite file alone does not guarantee that data survives redeployments.
- The administration token does not provide user accounts, per-library roles, or production-grade access control.

## Future expansions

These are **planned ideas**, not features in the current prototype:

1. **Library accounts and roles:** authenticated staff, library administrators, and visitor access.
2. **Multiple library workspaces:** separate catalogues, maps, settings, and permissions for each library.
3. **Catalogue management:** add, edit, import, and update books, shelves, availability, and categories.
4. **Editable library maps:** create locations and weighted paths through an administrator interface instead of editing Python constants.
5. **Multi-floor and accessible navigation:** lifts, stairs, wheelchair-accessible paths, and floor-specific maps.
6. **Persistent hosted data:** a production database such as PostgreSQL, migrations, tested backups, and recovery procedures.
7. **Larger-scale graph handling:** load and cache graphs per library, use map versions to invalidate stale routes, and investigate hierarchical routing if measurements justify it.
8. **Discovery improvements:** richer search, recommendations, and integrations with existing library systems.
9. **Operational improvements:** deployment configuration, monitoring, broader automated testing, and production security.

## Suggested GitHub repository name

`shelfwise-intelligent-library`

---

**ShelfWise** — Find Books. Discover Paths. Collect Smarter.
