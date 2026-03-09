# Design Document: Attribute-Based KNN Player Search

## Overview

This design extends the Scout AI application with attribute-specific player similarity search capabilities. The feature enables users to search for players similar to a target player based on specific attribute categories (Pace, Shooting, Passing, Dribbling, Defending, Physical) rather than overall statistical similarity.

The implementation leverages K-Nearest Neighbors (KNN) algorithm with category-specific feature sets, allowing scouts to identify specialists in particular playing styles. Unlike the existing hidden gems search which filters for lower-rated players, attribute search returns the most similar players regardless of rating, providing a pure similarity-based recommendation system.

### Key Design Decisions

1. **Separate KNN Models per Attribute**: Each attribute category uses a dedicated KNN model trained on its specific sub-attributes, enabling faster queries and more focused similarity matching.

2. **No Rating Filter**: Attribute search returns similar players regardless of overall rating, distinguishing it from hidden gems search and providing broader discovery capabilities.

3. **Multi-Attribute Granularity**: Each category uses multiple sub-attributes (e.g., Pace uses Acceleration and Sprint_Speed) for more nuanced similarity matching than single-value comparison.

4. **Model Caching**: All six attribute models are trained at startup and cached in memory, eliminating per-request training overhead.

5. **Euclidean Distance**: Unlike the cosine similarity used in hidden gems search, attribute search uses Euclidean distance as it's more appropriate for comparing magnitude differences in specific skill dimensions.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Search Results Page                                  │  │
│  │  - Attribute Category Selector (6 buttons)           │  │
│  │  - Attribute Search Results Display                  │  │
│  │  - Focused Radar Chart Visualization                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Client (lib/api.ts)                             │  │
│  │  - searchPlayerByAttribute(name, category)           │  │
│  │  - Result caching per player+category                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP GET
                            │ /search/{player_name}/attribute/{category}
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoint                                         │  │
│  │  GET /search/{player_name}/attribute/{category}      │  │
│  │  - Validates category parameter                      │  │
│  │  - Returns AttributeSearchResponse                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MLEngine (ml_engine.py)                             │  │
│  │  - attribute_models: Dict[str, NearestNeighbors]     │  │
│  │  - attribute_features: Dict[str, List[str]]          │  │
│  │  - find_similar_by_attribute(name, category)         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Models (models.py)                             │  │
│  │  - AttributeSearchResponse                           │  │
│  │  - Player (extended with sub-attributes)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Load at startup
                            ▼
                  ┌──────────────────────┐
                  │  FC 24 Player Data   │
                  │  (CSV with 50+ cols) │
                  └──────────────────────┘
```

### Data Flow

1. **Startup**: Backend loads CSV, trains 6 KNN models (one per attribute category), caches in memory
2. **User Search**: User searches for player, views results
3. **Attribute Selection**: User clicks attribute category button (e.g., "Shooting")
4. **API Request**: Frontend calls `/search/{player_name}/attribute/shooting`
5. **KNN Query**: Backend uses cached shooting model to find 4 nearest neighbors
6. **Filtering**: Exclude searched player, return top 3 similar players
7. **Visualization**: Frontend displays focused radar chart with shooting sub-attributes

## Components and Interfaces

### Backend Components

#### 1. MLEngine Extension (ml_engine.py)

**New Attributes:**
```python
class MLEngine:
    # Existing attributes
    self.df: Optional[pd.DataFrame]
    self.model: Optional[NearestNeighbors]  # Hidden gems model
    self.feature_columns: List[str]
    
    # New attributes for attribute search
    self.attribute_models: Dict[str, NearestNeighbors]
    self.attribute_features: Dict[str, List[str]]
