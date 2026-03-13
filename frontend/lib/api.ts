/**
 * Scout AI API Client
 * * Axios-based HTTP client for backend communication.
 * Validates: Requirements 6.2, 6.4, 6.5, 9.3
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import { SearchResponse, AttributeSearchResponse } from './types';

// Define the dynamic URL for Vercel deployment vs Local testing
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create Axios instance configured for Scout AI backend.
 * Exported for testing purposes.
 */
export const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: BASE_URL, // Updated to use the dynamic variable
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Default API client instance
let apiClient: AxiosInstance = createApiClient();

/**
 * Set a custom API client instance (for testing).
 * @internal
 */
export const setApiClient = (client: AxiosInstance): void => {
  apiClient = client;
};

/**
 * Custom error class for API errors.
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Search for a player and get hidden gem recommendations.
 * * @param playerName - The name of the player to search for
 * @returns Promise<SearchResponse> - The searched player and hidden gems
 * @throws APIError - If the request fails or times out
 * * Validates:
 * - Requirements 6.2: Uses HTTP GET method to /search/{player_name}
 * - Requirements 6.4: Timeout after 5 seconds
 * - Requirements 6.5: Handles HTTP status codes (404, 500)
 * - Requirements 9.3: Network error handling
 */
export async function searchPlayer(playerName: string): Promise<SearchResponse> {
  try {
    // Encode player name for URL
    const encodedName = encodeURIComponent(playerName);
    
    // Make GET request to /search/{player_name}
    const response = await apiClient.get<SearchResponse>(`/search/${encodedName}`);
    
    // Return the response data
    return response.data;
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new APIError(
          'Request timed out. Please try again.',
          undefined,
          error
        );
      }
      
      // Handle network errors (backend unavailable)
      if (!axiosError.response) {
        throw new APIError(
          'Unable to connect to the server. Please check your connection.',
          undefined,
          error
        );
      }
      
      // Handle HTTP error responses
      const statusCode = axiosError.response.status;
      // FIXED: Removed "as any" and specified the exact expected error structure
      const errorMessage = axiosError.response.data as { detail?: string };
      
      if (statusCode === 404) {
        throw new APIError(
          errorMessage?.detail || `Player "${playerName}" not found.`,
          404,
          error
        );
      }
      
      if (statusCode === 500) {
        throw new APIError(
          'Server error. Please try again later.',
          500,
          error
        );
      }
      
      // Handle other HTTP errors
      throw new APIError(
        errorMessage?.detail || 'An unexpected error occurred.',
        statusCode,
        error
      );
    }
    
    // Handle non-Axios errors
    throw new APIError(
      'An unexpected error occurred.',
      undefined,
      error as Error
    );
  }
}

/**
 * Search for players similar to a target player based on a specific attribute category.
 * * @param playerName - The name of the player to search for
 * @param attributeCategory - One of: pace, shooting, passing, dribbling, defending, physical
 * @returns Promise<AttributeSearchResponse> - The searched player and similar players
 * @throws APIError - If the request fails, times out, or invalid category
 * * Validates:
 * - Requirements 4.1: Uses HTTP GET method to /search/{player_name}/attribute/{category}
 * - Requirements 4.4: Handles invalid attribute category (400)
 * - Requirements 9.1: Network error handling
 */
export async function searchPlayerByAttribute(
  playerName: string,
  attributeCategory: string
): Promise<AttributeSearchResponse> {
  try {
    // Encode player name for URL
    const encodedName = encodeURIComponent(playerName);
    
    // Make GET request to /search/{player_name}/attribute/{category}
    const response = await apiClient.get<AttributeSearchResponse>(
      `/search/${encodedName}/attribute/${attributeCategory}`
    );
    
    // Return the response data
    return response.data;
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new APIError(
          'Request timed out. Please try again.',
          undefined,
          error
        );
      }
      
      // Handle network errors (backend unavailable)
      if (!axiosError.response) {
        throw new APIError(
          'Unable to connect to the server. Please check your connection.',
          undefined,
          error
        );
      }
      
      // Handle HTTP error responses
      const statusCode = axiosError.response.status;
      // FIXED: Removed "as any" and specified the exact expected error structure
      const errorMessage = axiosError.response.data as { detail?: string };
      
      if (statusCode === 400) {
        throw new APIError(
          errorMessage?.detail || 'Invalid attribute category.',
          400,
          error
        );
      }
      
      if (statusCode === 404) {
        throw new APIError(
          errorMessage?.detail || `Player "${playerName}" not found.`,
          404,
          error
        );
      }
      
      if (statusCode === 500) {
        throw new APIError(
          'Server error. Please try again later.',
          500,
          error
        );
      }
      
      // Handle other HTTP errors
      throw new APIError(
        errorMessage?.detail || 'An unexpected error occurred.',
        statusCode,
        error
      );
    }
    
    // Handle non-Axios errors
    throw new APIError(
      'An unexpected error occurred.',
      undefined,
      error as Error
    );
  }
}