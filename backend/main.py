"""
Scout AI Backend - FastAPI Application
Provides API endpoints for finding hidden gem players using ML.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from models import SearchResponse, AttributeSearchResponse

app = FastAPI(title="Scout AI Hidden Gems API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
    ],
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
async def search_player(player_name: str) -> SearchResponse:
    """
    Search for a player and return hidden gem recommendations.
    
    Args:
        player_name: Name of the player to search for
        
    Returns:
        SearchResponse with searched player and hidden gems
        
    Validates:
    - Requirements 1.1: Return player info and up to 3 hidden gems
    - Requirements 1.2: Return error for non-existent player
    - Requirements 1.3: Respond within 200ms
    """
    if ml_engine is None:
        raise HTTPException(
            status_code=503,
            detail="ML engine not initialized. Backend may still be starting up."
        )
    
    try:
        result = ml_engine.find_hidden_gems(player_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/search/{player_name}/attribute/{attribute_category}", response_model=AttributeSearchResponse)
async def search_player_by_attribute(
    player_name: str,
    attribute_category: str
) -> AttributeSearchResponse:
    """
    Search for players similar in a specific attribute category.
    
    Args:
        player_name: Name of the player to search for
        attribute_category: One of pace/shooting/passing/dribbling/defending/physical
        
    Returns:
        AttributeSearchResponse with searched player and 3 similar players
        
    Raises:
        HTTPException 400: Invalid attribute category
        HTTPException 404: Player not found
        HTTPException 503: ML engine not initialized
        
    Validates:
    - Requirements 4.1: GET endpoint at /search/{player_name}/attribute/{attribute_category}
    - Requirements 4.2: Return AttributeSearchResponse with searched player and 3 similar players
    - Requirements 4.3: Validate attribute_category is valid
    - Requirements 4.4: Return HTTP 400 for invalid category
    - Requirements 9.3: Return HTTP 500 with descriptive message for backend errors
    """
    if ml_engine is None:
        raise HTTPException(
            status_code=503,
            detail="ML engine not initialized. Backend may still be starting up."
        )
    
    # Validate attribute category
    valid_categories = {'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'}
    if attribute_category.lower() not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid attribute category. Must be one of: {', '.join(sorted(valid_categories))}"
        )
    
    try:
        result = ml_engine.find_similar_by_attribute(
            player_name, 
            attribute_category.lower()
        )
        return result
    except ValueError as e:
        # Check if it's a player not found error or other ValueError
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        else:
            # Other ValueErrors are treated as server errors
            raise HTTPException(status_code=500, detail=error_msg)


if __name__ == "__main__":
    import uvicorn
    # Grab the port from Railway's environment, fallback to 8000 locally
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
