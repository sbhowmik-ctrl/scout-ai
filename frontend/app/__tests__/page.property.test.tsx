/**
 * Property-Based Tests for Search Results Page
 * 
 * Tests universal properties for attribute search integration.
 * Uses fast-check for property-based testing.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import fc from 'fast-check';
import Home from '../page';
import * as api from '@/lib/api';
import { SearchResponse, AttributeSearchResponse, Player } from '@/lib/types';

// Mock the API module
jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock Recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  Legend: () => <div />,
  Tooltip: () => <div />,
  // BarChart components for PaceComparisonChart
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
}));

// Helper to create a mock player
const createMockPlayer = (name: string, overall: number): Player => ({
  name,
  club: 'Test Club',
  nation: 'Test Nation',
  position: 'ST',
  overall,
  stats: {
    PAC: 80,
    SHO: 85,
    PAS: 75,
    DRI: 82,
    DEF: 40,
    PHY: 78,
  },
  detailed_stats: {
    PAC: 80,
    SHO: 85,
    PAS: 75,
    DRI: 82,
    DEF: 40,
    PHY: 78,
    Acceleration: 82,
    Sprint_Speed: 78,
    Positioning: 88,
    Finishing: 87,
    Shot_Power: 85,
    Long_Shots: 80,
    Volleys: 75,
    Penalties: 82,
    Vision: 78,
    Crossing: 72,
    Free_Kick_Accuracy: 70,
    Short_Passing: 76,
    Long_Passing: 74,
    Curve: 75,
    Agility: 85,
    Balance: 80,
    Reactions: 88,
    Ball_Control: 86,
    Dribbling: 84,
    Composure: 82,
    Interceptions: 35,
    Heading_Accuracy: 65,
    Def_Awareness: 38,
    Standing_Tackle: 42,
    Sliding_Tackle: 40,
    Jumping: 75,
    Stamina: 80,
    Strength: 78,
    Aggression: 70,
  },
});

// Helper to create mock search response
const createMockSearchResponse = (playerName: string): SearchResponse => ({
  searched_player: createMockPlayer(playerName, 85),
  hidden_gems: [
    createMockPlayer('Hidden Gem 1', 78),
    createMockPlayer('Hidden Gem 2', 76),
  ],
});

// Helper to create mock attribute search response
const createMockAttributeResponse = (
  playerName: string,
  attribute: string
): AttributeSearchResponse => ({
  searched_player: createMockPlayer(playerName, 85),
  similar_players: [
    createMockPlayer('Similar 1', 86),
    createMockPlayer('Similar 2', 84),
    createMockPlayer('Similar 3', 83),
  ],
  attribute_category: attribute,
});

describe('Page Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  /**
   * Property 2: Frontend Attribute Switching Without Re-search
   * **Validates: Requirements 1.3**
   * 
   * For any player search result, switching between attribute categories
   * should not trigger a new player search, only attribute-specific searches.
   */
  test('Property 2: Switching attributes does not trigger player re-search', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'),
        fc.constantFrom('pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'),
        async (attr1, attr2) => {
          // Setup: Mock API responses
          const playerName = 'Test Player';
          const searchResponse = createMockSearchResponse(playerName);
          const attr1Response = createMockAttributeResponse(playerName, attr1);
          const attr2Response = createMockAttributeResponse(playerName, attr2);

          mockedApi.searchPlayer.mockResolvedValue(searchResponse);
          mockedApi.searchPlayerByAttribute.mockImplementation(async (name, attr) => {
            if (attr === attr1) return attr1Response;
            if (attr === attr2) return attr2Response;
            throw new Error(`Unexpected attribute: ${attr}`);
          });

          // Render component
          const { unmount } = render(<Home />);

          try {
            // Step 1: Search for player
            const searchInput = screen.getByPlaceholderText(/enter player name/i);
            
            await act(async () => {
              fireEvent.change(searchInput, { target: { value: playerName } });
              const searchButton = screen.getByRole('button', { name: /search/i });
              fireEvent.click(searchButton);
              
              // Wait for debounce (300ms)
              jest.advanceTimersByTime(300);
            });

            // Wait for search to complete
            await waitFor(() => {
              expect(mockedApi.searchPlayer).toHaveBeenCalledTimes(1);
            });

            // Wait for results to appear
            await waitFor(() => {
              expect(screen.getByText(/SEARCHED PLAYER/i)).toBeInTheDocument();
            });

            // Record initial searchPlayer call count
            const initialSearchPlayerCalls = mockedApi.searchPlayer.mock.calls.length;

            // Step 2: Select first attribute
            const attr1Button = screen.getByRole('button', { 
              name: new RegExp(`Select ${attr1} attribute`, 'i') 
            });
            
            await act(async () => {
              fireEvent.click(attr1Button);
            });

            // Wait for attribute search to complete
            await waitFor(() => {
              expect(mockedApi.searchPlayerByAttribute).toHaveBeenCalled();
            });

            // Step 3: Select second attribute (if different)
            if (attr1 !== attr2) {
              const attr2Button = screen.getByRole('button', { 
                name: new RegExp(`Select ${attr2} attribute`, 'i') 
              });
              
              await act(async () => {
                fireEvent.click(attr2Button);
              });

              // Wait a bit for any potential calls
              await act(async () => {
                jest.advanceTimersByTime(100);
              });
            }

            // Property assertion: searchPlayer should NOT be called again after initial search
            // (switching attributes should not re-search the player)
            const finalSearchPlayerCalls = mockedApi.searchPlayer.mock.calls.length;
            expect(finalSearchPlayerCalls).toBe(initialSearchPlayerCalls);
          } finally {
            // Clean up
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for faster execution
    );
  });

  /**
   * Property 13: Frontend Result Caching
   * **Validates: Requirements 8.3**
   * 
   * For any player and attribute category combination, if the same search
   * is performed twice, the second request should use cached results without
   * making an API call.
   */
  test('Property 13: Repeated attribute searches use cached results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'),
        async (attribute) => {
          // Setup: Mock API responses
          const playerName = 'Test Player';
          const searchResponse = createMockSearchResponse(playerName);
          const attributeResponse = createMockAttributeResponse(playerName, attribute);

          mockedApi.searchPlayer.mockResolvedValue(searchResponse);
          mockedApi.searchPlayerByAttribute.mockResolvedValue(attributeResponse);

          // Render component
          const { unmount } = render(<Home />);

          try {
            // Step 1: Search for player
            const searchInput = screen.getByPlaceholderText(/enter player name/i);
            
            await act(async () => {
              fireEvent.change(searchInput, { target: { value: playerName } });
              const searchButton = screen.getByRole('button', { name: /search/i });
              fireEvent.click(searchButton);
              
              // Wait for debounce (300ms)
              jest.advanceTimersByTime(300);
            });

            // Wait for search to complete
            await waitFor(() => {
              expect(screen.getByText(/SEARCHED PLAYER/i)).toBeInTheDocument();
            });

            // Step 2: Select attribute for the first time
            const attributeButton = screen.getByRole('button', { 
              name: new RegExp(`Select ${attribute} attribute`, 'i') 
            });
            
            await act(async () => {
              fireEvent.click(attributeButton);
            });

            // Wait for attribute search to complete
            await waitFor(() => {
              expect(mockedApi.searchPlayerByAttribute).toHaveBeenCalledTimes(1);
            });

            // Step 3: Select a different attribute
            const otherAttribute = attribute === 'pace' ? 'shooting' : 'pace';
            const otherButton = screen.getByRole('button', { 
              name: new RegExp(`Select ${otherAttribute} attribute`, 'i') 
            });
            
            await act(async () => {
              fireEvent.click(otherButton);
            });

            // Wait for second attribute search
            await waitFor(() => {
              expect(mockedApi.searchPlayerByAttribute).toHaveBeenCalledTimes(2);
            });

            // Step 4: Select the original attribute again
            await act(async () => {
              fireEvent.click(attributeButton);
            });

            // Wait a bit to ensure no new API call is made
            await act(async () => {
              jest.advanceTimersByTime(100);
            });

            // Property assertion: searchPlayerByAttribute should still only have been called twice
            // (third selection should use cache)
            expect(mockedApi.searchPlayerByAttribute).toHaveBeenCalledTimes(2);
          } finally {
            // Clean up
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for faster execution
    );
  });

  /**
   * Property 15: Backward Compatibility Preservation
   * **Validates: Requirements 10.5**
   * 
   * For any player search without attribute selection, the system should
   * return hidden gems results using the original search functionality unchanged.
   */
  test('Property 15: Searches without attribute selection return hidden gems results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Messi', 'Ronaldo', 'Neymar', 'Mbappe', 'Haaland', 'Salah', 'De Bruyne', 'Lewandowski', 'Benzema', 'Kane'),
        async (playerName) => {
          // Setup: Mock API response
          const searchResponse = createMockSearchResponse(playerName);

          mockedApi.searchPlayer.mockResolvedValue(searchResponse);

          // Render component
          const { unmount } = render(<Home />);

          try {
            // Step 1: Search for player
            const searchInput = screen.getByPlaceholderText(/enter player name/i);
            
            await act(async () => {
              fireEvent.change(searchInput, { target: { value: playerName } });
              const searchButton = screen.getByRole('button', { name: /search/i });
              fireEvent.click(searchButton);
              
              // Wait for debounce (300ms)
              jest.advanceTimersByTime(300);
            });

            // Wait for search to complete
            await waitFor(() => {
              expect(mockedApi.searchPlayer).toHaveBeenCalledWith(playerName);
            });

            // Wait for results to appear
            await waitFor(() => {
              expect(screen.getByText(/SEARCHED PLAYER/i)).toBeInTheDocument();
            });

            // Property assertion: Hidden gems section should be displayed
            // (original functionality preserved)
            expect(screen.getByText(/\[ HIDDEN GEMS \]/i)).toBeInTheDocument();
            
            // Attribute selector should be present but no attribute results shown
            expect(screen.getByText(/SEARCH BY ATTRIBUTE/i)).toBeInTheDocument();
            
            // No attribute comparison should be shown yet
            expect(screen.queryByText(/COMPARISON/i)).not.toBeInTheDocument();
          } finally {
            // Clean up
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for faster execution
    );
  });
});
