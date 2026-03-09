# Design Document: PACE Comparison Visualization

## Overview

The PACE Comparison Visualization feature introduces a specialized vertical bar chart component to replace the radar chart when displaying PACE attribute comparisons. Unlike other attributes with 4-6 sub-features, PACE contains only two sub-attributes (Acceleration and Sprint Speed), making the radar chart visualization less effective. This design implements a vertical bar chart that provides clearer visual comparison for these two metrics.

### Key Design Decisions

1. **Separate Component vs. Conditional Rendering**: Create a new `PaceComparisonChart` component that shares the same props interface as `AttributeRadarChart`, enabling seamless conditional rendering based on the selected attribute category.

2. **Recharts BarChart**: Leverage the existing Recharts library (already used for radar charts) to maintain consistency in dependencies and reduce bundle size.

3. **Visual Consistency**: Maintain the cyberpunk theme, color scheme, and layout patterns established by `AttributeRadarChart` to ensure a cohesive user experience.

4. **Responsive Design**: Use the same `ResponsiveContainer` approach as the radar chart to ensure the visualization adapts to different screen sizes.

### Research Summary

**Recharts BarChart Configuration**:
- The `BarChart` component from Recharts supports vertical bars by default
- Multiple bars can be grouped using the `Bar` component with different `dataKey` props
- The `XAxis` displays categorical data (ACC, SPR), while `YAxis` displays numeric values (0-100)
- Built-in `Tooltip` and `Legend` components provide interactivity with minimal configuration
- `ResponsiveContainer` ensures the chart adapts to parent container dimensions

**Accessibility Considerations**:
- Recharts provides basic ARIA support through the `accessibilityLayer` prop
- Color contrast ratios must be validated for the chosen color scheme
- Numeric labels on bars provide redundancy beyond color coding
- Legend provides text-based player identification

## Architecture

### Component Structure

```
frontend/components/
├── AttributeRadarChart.tsx          # Existing radar chart component
├── PaceComparisonChart.tsx          # New vertical bar chart component (NEW)
└── __tests__/
    ├── AttributeRadarChart.test.tsx
    └── PaceComparisonChart.test.tsx # New test file (NEW)
```

### Integration Point

The conditional rendering logic will be added to the parent component that currently renders `AttributeRadarChart`. The logic will check if `attributeCategory.toLowerCase() === 'pace'` and render `PaceComparisonChart` instead.

**Example Integration**:
```typescript
{attributeCategory.toLowerCase() === 'pace' ? (
  <PaceComparisonChart
    searchedPlayer={searchedPlayer}
    similarPlayers={similarPlayers}
    attributeCategory={attributeCategory}
  />
) : (
  <AttributeRadarChart
    searchedPlayer={searchedPlayer}
    similarPlayers={similarPlayers}
    attributeCategory={attributeCategory}
  />
)}
```

### Data Flow

1. Parent component receives `AttributeSearchResponse` from API
2. Parent extracts `searched_player`, `similar_players`, and `attribute_category`
3. Parent performs case-insensitive check on `attribute_category`
4. If "pace", render `PaceComparisonChart`; otherwise, render `AttributeRadarChart`
5. Component extracts ACC and SPR values from `player.detailed_stats`
6. Component transforms data into Recharts format
7. Recharts renders the visualization

## Components and Interfaces

### PaceComparisonChart Component

**File**: `frontend/components/PaceComparisonChart.tsx`

**Props Interface**:
```typescript
export interface PaceComparisonChartProps {
  /** The player that was searched for */
  searchedPlayer: Player;
  /** Similar players based on attribute (0-3 players) */
  similarPlayers: Player[];
  /** The attribute category used for search (should be "pace") */
  attributeCategory: string;
}
```

**Key Functions**:

1. **transformDataForChart()**
   - Extracts ACC and SPR values from all players
   - Transforms into Recharts data format: `[{ stat: 'ACC', [playerName]: value }, { stat: 'SPR', [playerName]: value }]`
   - Handles missing values by defaulting to 0

2. **getPlayerColors()**
   - Returns array of player-color mappings
   - Uses the same color scheme as `AttributeRadarChart`:
     - Searched player: `#ff00ff` (magenta)
     - Similar player 1: `#00ffff` (cyan)
     - Similar player 2: `#ffff00` (yellow)
     - Similar player 3: `#ff6600` (orange)

3. **formatValue()**
   - Formats numeric values as integers
   - Returns "N/A" for null/undefined values

### Recharts Configuration

**Components Used**:
- `ResponsiveContainer`: Responsive sizing wrapper
- `BarChart`: Main chart container
- `CartesianGrid`: Grid lines for readability
- `XAxis`: Displays "ACC" and "SPR" labels
- `YAxis`: Displays 0-100 scale
- `Tooltip`: Interactive hover information
- `Legend`: Player identification
- `Bar`: Individual bar series for each player

