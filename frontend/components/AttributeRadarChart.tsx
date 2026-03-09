/**
 * AttributeRadarChart Component
 * 
 * Visualize attribute-specific comparison between searched player and similar players.
 * Focuses on sub-attributes within the selected category.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 10.2
 */

'use client';

import { Player } from '@/lib/types';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

/**
 * Props for the AttributeRadarChart component.
 */
export interface AttributeRadarChartProps {
  /** The player that was searched for */
  searchedPlayer: Player;
  /** Similar players based on attribute (0-3 players) */
  similarPlayers: Player[];
  /** The attribute category used for search */
  attributeCategory: string;
}

/**
 * Mapping of attribute categories to their sub-attributes.
 * Validates: Requirements 3.1-3.6
 */
const ATTRIBUTE_SUB_ATTRIBUTES: Record<string, { key: string; label: string }[]> = {
  pace: [
    { key: 'Acceleration', label: 'ACC' },
    { key: 'Sprint_Speed', label: 'SPR' },
  ],
  shooting: [
    { key: 'Positioning', label: 'POS' },
    { key: 'Finishing', label: 'FIN' },
    { key: 'Shot_Power', label: 'POW' },
    { key: 'Long_Shots', label: 'LNG' },
    { key: 'Volleys', label: 'VOL' },
    { key: 'Penalties', label: 'PEN' },
  ],
  passing: [
    { key: 'Vision', label: 'VIS' },
    { key: 'Crossing', label: 'CRO' },
    { key: 'Free_Kick_Accuracy', label: 'FK' },
    { key: 'Short_Passing', label: 'SHO' },
    { key: 'Long_Passing', label: 'LNG' },
    { key: 'Curve', label: 'CUR' },
  ],
  dribbling: [
    { key: 'Agility', label: 'AGI' },
    { key: 'Balance', label: 'BAL' },
    { key: 'Reactions', label: 'REA' },
    { key: 'Ball_Control', label: 'CTL' },
    { key: 'Dribbling', label: 'DRI' },
    { key: 'Composure', label: 'COM' },
  ],
  defending: [
    { key: 'Interceptions', label: 'INT' },
    { key: 'Heading_Accuracy', label: 'HEA' },
    { key: 'Def_Awareness', label: 'AWR' },
    { key: 'Standing_Tackle', label: 'STD' },
    { key: 'Sliding_Tackle', label: 'SLD' },
  ],
  physical: [
    { key: 'Jumping', label: 'JMP' },
    { key: 'Stamina', label: 'STA' },
    { key: 'Strength', label: 'STR' },
    { key: 'Aggression', label: 'AGG' },
  ],
};

/**
 * Distinct colors for attribute search visualization.
 * Different from hidden gems (green/cyan) to provide visual distinction.
 * Validates: Requirement 5.3
 */
const ATTRIBUTE_COLORS = {
  searched: '#ff00ff',      // Magenta for searched player
  similar1: '#00ffff',      // Cyan for first similar player
  similar2: '#ffff00',      // Yellow for second similar player
  similar3: '#ff6600',      // Orange for third similar player
};

/**
 * AttributeRadarChart component using Recharts library.
 * 
 * Features:
 * - Displays sub-attributes for selected category (Requirement 5.1)
 * - Highlights selected attribute category (Requirement 5.2)
 * - Uses distinct visual styling from hidden gems (Requirement 5.3)
 * - Displays numeric values alongside chart (Requirement 5.4)
 * - Focused on attribute-specific comparison (Requirement 5.5)
 * - Cyberpunk dark theme styling (Requirement 10.2)
 */
