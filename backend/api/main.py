from fastapi import FastAPI, APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from starlette.middleware.trustedhost import TrustedHostMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from backend.db.database import engine, Base, get_db
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Any, Dict
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wordle Decoded API")

# Handle proxy headers for correct protocol on redirects (Railway uses X-Forwarded-Proto)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# CORS configuration
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://rafiag.github.io")
cors_origins = []
for origin in raw_origins.split(","):
    clean_origin = origin.strip().rstrip("/")
    if "://" in clean_origin:
        proto, rest = clean_origin.split("://")
        domain = rest.split("/")[0]
        cors_origins.append(f"{proto}://{domain}")
    else:
        cors_origins.append(clean_origin)

# Ensure the GitHub Pages origin is included without path
if "https://rafiag.github.io" not in cors_origins:
    cors_origins.append("https://rafiag.github.io")

print(f"DEBUG: Allowing CORS origins: {cors_origins}", flush=True)

# Allow all hosts for Railway
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler to ensure CORS headers on 500s
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal Server Error"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Handle Starlette/FastAPI exceptions like 404s
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

from backend.api.schemas import APIResponse

# API versioning with v1 router
api_v1_router = APIRouter(prefix="/api/v1", redirect_slashes=False)

@api_v1_router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for API monitoring"""
    try:
        # Simple query to verify DB connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = f"error: {str(e)}"
        
    return APIResponse(
        status="success",
        data={
            "healthy": True if "error" not in db_status else False,
            "service": "Wordle Decoded API",
            "database": db_status
        },
        meta={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0"
        }
    )

# Include versioned routers
# Include versioned routers
# Include versioned routers
from backend.api.endpoints import words, distributions, analytics, patterns, nyt, outliers, traps, dashboard

api_v1_router.include_router(words.router)
api_v1_router.include_router(distributions.router)
api_v1_router.include_router(analytics.router)
api_v1_router.include_router(patterns.router)
api_v1_router.include_router(outliers.router)
api_v1_router.include_router(traps.router)
api_v1_router.include_router(dashboard.router)
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
