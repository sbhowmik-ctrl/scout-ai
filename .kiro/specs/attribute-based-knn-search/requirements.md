# Requirements Document: Attribute-Based KNN Player Search

## Introduction

This feature enhances the Scout AI application by enabling attribute-specific player similarity search. Users can search for a player and select a specific attribute category (such as dribbling, pace, or shooting) to find the top 3 most similar players based on that particular attribute using K-Nearest Neighbors algorithm. This allows scouts to find players who excel in specific playing styles or skills rather than overall statistical similarity.

## Glossary

- **System**: The Scout AI web application (frontend and backend combined)
- **Backend**: The FastAPI server that processes attribute-based search requests
- **Frontend**: The Next.js web interface where users select attributes and view results
- **Attribute_Category**: A specific player skill dimension (PAC, SHO, PAS, DRI, DEF, PHY)
- **Attribute_Search_Engine**: The ML component that performs KNN search on selected attributes
- **Similar_Player**: A player found to be similar based on the selected attribute category
- **Attribute_Search_Response**: API response containing the searched player and top 3 similar players for the selected attribute
- **KNN_Attribute_Model**: K-Nearest Neighbors model trained on specific attribute features

## Requirements

### Requirement 1: Attribute Category Selection

**User Story:** As a football scout, I want to select a specific attribute category when searching for players, so that I can find players with similar strengths in particular skills.

#### Acceptance Criteria

1. WHEN a user views search results, THE Frontend SHALL display six attribute category options (Pace, Shooting, Passing, Dribbling, Defending, Physical)
2. WHEN a user selects an attribute category, THE System SHALL perform a KNN search based only on that attribute's value
3. THE Frontend SHALL allow users to switch between different attribute categories without re-searching the player
4. WHEN no attribute is selected, THE System SHALL default to showing the original hidden gems search results
5. THE Frontend SHALL visually indicate which attribute category is currently selected

### Requirement 2: Attribute-Based Similarity Search

**User Story:** As a football scout, I want to find players similar in specific attributes, so that I can identify specialists in particular playing styles.

#### Acceptance Criteria

1. WHEN a user selects an attribute category, THE Attribute_Search_Engine SHALL find the 3 most similar players based on that single attribute value
2. THE Attribute_Search_Engine SHALL use K-Nearest Neighbors algorithm with k=4 neighbors (excluding the searched player)
3. THE Attribute_Search_Engine SHALL use Euclidean distance as the similarity metric for single-attribute comparison
4. THE System SHALL exclude the searched player from the similar players results
5. THE System SHALL return similar players ordered by similarity distance (most similar first)

### Requirement 3: Multi-Attribute Granular Search

**User Story:** As a football scout, I want to search based on detailed sub-attributes within a category, so that I can find players with specific skill profiles.

#### Acceptance Criteria

1. WHERE the user selects Pace category, THE System SHALL use Acceleration and Sprint_Speed attributes for KNN search
2. WHERE the user selects Shooting category, THE System SHALL use Positioning, Finishing, Shot_Power, Long_Shots, Volleys, and Penalties attributes for KNN search
3. WHERE the user selects Passing category, THE System SHALL use Vision, Crossing, Free_Kick_Accuracy, Short_Passing, Long_Passing, and Curve attributes for KNN search
4. WHERE the user selects Dribbling category, THE System SHALL use Agility, Balance, Reactions, Ball_Control, Dribbling, and Composure attributes for KNN search
5. WHERE the user selects Defending category, THE System SHALL use Interceptions, Heading_Accuracy, Def_Awareness, Standing_Tackle, and Sliding_Tackle attributes for KNN search
6. WHERE the user selects Physical category, THE System SHALL use Jumping, Stamina, Strength, and Aggression attributes for KNN search

### Requirement 4: Attribute Search API Endpoint

**User Story:** As a developer, I want a dedicated API endpoint for attribute-based searches, so that the frontend can request attribute-specific similarity results.

#### Acceptance Criteria

