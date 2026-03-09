/**
 * Unit Tests for AttributeRadarChart Component
 * 
 * Validates: Requirements 5.1, 5.3, 5.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttributeRadarChart } from '../AttributeRadarChart';
import { Player, DetailedPlayerStats } from '@/lib/types';

/**
 * Helper function to create a test player with detailed stats.
 */
function createTestPlayer(overrides?: Partial<Player>): Player {
  const detailedStats: DetailedPlayerStats = {
    PAC: 85,
    SHO: 80,
    PAS: 75,
    DRI: 82,
    DEF: 40,
    PHY: 78,
    // Pace sub-attributes
    Acceleration: 88,
    Sprint_Speed: 82,
    // Shooting sub-attributes
    Positioning: 85,
    Finishing: 82,
    Shot_Power: 80,
    Long_Shots: 78,
    Volleys: 75,
    Penalties: 80,
    // Passing sub-attributes
    Vision: 78,
    Crossing: 72,
    Free_Kick_Accuracy: 70,
    Short_Passing: 80,
    Long_Passing: 75,
    Curve: 73,
    // Dribbling sub-attributes
    Agility: 85,
    Balance: 80,
    Reactions: 88,
    Ball_Control: 85,
    Dribbling: 82,
    Composure: 80,
    // Defending sub-attributes
    Interceptions: 42,
    Heading_Accuracy: 45,
    Def_Awareness: 40,
    Standing_Tackle: 38,
    Sliding_Tackle: 35,
    // Physical sub-attributes
    Jumping: 75,
    Stamina: 82,
    Strength: 78,
    Aggression: 70,
  };

  return {
    name: 'Test Player',
    club: 'Test Club',
    nation: 'Test Nation',
    position: 'ST',
    overall: 85,
    stats: {
      PAC: 85,
      SHO: 80,
      PAS: 75,
      DRI: 82,
      DEF: 40,
      PHY: 78,
    },
    detailed_stats: detailedStats,
    ...overrides,
  };
}

