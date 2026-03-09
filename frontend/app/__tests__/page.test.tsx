/**
 * Integration Tests for Main Page (Home)
 * 
 * Tests:
 * - Complete search flow with mocked API
 * - Error handling scenarios
 * - Radar chart display on gem selection
 * 
 * Validates: Requirements 1.1, 4.1, 9.1, 9.2, 9.3, 9.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';
import * as api from '@/lib/api';
import { SearchResponse } from '@/lib/types';

// Mock the API module
jest.mock('@/lib/api');

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

describe('Home Page Integration Tests', () => {
  const mockSearchResponse: SearchResponse = {
    searched_player: {
      name: 'Kylian Mbappe',
      club: 'Paris Saint-Germain',
      nation: 'France',
      position: 'ST',
      overall: 91,
      stats: {
        PAC: 97,
        SHO: 89,
        PAS: 80,
        DRI: 92,
        DEF: 36,
        PHY: 77,
      },
    },
    hidden_gems: [
      {
        name: 'Vinicius Junior',
        club: 'Real Madrid',
        nation: 'Brazil',
        position: 'LW',
        overall: 86,
        stats: {
          PAC: 95,
          SHO: 83,
          PAS: 79,
          DRI: 90,
          DEF: 29,
          PHY: 68,
        },
      },
      {
        name: 'Rafael Leao',
        club: 'AC Milan',
        nation: 'Portugal',
        position: 'LW',
        overall: 84,
        stats: {
          PAC: 93,
          SHO: 82,
          PAS: 75,
          DRI: 88,
          DEF: 32,
          PHY: 76,
        },
      },
      {
        name: 'Khvicha Kvaratskhelia',
        club: 'Napoli',
        nation: 'Georgia',
        position: 'LW',
        overall: 83,
        stats: {
          PAC: 91,
          SHO: 80,
          PAS: 78,
          DRI: 89,
          DEF: 30,
          PHY: 70,
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete Search Flow', () => {
    it('should display searched player and hidden gems after successful search', async () => {
      const mockSearchPlayer = jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      // Find and fill search input
      const input = screen.getByPlaceholderText(/enter player name/i);
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });

      // Submit search
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      // Fast-forward debounce timer (300ms)
      jest.advanceTimersByTime(300);

      // Wait for API call and results to render
      await waitFor(() => {
        expect(mockSearchPlayer).toHaveBeenCalledWith('Kylian Mbappe');
      });

      await waitFor(() => {
        // Check searched player is displayed (with > prefix)
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Kylian Mbappe';
        })).toBeInTheDocument();
        expect(screen.getByText('Paris Saint-Germain')).toBeInTheDocument();

        // Check hidden gems are displayed (with > prefix)
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Vinicius Junior';
        })).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Rafael Leao';
        })).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Khvicha Kvaratskhelia';
        })).toBeInTheDocument();
      });
    });

    it('should debounce search requests (300ms)', async () => {
      const mockSearchPlayer = jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Trigger multiple searches rapidly
      fireEvent.change(input, { target: { value: 'M' } });
      fireEvent.click(searchButton);

      jest.advanceTimersByTime(100);

      fireEvent.change(input, { target: { value: 'Mb' } });
      fireEvent.click(searchButton);

      jest.advanceTimersByTime(100);

      fireEvent.change(input, { target: { value: 'Mbappe' } });
      fireEvent.click(searchButton);

      // Only advance to complete the last debounce
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        // Should only call API once (last search)
        expect(mockSearchPlayer).toHaveBeenCalledTimes(1);
        expect(mockSearchPlayer).toHaveBeenCalledWith('Mbappe');
      });
    });

    it('should cache search results and avoid redundant API calls', async () => {
      const mockSearchPlayer = jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // First search
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockSearchPlayer).toHaveBeenCalledTimes(1);
      });

      // Clear input
      fireEvent.change(input, { target: { value: '' } });

      // Search for same player again
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        // Should still only have called API once (cached)
        expect(mockSearchPlayer).toHaveBeenCalledTimes(1);
      });

      // Verify results are still displayed
      expect(screen.getByText((content, element) => {
        return element?.textContent === '> Kylian Mbappe';
      })).toBeInTheDocument();
    });

    it('should display "No Hidden Gems" message when hidden_gems array is empty', async () => {
      const emptyGemsResponse: SearchResponse = {
        ...mockSearchResponse,
        hidden_gems: [],
      };

      jest.spyOn(api, 'searchPlayer').mockResolvedValue(emptyGemsResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Lionel Messi' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/no hidden gems found/i)).toBeInTheDocument();
        expect(screen.getByText(/already undervalued/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Scenarios', () => {
    // Use real timers for error handling tests
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should display error message when player is not found (404)', async () => {
      const notFoundError = new api.APIError('Player "Unknown Player" not found.', 404);
      jest.spyOn(api, 'searchPlayer').mockRejectedValue(notFoundError);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Unknown Player' } });
      fireEvent.click(searchButton);

      // Wait for error to appear (with real timers, debounce will happen naturally)
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/player "unknown player" not found/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display connection error when backend is unavailable', async () => {
      const connectionError = new api.APIError('Unable to connect to the server. Please check your connection.');
      jest.spyOn(api, 'searchPlayer').mockRejectedValue(connectionError);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Test Player' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to connect to the server/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display generic error for unexpected errors', async () => {
      const unexpectedError = new Error('Something went wrong');
      jest.spyOn(api, 'searchPlayer').mockRejectedValue(unexpectedError);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Test Player' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should allow retry after error', async () => {
      const error = new api.APIError('Player not found.', 404);
      const mockSearchPlayer = jest.spyOn(api, 'searchPlayer')
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // First search (fails)
      fireEvent.change(input, { target: { value: 'Bad Name' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/player not found/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/player not found/i)).not.toBeInTheDocument();
      });

      // Try search again (succeeds)
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/kylian mbappe/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show loading indicator during search', async () => {
      let resolveSearch: any;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      
      jest.spyOn(api, 'searchPlayer').mockReturnValue(searchPromise as any);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Test Player' } });
      fireEvent.click(searchButton);

      // Wait for loading state (with real timers, debounce will happen naturally)
      await waitFor(() => {
        expect(screen.getByText(/searching/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Resolve the search
      resolveSearch(mockSearchResponse);
    });
  });

  describe('Radar Chart Display', () => {
    it('should display radar chart modal when hidden gem is clicked', async () => {
      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Perform search
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Vinicius Junior';
        })).toBeInTheDocument();
      });

      // Click on first hidden gem
      const hiddenGemCard = screen.getByText((content, element) => {
        return element?.textContent === '> Vinicius Junior';
      }).closest('div[role="button"]');
      expect(hiddenGemCard).toBeInTheDocument();
      fireEvent.click(hiddenGemCard!);

      // Radar chart modal should appear
      await waitFor(() => {
        expect(screen.getByText(/player comparison/i)).toBeInTheDocument();
        expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      });
    });

    it('should close radar chart modal when close button is clicked', async () => {
      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Perform search
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Vinicius Junior';
        })).toBeInTheDocument();
      });

      // Click on hidden gem to open modal
      const hiddenGemCard = screen.getByText((content, element) => {
        return element?.textContent === '> Vinicius Junior';
      }).closest('div[role="button"]');
      fireEvent.click(hiddenGemCard!);

      await waitFor(() => {
        expect(screen.getByText(/player comparison/i)).toBeInTheDocument();
      });

      // Close modal using the X button (aria-label="Close comparison")
      const closeButtons = screen.getAllByRole('button', { name: /close comparison/i });
      const xButton = closeButtons.find(btn => btn.getAttribute('aria-label') === 'Close comparison');
      fireEvent.click(xButton!);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText(/player comparison/i)).not.toBeInTheDocument();
      });
    });

    it('should update radar chart when different hidden gem is selected', async () => {
      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Perform search
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.textContent === '> Vinicius Junior';
        })).toBeInTheDocument();
      });

      // Click first hidden gem
      const firstGem = screen.getByText((content, element) => {
        return element?.textContent === '> Vinicius Junior';
      }).closest('div[role="button"]');
      fireEvent.click(firstGem!);

      await waitFor(() => {
        // Check for comparison text in modal
        expect(screen.getByText(/kylian mbappe vs vinicius junior/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButtons = screen.getAllByRole('button', { name: /close comparison/i });
      const xButton = closeButtons.find(btn => btn.getAttribute('aria-label') === 'Close comparison');
      fireEvent.click(xButton!);

      await waitFor(() => {
        expect(screen.queryByText(/player comparison/i)).not.toBeInTheDocument();
      });

      // Click second hidden gem
      const secondGem = screen.getByText((content, element) => {
        return element?.textContent === '> Rafael Leao';
      }).closest('div[role="button"]');
      fireEvent.click(secondGem!);

      await waitFor(() => {
        // Check for new comparison text
        expect(screen.getByText(/kylian mbappe vs rafael leao/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI Layout and Display', () => {
    it('should display header with title', () => {
      render(<Home />);

      expect(screen.getByText(/scout ai: hidden gems/i)).toBeInTheDocument();
      expect(screen.getByText(/discover undervalued players/i)).toBeInTheDocument();
    });

    it('should display footer', () => {
      render(<Home />);

      expect(screen.getByText(/powered by fc 24 data/i)).toBeInTheDocument();
    });

    it('should separate searched player from hidden gems visually', async () => {
      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/\[ searched player \]/i)).toBeInTheDocument();
        expect(screen.getByText(/hidden gems.*similar players/i)).toBeInTheDocument();
      });
    });

    it('should display hidden gem badges on recommendation cards', async () => {
      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        // Should have 3 hidden gem badges (one for each recommendation)
        // Filter to only get the badge elements, not the section header
        const badges = screen.getAllByText(/💎 hidden gem/i).filter(
          (el) => el.classList.contains('rounded-full')
        );
        expect(badges).toHaveLength(3);
      });
    });
  });

  describe('Attribute Search Integration', () => {
    it('should render AttributeSelector when search results are displayed', async () => {
      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/SEARCH BY ATTRIBUTE/i)).toBeInTheDocument();
      });

      // All 6 attribute buttons should be present
      expect(screen.getByRole('button', { name: /Select Pace attribute/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Shooting attribute/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Passing attribute/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Dribbling attribute/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Defending attribute/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Physical attribute/i })).toBeInTheDocument();
    });

    it('should call searchPlayerByAttribute when attribute is selected', async () => {
      const mockAttributeResponse = {
        searched_player: mockSearchResponse.searched_player,
        similar_players: [
          {
            name: 'Erling Haaland',
            club: 'Manchester City',
            nation: 'Norway',
            position: 'ST',
            overall: 88,
            stats: {
              PAC: 89,
              SHO: 91,
              PAS: 65,
              DRI: 80,
              DEF: 45,
              PHY: 88,
            },
            detailed_stats: {
              PAC: 89,
              SHO: 91,
              PAS: 65,
              DRI: 80,
              DEF: 45,
              PHY: 88,
              Acceleration: 89,
              Sprint_Speed: 89,
              Positioning: 93,
              Finishing: 94,
              Shot_Power: 91,
              Long_Shots: 85,
              Volleys: 88,
              Penalties: 84,
            },
          },
        ],
        attribute_category: 'shooting',
      };

      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);
      jest.spyOn(api, 'searchPlayerByAttribute').mockResolvedValue(mockAttributeResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/SEARCH BY ATTRIBUTE/i)).toBeInTheDocument();
      });

      // Click shooting attribute
      const shootingButton = screen.getByRole('button', { name: /Select Shooting attribute/i });
      fireEvent.click(shootingButton);

      await waitFor(() => {
        expect(api.searchPlayerByAttribute).toHaveBeenCalledWith('Kylian Mbappe', 'shooting');
      });
    });

    it('should display AttributeRadarChart when attribute results are loaded', async () => {
      const mockAttributeResponse = {
        searched_player: mockSearchResponse.searched_player,
        similar_players: [
          {
            name: 'Erling Haaland',
            club: 'Manchester City',
            nation: 'Norway',
            position: 'ST',
            overall: 88,
            stats: {
              PAC: 89,
              SHO: 91,
              PAS: 65,
              DRI: 80,
              DEF: 45,
              PHY: 88,
            },
            detailed_stats: {
              PAC: 89,
              SHO: 91,
              PAS: 65,
              DRI: 80,
              DEF: 45,
              PHY: 88,
              Acceleration: 89,
              Sprint_Speed: 89,
              Positioning: 93,
              Finishing: 94,
              Shot_Power: 91,
              Long_Shots: 85,
              Volleys: 88,
              Penalties: 84,
            },
          },
        ],
        attribute_category: 'shooting',
      };

      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);
      jest.spyOn(api, 'searchPlayerByAttribute').mockResolvedValue(mockAttributeResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/SEARCH BY ATTRIBUTE/i)).toBeInTheDocument();
      });

      // Click shooting attribute
      const shootingButton = screen.getByRole('button', { name: /Select Shooting attribute/i });
      fireEvent.click(shootingButton);

      await waitFor(() => {
        expect(screen.getByText(/SHOOTING COMPARISON/i)).toBeInTheDocument();
      });
    });

    it('should show loading indicator during attribute search', async () => {
      let resolveAttributeSearch: any;
      const attributeSearchPromise = new Promise((resolve) => {
        resolveAttributeSearch = resolve;
      });

      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);
      jest.spyOn(api, 'searchPlayerByAttribute').mockReturnValue(attributeSearchPromise as any);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/SEARCH BY ATTRIBUTE/i)).toBeInTheDocument();
      });

      // Click shooting attribute
      const shootingButton = screen.getByRole('button', { name: /Select Shooting attribute/i });
      fireEvent.click(shootingButton);

      // Should show loading indicator
      await waitFor(() => {
        expect(screen.getByText(/Loading attribute search results/i)).toBeInTheDocument();
      });

      // Resolve the search
      resolveAttributeSearch({
        searched_player: mockSearchResponse.searched_player,
        similar_players: [],
        attribute_category: 'shooting',
      });
    });

    it('should cache attribute search results and not call API again for same attribute', async () => {
      // Use real timers for this test
      jest.useRealTimers();

      const mockPaceResponse = {
        searched_player: mockSearchResponse.searched_player,
        similar_players: [],
        attribute_category: 'pace',
      };

      const mockShootingResponse = {
        searched_player: mockSearchResponse.searched_player,
        similar_players: [],
        attribute_category: 'shooting',
      };

      jest.spyOn(api, 'searchPlayer').mockResolvedValue(mockSearchResponse);
      const mockSearchPlayerByAttribute = jest.spyOn(api, 'searchPlayerByAttribute')
        .mockResolvedValueOnce(mockPaceResponse)
        .mockResolvedValueOnce(mockShootingResponse);

      render(<Home />);

      const input = screen.getByPlaceholderText(/enter player name/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      fireEvent.click(searchButton);

      // Wait for search to complete (with real timers, debounce will happen naturally)
      await waitFor(() => {
        expect(screen.getByText(/SEARCH BY ATTRIBUTE/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Click pace attribute
      const paceButton = screen.getByRole('button', { name: /Select Pace attribute/i });
      fireEvent.click(paceButton);

      await waitFor(() => {
        expect(mockSearchPlayerByAttribute).toHaveBeenCalledTimes(1);
      });

      // Click shooting attribute
      const shootingButton = screen.getByRole('button', { name: /Select Shooting attribute/i });
      fireEvent.click(shootingButton);

      await waitFor(() => {
        expect(mockSearchPlayerByAttribute).toHaveBeenCalledTimes(2);
      });

      // Click pace attribute again - should use cache
      fireEvent.click(paceButton);

      // Wait a bit to ensure no new API call
      await waitFor(() => {
        // Should still only have 2 calls (cached)
        expect(mockSearchPlayerByAttribute).toHaveBeenCalledTimes(2);
      });

      // Restore fake timers
      jest.useFakeTimers();
    });
  });
});
