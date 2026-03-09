# Requirements Document: PACE Comparison Visualization

## Introduction

The PACE attribute in Scout AI is unique among the six core attributes (PAC, SHO, PAS, DRI, DEF, PHY) because it contains only two sub-features: Acceleration (ACC) and Sprint Speed (SPR). The current radar/hexagon chart visualization is optimized for attributes with 4-6 sub-features and becomes less effective with only two data points. This feature introduces a specialized comparison graph for PACE that provides a clearer, more intuitive visualization using a vertical bar-style comparison format.

## Glossary

- **Frontend**: The Next.js web interface that displays player comparisons
- **AttributeRadarChart**: The existing component that displays radar charts for attribute comparisons
- **PACE_Attribute**: The pace category containing only two sub-features (ACC and SPR)
- **ACC**: Acceleration sub-attribute (0-99 scale)
- **SPR**: Sprint Speed sub-attribute (0-99 scale)
- **Comparison_Graph**: The new vertical bar-style visualization for PACE comparisons
- **Searched_Player**: The player that the user searched for
- **Similar_Players**: Players similar to the searched player based on attribute search (0-3 players)
- **Bar_Chart**: A chart type that uses rectangular bars to represent values

## Requirements

### Requirement 1: PACE-Specific Visualization Detection

**User Story:** As a developer, I want the system to detect when PACE is the selected attribute, so that the appropriate visualization is displayed.

#### Acceptance Criteria

1. WHEN the attribute category is "pace", THE Frontend SHALL render the Comparison_Graph instead of the radar chart
2. WHEN the attribute category is not "pace", THE Frontend SHALL render the existing radar chart visualization
3. THE Frontend SHALL perform case-insensitive matching for the "pace" attribute category
4. THE Frontend SHALL maintain backward compatibility with all other attribute visualizations
5. THE Frontend SHALL use the same component interface for both visualization types to ensure seamless integration

### Requirement 2: Vertical Bar Comparison Layout

**User Story:** As a football scout, I want to see PACE sub-attributes displayed as vertical bars, so that I can easily compare acceleration and sprint speed across players.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL display two vertical bar groups, one for ACC and one for SPR
2. WHEN displaying multiple players, THE Comparison_Graph SHALL show bars for each player side-by-side within each sub-attribute group
3. THE Comparison_Graph SHALL use a vertical orientation with values increasing from bottom to top
4. THE Comparison_Graph SHALL display the Y-axis scale from 0 to 100 to match the attribute value range
5. THE Comparison_Graph SHALL label the X-axis with "ACC" and "SPR" labels

### Requirement 3: Player Differentiation and Color Coding

