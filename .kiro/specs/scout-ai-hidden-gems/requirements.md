# Requirements Document: Scout AI Hidden Gems

## Introduction

Scout AI is a web application designed to help football scouts discover undervalued players by finding "Hidden Gems" - lesser-known players who are statistically similar to famous stars but have lower overall ratings. The system analyzes FC 24 player data using machine learning to recommend players with similar playing styles who may be overlooked by other scouts.

## Glossary

- **System**: The Scout AI web application (frontend and backend combined)
- **Backend**: The FastAPI server that processes search requests and performs ML analysis
- **Frontend**: The Next.js web interface that users interact with
- **ML_Engine**: The machine learning component that uses K-Nearest Neighbors to find similar players
- **Hidden_Gem**: A player with a lower overall rating who has similar statistics to a searched player
- **Player_Stats**: The six core attributes used for comparison (PAC, SHO, PAS, DRI, DEF, PHY)
- **Search_Response**: The API response containing the searched player and recommended hidden gems
- **KNN_Model**: The K-Nearest Neighbors machine learning model trained on player statistics

## Requirements

### Requirement 1: Player Search

**User Story:** As a football scout, I want to search for a player by name, so that I can find similar undervalued players.

#### Acceptance Criteria

1. WHEN a user enters a valid player name and submits the search, THE System SHALL return the searched player's information and up to 3 hidden gem recommendations
2. WHEN a user searches for a non-existent player name, THE System SHALL return an error message indicating the player was not found
3. WHEN a search request is processed, THE Backend SHALL respond within 200 milliseconds
4. WHEN a user enters an empty search query, THE Frontend SHALL prevent the search submission
5. THE System SHALL perform case-insensitive player name matching

### Requirement 2: Hidden Gem Discovery

**User Story:** As a football scout, I want to receive recommendations for similar but lower-rated players, so that I can discover undervalued talent.

#### Acceptance Criteria

1. WHEN the ML_Engine finds hidden gems, THE System SHALL return only players with overall ratings lower than the searched player
2. WHEN sufficient lower-rated similar players exist, THE System SHALL return exactly 3 hidden gem recommendations
3. WHEN fewer than 3 lower-rated similar players exist, THE System SHALL return all available hidden gems (0-2 players)
4. THE ML_Engine SHALL select hidden gems from the 20 nearest neighbors based on statistical similarity
5. THE System SHALL order hidden gems by similarity distance, with the most similar player first

### Requirement 3: Data Loading and Initialization

**User Story:** As a system administrator, I want the application to load player data at startup, so that search requests can be processed quickly.

#### Acceptance Criteria

1. WHEN the Backend starts up, THE System SHALL load the CSV file from backend/data/all_fc_24_players.csv
2. WHEN loading CSV data, THE System SHALL fill null values in Player_Stats columns with the column mean
3. WHEN the Backend completes startup, THE ML_Engine SHALL have a trained KNN_Model ready for queries
4. THE Backend SHALL complete startup initialization within 2 seconds
5. IF the CSV file is missing or corrupted at startup, THEN THE Backend SHALL fail to start with a clear error message

### Requirement 4: Statistical Comparison Visualization

**User Story:** As a football scout, I want to visually compare player statistics, so that I can understand how similar the hidden gems are to my searched player.

#### Acceptance Criteria

1. WHEN a user clicks on a hidden gem recommendation, THE Frontend SHALL display a radar chart comparing the two players
2. THE Frontend SHALL visualize all six Player_Stats attributes (PAC, SHO, PAS, DRI, DEF, PHY) on the radar chart
3. WHEN displaying the radar chart, THE Frontend SHALL use distinct colors for the searched player and comparison player
4. THE Frontend SHALL render the radar chart using the Recharts library
5. WHEN a user selects a different hidden gem, THE Frontend SHALL update the radar chart to show the new comparison

### Requirement 5: Player Information Display

**User Story:** As a football scout, I want to see detailed player information, so that I can evaluate potential recruits.

#### Acceptance Criteria

1. WHEN displaying a player, THE Frontend SHALL show the player's name, club, nation, position, and overall rating
2. WHEN displaying hidden gem recommendations, THE Frontend SHALL visually indicate which players are hidden gems with a badge or label
3. THE System SHALL ensure all returned players have complete Player_Stats data (no null values)
4. WHEN displaying player cards, THE Frontend SHALL use the cyberpunk dark theme with green and black styling
5. THE Frontend SHALL display the searched player separately from the hidden gem recommendations

### Requirement 6: API Communication

**User Story:** As a developer, I want reliable communication between frontend and backend, so that the application functions correctly.

#### Acceptance Criteria

1. THE Backend SHALL enable CORS for requests from localhost:3000 during development
2. WHEN the Frontend makes a search request, THE System SHALL use HTTP GET method to /search/{player_name}
3. THE Backend SHALL return Search_Response data in JSON format with searched_player and hidden_gems fields
4. IF a network request exceeds 5 seconds, THEN THE Frontend SHALL timeout and display an error message
5. WHEN the Backend encounters an error, THE System SHALL return appropriate HTTP status codes (404 for not found, 500 for server errors)

### Requirement 7: Data Model Validation

**User Story:** As a developer, I want validated data models, so that the application handles data consistently and prevents errors.

#### Acceptance Criteria

1. THE Backend SHALL validate that all Player_Stats values are integers between 0 and 99
2. THE Backend SHALL ensure player names are non-empty strings
3. WHEN returning hidden gems, THE Backend SHALL include exactly the required fields: name, club, nation, position, overall, and stats
4. THE Frontend SHALL validate that Search_Response contains both searched_player and hidden_gems fields
5. THE System SHALL ensure all numeric stat values are properly typed (integers in Python, numbers in TypeScript)

### Requirement 8: Machine Learning Algorithm

**User Story:** As a system architect, I want a well-defined ML algorithm, so that hidden gem recommendations are consistent and accurate.

#### Acceptance Criteria

1. THE ML_Engine SHALL use K-Nearest Neighbors algorithm with k=20 neighbors
2. THE ML_Engine SHALL use cosine similarity as the distance metric for finding similar players
3. THE ML_Engine SHALL train the KNN_Model on the six Player_Stats features (PAC, SHO, PAS, DRI, DEF, PHY)
4. WHEN finding neighbors, THE ML_Engine SHALL exclude the searched player itself from the results
5. THE ML_Engine SHALL produce deterministic results for the same input player name

### Requirement 9: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages and feedback, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. WHEN a player is not found, THE Frontend SHALL display a user-friendly error message
2. WHEN no hidden gems exist for a player, THE Frontend SHALL display a message explaining that the player is already undervalued
3. WHEN a network error occurs, THE Frontend SHALL display an error message and allow the user to retry
4. WHEN a search is in progress, THE Frontend SHALL display a loading indicator
5. IF the Backend is unavailable, THEN THE Frontend SHALL display a connection error message

### Requirement 10: Performance Optimization

**User Story:** As a user, I want fast search results, so that I can efficiently evaluate multiple players.

#### Acceptance Criteria

1. THE Backend SHALL load CSV data into memory at startup to avoid repeated disk I/O
2. THE Backend SHALL train the KNN_Model once at startup, not per request
3. THE Frontend SHALL debounce search input by 300 milliseconds to reduce unnecessary API calls
4. THE Frontend SHALL cache search results in component state to avoid redundant requests
5. THE Frontend SHALL use React.memo for player card components to prevent unnecessary re-renders