**Chart Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#ff00ff" strokeOpacity={0.2} />
    <XAxis dataKey="stat" tick={{ fill: '#ff00ff', fontSize: 14, fontWeight: 'bold' }} />
    <YAxis domain={[0, 100]} tick={{ fill: '#ff00ff', fontSize: 11 }} />
    <Tooltip contentStyle={{ ... }} />
    <Legend wrapperStyle={{ ... }} />
    <Bar dataKey={searchedPlayer.name} fill="#ff00ff" label={{ position: 'top' }} />
    {similarPlayers.map((player, index) => (
      <Bar key={player.name} dataKey={player.name} fill={colors[index]} label={{ position: 'top' }} />
    ))}
  </BarChart>
</ResponsiveContainer>
```

## Data Models

### Chart Data Format

The component transforms player data into the following format for Recharts:

```typescript
interface ChartDataPoint {
  stat: 'ACC' | 'SPR';
  [playerName: string]: number | string;
}

// Example:
const chartData: ChartDataPoint[] = [
  {
    stat: 'ACC',
    'Kylian Mbappé': 97,
    'Erling Haaland': 89,
    'Vinícius Júnior': 95,
  },
  {
    stat: 'SPR',
    'Kylian Mbappé': 97,
    'Erling Haaland': 94,
    'Vinícius Júnior': 90,
  },
];
```

### Player Color Mapping

```typescript
interface PlayerColorMapping {
  name: string;
  color: string;
}

const PACE_COLORS = {
  searched: '#ff00ff',   // Magenta
  similar1: '#00ffff',   // Cyan
  similar2: '#ffff00',   // Yellow
  similar3: '#ff6600',   // Orange
};
```

### Sub-Attribute Mapping

```typescript
const PACE_SUB_ATTRIBUTES = [
  { key: 'Acceleration', label: 'ACC' },
  { key: 'Sprint_Speed', label: 'SPR' },
];
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all 60 acceptance criteria, several redundancies were identified:

**Redundant Properties Eliminated**:
- Requirements 1.2, 1.4, 12.1 are redundant with 1.1 (conditional rendering)
- Requirements 3.5 is redundant with 3.1-3.4 (color scheme consistency)
- Requirements 6.5, 7.5 are redundant with 6.1 (styling consistency)
- Requirements 9.2 is redundant with 4.3 (missing data handling)
- Requirements 10.2, 10.4 are redundant with 10.1 (Recharts usage)
- Requirements 11.2 is redundant with 11.1 (ARIA labels)
- Requirements 12.2 is redundant with 1.5 (props interface)

**Properties Consolidated**:
- Requirements 3.1-3.4 can be combined into a single property about player color assignment
- Requirements 6.1-6.3 can be combined into a single property about theme consistency
- Configuration checks (2.3, 2.4, 5.1, 5.2, 6.2, 6.3, 7.2, 8.2, 8.4, 10.1, 10.3, 10.5, 12.3) can be verified through example-based tests rather than properties

### Property 1: Conditional Rendering Based on Attribute Category

*For any* attribute category string, when the category is "pace" (case-insensitive), the system should render the PaceComparisonChart component; otherwise, it should render the AttributeRadarChart component.

**Validates: Requirements 1.1, 1.3**

### Property 2: Chart Structure Contains Two Sub-Attribute Groups

*For any* set of players (1-4 players), the rendered chart data should contain exactly two groups labeled "ACC" and "SPR".

**Validates: Requirements 2.1, 2.5**

### Property 3: Bar Count Matches Player Count

*For any* number of players (1-4), each sub-attribute group (ACC and SPR) should contain exactly that many bars.

**Validates: Requirements 2.2**

### Property 4: Player Color Assignment

