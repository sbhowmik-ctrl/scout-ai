/**
 * SearchBar Component
 * 
 * Central search input for player name queries.
 * Validates: Requirements 1.1, 1.4, 5.4, 9.4
 */

'use client';

import { useState, FormEvent } from 'react';

/**
 * Props for the SearchBar component.
 */
export interface SearchBarProps {
  /** Callback function called when search is submitted with valid input */
  onSearch: (playerName: string) => void;
  /** Whether a search is currently in progress */
  isLoading: boolean;
}

/**
 * SearchBar component with cyberpunk styling.
 * 
 * Features:
 * - Large centered input field with search icon
 * - Controlled input with useState
 * - Prevents empty search submissions (Requirement 1.4)
 * - Displays loading state during API calls (Requirement 9.4)
 * - Cyberpunk dark theme: green text on black background (Requirement 5.4)
 */
export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');

  /**
   * Handle form submission.
   * Prevents empty submissions and calls onSearch callback.
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent empty search submissions (Requirement 1.4)
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') {
      return;
    }
    
    // Call onSearch callback with player name
    onSearch(trimmedValue);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-cyber-green-light animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Large Centered Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="&gt; Enter player name (e.g., Kylian Mbappe)_"
            disabled={isLoading}
            className="flex-1 px-6 py-4 text-2xl bg-cyber-black text-cyber-green border-2 border-cyber-green rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-green-light focus:border-transparent focus:shadow-neon-green-sm placeholder-cyber-gray disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-wide"
            aria-label="Player name search"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || inputValue.trim() === ''}
            className="px-8 py-4 text-xl font-bold bg-cyber-green text-cyber-black rounded-lg hover:bg-cyber-green-light focus:outline-none focus:ring-2 focus:ring-cyber-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-neon-green tracking-wider"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                {/* Loading Spinner */}
                <svg
                  className="animate-spin h-6 w-6 text-cyber-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                SEARCHING...
              </span>
            ) : (
              '[ SEARCH ]'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
