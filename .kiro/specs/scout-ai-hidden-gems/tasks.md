# Implementation Plan: Scout AI Hidden Gems

## Overview

This implementation plan breaks down the Scout AI Hidden Gems feature into actionable coding tasks. The system consists of a FastAPI backend with ML capabilities (Python) and a Next.js 14 frontend (TypeScript) with a cyberpunk dark theme. The backend uses K-Nearest Neighbors to find similar players from FC 24 data, while the frontend provides an intuitive search interface with radar chart visualizations.

## Tasks

- [x] 1. Set up backend project structure and dependencies
  - Create backend/ directory with main.py and ml_engine.py
  - Create requirements.txt with FastAPI, pandas, scikit-learn, uvicorn dependencies
  - Set up Python virtual environment
  - Verify backend/data/all_fc_24_players.csv exists
  - _Requirements: 3.1, 3.5_

- [x] 2. Implement data loading and ML engine core
  - [x] 2.1 Create MLEngine class with data loading functionality
    - Implement load_data() method to read CSV using pandas
    - Implement null value imputation with column mean for Player_Stats
    - Select feature columns: PAC, SHO, PAS, DRI, DEF, PHY
    - Store cleaned DataFrame in instance variable
    - Handle duplicate player names (keep first occurrence)
    - _Requirements: 3.1, 3.2, 8.3_
  
  - [x] 2.2 Write property test for data loading
    - **Property 8: Null Value Imputation**
    - **Validates: Requirements 3.2**
    - Test that all null values in Player_Stats columns are replaced with column mean
  
  - [x] 2.3 Implement KNN model training
    - Create train_model() method in MLEngine class
    - Initialize NearestNeighbors with n_neighbors=20, metric='cosine'
    - Fit model on feature columns from DataFrame
    - Store trained model in instance variable
    - _Requirements: 8.1, 8.2, 8.3, 3.3_
  
  - [x] 2.4 Write property test for model training
    - **Property 15: Deterministic Search Results**
    - **Validates: Requirements 8.5**
    - Test that same player name produces identical results across multiple searches

- [x] 3. Implement hidden gem discovery algorithm
  - [x] 3.1 Create find_hidden_gems() method
    - Implement case-insensitive player name lookup in DataFrame
    - Raise ValueError if player not found
    - Extract player's feature vector and overall rating
    - Use KNN model to find 20 nearest neighbors
    - Exclude the searched player from results (skip first neighbor)
    - _Requirements: 1.1, 1.2, 1.5, 2.4, 8.4_
  
  - [x] 3.2 Implement hidden gem filtering and ranking
    - Filter neighbors to keep only players with overall < searched player's overall
    - Sort filtered players by similarity distance (ascending)
    - Return top 3 from sorted list
    - Handle case where fewer than 3 lower-rated players exist
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [x] 3.3 Implement _build_player_object() helper method
    - Convert DataFrame row to player dictionary
    - Extract name, club, nation, position, overall fields
    - Build stats dictionary with PAC, SHO, PAS, DRI, DEF, PHY
    - Ensure all numeric values are properly typed as integers
    - _Requirements: 5.3, 7.3, 7.5_
  
  - [x] 3.4 Write property tests for hidden gem discovery
    - **Property 1: Hidden Gems Always Lower Rated**
    - **Validates: Requirements 2.1**
    - Test that all hidden gems have overall < searched player's overall
    - **Property 2: Bounded Hidden Gem Count**
    - **Validates: Requirements 2.2, 2.3**
    - Test that result count is always 0-3
    - **Property 3: Hidden Gems from K-Nearest Neighbors**
    - **Validates: Requirements 2.4**
    - Test that all hidden gems are from the 20 nearest neighbors
    - **Property 4: Hidden Gems Ordered by Similarity**
    - **Validates: Requirements 2.5**
    - Test that hidden gems are ordered by similarity distance
    - **Property 6: Case-Insensitive Player Matching**
    - **Validates: Requirements 1.5**
    - Test that different case variations return same results
    - **Property 7: Non-Existent Player Error Handling**
    - **Validates: Requirements 1.2**
    - Test that non-existent players raise ValueError
    - **Property 14: Searched Player Exclusion**
    - **Validates: Requirements 8.4**
    - Test that searched player never appears in hidden_gems list

