/**
 * PaceComparisonChart Component
 * 
 * Specialized vertical bar chart visualization for PACE attribute comparison.
 * PACE contains only two sub-features (ACC and SPR), making a bar chart more effective than radar.
 * Validates: Requirements 1.5, 6.4, 12.2
 */

'use client';

import { Player } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Props for the PaceComparisonChart component.
 * Matches AttributeRadarChart interface for seamless integration.
 * Validates: Requirement 1.5, 12.2
 */
export interface PaceComparisonChartProps {
  /** The player that was searched for */
  searchedPlayer: Player;
  /** Similar players based on attribute (0-3 players) */
  similarPlayers: Player[];
  /** The attribute category used for search (should be "pace") */
  attributeCategory: string;
}

/**
 * Color scheme for player differentiation.
 * Matches AttributeRadarChart colors for consistency.
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
const PACE_COLORS = {
  searched: '#ff00ff',   // Magenta
  similar1: '#00ffff',   // Cyan
  similar2: '#ffff00',   // Yellow
  similar3: '#ff6600',   // Orange
};

/**
 * Chart data point interface for Recharts.
 */
interface ChartDataPoint {
  stat: 'ACC' | 'SPR';
  [playerName: string]: number | string;
}

/**
 * Player color mapping interface.
 */
interface PlayerColorMapping {
  name: string;
  color: string;
}

/**
 * Clamps a value to the 0-99 range with warning logging.
 * Validates: Requirement 9.3
 */
function clampValue(value: number, playerName: string, stat: string): number {
  if (value < 0 || value > 99) {
    console.warn(
      `PaceComparisonChart: Invalid ${stat} value for player "${playerName}". ` +
      `Value: ${value}, Expected range: 0-99. Clamping to valid range.`
    );
    return Math.max(0, Math.min(99, value));
  }
  return value;
}

/**
 * Gets a safe player name with fallback for empty names.
 * Validates: Requirement 9.5
 */
function getPlayerName(player: Player): string {
  if (!player.name || player.name.trim() === '') {
    console.warn(
      'PaceComparisonChart: Player with empty or missing name detected. ' +
      `Player data: ${JSON.stringify({ club: player.club, position: player.position })}. ` +
      'Using fallback name "Unknown Player".'
    );
    return 'Unknown Player';
  }
  return player.name;
}

/**
 * Formats a value for display.
 * Returns "N/A" for null/undefined values, otherwise formats as integer.
 * Validates: Requirements 4.2, 4.3
 */
function formatValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return Math.round(value).toString();
}

/**
 * Transforms player data into Recharts format.
 * Extracts ACC and SPR values from all players.
 * Validates: Requirements 2.1, 2.5, 9.2, 9.3, 9.4
 */
function transformDataForChart(
  searchedPlayer: Player,
  similarPlayers: Player[]
): ChartDataPoint[] {
  const allPlayers = [searchedPlayer, ...similarPlayers];
  
  // Create data points for ACC and SPR
  const accData: ChartDataPoint = { stat: 'ACC' };
  const sprData: ChartDataPoint = { stat: 'SPR' };
  
  allPlayers.forEach((player) => {
    const playerName = getPlayerName(player);
    
    // Error handling: Check if detailed_stats exists (Validates: Requirement 9.4)
    if (!player.detailed_stats || typeof player.detailed_stats !== 'object') {
      console.warn(
        `PaceComparisonChart: Missing or invalid detailed_stats for player "${playerName}". ` +
        'Defaulting ACC and SPR to 0.'
      );
      accData[playerName] = 0;
      sprData[playerName] = 0;
      return;
    }
    
    // Extract ACC value with fallback to 0
    const accValue = player.detailed_stats?.Acceleration ?? 0;
    const sprValue = player.detailed_stats?.Sprint_Speed ?? 0;
    
    // Clamp values to 0-99 range
    accData[playerName] = clampValue(accValue, playerName, 'ACC');
    sprData[playerName] = clampValue(sprValue, playerName, 'SPR');
  });
  
  return [accData, sprData];
}

/**
 * Creates player-color mappings for chart rendering.
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
function getPlayerColors(
  searchedPlayer: Player,
  similarPlayers: Player[]
): PlayerColorMapping[] {
  const colors: PlayerColorMapping[] = [
    { name: getPlayerName(searchedPlayer), color: PACE_COLORS.searched },
  ];
  
  const similarColors = [PACE_COLORS.similar1, PACE_COLORS.similar2, PACE_COLORS.similar3];
  
  similarPlayers.forEach((player, index) => {
    if (index < similarColors.length) {
      colors.push({
        name: getPlayerName(player),
        color: similarColors[index],
      });
    }
  });
  
  return colors;
}

/**
 * Truncates player names longer than 20 characters.
 * Validates: Requirement 7.3
 */
function truncatePlayerName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength - 3) + '...';
}

/**
 * Custom legend formatter with truncation and searched player highlighting.
 * Validates: Requirements 7.1, 7.3, 7.4
 */
