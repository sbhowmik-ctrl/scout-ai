# Implementation Plan: Attribute-Based KNN Player Search

## Overview

This implementation extends the Scout AI application with attribute-specific player similarity search. The feature enables users to search for players similar to a target player based on specific attribute categories (Pace, Shooting, Passing, Dribbling, Defending, Physical) using K-Nearest Neighbors algorithm.

The implementation involves:
- Backend: Extending MLEngine with 6 KNN models, new API endpoint, AttributeSearchResponse model
- Frontend: AttributeSelector component, AttributeRadarChart component, API client extension, page modifications
- Testing: Property-based tests (15 properties), unit tests, integration tests

## Tasks

- [x] 1. Extend backend data models for attribute search
  - [x] 1.1 Add AttributeSearchResponse model to models.py
    - Create AttributeSearchResponse with searched_player, similar_players, attribute_category fields
    - Add field validators for similar_players count (0-3) and valid attribute_category
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 1.2 Extend Player model with detailed sub-attribute stats
    - Create DetailedPlayerStats model with 29 sub-attribute fields
    - Add optional detailed_stats field to Player model
    - _Requirements: 3.1-3.6, 5.4_
  
  - [x] 1.3 Write unit tests for data models
    - Test AttributeSearchResponse validation (count, category)
    - Test DetailedPlayerStats field types
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 2. Implement attribute-based KNN in MLEngine
  - [x] 2.1 Add attribute feature mapping to MLEngine
    - Define attribute_features dict with 6 categories and their sub-attributes
    - Define attribute_models dict to store trained models
    - _Requirements: 3.1-3.6_
  
  - [x] 2.2 Implement train_attribute_models method
    - Train 6 separate NearestNeighbors models (k=4, metric='euclidean')
    - Handle null values by filling with column mean
    - Store models in attribute_models dict
    - _Requirements: 2.2, 2.3, 6.4, 8.1, 8.2_
  
  - [x] 2.3 Implement find_similar_by_attribute method
    - Validate attribute_category parameter
    - Find player (case-insensitive)
    - Query appropriate KNN model for 4 neighbors
    - Exclude searched player from results
    - Return top 3 similar players with detailed stats
    - _Requirements: 1.2, 2.1, 2.4, 2.5, 3.1-3.6, 7.1_
  
  - [x] 2.4 Write property test for attribute-specific feature usage
    - **Property 1: Attribute-Specific Feature Usage**
    - **Validates: Requirements 1.2, 3.1-3.6**
    - Test that each category uses only its associated sub-attributes
    - _Requirements: 1.2, 3.1-3.6_
  
  - [x] 2.5 Write property test for similar players exclusion
    - **Property 3: Similar Players Exclusion**
    - **Validates: Requirements 2.4**
    - Test that searched player never appears in similar_players list
    - _Requirements: 2.4_
  
  - [x] 2.6 Write property test for similarity distance ordering
    - **Property 4: Similarity Distance Ordering**
    - **Validates: Requirements 2.5**
    - Test that similar players are ordered by increasing distance
    - _Requirements: 2.5_
  
  - [x] 2.7 Write property test for no rating filter
    - **Property 11: No Rating Filter Applied**
    - **Validates: Requirements 7.1**
    - Test that similar players can have any rating relative to searched player
    - _Requirements: 7.1_
  
  - [x] 2.8 Write property test for null value imputation
    - **Property 9: Null Value Imputation**
    - **Validates: Requirements 6.4**
    - Test that all sub-attributes have no null values after loading
    - _Requirements: 6.4_
  
  - [x] 2.9 Write unit tests for MLEngine attribute methods
    - Test train_attribute_models creates 6 models
    - Test find_similar_by_attribute with specific examples
    - Test error handling for invalid category and player not found
    - _Requirements: 2.1-2.5, 3.1-3.6_

