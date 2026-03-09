/**
 * RadarChartModal Component
 * 
 * Modal/overlay wrapper for the RadarChart component.
 * Validates: Requirements 4.1, 4.5
 */

'use client';

import { useEffect } from 'react';
import { Player } from '@/lib/types';
import { RadarChart } from './RadarChart';

/**
 * Props for the RadarChartModal component.
 */
export interface RadarChartModalProps {
  /** The player that was searched for */
  searchedPlayer: Player;
  /** The hidden gem player to compare against */
  comparisonPlayer: Player;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * RadarChartModal component with overlay and close functionality.
 * 
 * Features:
 * - Dark background with transparency (Requirement 4.5)
 * - Close button to dismiss comparison (Requirement 4.5)
 * - Escape key support for accessibility
 * - Click outside to close
 * - Prevents body scroll when open
 */
export function RadarChartModal({ searchedPlayer, comparisonPlayer, onClose }: RadarChartModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Handle click on backdrop (outside modal content)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black bg-opacity-95 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="radar-chart-title"
    >
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto bg-cyber-dark-gray border-2 border-cyber-green rounded-lg shadow-neon-green">
        {/* Close Button (X) - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-cyber-black border-2 border-cyber-green rounded-full text-cyber-green hover:bg-cyber-green hover:text-cyber-black transition-all hover:shadow-neon-green-sm focus:outline-none focus:ring-2 focus:ring-cyber-green-light"
          aria-label="Close comparison"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Radar Chart */}
        <RadarChart
          searchedPlayer={searchedPlayer}
          comparisonPlayer={comparisonPlayer}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