function renderLegend(props: any, searchedPlayerName: string) {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 pt-4">
      {payload.map((entry: any, index: number) => {
        const isSearchedPlayer = entry.value === searchedPlayerName;
        const truncatedName = truncatePlayerName(entry.value);
        
        return (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2"
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                border: isSearchedPlayer ? '2px solid #ff00ff' : 'none',
                boxShadow: isSearchedPlayer ? '0 0 8px #ff00ff' : 'none',
              }}
            />
            <span
              style={{
                color: isSearchedPlayer ? '#ff00ff' : '#a855f7',
                fontWeight: isSearchedPlayer ? 'bold' : 'normal',
                fontSize: isSearchedPlayer ? '13px' : '12px',
                fontFamily: 'monospace',
                textShadow: isSearchedPlayer ? '0 0 4px #ff00ff' : 'none',
              }}
            >
              {truncatedName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * PaceComparisonChart component using Recharts BarChart.
 * 
 * Features:
 * - Vertical bar chart for ACC and SPR comparison
 * - Cyberpunk theme matching AttributeRadarChart
 * - Clear visualization for two-attribute comparison
 * - Responsive design with consistent styling
 */
export function PaceComparisonChart({
  searchedPlayer,
  similarPlayers,
  attributeCategory,
}: PaceComparisonChartProps) {
  // Error handling: Validate searchedPlayer (Validates: Requirement 9.4, 12.5)
  if (!searchedPlayer || typeof searchedPlayer !== 'object') {
    console.error('PaceComparisonChart: Invalid searchedPlayer object', searchedPlayer);
    return (
      <div className="w-full flex flex-col items-center p-6 font-mono bg-cyber-dark-gray border-2 border-red-500 rounded-lg shadow-lg">
        <div className="text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">[ ERROR ]</h3>
          <p className="text-red-300 text-sm">Unable to render chart: Invalid player data</p>
        </div>
      </div>
    );
  }

  // Error handling: Validate similarPlayers array (Validates: Requirement 9.1, 9.4)
  const validSimilarPlayers = Array.isArray(similarPlayers) 
    ? similarPlayers.filter((player) => {
        if (!player || typeof player !== 'object') {
          console.warn('PaceComparisonChart: Malformed player object detected and filtered out', player);
          return false;
        }
        return true;
      })
    : [];

  // Log if empty similarPlayers array (Validates: Requirement 9.1)
  if (validSimilarPlayers.length === 0 && similarPlayers.length > 0) {
    console.warn('PaceComparisonChart: All similar players were invalid and filtered out');
  }

  // Transform data for chart rendering (Validates: Requirements 2.1, 2.5, 9.2, 9.3)
  const chartData = transformDataForChart(searchedPlayer, validSimilarPlayers);
  
  // Get player color mappings (Validates: Requirements 3.1, 3.2, 3.3, 3.4)
  const playerColors = getPlayerColors(searchedPlayer, validSimilarPlayers);
  
  // Get searched player name for legend highlighting
  const searchedPlayerName = getPlayerName(searchedPlayer);

  return (
    <div 
      className="w-full flex flex-col items-center p-6 font-mono bg-cyber-dark-gray border-2 border-purple-500 rounded-lg shadow-lg"
      role="region"
      aria-label="PACE attribute comparison chart showing Acceleration and Sprint Speed for searched player and similar players"
    >
      {/* Chart Title - Cyberpunk Theme (Validates: Requirement 6.4) */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-purple-400 mb-1 tracking-wider">
          [ PACE COMPARISON ]
        </h3>
        <p className="text-purple-300 text-sm tracking-wide">
          &gt; Acceleration vs Sprint Speed Analysis_
        </p>
      </div>

      {/* Recharts Bar Chart Visualization (Validates: Requirements 2.3, 5.1, 5.2, 6.1, 10.1) */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* Grid with cyberpunk purple theme (Validates: Requirement 6.1) */}
          <CartesianGrid strokeDasharray="3 3" stroke="#ff00ff" strokeOpacity={0.2} />
          
          {/* X-Axis for sub-attributes (Validates: Requirements 2.4, 2.5) */}
          <XAxis
            dataKey="stat"
            tick={{ fill: '#ff00ff', fontSize: 14, fontWeight: 'bold' }}
            stroke="#ff00ff"
          />
          
          {/* Y-Axis for attribute values (Validates: Requirements 2.4, 2.5) */}
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#ff00ff', fontSize: 11 }}
            stroke="#ff00ff"
          />
          
          {/* Tooltip with cyberpunk theme (Validates: Requirements 8.1, 8.2, 8.4) */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '2px solid #ff00ff',
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: '#ff00ff',
            }}
            labelStyle={{ color: '#00ffff', fontWeight: 'bold' }}
            cursor={{ fill: 'rgba(255, 0, 255, 0.1)' }}
          />
          
          {/* Legend with cyberpunk theme (Validates: Requirements 7.1, 7.2, 7.3, 7.4) */}
          <Legend
            content={(props) => renderLegend(props, searchedPlayerName)}
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          
          {/* Bar components for each player (Validates: Requirements 2.2, 4.1, 4.4) */}
          {playerColors.map((playerColor) => (
            <Bar
              key={playerColor.name}
              dataKey={playerColor.name}
              fill={playerColor.color}
              fillOpacity={0.7}
              label={{
                position: 'top',
                fill: playerColor.color,
                fontSize: 12,
                fontWeight: 'bold',
                formatter: (value: any) => formatValue(value),
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