```

**Attribute Feature Mapping:**
```python
self.attribute_features = {
    'pace': ['Acceleration', 'Sprint Speed'],
    'shooting': ['Positioning', 'Finishing', 'Shot Power', 'Long Shots', 'Volleys', 'Penalties'],
    'passing': ['Vision', 'Crossing', 'Free Kick Accuracy', 'Short Passing', 'Long Passing', 'Curve'],
    'dribbling': ['Agility', 'Balance', 'Reactions', 'Ball Control', 'Dribbling', 'Composure'],
    'defending': ['Interceptions', 'Heading Accuracy', 'Def Awareness', 'Standing Tackle', 'Sliding Tackle'],
    'physical': ['Jumping', 'Stamina', 'Strength', 'Aggression']
}
```

**New Methods:**

```python
def train_attribute_models(self) -> None:
    """
    Train separate KNN models for each attribute category.
    Called during startup after train_model().
    
    For each category:
    - Extract sub-attribute features
    - Create NearestNeighbors with k=4, metric='euclidean'
    - Fit on feature subset
    - Store in attribute_models dict
    
    Validates: Requirements 8.1, 8.2
    """

def find_similar_by_attribute(
    self, 
    player_name: str, 
    attribute_category: str
) -> AttributeSearchResponse:
    """
    Find top 3 players similar in specific attribute category.
    
    Args:
        player_name: Name of player to search for
        attribute_category: One of pace/shooting/passing/dribbling/defending/physical
        
    Returns:
        AttributeSearchResponse with searched player and 3 similar players
        
    Raises:
        ValueError: If player not found or invalid category
        
    Process:
    1. Validate attribute_category
    2. Find player (case-insensitive)
    3. Get attribute model and features for category
    4. Extract player's attribute values
    5. Query KNN for 4 neighbors (k=4)
    6. Exclude searched player (first result)
    7. Return top 3 as similar_players
    
    Validates: Requirements 2.1-2.5, 3.1-3.6, 7.1
    """
```

#### 2. Data Models Extension (models.py)

**New Model:**
```python
class AttributeSearchResponse(BaseModel):
    """
    Response model for attribute-based search.
    
    Contains the searched player, similar players based on attribute,
    and the attribute category used for search.
    """
    searched_player: Player
    similar_players: List[Player]  # 0-3 players
    attribute_category: str  # pace/shooting/passing/dribbling/defending/physical
    
    @field_validator('similar_players')
    @classmethod
    def validate_similar_players_count(cls, v: List[Player]) -> List[Player]:
        """Ensure 0-3 similar players."""
        if len(v) > 3:
            raise ValueError("similar_players must contain at most 3 players")
        return v
    
    @field_validator('attribute_category')
    @classmethod
    def validate_attribute_category(cls, v: str) -> str:
        """Ensure valid attribute category."""
        valid_categories = {'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'}
        if v not in valid_categories:
            raise ValueError(f"attribute_category must be one of {valid_categories}")
        return v
```

**Player Model Extension:**
The existing Player model already contains the six main stats (PAC, SHO, PAS, DRI, DEF, PHY). For attribute search visualization, we'll need to include sub-attributes in the response. We'll extend the Player model:

```python
class DetailedPlayerStats(BaseModel):
    """Extended player statistics including sub-attributes."""
    # Main stats (existing)
    PAC: int
    SHO: int
    PAS: int
    DRI: int
    DEF: int
    PHY: int
    
    # Sub-attributes for detailed comparison
    Acceleration: Optional[int] = None
    Sprint_Speed: Optional[int] = None
    Positioning: Optional[int] = None
    Finishing: Optional[int] = None
    Shot_Power: Optional[int] = None
    Long_Shots: Optional[int] = None
    Volleys: Optional[int] = None
    Penalties: Optional[int] = None
    Vision: Optional[int] = None
    Crossing: Optional[int] = None
    Free_Kick_Accuracy: Optional[int] = None
    Short_Passing: Optional[int] = None
    Long_Passing: Optional[int] = None
    Curve: Optional[int] = None
    Agility: Optional[int] = None
    Balance: Optional[int] = None
    Reactions: Optional[int] = None
    Ball_Control: Optional[int] = None
    Dribbling: Optional[int] = None
    Composure: Optional[int] = None
    Interceptions: Optional[int] = None
    Heading_Accuracy: Optional[int] = None
    Def_Awareness: Optional[int] = None
    Standing_Tackle: Optional[int] = None
    Sliding_Tackle: Optional[int] = None
    Jumping: Optional[int] = None
    Stamina: Optional[int] = None
    Strength: Optional[int] = None
    Aggression: Optional[int] = None

