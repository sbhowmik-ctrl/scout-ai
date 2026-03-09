/**
 * Unit tests for API client
 * 
 * Tests searchPlayer function with mocked Axios responses,
 * timeout handling, and error response handling.
 */

import axios, { AxiosInstance } from 'axios';
import { searchPlayer, searchPlayerByAttribute, APIError, setApiClient } from '../api';
import { SearchResponse, AttributeSearchResponse } from '../types';

// Mock axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    } as any;
    
    // Set the mock instance for testing
    setApiClient(mockAxiosInstance);
  });

  describe('searchPlayer', () => {
    const mockSearchResponse: SearchResponse = {
      searched_player: {
        name: 'Kylian Mbappé',
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
          name: 'Rafael Leão',
          club: 'AC Milan',
          nation: 'Portugal',
          position: 'LW',
          overall: 84,
          stats: {
            PAC: 95,
            SHO: 78,
            PAS: 75,
            DRI: 90,
            DEF: 35,
            PHY: 75,
          },
        },
      ],
    };

    it('should successfully fetch search results for a valid player', async () => {
      // Mock successful response
      mockAxiosInstance.get.mockResolvedValue({ data: mockSearchResponse });

      const result = await searchPlayer('Kylian Mbappé');

      expect(result).toEqual(mockSearchResponse);
      expect(result.searched_player.name).toBe('Kylian Mbappé');
      expect(result.hidden_gems).toHaveLength(1);
    });

    it('should encode player names with special characters', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockSearchResponse });

      await searchPlayer('Kylian Mbappé');

      // Check that the player name was encoded
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/Kylian%20Mbapp%C3%A9');
    });

    it('should throw APIError with 404 status when player is not found', async () => {
      // Mock 404 response
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { detail: 'Player "Unknown Player" not found' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayer('Unknown Player')).rejects.toThrow(APIError);
      await expect(searchPlayer('Unknown Player')).rejects.toThrow(
        'Player "Unknown Player" not found'
      );
    });

    it('should throw APIError with 500 status on server error', async () => {
      // Mock 500 response
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayer('Test Player')).rejects.toThrow(APIError);
      await expect(searchPlayer('Test Player')).rejects.toThrow(
        'Server error. Please try again later.'
      );
    });

    it('should throw APIError on timeout', async () => {
      // Mock timeout error
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        response: undefined,
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayer('Test Player')).rejects.toThrow(APIError);
      await expect(searchPlayer('Test Player')).rejects.toThrow(
        'Request timed out. Please try again.'
      );
    });

    it('should throw APIError on network error (backend unavailable)', async () => {
      // Mock network error (no response)
      const error = {
        isAxiosError: true,
        response: undefined,
        code: 'ERR_NETWORK',
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayer('Test Player')).rejects.toThrow(APIError);
      await expect(searchPlayer('Test Player')).rejects.toThrow(
        'Unable to connect to the server. Please check your connection.'
      );
    });

    it('should handle non-Axios errors gracefully', async () => {
      // Mock non-Axios error
      const error = new Error('Unexpected error');
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(searchPlayer('Test Player')).rejects.toThrow(APIError);
      await expect(searchPlayer('Test Player')).rejects.toThrow(
        'An unexpected error occurred.'
      );
    });

    it('should include status code in APIError for HTTP errors', async () => {
      // Mock 404 response
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await searchPlayer('Unknown Player');
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(APIError);
        expect((err as APIError).statusCode).toBe(404);
      }
    });
  });

  describe('searchPlayerByAttribute', () => {
    const mockAttributeSearchResponse: AttributeSearchResponse = {
      searched_player: {
        name: 'Kylian Mbappé',
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
        detailed_stats: {
          PAC: 97,
          SHO: 89,
          PAS: 80,
          DRI: 92,
          DEF: 36,
          PHY: 77,
          Acceleration: 97,
          Sprint_Speed: 97,
        },
      },
      similar_players: [
        {
          name: 'Adama Traoré',
          club: 'Wolverhampton Wanderers',
          nation: 'Spain',
          position: 'RW',
          overall: 79,
          stats: {
            PAC: 96,
            SHO: 64,
            PAS: 66,
            DRI: 82,
            DEF: 34,
            PHY: 84,
          },
          detailed_stats: {
            PAC: 96,
            SHO: 64,
            PAS: 66,
            DRI: 82,
            DEF: 34,
            PHY: 84,
            Acceleration: 96,
            Sprint_Speed: 96,
          },
        },
      ],
      attribute_category: 'pace',
    };

    it('should successfully fetch attribute search results for valid inputs', async () => {
      // Mock successful response
      mockAxiosInstance.get.mockResolvedValue({ data: mockAttributeSearchResponse });

      const result = await searchPlayerByAttribute('Kylian Mbappé', 'pace');

      expect(result).toEqual(mockAttributeSearchResponse);
      expect(result.searched_player.name).toBe('Kylian Mbappé');
      expect(result.similar_players).toHaveLength(1);
      expect(result.attribute_category).toBe('pace');
    });

    it('should encode player names with special characters', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockAttributeSearchResponse });

      await searchPlayerByAttribute('Kylian Mbappé', 'pace');

      // Check that the player name was encoded
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/Kylian%20Mbapp%C3%A9/attribute/pace');
    });

    it('should use the correct endpoint format', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockAttributeSearchResponse });

      await searchPlayerByAttribute('Test Player', 'shooting');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/Test%20Player/attribute/shooting');
    });

    it('should throw APIError with 400 status for invalid attribute category', async () => {
      // Mock 400 response
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { detail: 'Invalid attribute category. Must be one of: pace, shooting, passing, dribbling, defending, physical' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayerByAttribute('Test Player', 'invalid')).rejects.toThrow(APIError);
      await expect(searchPlayerByAttribute('Test Player', 'invalid')).rejects.toThrow(
        'Invalid attribute category'
      );
    });

    it('should throw APIError with 404 status when player is not found', async () => {
      // Mock 404 response
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { detail: 'Player "Unknown Player" not found' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayerByAttribute('Unknown Player', 'pace')).rejects.toThrow(APIError);
      await expect(searchPlayerByAttribute('Unknown Player', 'pace')).rejects.toThrow(
        'Player "Unknown Player" not found'
      );
    });

    it('should throw APIError on timeout', async () => {
      // Mock timeout error
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        response: undefined,
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(APIError);
      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(
        'Request timed out. Please try again.'
      );
    });

    it('should throw APIError on network error (backend unavailable)', async () => {
      // Mock network error (no response)
      const error = {
        isAxiosError: true,
        response: undefined,
        code: 'ERR_NETWORK',
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(APIError);
      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(
        'Unable to connect to the server. Please check your connection.'
      );
    });

    it('should throw APIError with 500 status on server error', async () => {
      // Mock 500 response
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(APIError);
      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(
        'Server error. Please try again later.'
      );
    });

    it('should include status code in APIError for HTTP errors', async () => {
      // Mock 400 response
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { detail: 'Invalid category' },
        },
      };
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      try {
        await searchPlayerByAttribute('Test Player', 'invalid');
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(APIError);
        expect((err as APIError).statusCode).toBe(400);
      }
    });

    it('should handle non-Axios errors gracefully', async () => {
      // Mock non-Axios error
      const error = new Error('Unexpected error');
      
      mockAxiosInstance.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(APIError);
      await expect(searchPlayerByAttribute('Test Player', 'pace')).rejects.toThrow(
        'An unexpected error occurred.'
      );
    });

    it('should work with all valid attribute categories', async () => {
      const validCategories = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
      
      for (const category of validCategories) {
        mockAxiosInstance.get.mockResolvedValue({
          data: { ...mockAttributeSearchResponse, attribute_category: category },
        });

        const result = await searchPlayerByAttribute('Test Player', category);
        expect(result.attribute_category).toBe(category);
      }
    });
  });

});