- [x] 4. Add Pydantic data models for API validation (optional enhancement)
  - [x] 4.1 Define PlayerStats and Player Pydantic models
    - Create PlayerStats model with PAC, SHO, PAS, DRI, DEF, PHY fields (int)
    - Create Player model with name, club, nation, position, overall, stats fields
    - Add validation: stats values 0-99, player name non-empty
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 4.2 Define SearchResponse Pydantic model
    - Create SearchResponse with searched_player and hidden_gems fields
    - Ensure hidden_gems is List[Player] type
    - _Requirements: 6.3, 7.4_
  
  - [x] 4.3 Update find_hidden_gems() to return Pydantic models
    - Modify _build_player_object() to return Player model instances
    - Update find_hidden_gems() return type to SearchResponse
    - _Requirements: 5.3, 7.3_
  
  - [x] 4.4 Write property tests for data models
    - **Property 5: Response Structure Completeness**
    - **Validates: Requirements 5.3, 6.3, 7.3, 7.4, 7.5**
    - Test that all responses have required fields with correct types
    - **Property 12: Stat Value Validation**
    - **Validates: Requirements 7.1**
    - Test that all stat values are integers between 0-99
    - **Property 13: Player Name Validation**
    - **Validates: Requirements 7.2**
    - Test that player names are non-empty strings

- [x] 5. Implement FastAPI application and endpoints
  - [x] 5.1 Create FastAPI app with CORS configuration
    - Initialize FastAPI app instance
    - Add CORSMiddleware allowing localhost:3000 origin
    - Create global ml_engine variable
    - _Requirements: 6.1_
  
  - [x] 5.2 Implement startup event handler
    - Create @app.on_event("startup") function
    - Initialize MLEngine instance
    - Call load_data() with CSV path
    - Call train_model()
    - Add error handling for missing CSV file
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  
  - [x] 5.3 Implement /search/{player_name} endpoint
    - Create GET endpoint accepting player_name path parameter
    - Call ml_engine.find_hidden_gems(player_name)
    - Return SearchResponse with searched player and hidden gems
    - Handle ValueError with HTTP 404 response
    - Handle uninitialized engine with HTTP 503 response
    - _Requirements: 1.1, 1.2, 1.3, 6.2, 6.3, 6.5_
  
  - [x] 5.4 Implement /health endpoint
    - Create GET endpoint returning simple health check response
    - Return {"status": "healthy"} JSON
    - _Requirements: 6.5_
  
  - [x] 5.5 Write unit tests for API endpoints
    - Test /search endpoint with valid player name
    - Test /search endpoint with non-existent player (404)
    - Test /health endpoint
    - Mock MLEngine for isolated testing

- [x] 6. Checkpoint - Backend complete, verify functionality
  - Run backend with: uvicorn main:app --reload --port 8000
  - Test /health endpoint returns 200
  - Test /search/Mbappe returns valid response with 3 hidden gems
  - Test /search/NonExistentPlayer returns 404
  - Ensure all tests pass, ask the user if questions arise

- [x] 7. Set up frontend project structure and dependencies
  - Create frontend/ directory with Next.js 14 app structure
  - Initialize Next.js with TypeScript: npx create-next-app@14 frontend --typescript
  - Install dependencies: axios, recharts, tailwindcss
  - Configure Tailwind CSS with cyberpunk theme (green/black colors)
  - Create lib/ and components/ directories
  - _Requirements: 5.4_

- [x] 8. Create TypeScript data models and API client
  - [x] 8.1 Define TypeScript interfaces
    - Create lib/types.ts with Player, PlayerStats, SearchResponse interfaces
    - Ensure all fields match backend Pydantic models
    - _Requirements: 7.4, 7.5_
  
  - [x] 8.2 Implement API client with Axios
    - Create lib/api.ts with Axios instance
    - Configure baseURL: http://localhost:8000
    - Set timeout: 5000ms
    - Implement searchPlayer(playerName: string) function
    - Add error handling for network failures and timeouts
    - _Requirements: 6.2, 6.4, 6.5, 9.3_
  
  - [x] 8.3 Write unit tests for API client
    - Test searchPlayer with mocked Axios responses
    - Test timeout handling
    - Test error response handling

- [x] 9. Implement SearchBar component
  - [x] 9.1 Create SearchBar component
    - Create components/SearchBar.tsx with SearchBarProps interface
    - Implement controlled input with useState
    - Add search icon and submit button
    - Handle form submission calling onSearch prop
    - Prevent empty search submissions
    - Display loading state when isLoading prop is true
    - Apply cyberpunk styling: green text on black background, large centered input
    - _Requirements: 1.1, 1.4, 5.4, 9.4_
  
  - [x] 9.2 Write unit tests for SearchBar
    - Test input handling and state updates
    - Test form submission with valid input
    - Test empty input prevention
    - Test loading state display

