"""
Scout AI ML Engine - Machine Learning Core
Uses K-Nearest Neighbors to find similar players and recommend hidden gems.
"""

import pandas as pd
from sklearn.neighbors import NearestNeighbors
from typing import List, Dict, Optional
from models import Player, PlayerStats, SearchResponse, AttributeSearchResponse, DetailedPlayerStats


class MLEngine:
    """
    Machine learning engine for finding hidden gem players.
    
    Uses K-Nearest Neighbors with cosine similarity to find players
    with similar statistics to a searched player, then filters for
    lower-rated players to identify hidden gems.
    """
    
    def __init__(self):
        """Initialize ML engine with empty state."""
        self.df: Optional[pd.DataFrame] = None
        self.model: Optional[NearestNeighbors] = None
        self.feature_columns: List[str] = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY']
        
        # Attribute-based search: feature mapping and models
        self.attribute_features: Dict[str, List[str]] = {
            'pace': ['Acceleration', 'Sprint Speed'],
            'shooting': ['Positioning', 'Finishing', 'Shot Power', 'Long Shots', 'Volleys', 'Penalties'],
            'passing': ['Vision', 'Crossing', 'Free Kick Accuracy', 'Short Passing', 'Long Passing', 'Curve'],
            'dribbling': ['Agility', 'Balance', 'Reactions', 'Ball Control', 'Dribbling', 'Composure'],
            'defending': ['Interceptions', 'Heading Accuracy', 'Def Awareness', 'Standing Tackle', 'Sliding Tackle'],
            'physical': ['Jumping', 'Stamina', 'Strength', 'Aggression']
        }
        self.attribute_models: Dict[str, NearestNeighbors] = {}
        
    def load_data(self, csv_path: str) -> None:
        """
        Load and clean CSV data for ML processing.
        
        Args:
            csv_path: Path to the FC 24 player data CSV file
            
        Validates:
        - Requirements 3.1: Load CSV from specified path
        - Requirements 3.2: Fill null values with column mean
        - Requirements 8.3: Use six Player_Stats features
        """
        self.df = pd.read_csv(csv_path)
        
        # Remove duplicate players (keep first occurrence)
        self.df = self.df.drop_duplicates(subset=['name'], keep='first')
        
        # Fill null values in feature columns with column mean
        for col in self.feature_columns:
            if self.df[col].isnull().any():
                mean_value = self.df[col].mean()
                self.df[col] = self.df[col].fillna(mean_value)
        
        # Ensure numeric types
        for col in self.feature_columns:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
        
        # Drop rows with remaining nulls in required columns
        required_columns = ['name', 'club', 'nation', 'position', 'overall'] + self.feature_columns
        self.df = self.df.dropna(subset=required_columns)
        
        # Reset index after deduplication
        self.df = self.df.reset_index(drop=True)
    
    def train_model(self) -> None:
        """
        Train K-Nearest Neighbors model on player statistics.
        
        Validates:
        - Requirements 8.1: Use KNN with k=20 neighbors
        - Requirements 8.2: Use cosine similarity metric
        - Requirements 3.3: Model ready after startup
        """
        if self.df is None:
            raise ValueError("Data must be loaded before training model")
        
        X = self.df[self.feature_columns].values
        
        self.model = NearestNeighbors(
            n_neighbors=20,
            metric='cosine',
            algorithm='brute'
        )
        
        self.model.fit(X)
    
    def train_attribute_models(self) -> None:
        """
        Train separate KNN models for each attribute category.
        Called during startup after train_model().
        
        For each category:
        - Extract sub-attribute features
        - Create NearestNeighbors with k=4, metric='euclidean'
        - Fit on feature subset
        - Store in attribute_models dict
        
        Validates:
        - Requirements 8.1: Train separate models at startup
        - Requirements 8.2: Cache models in memory
        - Requirements 2.2: Use k=4 neighbors
        - Requirements 2.3: Use Euclidean distance
        - Requirements 6.4: Handle null values with column mean
        """
        if self.df is None:
            raise ValueError("Data must be loaded before training attribute models")
        
        # Get all sub-attribute columns needed
        all_sub_attributes = set()
        for features in self.attribute_features.values():
            all_sub_attributes.update(features)
        
        # Fill null values in sub-attribute columns with column mean (only for columns that exist)
        for col in all_sub_attributes:
            if col in self.df.columns and self.df[col].isnull().any():
                mean_value = self.df[col].mean()
                self.df[col] = self.df[col].fillna(mean_value)
        
        # Train a separate model for each attribute category
        for category, features in self.attribute_features.items():
            # Check if all required features exist in the dataframe
            available_features = [f for f in features if f in self.df.columns]
            
            if len(available_features) == 0:
                # Skip this category if no features are available
                continue
            
            # Extract feature values for this category (only available features)
            X = self.df[available_features].values
            
            # Create and train KNN model with k=4, euclidean distance
            model = NearestNeighbors(
                n_neighbors=min(4, len(self.df)),  # Handle small datasets
                metric='euclidean',
                algorithm='brute'
            )
            
            model.fit(X)
            
            # Store in attribute_models dict
            self.attribute_models[category] = model
    
    def find_hidden_gems(self, player_name: str) -> SearchResponse:
        """
        Find top 3 hidden gems similar to the given player.
        
        Args:
            player_name: Name of the player to search for
            
        Returns:
            SearchResponse with searched player and hidden gems
            
        Raises:
            ValueError: If player not found in database
            
        Validates:
        - Requirements 1.5: Case-insensitive matching
        - Requirements 2.1: Hidden gems have lower overall rating
        - Requirements 2.2, 2.3: Return 0-3 hidden gems
        - Requirements 2.4: Select from 20 nearest neighbors
        - Requirements 2.5: Order by similarity
        - Requirements 8.4: Exclude searched player from results
        - Requirements 5.3, 7.3: Return Pydantic models
        """
        if self.df is None or self.model is None:
            raise ValueError("ML engine not initialized")
        
        # Step 1: Find searched player (case-insensitive)
        player_row = self.df[self.df['name'].str.lower() == player_name.lower()]
        
        if player_row.empty:
            raise ValueError(f"Player '{player_name}' not found")
        
        target_rating = player_row['overall'].values[0]
        player_stats = player_row[self.feature_columns].values
        
        # Step 2: Find 20 nearest neighbors (or all available if fewer than 21 players)
        n_neighbors = min(21, len(self.df))
        distances, indices = self.model.kneighbors(player_stats, n_neighbors=n_neighbors)
        
        # Skip first result (the player itself)
        neighbor_indices = indices[0][1:]
        neighbor_distances = distances[0][1:]
        
        # Step 3: Filter for lower-rated players
        hidden_gems = []
        for idx, dist in zip(neighbor_indices, neighbor_distances):
            neighbor = self.df.iloc[idx]
            if neighbor['overall'] < target_rating:
                hidden_gems.append({
                    'player': neighbor,
                    'distance': dist
                })
        
        # Step 4: Return top 3 sorted by distance
        hidden_gems_sorted = sorted(hidden_gems, key=lambda x: x['distance'])[:3]
        
        return SearchResponse(
            searched_player=self._build_player_object(player_row.iloc[0]),
            hidden_gems=[self._build_player_object(gem['player']) for gem in hidden_gems_sorted]
        )
    
    def find_similar_by_attribute(
        self, 
        player_name: str, 
        attribute_category: str
    ) -> AttributeSearchResponse:
        """
        Find top 3 players similar in specific attribute category.
        
        Args:
            player_name: Name of player to search for
            attribute_category: One of pace/shooting/passing/dribbling/defending/physical
            
        Returns:
            AttributeSearchResponse with searched player and 3 similar players
            
        Raises:
            ValueError: If player not found or invalid category
            
        Process:
        1. Validate attribute_category
        2. Find player (case-insensitive)
        3. Get attribute model and features for category
        4. Extract player's attribute values
        5. Query KNN for 4 neighbors (k=4)
        6. Exclude searched player (first result)
        7. Return top 3 as similar_players
        
        Validates:
        - Requirements 1.2: Use only selected attribute's sub-attributes
        - Requirements 2.1: Find 3 most similar players
        - Requirements 2.4: Exclude searched player
        - Requirements 2.5: Order by similarity distance
        - Requirements 3.1-3.6: Use correct sub-attributes per category
        - Requirements 7.1: No rating filter applied
        """
        if self.df is None or not self.attribute_models:
            raise ValueError("ML engine not initialized with attribute models")
        
        # Step 1: Validate attribute_category
        if attribute_category not in self.attribute_features:
            valid_categories = ', '.join(self.attribute_features.keys())
            raise ValueError(f"Invalid attribute category '{attribute_category}'. Must be one of: {valid_categories}")
        
        # Check if model exists for this category
        if attribute_category not in self.attribute_models:
            raise ValueError(f"No model available for category '{attribute_category}'. Required sub-attributes may be missing from dataset.")
        
        # Step 2: Find player (case-insensitive)
        player_row = self.df[self.df['name'].str.lower() == player_name.lower()]
        
        if player_row.empty:
            raise ValueError(f"Player '{player_name}' not found")
        
        player_idx = player_row.index[0]
        
        # Step 3: Get attribute model and features for category
        model = self.attribute_models[attribute_category]
        features = self.attribute_features[attribute_category]
        
        # Use only available features (same as what was used during training)
        available_features = [f for f in features if f in self.df.columns]
        
        # Step 4: Extract player's attribute values
        player_features = player_row[available_features].values
        
        # Step 5: Query KNN for 4 neighbors (or all available if fewer)
        n_neighbors = min(4, len(self.df))
        distances, indices = model.kneighbors(player_features, n_neighbors=n_neighbors)
        
        # Step 6: Exclude searched player from results
        similar_players = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != player_idx:  # Exclude the searched player
                similar_players.append({
                    'player': self.df.iloc[idx],
                    'distance': dist
                })
        
        # Step 7: Return top 3 similar players (already ordered by distance)
        top_3_similar = similar_players[:3]
        
        return AttributeSearchResponse(
            searched_player=self._build_player_object(player_row.iloc[0], include_detailed=True),
            similar_players=[self._build_player_object(sim['player'], include_detailed=True) for sim in top_3_similar],
            attribute_category=attribute_category
        )
    
    def _build_player_object(self, player_row: pd.Series, include_detailed: bool = False) -> Player:
        """
        Convert DataFrame row to Player Pydantic model.
        
        Args:
            player_row: Pandas Series representing a player
            include_detailed: Whether to include detailed sub-attribute stats
            
        Returns:
            Player model instance with validated data
            
        Validates:
        - Requirements 5.3: Return complete player data
        - Requirements 7.3: All required fields present
        """
        player = Player(
            name=player_row['name'],
            club=player_row['club'],
            nation=player_row['nation'],
            position=player_row['position'],
            overall=int(player_row['overall']),
            stats=PlayerStats(
                PAC=int(player_row['PAC']),
                SHO=int(player_row['SHO']),
                PAS=int(player_row['PAS']),
                DRI=int(player_row['DRI']),
                DEF=int(player_row['DEF']),
                PHY=int(player_row['PHY'])
            )
        )
        
        # Add detailed stats if requested (for attribute search)
        if include_detailed:
            detailed_stats = {}
            
            # Get all sub-attribute columns
            all_sub_attributes = set()
            for features in self.attribute_features.values():
                all_sub_attributes.update(features)
            
            # Extract values for each sub-attribute
            for col in all_sub_attributes:
                if col in player_row.index and pd.notna(player_row[col]):
                    detailed_stats[col.replace(' ', '_')] = int(player_row[col])
            
            if detailed_stats:
                player.detailed_stats = DetailedPlayerStats(**detailed_stats)
        
        return player
