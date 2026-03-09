/**
 * RadarChart Component
 * 
 * Visualize statistical comparison between searched player and selected recommendation.
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
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
 * Props for the RadarChart component.
 */
export interface RadarChartProps {
  /** The player that was searched for */
  searchedPlayer: Player;
  /** The hidden gem player to compare against */
  comparisonPlayer: Player;
  /** Optional callback when chart is closed */
  onClose?: () => void;
}

/**
 * RadarChart component using Recharts library.
 * 
 * Features:
 * - Displays all six Player_Stats attributes (Requirement 4.2)
 * - Uses distinct colors: searched player (green), comparison (cyan) (Requirement 4.3)
 * - Renders using Recharts library (Requirement 4.4)
 * - Responsive sizing
 * - Overlays two players' stats: PAC, SHO, PAS, DRI, DEF, PHY
 */
export function RadarChart({ searchedPlayer, comparisonPlayer, onClose }: RadarChartProps) {
  // Transform player stats into Recharts data format
  // Each stat becomes a data point with values for both players
  const chartData = [
    {
      stat: 'PAC',
      [searchedPlayer.name]: searchedPlayer.stats.PAC,
      [comparisonPlayer.name]: comparisonPlayer.stats.PAC,
    },
    {
      stat: 'SHO',
      [searchedPlayer.name]: searchedPlayer.stats.SHO,
      [comparisonPlayer.name]: comparisonPlayer.stats.SHO,
    },
    {
      stat: 'PAS',
      [searchedPlayer.name]: searchedPlayer.stats.PAS,
      [comparisonPlayer.name]: comparisonPlayer.stats.PAS,
    },
    {
      stat: 'DRI',
      [searchedPlayer.name]: searchedPlayer.stats.DRI,
      [comparisonPlayer.name]: comparisonPlayer.stats.DRI,
    },
    {
      stat: 'DEF',
      [searchedPlayer.name]: searchedPlayer.stats.DEF,
      [comparisonPlayer.name]: comparisonPlayer.stats.DEF,
    },
    {
      stat: 'PHY',
      [searchedPlayer.name]: searchedPlayer.stats.PHY,
      [comparisonPlayer.name]: comparisonPlayer.stats.PHY,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 font-mono">
      {/* Chart Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-cyber-green-light mb-2 tracking-wider">
          [ PLAYER COMPARISON ]
        </h2>
        <p className="text-cyber-green tracking-wide">
          &gt; {searchedPlayer.name} vs {comparisonPlayer.name}_
        </p>
      </div>

      {/* Responsive Radar Chart */}
      <ResponsiveContainer width="100%" height={500}>
        <RechartsRadarChart data={chartData}>
          {/* Grid lines */}
          <PolarGrid stroke="#00ff41" strokeOpacity={0.3} />
          
          {/* Stat labels around the chart */}
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: '#39ff14', fontSize: 16, fontWeight: 'bold' }}
          />
          
          {/* Radial axis (0-100 scale) */}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#00ff41', fontSize: 12 }}
          />
          
          {/* Searched player data - Green (Requirement 4.3) */}
          <Radar
            name={searchedPlayer.name}
            dataKey={searchedPlayer.name}
            stroke="#00ff41"
            fill="#00ff41"
            fillOpacity={0.3}
            strokeWidth={3}
          />
          
          {/* Comparison player data - Cyan (Requirement 4.3) */}
          <Radar
            name={comparisonPlayer.name}
            dataKey={comparisonPlayer.name}
            stroke="#00ffff"
            fill="#00ffff"
            fillOpacity={0.3}
            strokeWidth={3}
          />
          
          {/* Legend */}
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              color: '#39ff14',
            }}
          />
          
          {/* Tooltip on hover */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '2px solid #00ff41',
              borderRadius: '8px',
              color: '#39ff14',
              fontFamily: 'monospace',
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Close button if onClose callback provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 text-lg font-bold bg-cyber-green text-cyber-black rounded-lg hover:bg-cyber-green-light focus:outline-none focus:ring-2 focus:ring-cyber-green-light transition-all hover:shadow-neon-green tracking-wider"
        >
          [ CLOSE COMPARISON ]
        </button>
      )}
    </div>
  );
}