describe('AttributeRadarChart Component - Unit Tests', () => {
  describe('Rendering with Different Attribute Categories (Requirement 5.1)', () => {
    it('should render with pace attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Kylian Mbappe' });
      const similarPlayers = [
        createTestPlayer({ name: 'Vinicius Jr' }),
        createTestPlayer({ name: 'Alphonso Davies' }),
      ];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify attribute category is displayed in title
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with shooting attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Erling Haaland' });
      const similarPlayers = [createTestPlayer({ name: 'Harry Kane' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="shooting"
        />
      );

      expect(screen.getByText('[ SHOOTING COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with passing attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Kevin De Bruyne' });
      const similarPlayers = [createTestPlayer({ name: 'Bruno Fernandes' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="passing"
        />
      );

      expect(screen.getByText('[ PASSING COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with dribbling attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Lionel Messi' });
      const similarPlayers = [createTestPlayer({ name: 'Neymar Jr' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="dribbling"
        />
      );

      expect(screen.getByText('[ DRIBBLING COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with defending attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Virgil van Dijk' });
      const similarPlayers = [createTestPlayer({ name: 'Ruben Dias' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="defending"
        />
      );

      expect(screen.getByText('[ DEFENDING COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with physical attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Adama Traore' });
      const similarPlayers = [createTestPlayer({ name: 'Romelu Lukaku' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="physical"
        />
      );

      expect(screen.getByText('[ PHYSICAL COMPARISON ]')).toBeInTheDocument();
    });
  });

  describe('Sub-Attribute Mapping (Requirement 5.1)', () => {
    it('should display correct number of sub-attributes for pace (2)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Pace has 2 sub-attributes: Acceleration, Sprint_Speed
      const numericValueBoxes = container.querySelectorAll('.bg-cyber-black.border-purple-500');
      expect(numericValueBoxes.length).toBe(2);
    });

    it('should display correct number of sub-attributes for shooting (6)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="shooting"
        />
      );

      // Shooting has 6 sub-attributes
      const numericValueBoxes = container.querySelectorAll('.bg-cyber-black.border-purple-500');
      expect(numericValueBoxes.length).toBe(6);
    });

    it('should display correct number of sub-attributes for defending (5)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="defending"
        />
      );

      // Defending has 5 sub-attributes
      const numericValueBoxes = container.querySelectorAll('.bg-cyber-black.border-purple-500');
      expect(numericValueBoxes.length).toBe(5);
    });
  });

  describe('Chart Data Structure', () => {
    it('should render chart with searched player and similar players', () => {
      const searchedPlayer = createTestPlayer({ name: 'Searched Player' });
      const similarPlayers = [
        createTestPlayer({ name: 'Similar Player 1' }),
        createTestPlayer({ name: 'Similar Player 2' }),
        createTestPlayer({ name: 'Similar Player 3' }),
      ];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should render with 0 similar players', () => {
      const searchedPlayer = createTestPlayer({ name: 'Lonely Player' });
      const similarPlayers: Player[] = [];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="shooting"
        />
      );

      // Verify chart still renders
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      expect(screen.getByText('[ SHOOTING COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with 1 similar player', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="dribbling"
        />
      );

      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should render with 3 similar players (maximum)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [
        createTestPlayer({ name: 'Player B' }),
        createTestPlayer({ name: 'Player C' }),
        createTestPlayer({ name: 'Player D' }),
      ];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="passing"
        />
      );

      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('Styling Differences from Hidden Gems (Requirement 5.3)', () => {
    it('should use purple theme colors (distinct from hidden gems green/cyan)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify purple border styling (distinct from hidden gems)
      const chartContainer = container.querySelector('.border-purple-500');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should display attribute-specific subtitle', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="shooting"
        />
      );

      // Verify attribute-specific subtitle (different from hidden gems)
      expect(screen.getByText(/Attribute-Specific Similarity Analysis/i)).toBeInTheDocument();
    });

    it('should use distinct title format with attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="physical"
        />
      );

      // Title format: [ ATTRIBUTE COMPARISON ] (different from hidden gems)
      expect(screen.getByText('[ PHYSICAL COMPARISON ]')).toBeInTheDocument();
    });
  });

  describe('Numeric Values Display (Requirement 5.4)', () => {
    it('should display numeric values section', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify numeric values section header
      expect(screen.getByText('[ NUMERIC VALUES ]')).toBeInTheDocument();
    });

    it('should display player names in numeric values', () => {
      const searchedPlayer = createTestPlayer({ name: 'Kylian Mbappe' });
      const similarPlayers = [
        createTestPlayer({ name: 'Vinicius Jr' }),
        createTestPlayer({ name: 'Alphonso Davies' }),
      ];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify all player names appear in numeric values (multiple times for each sub-attribute)
      expect(screen.getAllByText('Kylian Mbappe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Vinicius Jr').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Alphonso Davies').length).toBeGreaterThan(0);
    });

    it('should handle missing detailed_stats gracefully', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Player A',
        detailed_stats: undefined,
      });
      const similarPlayers = [
        createTestPlayer({
          name: 'Player B',
          detailed_stats: undefined,
        }),
      ];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should still render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('Cyberpunk Dark Theme Styling (Requirement 10.2)', () => {
    it('should apply cyberpunk dark theme classes', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="shooting"
        />
      );

      // Verify cyberpunk theme classes
      const chartContainer = container.querySelector('.bg-cyber-dark-gray');
      expect(chartContainer).toBeInTheDocument();
      
      const purpleBorder = container.querySelector('.border-purple-500');
      expect(purpleBorder).toBeInTheDocument();
    });

    it('should use monospace font for cyberpunk aesthetic', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="dribbling"
        />
      );

      // Verify monospace font class
      const monoFont = container.querySelector('.font-mono');
      expect(monoFont).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid attribute category gracefully', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="invalid_category"
        />
      );

      // Should still render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should handle case-insensitive attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="PACE"
        />
      );

      // Should render with uppercase category
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });

    it('should handle players with partial detailed_stats', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Player A',
        detailed_stats: {
          PAC: 85,
          SHO: 80,
          PAS: 75,
          DRI: 82,
          DEF: 40,
          PHY: 78,
          Acceleration: 88,
          Sprint_Speed: 82,
          // Other sub-attributes missing
        },
      });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('Responsive Container', () => {
    it('should render ResponsiveContainer for responsive sizing', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <AttributeRadarChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="shooting"
        />
      );

      // Recharts ResponsiveContainer creates a div with specific class
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });
});
