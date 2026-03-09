/**
 * PlayerCard Component
 * 
 * Display player information in a card format with cyberpunk styling.
 * Validates: Requirements 5.1, 5.2, 5.4, 10.5
 */

'use client';

import { memo } from 'react';
import { Player } from '@/lib/types';

/**
 * Props for the PlayerCard component.
 */
export interface PlayerCardProps {
  /** Player data to display */
  player: Player;
  /** Whether this player is a hidden gem recommendation */
  isHiddenGem?: boolean;
  /** Callback when card is clicked (for radar chart comparison) */
  onSelect?: (player: Player) => void;
}

/**
 * PlayerCard component with cyberpunk styling.
 * 
 * Features:
 * - Displays player name, club, nation, position, overall rating (Requirement 5.1)
 * - Shows "Hidden Gem" badge for recommendations (Requirement 5.2)
 * - Handles click events for radar chart comparison
 * - Cyberpunk dark theme with green accents (Requirement 5.4)
 * - Uses React.memo for performance optimization (Requirement 10.5)
 */
function PlayerCardComponent({ player, isHiddenGem = false, onSelect }: PlayerCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(player);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-6 bg-cyber-dark-gray border-2 rounded-lg transition-all
        ${isHiddenGem 
          ? 'border-cyber-green hover:border-cyber-green-light hover:shadow-neon-green cursor-pointer animate-pulse-glow' 
          : 'border-cyber-green-dark shadow-neon-green-sm'
        }
      `}
      role={onSelect ? 'button' : 'article'}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${player.name} - ${player.position} - Overall ${player.overall}`}
    >
      {/* Hidden Gem Badge - Requirement 5.2 */}
      {isHiddenGem && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-cyber-green text-cyber-black text-sm font-bold rounded-full shadow-neon-green-sm tracking-wider">
          💎 HIDDEN GEM
        </div>
      )}

      {/* Player Name */}
      <h3 className="text-2xl font-bold text-cyber-green-light mb-4 tracking-wide">
        &gt; {player.name}
      </h3>

      {/* Player Details - Requirement 5.1 */}
      <div className="space-y-2 text-cyber-green">
        <div className="flex items-center gap-2">
          <span className="text-cyber-gray font-semibold tracking-wider">CLUB:</span>
          <span className="tracking-wide">{player.club}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-gray font-semibold tracking-wider">NATION:</span>
          <span className="tracking-wide">{player.nation}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-gray font-semibold tracking-wider">POS:</span>
          <span className="font-mono tracking-widest">{player.position}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-gray font-semibold tracking-wider">OVR:</span>
          <span className="text-3xl font-bold text-cyber-green-light">{player.overall}</span>
        </div>
      </div>

      {/* Player Stats */}
      <div className="mt-4 pt-4 border-t border-cyber-green-dark">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="text-cyber-gray font-semibold tracking-wider">PAC</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.PAC}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-gray font-semibold tracking-wider">SHO</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.SHO}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-gray font-semibold tracking-wider">PAS</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.PAS}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-gray font-semibold tracking-wider">DRI</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.DRI}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-gray font-semibold tracking-wider">DEF</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.DEF}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-gray font-semibold tracking-wider">PHY</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.PHY}</div>
          </div>
        </div>
      </div>

      {/* Click hint for hidden gems */}
      {isHiddenGem && onSelect && (
        <div className="mt-4 text-center text-cyber-gray text-sm tracking-wide">
          &gt; Click to compare stats_
        </div>
      )}
    </div>
  );
}

/**
 * Memoized PlayerCard component for performance optimization.
 * Requirement 10.5: Use React.memo to prevent unnecessary re-renders
 */
export const PlayerCard = memo(PlayerCardComponent);