class Player(BaseModel):
    """Player model with optional detailed stats."""
    name: str
    club: str
    nation: str
    position: str
    overall: int
    stats: PlayerStats  # Basic stats for backward compatibility
    detailed_stats: Optional[DetailedPlayerStats] = None  # For attribute search
```

#### 3. API Endpoint (main.py)

**New Endpoint:**
```python
@app.get(
    "/search/{player_name}/attribute/{attribute_category}",
    response_model=AttributeSearchResponse
)
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
        
    Validates: Requirements 4.1-4.5
    """
    if ml_engine is None:
        raise HTTPException(
            status_code=503,
            detail="ML engine not initialized"
        )
    
    # Validate attribute category
    valid_categories = {'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'}
    if attribute_category.lower() not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid attribute category. Must be one of: {', '.join(valid_categories)}"
        )
    
    try:
        result = ml_engine.find_similar_by_attribute(
            player_name, 
            attribute_category.lower()
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

**Startup Modification:**
```python
@app.on_event("startup")
async def startup_event():
    """Initialize ML engine with both hidden gems and attribute models."""
    global ml_engine
    
    csv_path = "data/all_fc_24_players.csv"
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found at {csv_path}")
    
    from ml_engine import MLEngine
    ml_engine = MLEngine()
    ml_engine.load_data(csv_path)
    ml_engine.train_model()  # Hidden gems model
    ml_engine.train_attribute_models()  # New: Attribute models
    
    print(f"✓ Backend startup complete - ML engine initialized with hidden gems and attribute models")
```

### Frontend Components

#### 1. API Client Extension (lib/api.ts)

**New Function:**
```typescript
export interface AttributeSearchResponse {
  searched_player: Player;
  similar_players: Player[];
  attribute_category: string;
}

/**
 * Search for players similar in a specific attribute category.
 * 
 * @param playerName - The name of the player to search for
 * @param attributeCategory - One of: pace, shooting, passing, dribbling, defending, physical
 * @returns Promise<AttributeSearchResponse>
 * @throws APIError - If request fails or invalid category
 * 
 * Validates: Requirements 4.1, 4.4, 9.1
 */
export async function searchPlayerByAttribute(
  playerName: string,
  attributeCategory: string
): Promise<AttributeSearchResponse> {
  try {
    const encodedName = encodeURIComponent(playerName);
    const response = await apiClient.get<AttributeSearchResponse>(
      `/search/${encodedName}/attribute/${attributeCategory}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        throw new APIError('Request timed out. Please try again.');
      }
      
      if (!axiosError.response) {
        throw new APIError('Unable to connect to the server.');
      }
      
      const statusCode = axiosError.response.status;
      const errorMessage = axiosError.response.data as any;
      
      if (statusCode === 400) {
        throw new APIError(
          errorMessage?.detail || 'Invalid attribute category.',
          400,
          error
        );
      }
      
      if (statusCode === 404) {
        throw new APIError(
          errorMessage?.detail || `Player "${playerName}" not found.`,
          404,
          error
        );
      }
      
      throw new APIError(
        errorMessage?.detail || 'An unexpected error occurred.',
        statusCode,
        error
      );
    }
    
    throw new APIError('An unexpected error occurred.', undefined, error as Error);
  }
}
```

#### 2. Attribute Selector Component

**New Component: components/AttributeSelector.tsx**
```typescript
interface AttributeSelectorProps {
  selectedAttribute: string | null;
  onAttributeSelect: (attribute: string) => void;
  disabled?: boolean;
}

/**
 * Displays six attribute category buttons for selection.
 * 
 * Validates: Requirements 1.1, 1.3, 1.5
 */
export function AttributeSelector({
  selectedAttribute,
  onAttributeSelect,
  disabled = false
}: AttributeSelectorProps) {
  const attributes = [
    { id: 'pace', label: 'Pace', icon: '⚡' },
    { id: 'shooting', label: 'Shooting', icon: '🎯' },
    { id: 'passing', label: 'Passing', icon: '🎯' },
    { id: 'dribbling', label: 'Dribbling', icon: '⚽' },
    { id: 'defending', label: 'Defending', icon: '🛡️' },
    { id: 'physical', label: 'Physical', icon: '💪' }
  ];
  
  return (
    <div className="attribute-selector">
      <h3>Search by Attribute</h3>
      <div className="attribute-buttons">
        {attributes.map(attr => (
          <button
            key={attr.id}
            onClick={() => onAttributeSelect(attr.id)}
            disabled={disabled}
            className={selectedAttribute === attr.id ? 'selected' : ''}
          >
            <span className="icon">{attr.icon}</span>
            <span className="label">{attr.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### 3. Search Results Page Extension

**Modified: app/page.tsx**

Add state management for attribute search:
```typescript
const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
const [attributeResults, setAttributeResults] = useState<AttributeSearchResponse | null>(null);
const [attributeLoading, setAttributeLoading] = useState(false);
const [attributeCache, setAttributeCache] = useState<Map<string, AttributeSearchResponse>>(new Map());
```

Add attribute selection handler:
```typescript
const handleAttributeSelect = async (attribute: string) => {
  if (!searchResults) return;
  
  setSelectedAttribute(attribute);
  
  // Check cache first
  const cacheKey = `${searchResults.searched_player.name}-${attribute}`;
  if (attributeCache.has(cacheKey)) {
    setAttributeResults(attributeCache.get(cacheKey)!);
    return;
  }
  
  // Fetch from API
  setAttributeLoading(true);
  try {
    const results = await searchPlayerByAttribute(
      searchResults.searched_player.name,
      attribute
    );
    setAttributeResults(results);
    
    // Cache results
    setAttributeCache(prev => new Map(prev).set(cacheKey, results));
  } catch (error) {
    // Handle error
  } finally {
    setAttributeLoading(false);
  }
};
```

#### 4. Focused Radar Chart Component

**New Component: components/AttributeRadarChart.tsx**
```typescript
interface AttributeRadarChartProps {
  searchedPlayer: Player;
  similarPlayers: Player[];
  attributeCategory: string;
}

/**
 * Displays radar chart focused on selected attribute's sub-attributes.
 * 
 * Validates: Requirements 5.1, 5.2, 5.5
 */
export function AttributeRadarChart({
  searchedPlayer,
  similarPlayers,
  attributeCategory
}: AttributeRadarChartProps) {
  // Map attribute category to sub-attributes
  const attributeMapping = {
    pace: ['Acceleration', 'Sprint_Speed'],
    shooting: ['Positioning', 'Finishing', 'Shot_Power', 'Long_Shots', 'Volleys', 'Penalties'],
    passing: ['Vision', 'Crossing', 'Free_Kick_Accuracy', 'Short_Passing', 'Long_Passing', 'Curve'],
    dribbling: ['Agility', 'Balance', 'Reactions', 'Ball_Control', 'Dribbling', 'Composure'],
    defending: ['Interceptions', 'Heading_Accuracy', 'Def_Awareness', 'Standing_Tackle', 'Sliding_Tackle'],
    physical: ['Jumping', 'Stamina', 'Strength', 'Aggression']
  };
  
  const subAttributes = attributeMapping[attributeCategory];
  
  // Build chart data with highlighted attribute category
  // Use distinct colors for attribute search vs hidden gems
  // Display numeric values alongside chart
}
```

## Data Models

### Attribute Feature Sets

Each attribute category maps to specific sub-attributes from the FC 24 dataset:

| Category | Sub-Attributes | Count |
|----------|---------------|-------|
| Pace | Acceleration, Sprint Speed | 2 |
| Shooting | Positioning, Finishing, Shot Power, Long Shots, Volleys, Penalties | 6 |
| Passing | Vision, Crossing, Free Kick Accuracy, Short Passing, Long Passing, Curve | 6 |
| Dribbling | Agility, Balance, Reactions, Ball Control, Dribbling, Composure | 6 |
| Defending | Interceptions, Heading Accuracy, Def Awareness, Standing Tackle, Sliding Tackle | 5 |
| Physical | Jumping, Stamina, Strength, Aggression | 4 |

### Data Validation and Cleaning

**Null Value Handling:**
- During data loading, fill null values in all sub-attribute columns with column mean
- Ensures all players have complete attribute data for KNN
- Validates: Requirements 6.4

**Data Type Enforcement:**
- All sub-attributes must be numeric (int or float)
- Convert to int for API responses
- Validates: Requirements 6.3

### Database Schema

No database changes required. All data loaded from existing CSV file with additional columns:
- Existing: name, club, nation, position, overall, PAC, SHO, PAS, DRI, DEF, PHY
- Used for attribute search: All 29 sub-attribute columns listed above


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Requirements 7.2 and 2.1 both test that the system returns the 3 most similar players - 7.2 is redundant
- Requirements 7.3 and 7.1 both test that no rating filter is applied - 7.3 is redundant
- Requirements 7.4 and 5.3 both test visual distinction between result types - 7.4 is redundant

The following properties provide unique validation value:

### Property 1: Attribute-Specific Feature Usage

*For any* attribute category selection, the KNN search should use only the sub-attributes associated with that category and no other features.

**Validates: Requirements 1.2, 3.1-3.6**

### Property 2: Frontend Attribute Switching Without Re-search

*For any* player search result, switching between attribute categories should not trigger a new player search, only attribute-specific searches.

**Validates: Requirements 1.3**

### Property 3: Similar Players Exclusion

*For any* player and attribute category, the searched player should never appear in the similar_players list of the response.

**Validates: Requirements 2.4**

### Property 4: Similarity Distance Ordering

*For any* attribute search response with multiple similar players, the players should be ordered by increasing similarity distance (most similar first).

**Validates: Requirements 2.5**

### Property 5: Valid Response Structure

*For any* valid player name and attribute category, the backend should return an AttributeSearchResponse with the correct structure containing searched_player, similar_players (0-3 players), and the requested attribute_category.

**Validates: Requirements 4.2**

### Property 6: Invalid Category Rejection

*For any* invalid attribute category (not in {pace, shooting, passing, dribbling, defending, physical}), the backend should return HTTP 400 with an error message.

**Validates: Requirements 4.3, 4.4**

### Property 7: Similar Players Count Validation

*For any* attribute search response, the similar_players list should contain between 0 and 3 players (inclusive).

**Validates: Requirements 6.2**

### Property 8: Non-Null Sub-Attributes

*For any* player included in KNN computation, all sub-attribute values for the selected category should be non-null numeric values.

**Validates: Requirements 6.3**

### Property 9: Null Value Imputation

*For any* sub-attribute column in the loaded dataset, after data loading, there should be no null values (all filled with column mean).

**Validates: Requirements 6.4**

### Property 10: Response Category Match

*For any* attribute search request with category X, the returned AttributeSearchResponse should have attribute_category field equal to X.

**Validates: Requirements 6.5**

### Property 11: No Rating Filter Applied

*For any* attribute search result, the similar_players list may contain players with overall ratings higher than, equal to, or lower than the searched player's rating.

**Validates: Requirements 7.1, 7.3**

### Property 12: Model Reuse Across Requests

*For any* two consecutive attribute search requests for the same attribute category, the same cached KNN model instance should be used (no retraining).

**Validates: Requirements 8.2**

### Property 13: Frontend Result Caching

*For any* player and attribute category combination, if the same search is performed twice, the second request should use cached results without making an API call.

**Validates: Requirements 8.3**

### Property 14: Error Response Format

*For any* backend error during attribute search, the system should return HTTP 500 with a descriptive error message in the response body.

**Validates: Requirements 9.3**

### Property 15: Backward Compatibility Preservation

*For any* player search without attribute selection, the system should return hidden gems results using the original search functionality unchanged.

**Validates: Requirements 10.5**

## Error Handling

### Backend Error Scenarios

1. **Player Not Found**
   - Trigger: Player name doesn't exist in dataset
   - Response: HTTP 404 with message "Player '{name}' not found"
   - Validates: Requirements 9.1

2. **Invalid Attribute Category**
   - Trigger: attribute_category not in valid set
   - Response: HTTP 400 with message listing valid categories
   - Validates: Requirements 4.3, 4.4

3. **ML Engine Not Initialized**
   - Trigger: Request before startup complete
   - Response: HTTP 503 with message "ML engine not initialized"
   - Validates: Requirements 4.2

4. **Incomplete Attribute Data**
   - Trigger: Player has null values in required sub-attributes after imputation
   - Behavior: Exclude player from results, log warning
   - Validates: Requirements 9.5

5. **Insufficient Similar Players**
   - Trigger: Dataset has fewer than 4 total players
   - Behavior: Return all available similar players (0-3)
   - Validates: Requirements 9.2

6. **CSV Loading Failure**
   - Trigger: CSV file missing or corrupted
   - Response: Startup failure with clear error message
   - Validates: Existing requirement from hidden gems

### Frontend Error Scenarios

1. **API Request Timeout**
   - Trigger: Backend doesn't respond within 5 seconds
   - Display: "Request timed out. Please try again."
   - Validates: Existing error handling

2. **Network Unavailable**
   - Trigger: Cannot connect to backend
   - Display: "Unable to connect to the server. Please check your connection."
   - Validates: Existing error handling

3. **Player Not Found**
   - Trigger: HTTP 404 from backend
   - Display: Same error message as standard search
   - Validates: Requirements 9.1

4. **Invalid Category**
   - Trigger: HTTP 400 from backend
   - Display: Error message from backend response
   - Validates: Requirements 4.4

5. **Loading State**
   - Trigger: Attribute search in progress
   - Display: Loading indicator specific to selected attribute
   - Validates: Requirements 9.4

### Error Recovery Strategies

1. **Graceful Degradation**: If attribute search fails, user can still view hidden gems results
2. **Retry Mechanism**: Frontend allows user to retry failed attribute searches
3. **Clear Feedback**: All errors display user-friendly messages with actionable guidance
4. **State Preservation**: Errors don't clear existing search results or selections

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of attribute category mappings (Requirements 3.1-3.6)
- UI component rendering with specific props
- API endpoint existence and configuration
- Error message formatting
- Edge cases (empty datasets, single player, etc.)

**Property-Based Tests** focus on:
- Universal properties across all attribute categories and players
- Input validation across wide range of valid/invalid inputs
- Algorithm correctness (ordering, exclusion, filtering)
- Data integrity (null handling, type validation)
- Caching behavior across multiple requests

### Property-Based Testing Configuration

**Library Selection:**
- Backend: `hypothesis` (Python property-based testing library)
- Frontend: `fast-check` (TypeScript property-based testing library)

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: attribute-based-knn-search, Property {number}: {property_text}`
- Random seed logging for reproducibility

### Backend Property Tests

**Test File: backend/test_attribute_search_properties.py**

```python
from hypothesis import given, strategies as st
import hypothesis

# Configure hypothesis
hypothesis.settings.register_profile("ci", max_examples=100)
hypothesis.settings.load_profile("ci")

# Property 1: Attribute-Specific Feature Usage
@given(
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_attribute_specific_features(attribute_category):
    """
    Feature: attribute-based-knn-search, Property 1: 
    For any attribute category, KNN uses only associated sub-attributes
    """
    # Test implementation

# Property 3: Similar Players Exclusion
@given(
    player_name=st.sampled_from(get_all_player_names()),
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_searched_player_excluded(player_name, attribute_category):
    """
    Feature: attribute-based-knn-search, Property 3:
    Searched player never appears in similar_players list
    """
    # Test implementation

# Property 4: Similarity Distance Ordering
@given(
    player_name=st.sampled_from(get_all_player_names()),
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_similarity_ordering(player_name, attribute_category):
    """
    Feature: attribute-based-knn-search, Property 4:
    Similar players ordered by increasing distance
    """
    # Test implementation

# Property 6: Invalid Category Rejection
@given(
    invalid_category=st.text().filter(
        lambda x: x not in ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical']
    )
)
def test_invalid_category_rejected(invalid_category):
    """
    Feature: attribute-based-knn-search, Property 6:
    Invalid categories return HTTP 400
    """
    # Test implementation

# Property 9: Null Value Imputation
def test_no_nulls_after_loading():
    """
    Feature: attribute-based-knn-search, Property 9:
    All sub-attributes have no null values after loading
    """
    # Test implementation

# Property 11: No Rating Filter Applied
@given(
    player_name=st.sampled_from(get_all_player_names()),
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_no_rating_filter(player_name, attribute_category):
    """
    Feature: attribute-based-knn-search, Property 11:
    Similar players can have any rating relative to searched player
    """
    # Test implementation
```

### Frontend Property Tests

**Test File: frontend/lib/__tests__/attribute-search.property.test.ts**

```typescript
import fc from 'fast-check';

// Property 2: Frontend Attribute Switching Without Re-search
test('Property 2: Switching attributes does not trigger player re-search', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'),
      fc.constantFrom('pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'),
      (attr1, attr2) => {
        // Feature: attribute-based-knn-search, Property 2
        // Test that switching from attr1 to attr2 doesn't re-search player
      }
    ),
    { numRuns: 100 }
  );
});

// Property 13: Frontend Result Caching
test('Property 13: Repeated searches use cached results', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }),
      fc.constantFrom('pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'),
      (playerName, attribute) => {
        // Feature: attribute-based-knn-search, Property 13
        // Test that second search doesn't make API call
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Coverage

**Backend Unit Tests (backend/test_attribute_search.py):**
- Attribute feature mapping for each category (Requirements 3.1-3.6)
- API endpoint registration and path parameters
- KNN model configuration (k=4, metric='euclidean')
- Response model validation
- Error message formatting
- Edge cases: empty dataset, single player, duplicate players

**Frontend Unit Tests (frontend/components/__tests__/):**
- AttributeSelector component rendering
- Attribute button click handlers
- AttributeRadarChart with specific data
- Loading indicator display
- Error message display
- CSS class application for styling

### Integration Tests

**End-to-End Flow:**
1. User searches for player
2. Hidden gems results displayed
3. User clicks "Shooting" attribute
4. Attribute search API called
5. Results displayed with focused radar chart
6. User switches to "Pace" attribute
7. Cached or new results displayed
8. User returns to hidden gems view

**Performance Tests:**
- Attribute search response time < 200ms (Requirements 4.5)
- Cached attribute switch < 100ms (Requirements 8.5)
- Startup time with 6 models < 5 seconds

### Test Data Strategy

**Backend:**
- Use actual FC 24 CSV data for integration tests
- Generate synthetic player data for property tests
- Include edge cases: minimum stats (0), maximum stats (99), null values

**Frontend:**
- Mock API responses with realistic player data
- Test with 0, 1, 2, 3 similar players
- Test with all six attribute categories

### Continuous Integration

- Run all unit tests on every commit
- Run property tests (100 iterations) on every PR
- Run integration tests before merge
- Performance tests run nightly
- Fail build if any test fails or coverage drops below 80%