- [x] 3. Checkpoint - Ensure backend ML engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add attribute search API endpoint
  - [x] 4.1 Implement GET /search/{player_name}/attribute/{attribute_category} endpoint
    - Validate attribute_category parameter
    - Call ml_engine.find_similar_by_attribute
    - Return AttributeSearchResponse
    - Handle errors: 400 for invalid category, 404 for player not found, 503 for ML engine not initialized
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.3_
  
  - [x] 4.2 Update startup event to train attribute models
    - Call ml_engine.train_attribute_models() after train_model()
    - Add logging for attribute models initialization
    - _Requirements: 8.1, 8.2_
  
  - [x] 4.3 Write property test for valid response structure
    - **Property 5: Valid Response Structure**
    - **Validates: Requirements 4.2**
    - Test that valid requests return correct AttributeSearchResponse structure
    - _Requirements: 4.2_
  
  - [x] 4.4 Write property test for invalid category rejection
    - **Property 6: Invalid Category Rejection**
    - **Validates: Requirements 4.3, 4.4**
    - Test that invalid categories return HTTP 400
    - _Requirements: 4.3, 4.4_
  
  - [x] 4.5 Write property test for response category match
    - **Property 10: Response Category Match**
    - **Validates: Requirements 6.5**
    - Test that response attribute_category matches request
    - _Requirements: 6.5_
  
  - [x] 4.6 Write property test for similar players count validation
    - **Property 7: Similar Players Count Validation**
    - **Validates: Requirements 6.2**
    - Test that similar_players contains 0-3 players
    - _Requirements: 6.2_
  
  - [x] 4.7 Write property test for model reuse across requests
    - **Property 12: Model Reuse Across Requests**
    - **Validates: Requirements 8.2**
    - Test that same model instance is used for consecutive requests
    - _Requirements: 8.2_
  
  - [x] 4.8 Write property test for error response format
    - **Property 14: Error Response Format**
    - **Validates: Requirements 9.3**
    - Test that backend errors return HTTP 500 with descriptive message
    - _Requirements: 9.3_
  
  - [x] 4.9 Write unit tests for API endpoint
    - Test endpoint with valid player and category
    - Test endpoint with invalid category
    - Test endpoint with player not found
    - Test endpoint response time < 200ms
    - _Requirements: 4.1-4.5_

- [x] 5. Checkpoint - Ensure backend API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Extend frontend API client for attribute search
  - [x] 6.1 Add AttributeSearchResponse interface to lib/types.ts
    - Define TypeScript interface matching backend model
    - Include Player type with detailed_stats
    - _Requirements: 6.1, 6.5_
  
  - [x] 6.2 Implement searchPlayerByAttribute function in lib/api.ts
    - Create function with playerName and attributeCategory parameters
    - Make GET request to /search/{player_name}/attribute/{category}
    - Handle errors: 400, 404, timeout, network unavailable
    - Return AttributeSearchResponse
    - _Requirements: 4.1, 4.4, 9.1_
  
  - [x] 6.3 Write unit tests for API client
    - Test searchPlayerByAttribute with valid inputs
    - Test error handling for 400, 404, timeout
    - Mock axios responses
    - _Requirements: 4.1, 4.4, 9.1_

- [x] 7. Create AttributeSelector component
  - [x] 7.1 Implement AttributeSelector component in components/AttributeSelector.tsx
    - Display 6 attribute category buttons (Pace, Shooting, Passing, Dribbling, Defending, Physical)
    - Handle attribute selection with onAttributeSelect callback
    - Visually indicate selected attribute
    - Support disabled state
    - Apply cyberpunk dark theme styling (green/black)
    - _Requirements: 1.1, 1.3, 1.5, 10.2_
  
  - [x] 7.2 Write unit tests for AttributeSelector
    - Test rendering of 6 buttons
    - Test click handlers
    - Test selected state styling
    - Test disabled state
    - _Requirements: 1.1, 1.5_

