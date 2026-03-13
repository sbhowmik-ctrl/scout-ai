/**
 * Scout AI Hidden Gems - Main Page
 * 
 * Main application page with search functionality and player comparison.
 * Validates: Requirements 1.1, 4.1, 4.5, 5.5, 10.3, 10.4
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { PlayerCard } from '@/components/PlayerCard';
import { RadarChartModal } from '@/components/RadarChartModal';
import { AttributeSelector } from '@/components/AttributeSelector';
import { AttributeRadarChart } from '@/components/AttributeRadarChart';
import { PaceComparisonChart } from '@/components/PaceComparisonChart';
import { CyberpunkBackground } from '@/components/CyberpunkBackground';
import { searchPlayer, searchPlayerByAttribute, APIError } from '@/lib/api';
import { SearchResponse, Player, AttributeSearchResponse } from '@/lib/types';

export default function Home() {
  // State management
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [selectedGem, setSelectedGem] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Attribute search state management (Requirements 1.3, 8.3)
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [attributeResults, setAttributeResults] = useState<AttributeSearchResponse | null>(null);
  const [attributeLoading, setAttributeLoading] = useState(false);
  const [attributeCache, setAttributeCache] = useState<Map<string, AttributeSearchResponse>>(new Map());
  
  // Cache for search results (Requirement 10.4)
  const searchCache = useRef<Map<string, SearchResponse>>(new Map());
  
  // Debounce timer reference (Requirement 10.3)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle search with debouncing and caching.
   * Requirement 10.3: Debounce search input by 300ms
   * Requirement 10.4: Cache search results to avoid redundant API calls
   */
  const handleSearch = useCallback(async (playerName: string) => {
    // Clear any existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the search (300ms delay)
    debounceTimer.current = setTimeout(async () => {
      // Normalize player name for cache key
      const cacheKey = playerName.toLowerCase().trim();
      
      // Check cache first (Requirement 10.4)
      if (searchCache.current.has(cacheKey)) {
        const cachedResult = searchCache.current.get(cacheKey)!;
        setSearchResult(cachedResult);
        setSelectedGem(null);
        setError(null);
        return;
      }

      // Perform API search
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await searchPlayer(playerName);
        
        // Store in cache
        searchCache.current.set(cacheKey, result);
        
        // Update state
        setSearchResult(result);
        setSelectedGem(null);
      } catch (err) {
        // Handle API errors
        if (err instanceof APIError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        setSearchResult(null);
        setSelectedGem(null);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay (Requirement 10.3)
  }, []);

  /**
   * Handle hidden gem selection for radar chart comparison.
   * Requirement 4.1: Display radar chart when hidden gem is clicked
   */
  const handleGemSelect = useCallback((player: Player) => {
    setSelectedGem(player);
  }, []);

  /**
   * Handle attribute category selection for attribute-based search.
   * Requirements 1.3, 8.3, 8.4, 9.4
   */
  const handleAttributeSelect = useCallback(async (attribute: string) => {
    if (!searchResult) return;
    
    setSelectedAttribute(attribute);
    
    // Check cache first (Requirement 8.3)
    const cacheKey = `${searchResult.searched_player.name}-${attribute}`;
    if (attributeCache.has(cacheKey)) {
      setAttributeResults(attributeCache.get(cacheKey)!);
      return;
    }
    
    // Fetch from API (Requirement 1.3)
    setAttributeLoading(true);
    try {
      const results = await searchPlayerByAttribute(
        searchResult.searched_player.name,
        attribute
      );
      setAttributeResults(results);
      
      // Cache results for future use (Requirement 8.3)
      setAttributeCache(prev => new Map(prev).set(cacheKey, results));
    } catch (err) {
      // Handle API errors (Requirement 9.4)
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during attribute search.');
      }
      setAttributeResults(null);
    } finally {
      setAttributeLoading(false);
    }
  }, [searchResult, attributeCache]);

  /**
   * Close radar chart modal.
   * Requirement 4.5: Allow closing the radar chart overlay
   */
  const handleCloseRadarChart = useCallback(() => {
    setSelectedGem(null);
  }, []);

  /**
   * Retry search after error.
   * Clears error state and allows user to search again.
   */
  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-green font-mono relative">
      {/* 3D Animated Background */}
      <CyberpunkBackground />
      
      {/* Content with higher z-index */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b-2 border-cyber-green py-6 shadow-neon-green-sm backdrop-blur-sm bg-cyber-black/80">
          <div className="container mx-auto px-4">
            <h1 
              className="text-4xl md:text-5xl font-bold text-center text-cyber-green-light tracking-wider"
              style={{
                textShadow: `
                  0 0 10px #00ff00,
                  0 0 20px #00ff00,
                  0 0 30px #00ff00,
                  0 0 40px #00ff00,
                  2px 2px 0px rgba(255, 0, 255, 0.8),
                  4px 4px 0px rgba(0, 255, 255, 0.6),
                  6px 6px 0px rgba(255, 255, 0, 0.4)
                `,
                transform: 'perspective(500px) rotateX(10deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <span 
                className="inline-block animate-bounce"
                style={{
                  animation: 'bounce 2s infinite',
                  display: 'inline-block',
                  transform: 'translateZ(20px)',
                }}
              >
                ⚽
              </span>
              {' '}
              <span 
                className="inline-block"
                style={{
                  transform: 'translateZ(30px)',
                  display: 'inline-block',
                }}
              >
                SCOUT AI: HIDDEN GEMS
              </span>
            </h1>
            <p className="text-center text-cyber-green mt-2 tracking-wide">
              &gt; Discover undervalued players similar to your favorite stars_
            </p>
          </div>
        </header>

      {/* Search Bar - Requirement 1.1 */}
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 mt-8">
          <div className="max-w-2xl mx-auto bg-cyber-dark-gray border-2 border-red-500 rounded-lg p-6 shadow-lg shadow-red-500/50">
            <div className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-red-400 flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-2 tracking-wider">[ ERROR ]</h3>
                <p className="text-red-300 font-mono">&gt; {error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-4 px-4 py-2 bg-red-500 text-cyber-black rounded hover:bg-red-600 transition-all hover:shadow-lg hover:shadow-red-500/50 font-bold tracking-wider"
                >
                  [ RETRY ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResult && !error && (
        <div className="container mx-auto px-4 py-8">
          {/* Searched Player Section - Requirement 5.5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-cyber-green-light mb-4 text-center tracking-wider">
              [ SEARCHED PLAYER ]
            </h2>
            <div className="max-w-md mx-auto">
              <PlayerCard player={searchResult.searched_player} />
            </div>
          </div>

          {/* Hidden Gems Section */}
          {searchResult.hidden_gems.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-cyber-green-light mb-4 text-center tracking-wider">
                💎 [ HIDDEN GEMS ] - Similar Players with Lower Ratings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {searchResult.hidden_gems.map((gem) => (
                  <PlayerCard
                    key={gem.name}
                    player={gem}
                    isHiddenGem
                    onSelect={handleGemSelect}
                  />
                ))}
              </div>
              <p className="text-center text-cyber-green mt-6 text-sm tracking-wide">
                &gt; Click on any hidden gem to compare stats with {searchResult.searched_player.name}_
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-cyber-dark-gray border-2 border-cyber-green rounded-lg p-8 text-center shadow-neon-green">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-cyber-green-light mb-2 tracking-wider">
                [ NO HIDDEN GEMS FOUND ]
              </h3>
              <p className="text-cyber-green tracking-wide">
                &gt; {searchResult.searched_player.name} is already undervalued!<br/>
                &gt; No similar players with lower ratings detected_
              </p>
            </div>
          )}

          {/* Attribute Selector Section - Requirement 1.1, 10.1 */}
          <div className="mt-12">
            <AttributeSelector
              selectedAttribute={selectedAttribute}
              onAttributeSelect={handleAttributeSelect}
              disabled={attributeLoading}
            />
          </div>

          {/* Attribute Results Section - Requirements 5.1, 9.4, 10.3 */}
          {attributeLoading && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-400 mt-4 font-mono tracking-wider">
                &gt; Loading attribute search results...
              </p>
            </div>
          )}

          {attributeResults && !attributeLoading && (
            <div className="mt-8">
              {attributeResults.attribute_category.toLowerCase() === 'pace' ? (
                <PaceComparisonChart
                  searchedPlayer={attributeResults.searched_player}
                  similarPlayers={attributeResults.similar_players}
                  attributeCategory={attributeResults.attribute_category}
                />
              ) : (
                <AttributeRadarChart
                  searchedPlayer={attributeResults.searched_player}
                  similarPlayers={attributeResults.similar_players}
                  attributeCategory={attributeResults.attribute_category}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Radar Chart Modal - Requirement 4.1, 4.5 */}
      {selectedGem && searchResult && (
        <RadarChartModal
          searchedPlayer={searchResult.searched_player}
          comparisonPlayer={selectedGem}
          onClose={handleCloseRadarChart}
        />
      )}

      {/* Footer */}
      <footer className="border-t-2 border-cyber-green mt-16 py-6 shadow-neon-green-sm backdrop-blur-sm bg-cyber-black/80">
        <div className="container mx-auto px-4 text-center text-cyber-green text-sm tracking-wider">
          <p>&gt; SCOUT AI HIDDEN GEMS - Powered by FC 24 Data & Machine Learning_</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
