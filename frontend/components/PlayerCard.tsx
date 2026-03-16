/**
 * PlayerCard Component
 * 
 * Display player information in a card format with cyberpunk styling.
 * Validates: Requirements 5.1, 5.2, 5.4, 10.5
 */

'use client';

import { memo, useState } from 'react';
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
 * PlayerCard component with cyberpunk styling and 3D effects.
 * 
 * Features:
 * - Displays player name, club, nation, position, overall rating (Requirement 5.1)
 * - Shows "Hidden Gem" badge for recommendations (Requirement 5.2)
 * - Handles click events for radar chart comparison
 * - Cyberpunk dark theme with green accents (Requirement 5.4)
 * - Uses React.memo for performance optimization (Requirement 10.5)
 * - 3D hover effects for enhanced visual appeal
 */
function PlayerCardComponent({ player, isHiddenGem = false, onSelect }: PlayerCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleClick = () => {
    if (onSelect) {
      onSelect(player);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
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
      <h3 className="text-2xl font-bold text-cyber-green-light mb-4 tracking-wide pr-28">
        &gt; {player.name}
      </h3>

      {/* Player Details - Requirement 5.1 */}
      <div className="space-y-2 text-cyber-green">
        <div className="flex items-center gap-2">
          <span className="text-cyber-green text-xs font-semibold tracking-wider">CLUB:</span>
          <span className="tracking-wide">{player.club}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-green text-xs font-semibold tracking-wider">NATION:</span>
          <span className="tracking-wide">{player.nation}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-green text-xs font-semibold tracking-wider">POS:</span>
          <span className="font-mono tracking-widest">{player.position}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-green text-xs font-semibold tracking-wider">OVR:</span>
          <span className="text-3xl font-bold text-cyber-green-light">{player.overall}</span>
        </div>
      </div>

      {/* Player Stats */}
      <div className="mt-4 pt-4 border-t border-cyber-green-dark">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="text-cyber-green text-xs font-semibold tracking-wider">PAC</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.PAC}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-xs font-semibold tracking-wider">SHO</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.SHO}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-xs font-semibold tracking-wider">PAS</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.PAS}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-xs font-semibold tracking-wider">DRI</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.DRI}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-xs font-semibold tracking-wider">DEF</div>
            <div className="text-cyber-green-light font-bold text-lg">{player.stats.DEF}</div>
          </div>
          <div className="text-center">
            <div className="text-cyber-green text-xs font-semibold tracking-wider">PHY</div>
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
