from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.routes import ocean, species, biodiversity, fisheries, molecular, analytics, query, datasets
import time
from collections import defaultdict

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Driven Unified Data Platform for Oceanographic, Fisheries and Molecular Biodiversity Insights",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory rate limiter (no extra deps) ────────────────────────────────────
# Stores {ip: [timestamp, ...]} for a sliding window
_rate_store: dict[str, list[float]] = defaultdict(list)

RATE_LIMITS = {
    "/api/query": {"requests": 10, "window_s": 60},   # 10 query/min per IP
    "default":    {"requests": 120, "window_s": 60},  # 120 req/min for all other routes
}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    now = time.time()

    # Pick limit config
    if path.startswith("/api/query"):
        cfg = RATE_LIMITS["/api/query"]
    else:
        cfg = RATE_LIMITS["default"]

    window = cfg["window_s"]
    max_req = cfg["requests"]
    key = f"{client_ip}:{path}"

    # Prune old timestamps outside the sliding window
    _rate_store[key] = [t for t in _rate_store[key] if now - t < window]

    if len(_rate_store[key]) >= max_req:
        retry_after = int(window - (now - _rate_store[key][0]))
        return JSONResponse(
            status_code=429,
            content={"detail": f"Rate limit exceeded. Try again in {retry_after}s."},
            headers={"Retry-After": str(retry_after), "X-RateLimit-Limit": str(max_req)},
        )

    _rate_store[key].append(now)
    response = await call_next(request)

    # Expose rate limit headers on every response
    remaining = max(0, max_req - len(_rate_store[key]))
    response.headers["X-RateLimit-Limit"]     = str(max_req)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Window"]    = f"{window}s"
    return response
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(ocean.router,        prefix=settings.API_V1_STR)
app.include_router(species.router,      prefix=settings.API_V1_STR)
app.include_router(biodiversity.router, prefix=settings.API_V1_STR)
app.include_router(fisheries.router,    prefix=settings.API_V1_STR)
app.include_router(molecular.router,    prefix=settings.API_V1_STR)
app.include_router(analytics.router,    prefix=settings.API_V1_STR)
app.include_router(query.router,        prefix=settings.API_V1_STR)
app.include_router(datasets.router,     prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to Unified Marine Intelligence API",
        "docs": "/docs",
        "health": "/health"
    }
