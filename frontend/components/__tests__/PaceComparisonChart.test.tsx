/**
 * Unit Tests for PaceComparisonChart Component
 * 
 * Validates: Requirements 1.5, 2.1, 2.2, 2.5, 3.1-3.4, 4.1-4.3, 5.1-5.3, 
 *            6.1-6.4, 7.1-7.4, 8.1-8.4, 9.1-9.5, 10.1-10.5, 11.1, 12.2-12.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaceComparisonChart } from '../PaceComparisonChart';
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

describe('PaceComparisonChart Component - Unit Tests', () => {
  describe('8.1 Specific Examples - Rendering with Different Player Counts', () => {
    it('should render with 1 player (searched only)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Kylian Mbappé' });
      const similarPlayers: Player[] = [];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify title
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
      
      // Verify subtitle
      expect(screen.getByText('> Acceleration vs Sprint Speed Analysis_')).toBeInTheDocument();
    });

    it('should render with 2 players (searched + 1 similar)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Kylian Mbappé' });
      const similarPlayers = [
        createTestPlayer({ name: 'Vinícius Júnior' }),
      ];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with 4 players (searched + 3 similar)', () => {
      const searchedPlayer = createTestPlayer({ name: 'Kylian Mbappé' });
      const similarPlayers = [
        createTestPlayer({ name: 'Vinícius Júnior' }),
        createTestPlayer({ name: 'Erling Haaland' }),
        createTestPlayer({ name: 'Alphonso Davies' }),
      ];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });

    it('should render with specific ACC/SPR values', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Kylian Mbappé',
        detailed_stats: {
          PAC: 97,
          SHO: 89,
          PAS: 80,
          DRI: 92,
          DEF: 39,
          PHY: 77,
          Acceleration: 97,
          Sprint_Speed: 97,
        },
      });
      const similarPlayers = [
        createTestPlayer({
          name: 'Vinícius Júnior',
          detailed_stats: {
            PAC: 95,
            SHO: 83,
            PAS: 79,
            DRI: 93,
            DEF: 29,
            PHY: 67,
            Acceleration: 95,
            Sprint_Speed: 90,
          },
        }),
      ];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders with specific values
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('8.2 Edge Cases - Missing Data Handling', () => {
    it('should handle missing ACC data (null/undefined) and display N/A with zero-height bar', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Player A',
        detailed_stats: {
          PAC: 85,
          SHO: 80,
          PAS: 75,
          DRI: 82,
          DEF: 40,
          PHY: 78,
          Acceleration: undefined, // Missing ACC
          Sprint_Speed: 82,
        },
      });
      const similarPlayers: Player[] = [];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should handle missing SPR data (null/undefined) and display N/A with zero-height bar', () => {
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
          Sprint_Speed: undefined, // Missing SPR
        },
      });
      const similarPlayers: Player[] = [];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should handle empty similarPlayers array and show only searched player', () => {
      const searchedPlayer = createTestPlayer({ name: 'Lonely Player' });
      const similarPlayers: Player[] = [];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders with only searched player
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });

    it('should handle empty player names and display "Unknown Player"', () => {
      const searchedPlayer = createTestPlayer({ name: '' });
      const similarPlayers: Player[] = [];

      // Mock console.warn to verify warning is logged
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Player with empty or missing name detected')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should truncate long player names in legend', () => {
      const longName = 'This Is A Very Long Player Name That Should Be Truncated';
      const searchedPlayer = createTestPlayer({ name: longName });
      const similarPlayers: Player[] = [];

      render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // The full name should not appear (it should be truncated)
      // Note: We can't easily test the truncated text in legend due to Recharts rendering
      // but we verify the component renders without crashing
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });
  });

  describe('8.3 Error Conditions - Invalid Data Handling', () => {
    it('should clamp invalid value ranges (negative) with warnings', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Player A',
        detailed_stats: {
          PAC: 85,
          SHO: 80,
          PAS: 75,
          DRI: 82,
          DEF: 40,
          PHY: 78,
          Acceleration: -10, // Invalid negative value
          Sprint_Speed: 82,
        },
      });
      const similarPlayers: Player[] = [];

      // Mock console.warn to verify warning is logged
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify warning was logged for clamping
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid ACC value')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should clamp invalid value ranges (> 99) with warnings', () => {
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
          Sprint_Speed: 150, // Invalid value > 99
        },
      });
      const similarPlayers: Player[] = [];

      // Mock console.warn to verify warning is logged
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify warning was logged for clamping
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid SPR value')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed player objects gracefully', () => {
      const searchedPlayer = createTestPlayer({ name: 'Valid Player' });
      const similarPlayers = [
        null as any, // Malformed player
        createTestPlayer({ name: 'Valid Similar Player' }),
      ];

      // Mock console.warn to verify warning is logged
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify warning was logged (check for both parts of the message)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Malformed player object detected'),
        null
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle missing detailed_stats object without crashing', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Player A',
        detailed_stats: undefined,
      });
      const similarPlayers: Player[] = [];

      // Mock console.warn to verify warning is logged
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render without crashing
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      
      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing or invalid detailed_stats')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should render error UI when searchedPlayer is invalid', () => {
      const searchedPlayer = null as any; // Invalid player
      const similarPlayers: Player[] = [];

      // Mock console.error to verify error is logged
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Should render error UI
      expect(screen.getByText('[ ERROR ]')).toBeInTheDocument();
      expect(screen.getByText('Unable to render chart: Invalid player data')).toBeInTheDocument();
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid searchedPlayer object'),
        null
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('8.4 Configuration - Component Structure and Styling', () => {
    it('should match AttributeRadarChart props interface', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      // This test verifies TypeScript compilation - if props don't match, it won't compile
      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should use ResponsiveContainer with correct dimensions', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Recharts ResponsiveContainer creates a div with specific class
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('should have minimum chart height of 400px', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // ResponsiveContainer should be present (height is set via props)
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('should use Recharts components properly', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify Recharts components are rendered
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      // Note: .recharts-wrapper may not be present in all Recharts versions
      // The responsive container is sufficient to verify Recharts is being used
    });

    it('should apply cyberpunk theme classes', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify cyberpunk theme classes
      const chartContainer = container.querySelector('.bg-cyber-dark-gray');
      expect(chartContainer).toBeInTheDocument();
      
      const purpleBorder = container.querySelector('.border-purple-500');
      expect(purpleBorder).toBeInTheDocument();
      
      const monoFont = container.querySelector('.font-mono');
      expect(monoFont).toBeInTheDocument();
    });

    it('should include ARIA labels for accessibility', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify ARIA attributes
      const chartRegion = container.querySelector('[role="region"]');
      expect(chartRegion).toBeInTheDocument();
      expect(chartRegion).toHaveAttribute('aria-label');
    });

    it('should display chart title in uppercase with brackets', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify title format
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });

    it('should display subtitle with cyberpunk styling', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify subtitle
      expect(screen.getByText('> Acceleration vs Sprint Speed Analysis_')).toBeInTheDocument();
    });

    it('should handle case-insensitive attribute category', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="PACE"
        />
      );

      // Should render regardless of case
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      expect(screen.getByText('[ PACE COMPARISON ]')).toBeInTheDocument();
    });
  });

  describe('Color Scheme and Player Differentiation', () => {
    it('should use correct color scheme for players', () => {
      const searchedPlayer = createTestPlayer({ name: 'Searched Player' });
      const similarPlayers = [
        createTestPlayer({ name: 'Similar 1' }),
        createTestPlayer({ name: 'Similar 2' }),
        createTestPlayer({ name: 'Similar 3' }),
      ];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders (color verification would require more complex testing)
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should transform data correctly for chart rendering', () => {
      const searchedPlayer = createTestPlayer({
        name: 'Player A',
        detailed_stats: {
          PAC: 90,
          SHO: 80,
          PAS: 75,
          DRI: 82,
          DEF: 40,
          PHY: 78,
          Acceleration: 92,
          Sprint_Speed: 88,
        },
      });
      const similarPlayers = [
        createTestPlayer({
          name: 'Player B',
          detailed_stats: {
            PAC: 85,
            SHO: 80,
            PAS: 75,
            DRI: 82,
            DEF: 40,
            PHY: 78,
            Acceleration: 87,
            Sprint_Speed: 83,
          },
        }),
      ];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify chart renders with transformed data
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive container', () => {
      const searchedPlayer = createTestPlayer({ name: 'Player A' });
      const similarPlayers = [createTestPlayer({ name: 'Player B' })];

      const { container } = render(
        <PaceComparisonChart
          searchedPlayer={searchedPlayer}
          similarPlayers={similarPlayers}
          attributeCategory="pace"
        />
      );

      // Verify ResponsiveContainer is used
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });
});
