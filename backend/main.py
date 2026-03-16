"""
Scout AI Backend - FastAPI Application
Provides API endpoints for finding hidden gem players using ML.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Optional
import asyncio
import os
from models import SearchResponse, AttributeSearchResponse

limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])

app = FastAPI(title="Scout AI Hidden Gems API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS for frontend communication
# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    # Change this from the list of localhost URLs to a wildcard "*"
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global ML engine instance (initialized at startup)
ml_engine: Optional[object] = None


@app.on_event("startup")
async def startup_event():
    """
    Initialize ML engine and load data at application startup.
    
    Validates:
    - Requirements 3.1: Load CSV from backend/data/all_fc_24_players.csv
    - Requirements 3.5: Fail with clear error if CSV missing/corrupted
    - Requirements 8.1: Train attribute models at startup
    - Requirements 8.2: Cache attribute models in memory
    """
    global ml_engine
    
    csv_path = "data/all_fc_24_players.csv"
    
    # Verify CSV file exists
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"CSV file not found at {csv_path}. "
            "Please ensure the player data file exists before starting the backend."
        )
    
    # Initialize MLEngine
    from ml_engine import MLEngine
    ml_engine = MLEngine()
    ml_engine.load_data(csv_path)
    ml_engine.train_model()
    
    # Train attribute models for attribute-based search
    ml_engine.train_attribute_models()
    print(f"✓ Attribute models initialized: {len(ml_engine.attribute_models)} categories trained")
    
    print(f"✓ Backend startup complete - ML engine initialized with hidden gems and attribute models")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Scout AI Hidden Gems API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "search": "/search/{player_name}",
            "docs": "/docs"
        },
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend is running."""
    return {"status": "healthy", "service": "Scout AI Backend"}


@app.get("/search/{player_name}", response_model=SearchResponse)
@limiter.limit("10/minute")
async def search_player(request: Request, player_name: str) -> SearchResponse:
    """
    Search for a player and return hidden gem recommendations.
    Rate limited to 10 requests/minute per IP.
    """
    if ml_engine is None:
        raise HTTPException(
            status_code=503,
            detail="ML engine not initialized. Backend may still be starting up."
        )
    
    try:
        result = await asyncio.to_thread(ml_engine.find_hidden_gems, player_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/search/{player_name}/attribute/{attribute_category}", response_model=AttributeSearchResponse)
@limiter.limit("10/minute")
async def search_player_by_attribute(
    request: Request,
    player_name: str,
    attribute_category: str
) -> AttributeSearchResponse:
    """
    Search for players similar in a specific attribute category.
    Rate limited to 10 requests/minute per IP.
    """
    if ml_engine is None:
        raise HTTPException(
            status_code=503,
            detail="ML engine not initialized. Backend may still be starting up."
        )
    
    valid_categories = {'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'}
    if attribute_category.lower() not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid attribute category. Must be one of: {', '.join(sorted(valid_categories))}"
        )
    
    try:
        result = await asyncio.to_thread(
            ml_engine.find_similar_by_attribute,
            player_name,
            attribute_category.lower()
        )
        return result
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        else:
            raise HTTPException(status_code=500, detail=error_msg)


if __name__ == "__main__":
    import uvicorn
    # Grab the port from Railway's environment, fallback to 8000 locally
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
