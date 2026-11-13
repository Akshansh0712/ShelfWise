# Deploy ShelfWise on Render (free demo)

This guide deploys the existing React frontend and FastAPI backend as two Render services from the same GitHub repository.

**Free-demo data limitation:** Render's free web service uses an ephemeral filesystem. The SQLite database is reset when the backend restarts, redeploys, or spins down. The sample catalogue is seeded again, but saved constraints can disappear. Do not use this setup for data you need to keep. Render's free service can also take time to wake after inactivity. See [Render's free service documentation](https://render.com/docs/free).

## Before you begin

- Push the deployment changes to the repository's `main` branch.
- Sign in to [Render](https://dashboard.render.com/) and connect the GitHub repository.
- Do not put an administrator token, SQLite database, or other secrets in GitHub.

## 1. Create the backend

On Render, choose **New → Web Service** and select the ShelfWise repository. Configure:

| Setting | Value |
| --- | --- |
| Name | A unique name such as `shelfwise-api` |
| Branch | `main` |
| Root directory | `backend` |
| Language | Python 3 |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance type | Free |

Add an environment variable `PYTHON_VERSION` with value `3.12.10`. Optionally add `SHELFWISE_ADMIN_TOKEN` as a private environment variable if you need the demonstration Administration page. Create the service and wait for a successful deployment. Copy the backend URL, such as `https://example-api.onrender.com`.

Confirm `<backend URL>/api/books` returns sample books. The application documentation is at `<backend URL>/docs`.

## 2. Create the frontend

Choose **New → Static Site** and select the same repository:

| Setting | Value |
| --- | --- |
| Name | A unique name such as `shelfwise-web` |
| Branch | `main` |
| Root directory | `frontend` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Add the frontend environment variable `VITE_API_URL`, with the backend URL from step 1, including `https://` and without a trailing slash. **Do not use localhost.** Vite embeds this value at build time, so changing it requires a frontend rebuild or redeploy.

Create the static site and copy its URL, such as `https://example-web.onrender.com`.

## 3. Connect the frontend and backend

In the backend service's environment settings, add:

```text
SHELFWISE_ALLOWED_ORIGINS=https://example-web.onrender.com
```

Replace the example with the actual frontend URL, with no trailing slash or path. Save the setting and redeploy or restart the backend when prompted. Multiple allowed origins can be supplied as a comma-separated list. Local development origins remain available.

Open the frontend URL and check that the catalogue loads, that a route can be calculated, and that the algorithm trace and collection planner work. If you enabled administration, use the token saved in Render; don't share it publicly.

## Updating later

Commit and push changes to GitHub, then confirm Render builds and deploys the new commit. Code updates and database persistence are separate: this free demo's SQLite changes do not survive reliably. For real library data, use a suitable persistent database or paid persistent disk, configure backups, and add proper authentication and per-library permissions before accepting users.

## Troubleshooting

- **Frontend shows “Failed to fetch”:** verify the backend is live, `VITE_API_URL` contains the public backend URL at frontend build time, and `SHELFWISE_ALLOWED_ORIGINS` exactly matches the frontend origin. Redeploy after changing the relevant variables.
- **Backend deployment fails:** confirm the root directory is `backend`, Python is 3.12, and the start command uses `$PORT`.
- **First request is slow:** a free web service may be waking from inactivity.
- **Saved settings disappeared:** free Render web service storage is temporary; this is expected after restarts or redeployments.
