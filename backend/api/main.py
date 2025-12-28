from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.db.database import engine, Base
from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wordle Decoded API")

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.api.schemas import APIResponse

# API versioning with v1 router
api_v1_router = APIRouter(prefix="/api/v1")

@api_v1_router.get("/health")
async def health_check():
    """Health check endpoint for API monitoring"""
    return APIResponse(
        status="success",
        data={"healthy": True, "service": "Wordle Decoded API"},
        meta={
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        }
    )

# Include versioned routers
# Include versioned routers
from backend.api.endpoints import words, distributions, analytics, patterns, nyt

api_v1_router.include_router(words.router)
api_v1_router.include_router(distributions.router)
api_v1_router.include_router(analytics.router)
api_v1_router.include_router(patterns.router)
api_v1_router.include_router(nyt.router, prefix="/nyt", tags=["nyt-effect"])
app.include_router(api_v1_router)

# Root endpoint (unversioned for basic info)
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Wordle Decoded API",
        "version": "1.0.0",
        "documentation": "/docs",
        "api_v1": "/api/v1"
    }
