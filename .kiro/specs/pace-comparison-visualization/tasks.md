# Implementation Plan: PACE Comparison Visualization

## Overview

This implementation plan creates a specialized vertical bar chart visualization for the PACE attribute, which contains only two sub-features (ACC and SPR). The new `PaceComparisonChart` component will replace the radar chart when PACE is selected, providing a clearer comparison format. The implementation uses TypeScript, React, and the existing Recharts library to maintain consistency with the current codebase.

## Tasks

- [x] 1. Create PaceComparisonChart component structure
  - Create `frontend/components/PaceComparisonChart.tsx` file
  - Define TypeScript interface `PaceComparisonChartProps` matching AttributeRadarChart props
  - Set up component skeleton with props destructuring
  - Add cyberpunk theme container with title "[ PACE COMPARISON ]"
  - _Requirements: 1.5, 6.4, 12.2_

- [x] 2. Implement data transformation and color mapping
  - [x] 2.1 Create data transformation function
    - Implement `transformDataForChart()` to extract ACC and SPR values from players
    - Transform data into Recharts format: `[{ stat: 'ACC', [playerName]: value }, { stat: 'SPR', [playerName]: value }]`
    - Handle missing values by defaulting to 0
    - Implement value clamping for 0-99 range with warning logs
    - _Requirements: 2.1, 2.5, 9.2, 9.3_
  
  - [x] 2.2 Create player color mapping function
    - Implement `getPlayerColors()` returning player-color mappings
    - Use color scheme: searched (#ff00ff), similar1 (#00ffff), similar2 (#ffff00), similar3 (#ff6600)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 2.3 Create value formatting function
    - Implement `formatValue()` to format numbers as integers
    - Return "N/A" for null/undefined values
    - Handle empty player names with "Unknown Player" fallback
    - _Requirements: 4.2, 4.3, 9.5_

- [x] 3. Implement Recharts bar chart visualization
  - [x] 3.1 Configure ResponsiveContainer and BarChart
    - Add ResponsiveContainer with 100% width and 400px height
    - Configure BarChart with transformed data and margins
    - Add CartesianGrid with purple stroke matching cyberpunk theme
    - _Requirements: 2.3, 5.1, 5.2, 6.1, 10.1_
  
  - [x] 3.2 Configure axes and scale
    - Add XAxis with dataKey="stat" displaying ACC and SPR labels
    - Add YAxis with domain [0, 100] for attribute value range
    - Style axes with purple color (#ff00ff) and appropriate font sizes
    - _Requirements: 2.4, 2.5_
  
  - [x] 3.3 Add Bar components for each player
    - Create Bar for searched player with magenta fill
    - Map over similarPlayers to create Bar components with respective colors
    - Add numeric labels on top of bars using label prop
    - Ensure bars are grouped side-by-side within each sub-attribute
    - _Requirements: 2.2, 4.1, 4.4_

- [x] 4. Implement interactive features
  - [x] 4.1 Configure Recharts Tooltip
    - Add Tooltip component with cyberpunk theme styling (dark background, purple border)
    - Configure contentStyle with monospace font
    - Display player name and exact value on hover
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 4.2 Configure Recharts Legend
    - Add Legend component positioned below chart
    - Style legend with cyberpunk theme matching AttributeRadarChart
    - Implement player name truncation for names longer than 20 characters
    - Add distinct styling for searched player in legend
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5. Add accessibility and error handling
  - [x] 5.1 Implement accessibility features
    - Add aria-label to chart container describing purpose
    - Ensure ARIA attributes are present for screen readers
    - Verify color contrast ratios meet accessibility standards
    - _Requirements: 11.1, 11.2, 11.4_
  
  - [x] 5.2 Implement error handling and validation
    - Add error logging for invalid data with player name and value details
    - Handle empty similarPlayers array gracefully
    - Add fallback rendering for malformed player objects
    - Ensure component doesn't crash on invalid input
    - _Requirements: 9.1, 9.4, 12.5_

- [x] 6. Integrate conditional rendering in parent component
  - Locate parent component that renders AttributeRadarChart
  - Add conditional logic: if attributeCategory.toLowerCase() === 'pace', render PaceComparisonChart
  - Ensure case-insensitive matching for "pace" attribute
  - Import PaceComparisonChart component
  - Verify backward compatibility with other attribute visualizations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 12.1, 12.4_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create unit tests for PaceComparisonChart
  - [ ]* 8.1 Write tests for specific examples
    - Test rendering with 1 player (searched only)
    - Test rendering with 2 players (searched + 1 similar)
    - Test rendering with 4 players (searched + 3 similar)
    - Test rendering with specific ACC/SPR values
    - _Requirements: 2.2, 7.1_
  
  - [ ]* 8.2 Write tests for edge cases
    - Test missing ACC data (null/undefined) displays "N/A" and zero-height bar
    - Test missing SPR data (null/undefined) displays "N/A" and zero-height bar
    - Test empty similarPlayers array shows only searched player
    - Test empty player names display "Unknown Player"
    - Test long player names are truncated in legend
    - _Requirements: 4.3, 9.1, 9.2, 9.5, 7.3_
  
  - [ ]* 8.3 Write tests for error conditions
    - Test invalid value ranges (negative, > 99) are clamped with warnings
    - Test malformed player objects are handled gracefully
    - Test missing detailed_stats object doesn't crash component
    - _Requirements: 9.3, 9.4_
  
  - [ ]* 8.4 Write tests for configuration
    - Test props interface matches AttributeRadarChart
    - Test ResponsiveContainer is used with correct dimensions
    - Test chart height is 400px minimum
    - Test Recharts components are properly configured
    - Test cyberpunk theme classes are applied
    - Test ARIA labels are present
    - _Requirements: 1.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 10.1, 10.3, 10.5, 11.1, 12.2, 12.3_

- [x] 9. Create property-based tests
  - [ ]* 9.1 Write property test for conditional rendering
    - **Property 1: Conditional rendering based on attribute category**
    - **Validates: Requirements 1.1, 1.3**
    - Generate various attribute category strings (pace, PACE, Pace, shooting, etc.)
    - Verify "pace" (case-insensitive) triggers PaceComparisonChart rendering
    - Verify other categories trigger AttributeRadarChart rendering
  
  - [ ]* 9.2 Write property test for chart structure
    - **Property 2: Chart structure contains two sub-attribute groups**
    - **Validates: Requirements 2.1, 2.5**
    - Generate player sets with 1-4 players
    - Verify chart data contains exactly two groups labeled "ACC" and "SPR"
  
  - [ ]* 9.3 Write property test for bar count
    - **Property 3: Bar count matches player count**
    - **Validates: Requirements 2.2**
    - Generate player sets with varying counts (1-4)
    - Verify each sub-attribute group contains correct number of bars
  
  - [ ]* 9.4 Write property test for color assignment
    - **Property 4: Player color assignment**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Generate player sets with 1-4 players
    - Verify searched player gets magenta, similar players get cyan/yellow/orange in order
  
  - [ ]* 9.5 Write property test for numeric labels
    - **Property 5: Numeric labels on bars**
    - **Validates: Requirements 4.1, 4.2**
    - Generate players with valid ACC/SPR values (0-99)
    - Verify each bar displays integer value label
  
  - [ ]* 9.6 Write property test for chart title
    - **Property 6: Chart title consistency**
    - **Validates: Requirements 6.4**
    - Generate various input data
    - Verify chart always displays "[ PACE COMPARISON ]" in uppercase
  
  - [ ]* 9.7 Write property test for legend completeness
    - **Property 7: Legend contains all players**
    - **Validates: Requirements 7.1**
    - Generate player sets with 1-4 players
    - Verify legend displays all player names with corresponding colors
  
  - [ ]* 9.8 Write property test for name truncation
    - **Property 8: Long name truncation**
    - **Validates: Requirements 7.3**
    - Generate players with names longer than 20 characters
    - Verify legend truncates long names to prevent layout issues
  
  - [ ]* 9.9 Write property test for searched player highlighting
    - **Property 9: Searched player legend highlighting**
    - **Validates: Requirements 7.4**
    - Generate player sets with 1-4 players
    - Verify searched player has distinct styling in legend
  
  - [ ]* 9.10 Write property test for tooltip content
    - **Property 10: Tooltip content on hover**
    - **Validates: Requirements 8.1**
    - Generate players with various ACC/SPR values
    - Verify hovering over bar displays tooltip with player name and value
  
  - [ ]* 9.11 Write property test for tooltip dismissal
    - **Property 11: Tooltip dismissal**
    - **Validates: Requirements 8.5**
    - Simulate hover and cursor movement away
    - Verify tooltip is dismissed when cursor leaves bar
  
  - [ ]* 9.12 Write property test for value range validation
    - **Property 12: Value range validation**
    - **Validates: Requirements 9.3**
    - Generate players with values outside 0-99 range
    - Verify values are clamped and warnings are logged
  
  - [ ]* 9.13 Write property test for invalid data fallback
    - **Property 13: Invalid data fallback**
    - **Validates: Requirements 9.4**
    - Generate malformed player objects
    - Verify component logs warning and renders with fallback values
  
  - [ ]* 9.14 Write property test for ARIA labels
    - **Property 14: ARIA label presence**
    - **Validates: Requirements 11.1**
    - Generate various input data
    - Verify chart container includes aria-label or role attribute
  
  - [ ]* 9.15 Write property test for redundant encoding
    - **Property 15: Redundant player encoding**
    - **Validates: Requirements 11.3**
    - Generate player sets with 1-4 players
    - Verify each player is identifiable by both color and text (legend/tooltip)
  
  - [ ]* 9.16 Write property test for error boundary consistency
    - **Property 16: Error boundary consistency**
    - **Validates: Requirements 12.5**
    - Simulate rendering errors
    - Verify PaceComparisonChart handles errors same as AttributeRadarChart

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The component uses TypeScript and React with Recharts library
- Cyberpunk theme styling must match AttributeRadarChart for visual consistency
- Property tests use fast-check library with minimum 100 iterations
- All 16 correctness properties from the design document are covered in property tests