export function AttributeRadarChart({
  searchedPlayer,
  similarPlayers,
  attributeCategory,
}: AttributeRadarChartProps) {
  // Get sub-attributes for the selected category
  const subAttributes = ATTRIBUTE_SUB_ATTRIBUTES[attributeCategory.toLowerCase()] || [];

  // Transform player stats into Recharts data format
  // Each sub-attribute becomes a data point with values for all players
  const chartData = subAttributes.map(({ key, label }) => {
    const dataPoint: Record<string, any> = {
      stat: label,
    };

    // Add searched player value
    const searchedValue = searchedPlayer.detailed_stats?.[key as keyof typeof searchedPlayer.detailed_stats];
    dataPoint[searchedPlayer.name] = searchedValue ?? 0;

    // Add similar players values
    similarPlayers.forEach((player) => {
      const value = player.detailed_stats?.[key as keyof typeof player.detailed_stats];
      dataPoint[player.name] = value ?? 0;
    });

    return dataPoint;
  });

  // Determine colors for each player
  const playerColors = [
    { name: searchedPlayer.name, color: ATTRIBUTE_COLORS.searched },
    ...similarPlayers.map((player, index) => ({
      name: player.name,
      color: [ATTRIBUTE_COLORS.similar1, ATTRIBUTE_COLORS.similar2, ATTRIBUTE_COLORS.similar3][index] || ATTRIBUTE_COLORS.similar1,
    })),
  ];

  return (
    <div className="w-full flex flex-col items-center p-6 font-mono bg-cyber-dark-gray border-2 border-purple-500 rounded-lg shadow-lg">
      {/* Chart Title with Attribute Category Highlight */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-purple-400 mb-1 tracking-wider">
          [ {attributeCategory.toUpperCase()} COMPARISON ]
        </h3>
        <p className="text-purple-300 text-sm tracking-wide">
          &gt; Attribute-Specific Similarity Analysis_
        </p>
      </div>

      {/* Responsive Radar Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={chartData}>
          {/* Grid lines - Purple theme for distinction */}
          <PolarGrid stroke="#ff00ff" strokeOpacity={0.3} />
          
          {/* Sub-attribute labels around the chart */}
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: '#ff00ff', fontSize: 14, fontWeight: 'bold' }}
          />
          
          {/* Radial axis (0-100 scale) */}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#ff00ff', fontSize: 11 }}
          />
          
          {/* Searched player data - Magenta */}
          <Radar
            name={searchedPlayer.name}
            dataKey={searchedPlayer.name}
            stroke={ATTRIBUTE_COLORS.searched}
            fill={ATTRIBUTE_COLORS.searched}
            fillOpacity={0.2}
            strokeWidth={3}
          />
          
          {/* Similar players data - Distinct colors */}
          {similarPlayers.map((player, index) => {
            const color = playerColors[index + 1].color;
            return (
              <Radar
                key={player.name}
                name={player.name}
                dataKey={player.name}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            );
          })}
          
          {/* Legend */}
          <Legend
            wrapperStyle={{
              paddingTop: '15px',
              fontSize: '13px',
              color: '#ff00ff',
            }}
          />
          
          {/* Tooltip on hover */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '2px solid #ff00ff',
              borderRadius: '8px',
              color: '#ff00ff',
              fontFamily: 'monospace',
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Numeric Values Display (Requirement 5.4) */}
      <div className="mt-6 w-full max-w-4xl">
        <h4 className="text-lg font-bold text-purple-400 mb-3 text-center tracking-wider">
          [ NUMERIC VALUES ]
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subAttributes.map(({ key, label }) => (
            <div
              key={key}
              className="bg-cyber-black border border-purple-500 rounded p-3"
            >
              <div className="text-purple-300 text-xs font-bold mb-2 uppercase tracking-wide">
                {label}
              </div>
              <div className="space-y-1">
                {/* Searched player value */}
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 text-sm truncate max-w-[150px]">
                    {searchedPlayer.name}
                  </span>
                  <span className="text-purple-200 font-bold">
                    {searchedPlayer.detailed_stats?.[key as keyof typeof searchedPlayer.detailed_stats] ?? 'N/A'}
                  </span>
                </div>
                {/* Similar players values */}
                {similarPlayers.map((player) => (
                  <div key={player.name} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm truncate max-w-[150px]">
                      {player.name}
                    </span>
                    <span className="text-gray-300 font-bold">
                      {player.detailed_stats?.[key as keyof typeof player.detailed_stats] ?? 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