- [x] 10. Implement PlayerCard component
  - [x] 10.1 Create PlayerCard component
    - Create components/PlayerCard.tsx with PlayerCardProps interface
    - Display player name, club, nation, position, overall rating
    - Show "Hidden Gem" badge when isHiddenGem prop is true
    - Handle onClick event calling onSelect prop
    - Apply cyberpunk dark theme styling with green accents
    - Use React.memo for performance optimization
    - _Requirements: 5.1, 5.2, 5.4, 10.5_
  
  - [x] 10.2 Write property tests for PlayerCard
    - **Property 10: Player Display Field Completeness**
    - **Validates: Requirements 5.1**
    - Test that all required fields are rendered
    - **Property 11: Hidden Gem Visual Indicator**
    - **Validates: Requirements 5.2**
    - Test that hidden gem badge appears when isHiddenGem is true

- [x] 11. Implement RadarChart component
  - [x] 11.1 Create RadarChart component with Recharts
    - Create components/RadarChart.tsx with RadarChartProps interface
    - Use Recharts Radar, RadarChart, PolarGrid, PolarAngleAxis components
    - Display all six Player_Stats: PAC, SHO, PAS, DRI, DEF, PHY
    - Use distinct colors: searched player (green), comparison player (cyan)
    - Make chart responsive with proper sizing
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 11.2 Add overlay/modal functionality for radar chart
    - Wrap RadarChart in modal/overlay component
    - Add close button to dismiss comparison
    - Apply dark background with transparency
    - _Requirements: 4.1, 4.5_
  
  - [x] 11.3 Write property test for RadarChart
    - **Property 9: Radar Chart Data Completeness**
    - **Validates: Requirements 4.2**
    - Test that all six stats are displayed for both players

- [x] 12. Implement main page with search flow
  - [x] 12.1 Create app/page.tsx with search functionality
    - Import SearchBar, PlayerCard, RadarChart components
    - Implement handleSearch function calling API client
    - Manage state: searchResult, selectedGem, isLoading
    - Display searched player and hidden gems in grid layout
    - Show RadarChart when hidden gem is selected
    - Add debouncing to search input (300ms)
    - Cache search results in state
    - _Requirements: 1.1, 4.1, 4.5, 5.5, 10.3, 10.4_
  
  - [x] 12.2 Implement error handling and user feedback
    - Display error messages for player not found
    - Display message when no hidden gems exist
    - Show loading indicator during search
    - Display connection error if backend unavailable
    - Allow retry after errors
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 12.3 Write integration tests for main page
    - Test complete search flow with mocked API
    - Test error handling scenarios
    - Test radar chart display on gem selection

- [x] 13. Apply cyberpunk theme styling
  - [x] 13.1 Configure Tailwind with custom colors
    - Update tailwind.config.js with green/black color scheme
    - Define custom green shades for text and accents
    - Set black as primary background
    - _Requirements: 5.4_
  
  - [x] 13.2 Style all components with cyberpunk theme
    - Apply consistent green text on black background
    - Add neon green borders and accents
    - Use monospace fonts for tech aesthetic
    - Add subtle glow effects to interactive elements
    - _Requirements: 5.4_

- [x] 14. Final integration and testing
  - [x] 14.1 Test complete end-to-end flow
    - Start backend: uvicorn main:app --reload --port 8000
    - Start frontend: npm run dev (in frontend directory)
    - Test search for "Kylian Mbappe" returns 3 hidden gems
    - Test clicking hidden gem displays radar chart
    - Test search for non-existent player shows error
    - Verify all six stats visible in radar chart
    - _Requirements: 1.1, 2.2, 4.2, 9.1_
  
  - [x] 14.2 Verify performance requirements
    - Measure backend startup time (should be < 2 seconds)
    - Measure search response time (should be < 200ms)
    - Test frontend responsiveness and loading states
    - _Requirements: 1.3, 3.4, 10.1, 10.2_
  
  - [x] 14.3 Run all property-based tests
    - Execute all backend property tests with Hypothesis
    - Execute all frontend property tests with fast-check
    - Verify all properties pass

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Backend uses Python with FastAPI, pandas, scikit-learn
- Frontend uses TypeScript with Next.js 14, Tailwind CSS, Recharts
- Property tests validate universal correctness properties from design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at key milestones
- Performance targets: API response <200ms, startup <2s
- Data loaded once at startup into global state for fast queries
