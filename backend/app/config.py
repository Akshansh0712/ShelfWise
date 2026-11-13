import os

LOCAL_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")


def allowed_origins():
    """Allow explicitly configured frontend origins alongside local development."""
    configured = os.getenv("SHELFWISE_ALLOWED_ORIGINS", "")
    return list(dict.fromkeys([
        *LOCAL_ORIGINS,
        *(origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()),
    ]))