**User Story:** As a football scout, I want each player to have a distinct color in the comparison graph, so that I can easily identify and compare their PACE attributes.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL use magenta (#ff00ff) for the Searched_Player bars
2. THE Comparison_Graph SHALL use cyan (#00ffff) for the first Similar_Player
3. THE Comparison_Graph SHALL use yellow (#ffff00) for the second Similar_Player
4. THE Comparison_Graph SHALL use orange (#ff6600) for the third Similar_Player
5. THE Comparison_Graph SHALL maintain the same color scheme as the AttributeRadarChart for consistency

### Requirement 4: Numeric Value Display

**User Story:** As a football scout, I want to see exact numeric values for ACC and SPR, so that I can make precise comparisons between players.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL display numeric values on top of or inside each bar
2. THE Comparison_Graph SHALL format values as integers (0-99 range)
3. WHEN a player has missing ACC or SPR data, THE Comparison_Graph SHALL display "N/A" and render a zero-height bar
4. THE Comparison_Graph SHALL ensure numeric labels are readable against the bar colors
5. THE Comparison_Graph SHALL display values with sufficient contrast for accessibility

### Requirement 5: Responsive Design and Layout

**User Story:** As a user, I want the PACE comparison graph to work on different screen sizes, so that I can view comparisons on any device.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL use responsive container sizing to adapt to different screen widths
2. THE Comparison_Graph SHALL maintain a minimum height of 400 pixels for readability
3. WHEN displayed on mobile devices, THE Comparison_Graph SHALL remain legible with appropriately sized bars and labels
4. THE Comparison_Graph SHALL use the same responsive container approach as the AttributeRadarChart
5. THE Comparison_Graph SHALL prevent bar overlap by adjusting bar width based on the number of players

### Requirement 6: Cyberpunk Theme Consistency

**User Story:** As a user, I want the PACE comparison graph to match the application's visual style, so that the interface feels cohesive.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL use the cyberpunk dark theme with purple accents matching the AttributeRadarChart
2. THE Comparison_Graph SHALL use a dark background (#0a0a0a or similar) with purple borders
3. THE Comparison_Graph SHALL use monospace font for labels and values
4. THE Comparison_Graph SHALL include a title section with "[ PACE COMPARISON ]" in uppercase with tracking
5. THE Comparison_Graph SHALL apply the same border, shadow, and styling patterns as the AttributeRadarChart

### Requirement 7: Legend and Player Identification

**User Story:** As a football scout, I want a legend showing which color represents which player, so that I can quickly identify players in the comparison.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL display a legend showing player names with their corresponding colors
2. THE Comparison_Graph SHALL position the legend below the bar chart
3. THE Comparison_Graph SHALL truncate long player names in the legend to prevent layout issues
4. THE Comparison_Graph SHALL highlight the Searched_Player in the legend with distinct styling
5. THE Comparison_Graph SHALL display the legend using the same styling as the AttributeRadarChart legend

### Requirement 8: Interactive Tooltips

**User Story:** As a user, I want to see detailed information when hovering over bars, so that I can get additional context about player attributes.

#### Acceptance Criteria

1. WHEN a user hovers over a bar, THE Comparison_Graph SHALL display a tooltip with the player name and exact value
2. THE Comparison_Graph SHALL style tooltips with the cyberpunk theme (dark background, purple border)
3. THE Comparison_Graph SHALL position tooltips to avoid obscuring other bars
4. THE Comparison_Graph SHALL use monospace font in tooltips for consistency
5. THE Comparison_Graph SHALL dismiss tooltips when the user moves the cursor away

### Requirement 9: Data Validation and Error Handling

**User Story:** As a developer, I want proper data validation, so that the comparison graph handles edge cases gracefully.

#### Acceptance Criteria

1. WHEN no Similar_Players are provided, THE Comparison_Graph SHALL display only the Searched_Player bars
2. WHEN ACC or SPR values are null or undefined, THE Comparison_Graph SHALL treat them as 0 and display "N/A"
3. THE Comparison_Graph SHALL validate that attribute values are within the 0-99 range
4. WHEN invalid data is detected, THE Comparison_Graph SHALL log a warning and render with fallback values
5. THE Comparison_Graph SHALL handle empty player names by displaying "Unknown Player"

### Requirement 10: Chart Library Integration

**User Story:** As a developer, I want to use a reliable charting library, so that the visualization is maintainable and performant.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL use the Recharts library for rendering bar charts
2. THE Comparison_Graph SHALL use the BarChart component from Recharts
3. THE Comparison_Graph SHALL configure Recharts with appropriate props for vertical bars
4. THE Comparison_Graph SHALL use ResponsiveContainer from Recharts for responsive sizing
5. THE Comparison_Graph SHALL leverage Recharts' built-in tooltip and legend components

### Requirement 11: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the PACE comparison graph to be accessible, so that I can use assistive technologies to understand the data.

#### Acceptance Criteria

1. THE Comparison_Graph SHALL include appropriate ARIA labels for the chart container
2. THE Comparison_Graph SHALL provide alt text or aria-label describing the chart purpose
3. THE Comparison_Graph SHALL ensure color is not the only means of differentiating players (use labels)
4. THE Comparison_Graph SHALL maintain sufficient color contrast ratios for text and bars
5. THE Comparison_Graph SHALL support keyboard navigation for interactive elements

### Requirement 12: Component Integration

**User Story:** As a developer, I want seamless integration with the existing attribute comparison flow, so that the PACE visualization works without breaking existing functionality.

#### Acceptance Criteria

1. THE Frontend SHALL conditionally render the Comparison_Graph within the same container as AttributeRadarChart
2. THE Comparison_Graph SHALL accept the same props interface as AttributeRadarChart (searchedPlayer, similarPlayers, attributeCategory)
3. THE Comparison_Graph SHALL be exported from the same module or a parallel module for easy imports
4. THE Frontend SHALL not require changes to parent components beyond the conditional rendering logic
5. THE Comparison_Graph SHALL maintain the same error boundary behavior as AttributeRadarChart
