from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import ocean, species, biodiversity, fisheries, molecular, analytics, query

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Driven Unified Data Platform for Oceanographic, Fisheries and Molecular Biodiversity Insights",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocean.router, prefix=settings.API_V1_STR)
app.include_router(species.router, prefix=settings.API_V1_STR)
app.include_router(biodiversity.router, prefix=settings.API_V1_STR)
app.include_router(fisheries.router, prefix=settings.API_V1_STR)
app.include_router(molecular.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(query.router, prefix=settings.API_V1_STR)

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