1. THE Backend SHALL provide a GET endpoint at /search/{player_name}/attribute/{attribute_category}
2. WHEN the endpoint receives a valid request, THE Backend SHALL return an Attribute_Search_Response with the searched player and 3 similar players
3. THE Backend SHALL validate that attribute_category is one of: pace, shooting, passing, dribbling, defending, physical
4. IF an invalid attribute_category is provided, THEN THE Backend SHALL return HTTP 400 with an error message
5. THE Backend SHALL respond to attribute search requests within 200 milliseconds

### Requirement 5: Attribute Comparison Visualization

**User Story:** As a football scout, I want to see visual comparisons of the selected attribute, so that I can understand the similarity between players.

#### Acceptance Criteria

1. WHEN viewing attribute search results, THE Frontend SHALL display a radar chart focused on the selected attribute's sub-attributes
2. WHEN a user clicks on a similar player, THE Frontend SHALL show a detailed comparison highlighting the selected attribute category
3. THE Frontend SHALL use distinct visual styling to differentiate attribute-based results from hidden gems results
4. THE Frontend SHALL display the attribute values numerically alongside the visual comparison
5. WHEN comparing players, THE Frontend SHALL highlight the selected attribute category on the radar chart

### Requirement 6: Data Model for Attribute Search

**User Story:** As a developer, I want well-defined data models for attribute searches, so that data is handled consistently across the system.

#### Acceptance Criteria

1. THE Backend SHALL define an Attribute_Search_Response model with searched_player, similar_players, and attribute_category fields
2. THE Backend SHALL validate that similar_players contains exactly 0-3 Player objects
3. THE Backend SHALL ensure all sub-attribute values used in KNN are non-null numeric values
4. WHEN loading CSV data, THE System SHALL fill null values in sub-attribute columns with column mean
5. THE Frontend SHALL validate that Attribute_Search_Response contains the expected attribute_category value

### Requirement 7: No Rating Restriction for Attribute Search

**User Story:** As a football scout, I want to see all similar players regardless of rating, so that I can find the best matches for specific attributes.

#### Acceptance Criteria

1. THE Attribute_Search_Engine SHALL NOT filter results by overall rating (unlike hidden gems search)
2. THE System SHALL return the 3 most similar players based purely on attribute similarity
3. THE System SHALL include players with higher, equal, or lower overall ratings than the searched player
4. THE Frontend SHALL clearly distinguish attribute search results from hidden gems results
5. THE Frontend SHALL display overall ratings for all similar players to provide context

### Requirement 8: Attribute Search Performance

**User Story:** As a user, I want fast attribute search results, so that I can quickly explore different attribute categories.

#### Acceptance Criteria

1. THE Backend SHALL train separate KNN models for each attribute category at startup
2. THE Backend SHALL cache trained attribute models in memory to avoid retraining per request
3. THE Frontend SHALL cache attribute search results per player and attribute combination
4. THE Frontend SHALL preload attribute data when displaying initial search results
5. WHEN switching between attribute categories, THE Frontend SHALL display results within 100 milliseconds if cached

### Requirement 9: Error Handling for Attribute Search

**User Story:** As a user, I want clear error messages for attribute searches, so that I understand any issues and can take corrective action.

#### Acceptance Criteria

1. WHEN a player is not found for attribute search, THE Frontend SHALL display the same error message as the standard search
2. WHEN fewer than 3 similar players exist in the dataset, THE System SHALL return all available similar players
3. IF the Backend encounters an error during attribute search, THEN THE System SHALL return HTTP 500 with a descriptive error message
4. WHEN an attribute search is in progress, THE Frontend SHALL display a loading indicator specific to the attribute category
5. IF attribute data is incomplete for a player, THEN THE Backend SHALL exclude that player from results and log a warning

### Requirement 10: Attribute Search Integration

**User Story:** As a user, I want attribute search to integrate seamlessly with existing functionality, so that I have a cohesive experience.

#### Acceptance Criteria

1. THE Frontend SHALL display attribute category selection alongside the existing hidden gems results
2. WHEN viewing attribute search results, THE Frontend SHALL maintain the cyberpunk dark theme with green and black styling
3. THE System SHALL allow users to view both hidden gems and attribute-based results for the same player
4. THE Frontend SHALL provide clear navigation between hidden gems view and attribute search view
5. THE System SHALL preserve the original search functionality when attribute search is not being used