*For any* set of players, the searched player should be assigned magenta (#ff00ff), and similar players should be assigned colors in order: cyan (#00ffff), yellow (#ffff00), orange (#ff6600).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 5: Numeric Labels on Bars

*For any* player data with valid ACC and SPR values, each bar should display a numeric label showing the integer value (0-99).

**Validates: Requirements 4.1, 4.2**

### Property 6: Chart Title Consistency

*For any* input data, the chart should display the title "[ PACE COMPARISON ]" in uppercase.

**Validates: Requirements 6.4**

### Property 7: Legend Contains All Players

*For any* set of players, the legend should display all player names with their corresponding colors.

**Validates: Requirements 7.1**

### Property 8: Long Name Truncation

*For any* player with a name longer than a specified threshold (e.g., 20 characters), the legend should truncate the name to prevent layout issues.

**Validates: Requirements 7.3**

### Property 9: Searched Player Legend Highlighting

*For any* set of players, the searched player should have distinct styling in the legend compared to similar players.

**Validates: Requirements 7.4**

### Property 10: Tooltip Content on Hover

*For any* bar in the chart, hovering over it should display a tooltip containing the player name and exact numeric value.

**Validates: Requirements 8.1**

### Property 11: Tooltip Dismissal

*For any* bar with an active tooltip, moving the cursor away should dismiss the tooltip.

**Validates: Requirements 8.5**

### Property 12: Value Range Validation

*For any* player data, if ACC or SPR values are outside the 0-99 range, the system should clamp them to the valid range or log a warning.

**Validates: Requirements 9.3**

### Property 13: Invalid Data Fallback

*For any* invalid player data (e.g., malformed objects), the system should log a warning and render with fallback values rather than crashing.

**Validates: Requirements 9.4**

### Property 14: ARIA Label Presence

*For any* rendered chart, the chart container should include an aria-label or role attribute describing the chart purpose.

**Validates: Requirements 11.1**

### Property 15: Redundant Player Encoding

*For any* set of players, each player should be identifiable by both color and text label (legend and tooltip), ensuring accessibility beyond color alone.

**Validates: Requirements 11.3**

### Property 16: Error Boundary Consistency

*For any* error thrown during rendering, the PaceComparisonChart should handle errors in the same manner as AttributeRadarChart (e.g., caught by error boundary).

**Validates: Requirements 12.5**

### Edge Cases

The following edge cases will be handled through property test generators and specific unit tests:

**Edge Case 1: Missing ACC or SPR Data**
- When a player has null/undefined ACC or SPR values, display "N/A" and render a zero-height bar
- **Validates: Requirements 4.3**

**Edge Case 2: No Similar Players**
- When similarPlayers array is empty, display only the searched player's bars
- **Validates: Requirements 9.1**

**Edge Case 3: Empty Player Names**
- When a player name is an empty string, display "Unknown Player"
- **Validates: Requirements 9.5**

### Configuration Examples

The following requirements are structural/configuration checks that will be verified through example-based unit tests:

- **Requirements 1.5**: Props interface compatibility (example test)
- **Requirements 2.3, 2.4**: Vertical orientation and Y-axis scale (example test)
- **Requirements 5.1, 5.2, 5.4**: Responsive container and height (example test)
- **Requirements 6.1, 6.2, 6.3**: Cyberpunk theme styling (example test)
- **Requirements 7.2**: Legend positioning (example test)
- **Requirements 8.2, 8.4**: Tooltip styling (example test)
- **Requirements 10.1, 10.3, 10.5**: Recharts component usage (example test)
- **Requirements 12.3**: Module export structure (example test)

## Error Handling

### Missing Data Handling

**Scenario**: Player has null/undefined ACC or SPR values

**Handling**:
1. Default the value to 0 for chart rendering
2. Display "N/A" in the numeric label
3. Render a zero-height bar to maintain visual consistency
4. Log a debug message (not a warning, as missing sub-attributes are expected)

**Implementation**:
```typescript
const accValue = player.detailed_stats?.Acceleration ?? 0;
const sprValue = player.detailed_stats?.Sprint_Speed ?? 0;
const accLabel = player.detailed_stats?.Acceleration !== undefined 
  ? player.detailed_stats.Acceleration.toString() 
  : 'N/A';
```

### Invalid Value Range

**Scenario**: ACC or SPR values are outside 0-99 range

**Handling**:
1. Clamp values to 0-99 range
2. Log a warning with player name and invalid value
3. Continue rendering with clamped value

**Implementation**:
```typescript
function clampValue(value: number, playerName: string, stat: string): number {
  if (value < 0 || value > 99) {
    console.warn(`Invalid ${stat} value ${value} for player ${playerName}. Clamping to 0-99 range.`);
    return Math.max(0, Math.min(99, value));
  }
  return value;
}
```

### Empty Similar Players Array

**Scenario**: No similar players provided (empty array)

**Handling**:
1. Render chart with only searched player's bars
2. Legend shows only searched player
3. Chart remains functional and visually consistent

**Implementation**:
```typescript
// No special handling needed - component naturally handles empty array
const allPlayers = [searchedPlayer, ...similarPlayers];
```

### Empty or Invalid Player Names

**Scenario**: Player name is empty string, null, or undefined

**Handling**:
1. Replace with "Unknown Player" fallback
2. Log a warning
3. Continue rendering

**Implementation**:
```typescript
function getPlayerName(player: Player): string {
  if (!player.name || player.name.trim() === '') {
    console.warn('Player with empty name detected. Using fallback.');
    return 'Unknown Player';
  }
  return player.name;
}
```

### Component Rendering Errors

**Scenario**: Unexpected error during component rendering

**Handling**:
1. Error should be caught by parent error boundary
2. Display fallback UI to user
3. Log error details for debugging
4. Maintain same error boundary behavior as AttributeRadarChart

**Implementation**:
```typescript
// Parent component should wrap in error boundary
<ErrorBoundary fallback={<ChartErrorFallback />}>
  {attributeCategory.toLowerCase() === 'pace' ? (
    <PaceComparisonChart {...props} />
  ) : (
    <AttributeRadarChart {...props} />
  )}
</ErrorBoundary>
```

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, error conditions, and configuration
**Property Tests**: Verify universal properties across all inputs

### Property-Based Testing Configuration

**Library**: `fast-check` (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: pace-comparison-visualization, Property {number}: {property_text}`

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';

describe('PaceComparisonChart Properties', () => {
  it('Property 1: Conditional rendering based on attribute category', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('pace'),
          fc.constant('PACE'),
          fc.constant('Pace'),
          fc.constant('shooting'),
          fc.constant('passing'),
          fc.constant('dribbling'),
          fc.constant('defending'),
          fc.constant('physical')
        ),
        (attributeCategory) => {
          // Test that 'pace' (case-insensitive) renders PaceComparisonChart
          // and other categories render AttributeRadarChart
          const isPace = attributeCategory.toLowerCase() === 'pace';
          // Assertion logic here
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Focus Areas

**Specific Examples**:
- Render with 1 player (searched only)
- Render with 2 players (searched + 1 similar)
- Render with 4 players (searched + 3 similar)
- Render with specific ACC/SPR values (e.g., 97/97 for Mbappé)

**Edge Cases**:
- Missing ACC data (null/undefined)
- Missing SPR data (null/undefined)
- Empty similar players array
- Empty player names
- Very long player names (truncation)

**Error Conditions**:
- Invalid value ranges (negative, > 99)
- Malformed player objects
- Missing detailed_stats object

**Configuration Checks**:
- Props interface matches AttributeRadarChart
- ResponsiveContainer is used
- Chart height is 400px
- Recharts components are properly configured
- Cyberpunk theme classes are applied
- ARIA labels are present

### Property Testing Focus Areas

**Universal Properties**:
- Conditional rendering (Property 1)
- Chart structure (Property 2, 3)
- Color assignment (Property 4)
- Numeric labels (Property 5)
- Title consistency (Property 6)
- Legend completeness (Property 7, 8, 9)
- Tooltip behavior (Property 10, 11)
- Data validation (Property 12, 13)
- Accessibility (Property 14, 15)
- Error handling (Property 16)

### Test Data Generators

**Player Generator**:
```typescript
const playerArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  club: fc.string(),
  nation: fc.string(),
  position: fc.string(),
  overall: fc.integer({ min: 0, max: 99 }),
  stats: fc.record({
    PAC: fc.integer({ min: 0, max: 99 }),
    SHO: fc.integer({ min: 0, max: 99 }),
    PAS: fc.integer({ min: 0, max: 99 }),
    DRI: fc.integer({ min: 0, max: 99 }),
    DEF: fc.integer({ min: 0, max: 99 }),
    PHY: fc.integer({ min: 0, max: 99 }),
  }),
  detailed_stats: fc.record({
    Acceleration: fc.option(fc.integer({ min: 0, max: 99 })),
    Sprint_Speed: fc.option(fc.integer({ min: 0, max: 99 })),
    // ... other stats
  }),
});
```

**Similar Players Generator**:
```typescript
const similarPlayersArbitrary = fc.array(playerArbitrary, { minLength: 0, maxLength: 3 });
```

**Attribute Category Generator**:
```typescript
const attributeCategoryArbitrary = fc.oneof(
  fc.constant('pace'),
  fc.constant('PACE'),
  fc.constant('Pace'),
  fc.constant('shooting'),
  fc.constant('passing'),
  fc.constant('dribbling'),
  fc.constant('defending'),
  fc.constant('physical')
);
```

### Integration Testing

**Parent Component Integration**:
- Verify conditional rendering logic in parent component
- Test that both chart types receive correct props
- Verify error boundary wraps both chart types
- Test that API response data flows correctly to charts

**Visual Regression Testing** (Optional):
- Capture screenshots of chart with different player counts
- Compare against baseline images
- Detect unintended visual changes

### Test Coverage Goals

- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Property Tests**: All 16 properties implemented
- **Edge Cases**: All 3 edge cases covered
- **Configuration Examples**: All structural checks verified

