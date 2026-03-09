/**
 * Scout AI TypeScript Data Models
 * 
 * These interfaces match the backend Pydantic models exactly.
 * Validates: Requirements 7.4, 7.5
 */

/**
 * Player statistics with six core attributes.
 * All values are integers between 0-99.
 */
export interface PlayerStats {
  PAC: number;  // Pace stat (0-99)
  SHO: number;  // Shooting stat (0-99)
  PAS: number;  // Passing stat (0-99)
  DRI: number;  // Dribbling stat (0-99)
  DEF: number;  // Defending stat (0-99)
  PHY: number;  // Physical stat (0-99)
}

/**
 * Detailed player statistics including sub-attributes.
 * Used for attribute-based search visualization.
 * All values are optional integers between 0-99.
 */
export interface DetailedPlayerStats {
  // Main stats
  PAC: number;
  SHO: number;
  PAS: number;
  DRI: number;
  DEF: number;
  PHY: number;
  
  // Pace sub-attributes
  Acceleration?: number;
  Sprint_Speed?: number;
  
  // Shooting sub-attributes
  Positioning?: number;
  Finishing?: number;
  Shot_Power?: number;
  Long_Shots?: number;
  Volleys?: number;
  Penalties?: number;
  
  // Passing sub-attributes
  Vision?: number;
  Crossing?: number;
  Free_Kick_Accuracy?: number;
  Short_Passing?: number;
  Long_Passing?: number;
  Curve?: number;
  
  // Dribbling sub-attributes
  Agility?: number;
  Balance?: number;
  Reactions?: number;
  Ball_Control?: number;
  Dribbling?: number;
  Composure?: number;
  
  // Defending sub-attributes
  Interceptions?: number;
  Heading_Accuracy?: number;
  Def_Awareness?: number;
  Standing_Tackle?: number;
  Sliding_Tackle?: number;
  
  // Physical sub-attributes
  Jumping?: number;
  Stamina?: number;
  Strength?: number;
  Aggression?: number;
}

/**
 * Player model with complete information and statistics.
 * All fields are required (non-nullable).
 */
export interface Player {
  name: string;       // Player name (non-empty)
  club: string;       // Player's club
  nation: string;     // Player's nation
  position: string;   // Player's position
  overall: number;    // Overall rating (0-99)
  stats: PlayerStats; // Player statistics
  detailed_stats?: DetailedPlayerStats; // Optional detailed stats for attribute search
}

/**
 * Search response containing searched player and hidden gem recommendations.
 * Validates: Requirements 6.3, 7.4
 */
export interface SearchResponse {
  searched_player: Player;    // The player that was searched for
  hidden_gems: Player[];      // List of hidden gem recommendations (0-3 players)
}

/**
 * Attribute search response containing searched player and similar players by attribute.
 * Validates: Requirements 6.1, 6.5
 */
export interface AttributeSearchResponse {
  searched_player: Player;           // The player that was searched for
  similar_players: Player[];         // List of similar players (0-3 players)
  attribute_category: string;        // The attribute category used for search
}
