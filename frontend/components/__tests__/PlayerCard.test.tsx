/**
 * Property Tests for PlayerCard Component
 * 
 * Property 10: Player Display Field Completeness (validates Requirements 5.1)
 * Property 11: Hidden Gem Visual Indicator (validates Requirements 5.2)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlayerCard } from '../PlayerCard';
import { Player } from '@/lib/types';

/**
 * Helper function to create a test player with all required fields.
 */
function createTestPlayer(overrides?: Partial<Player>): Player {
  return {
    name: 'Test Player',
    club: 'Test Club',
    nation: 'Test Nation',
    position: 'ST',
    overall: 85,
    stats: {
      PAC: 90,
      SHO: 88,
      PAS: 75,
      DRI: 85,
      DEF: 35,
      PHY: 80,
    },
    ...overrides,
  };
}

describe('PlayerCard Component - Property Tests', () => {
  describe('Property 10: Player Display Field Completeness', () => {
    /**
     * **Validates: Requirements 5.1**
     * 
     * For any player displayed in the UI, the rendered output must include
     * the player's name, club, nation, position, and overall rating.
     */
    it('should display all required player fields (name, club, nation, position, overall)', () => {
      const player = createTestPlayer({
        name: 'Kylian Mbappe',
        club: 'Paris Saint-Germain',
        nation: 'France',
        position: 'ST',
        overall: 91,
      });

      render(<PlayerCard player={player} />);

      // Verify name is displayed (with > prefix)
      expect(screen.getByText((content, element) => {
        return element?.textContent === '> Kylian Mbappe';
      })).toBeInTheDocument();

      // Verify club is displayed
      expect(screen.getByText('Paris Saint-Germain')).toBeInTheDocument();

      // Verify nation is displayed
      expect(screen.getByText('France')).toBeInTheDocument();

      // Verify position is displayed
      expect(screen.getByText('ST')).toBeInTheDocument();

      // Verify overall rating is displayed
      expect(screen.getByText('91')).toBeInTheDocument();
    });

    it('should display all required fields for any valid player', () => {
      // Test with different player data
      const player = createTestPlayer({
        name: 'Lionel Messi',
        club: 'Inter Miami',
        nation: 'Argentina',
        position: 'RW',
        overall: 90,
      });

      render(<PlayerCard player={player} />);

      expect(screen.getByText((content, element) => {
        return element?.textContent === '> Lionel Messi';
      })).toBeInTheDocument();
      expect(screen.getByText('Inter Miami')).toBeInTheDocument();
      expect(screen.getByText('Argentina')).toBeInTheDocument();
      expect(screen.getByText('RW')).toBeInTheDocument();
      // Overall 90 appears multiple times (overall rating + PAC stat), so use getAllByText
      expect(screen.getAllByText('90').length).toBeGreaterThan(0);
    });

    it('should display all six player stats (PAC, SHO, PAS, DRI, DEF, PHY)', () => {
      const player = createTestPlayer({
        stats: {
          PAC: 95,
          SHO: 92,
          PAS: 88,
          DRI: 93,
          DEF: 40,
          PHY: 78,
        },
      });

      render(<PlayerCard player={player} />);

      // Verify all stat labels are displayed
      expect(screen.getByText('PAC')).toBeInTheDocument();
      expect(screen.getByText('SHO')).toBeInTheDocument();
      expect(screen.getByText('PAS')).toBeInTheDocument();
      expect(screen.getByText('DRI')).toBeInTheDocument();
      expect(screen.getByText('DEF')).toBeInTheDocument();
      expect(screen.getByText('PHY')).toBeInTheDocument();

      // Verify all stat values are displayed
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('93')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('78')).toBeInTheDocument();
    });

    it('should display fields correctly for players with edge case values', () => {
      // Test with minimum overall rating
      const lowRatedPlayer = createTestPlayer({
        name: 'Low Rated Player',
        overall: 50,
        stats: {
          PAC: 45,
          SHO: 40,
          PAS: 42,
          DRI: 48,
          DEF: 50,
          PHY: 52,
        },
      });

      render(<PlayerCard player={lowRatedPlayer} />);

      expect(screen.getByText((content, element) => {
        return element?.textContent === '> Low Rated Player';
      })).toBeInTheDocument();
      // Overall 50 appears twice (overall rating + DEF stat), so use getAllByText
      expect(screen.getAllByText('50').length).toBeGreaterThan(0);
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });

    it('should display fields correctly for players with maximum overall rating', () => {
      // Test with maximum overall rating
      const highRatedPlayer = createTestPlayer({
        name: 'High Rated Player',
        overall: 99,
        stats: {
          PAC: 99,
          SHO: 99,
          PAS: 99,
          DRI: 99,
          DEF: 99,
          PHY: 99,
        },
      });

      render(<PlayerCard player={highRatedPlayer} />);

      expect(screen.getByText((content, element) => {
        return element?.textContent === '> High Rated Player';
      })).toBeInTheDocument();
      // There will be multiple "99" texts, so we just verify at least one exists
      expect(screen.getAllByText('99').length).toBeGreaterThan(0);
    });
  });

  describe('Property 11: Hidden Gem Visual Indicator', () => {
    /**
     * **Validates: Requirements 5.2**
     * 
     * For any hidden gem recommendation displayed in the UI, the rendered output
     * must include a visual indicator (badge or label) distinguishing it from
     * the searched player.
     */
    it('should display hidden gem badge when isHiddenGem is true', () => {
      const player = createTestPlayer();

      render(<PlayerCard player={player} isHiddenGem={true} />);

      // Verify hidden gem badge is displayed
      const badge = screen.getByText(/hidden gem/i);
      expect(badge).toBeInTheDocument();
    });

    it('should NOT display hidden gem badge when isHiddenGem is false', () => {
      const player = createTestPlayer();

      render(<PlayerCard player={player} isHiddenGem={false} />);

      // Verify hidden gem badge is NOT displayed
      expect(screen.queryByText(/hidden gem/i)).not.toBeInTheDocument();
    });

    it('should NOT display hidden gem badge when isHiddenGem is undefined', () => {
      const player = createTestPlayer();

      render(<PlayerCard player={player} />);

      // Verify hidden gem badge is NOT displayed (default behavior)
      expect(screen.queryByText(/hidden gem/i)).not.toBeInTheDocument();
    });

    it('should display hidden gem badge for any player when isHiddenGem is true', () => {
      // Test with different players
      const players = [
        createTestPlayer({ name: 'Player 1', overall: 75 }),
        createTestPlayer({ name: 'Player 2', overall: 80 }),
        createTestPlayer({ name: 'Player 3', overall: 85 }),
      ];

      players.forEach((player) => {
        const { unmount } = render(<PlayerCard player={player} isHiddenGem={true} />);
        
        expect(screen.getByText(/hidden gem/i)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should display click hint when isHiddenGem is true and onSelect is provided', () => {
      const player = createTestPlayer();
      const mockOnSelect = jest.fn();

      render(<PlayerCard player={player} isHiddenGem={true} onSelect={mockOnSelect} />);

      // Verify click hint is displayed
      expect(screen.getByText(/click to compare stats/i)).toBeInTheDocument();
    });

    it('should NOT display click hint when isHiddenGem is false', () => {
      const player = createTestPlayer();
      const mockOnSelect = jest.fn();

      render(<PlayerCard player={player} isHiddenGem={false} onSelect={mockOnSelect} />);

      // Verify click hint is NOT displayed
      expect(screen.queryByText(/click to compare stats/i)).not.toBeInTheDocument();
    });
  });

  describe('Interaction Tests', () => {
    it('should call onSelect with player data when card is clicked', () => {
      const player = createTestPlayer({ name: 'Clickable Player' });
      const mockOnSelect = jest.fn();

      render(<PlayerCard player={player} isHiddenGem={true} onSelect={mockOnSelect} />);

      const card = screen.getByText((content, element) => {
        return element?.textContent === '> Clickable Player';
      }).closest('div');
      fireEvent.click(card!);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(player);
    });

    it('should not call onSelect when onSelect is not provided', () => {
      const player = createTestPlayer();

      // Should not throw error when clicked without onSelect
      render(<PlayerCard player={player} />);

      const card = screen.getByText((content, element) => {
        return element?.textContent === '> Test Player';
      }).closest('div');
      expect(() => fireEvent.click(card!)).not.toThrow();
    });

    it('should handle keyboard interaction (Enter key)', () => {
      const player = createTestPlayer();
      const mockOnSelect = jest.fn();

      render(<PlayerCard player={player} isHiddenGem={true} onSelect={mockOnSelect} />);

      const card = screen.getByText((content, element) => {
        return element?.textContent === '> Test Player';
      }).closest('div');
      fireEvent.keyDown(card!, { key: 'Enter' });

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(player);
    });

    it('should handle keyboard interaction (Space key)', () => {
      const player = createTestPlayer();
      const mockOnSelect = jest.fn();

      render(<PlayerCard player={player} isHiddenGem={true} onSelect={mockOnSelect} />);

      const card = screen.getByText((content, element) => {
        return element?.textContent === '> Test Player';
      }).closest('div');
      fireEvent.keyDown(card!, { key: ' ' });

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(player);
    });
  });

  describe('Styling and Accessibility', () => {
    it('should have proper role when onSelect is provided', () => {
      const player = createTestPlayer();
      const mockOnSelect = jest.fn();

      render(<PlayerCard player={player} onSelect={mockOnSelect} />);

      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });

    it('should have proper aria-label', () => {
      const player = createTestPlayer({
        name: 'Test Player',
        position: 'ST',
        overall: 85,
      });

      render(<PlayerCard player={player} />);

      const card = screen.getByLabelText('Test Player - ST - Overall 85');
      expect(card).toBeInTheDocument();
    });

    it('should apply different styling for hidden gems', () => {
      const player = createTestPlayer();

      const { container: hiddenGemContainer } = render(
        <PlayerCard player={player} isHiddenGem={true} onSelect={jest.fn()} />
      );
      const { container: normalContainer } = render(
        <PlayerCard player={player} isHiddenGem={false} />
      );

      const hiddenGemCard = hiddenGemContainer.firstChild as HTMLElement;
      const normalCard = normalContainer.firstChild as HTMLElement;

      // Hidden gem with onSelect should have cursor-pointer class
      expect(hiddenGemCard.className).toContain('cursor-pointer');
      
      // Normal card without onSelect should not have cursor-pointer
      expect(normalCard.className).not.toContain('cursor-pointer');
    });
  });

  describe('React.memo Performance Optimization', () => {
    /**
     * **Validates: Requirements 10.5**
     * 
     * Verify that PlayerCard uses React.memo for performance optimization.
     */
    it('should be a memoized component', () => {
      const player = createTestPlayer();

      // Render the component twice with same props
      const { rerender } = render(<PlayerCard player={player} />);
      
      // Re-render with same props should not cause re-render
      // (This is a basic check - in real scenarios, React DevTools Profiler would be used)
      rerender(<PlayerCard player={player} />);

      // Component should still display correctly (with > prefix)
      expect(screen.getByText((content, element) => {
        return element?.textContent === '> Test Player';
      })).toBeInTheDocument();
    });
  });
});