- [x] 8. Create AttributeRadarChart component
  - [x] 8.1 Implement AttributeRadarChart component in components/AttributeRadarChart.tsx
    - Map attribute category to sub-attributes
    - Display radar chart focused on selected attribute's sub-attributes
    - Highlight selected attribute category on chart
    - Display numeric values alongside chart
    - Use distinct visual styling from hidden gems results
    - Apply cyberpunk dark theme styling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.2_
  
  - [x] 8.2 Write unit tests for AttributeRadarChart
    - Test rendering with different attribute categories
    - Test sub-attribute mapping
    - Test chart data structure
    - Test styling differences from hidden gems
    - _Requirements: 5.1, 5.3, 5.5_

- [x] 9. Integrate attribute search into search results page
  - [x] 9.1 Add state management for attribute search in app/page.tsx
    - Add selectedAttribute state
    - Add attributeResults state
    - Add attributeLoading state
    - Add attributeCache state (Map)
    - _Requirements: 1.3, 8.3_
  
  - [x] 9.2 Implement handleAttributeSelect function in app/page.tsx
    - Check cache first for player+attribute combination
    - Call searchPlayerByAttribute if not cached
    - Update attributeResults state
    - Cache results for future use
    - Handle loading and error states
    - _Requirements: 1.3, 8.3, 8.4, 9.4_
  
  - [x] 9.3 Add AttributeSelector to search results display
    - Render AttributeSelector below hidden gems results
    - Pass selectedAttribute and handleAttributeSelect
    - Show only when search results exist
    - _Requirements: 1.1, 10.1_
  
  - [x] 9.4 Add AttributeRadarChart to attribute results display
    - Render AttributeRadarChart when attributeResults exist
    - Pass searchedPlayer, similarPlayers, attributeCategory
    - Show loading indicator during attribute search
    - Maintain hidden gems results visibility
    - _Requirements: 5.1, 9.4, 10.3_
  
  - [x] 9.5 Write property test for frontend attribute switching
    - **Property 2: Frontend Attribute Switching Without Re-search**
    - **Validates: Requirements 1.3**
    - Test that switching attributes doesn't trigger player re-search
    - _Requirements: 1.3_
  
  - [x] 9.6 Write property test for frontend result caching
    - **Property 13: Frontend Result Caching**
    - **Validates: Requirements 8.3**
    - Test that repeated searches use cached results
    - _Requirements: 8.3_
  
  - [x] 9.7 Write property test for backward compatibility
    - **Property 15: Backward Compatibility Preservation**
    - **Validates: Requirements 10.5**
    - Test that searches without attribute selection return hidden gems results
    - _Requirements: 10.5_
  
  - [x] 9.8 Write unit tests for page integration
    - Test handleAttributeSelect with cache hit
    - Test handleAttributeSelect with cache miss
    - Test AttributeSelector rendering
    - Test AttributeRadarChart rendering
    - Test loading states
    - _Requirements: 1.3, 8.3, 9.4, 10.1_

- [x] 10. Checkpoint - Ensure frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Add comprehensive integration tests
  - [x] 11.1 Write end-to-end integration test for attribute search flow
    - Test complete flow: search player → select attribute → view results → switch attribute
    - Test caching behavior
    - Test error handling
    - _Requirements: 1.1-1.5, 2.1-2.5, 4.1-4.5, 10.1-10.5_
  
  - [x] 11.2 Write performance tests
    - Test attribute search response time < 200ms
    - Test cached attribute switch < 100ms
    - Test startup time with 6 models < 5 seconds
    - _Requirements: 4.5, 8.5_

- [x] 12. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (15 total)
- Unit tests validate specific examples and edge cases
- The design uses Python for backend and TypeScript for frontend
- Backend uses `hypothesis` library for property-based testing
- Frontend uses `fast-check` library for property-based testing (already installed)
- All attribute models are trained at startup and cached in memory
- Frontend caches attribute search results per player+attribute combination
