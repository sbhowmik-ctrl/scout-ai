"""
Scout AI Data Models - Pydantic Models for API Validation
Defines data models with validation for player data and search responses.
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional


class PlayerStats(BaseModel):
    """
    Player statistics model with six core attributes.
    
    Validates:
    - Requirements 7.1: All stat values are integers between 0-99
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "PAC": 85,
                "SHO": 90,
                "PAS": 80,
                "DRI": 88,
                "DEF": 35,
                "PHY": 75
            }
        }
    )
    
    PAC: int = Field(..., ge=0, le=99, description="Pace stat (0-99)")
    SHO: int = Field(..., ge=0, le=99, description="Shooting stat (0-99)")
    PAS: int = Field(..., ge=0, le=99, description="Passing stat (0-99)")
    DRI: int = Field(..., ge=0, le=99, description="Dribbling stat (0-99)")
    DEF: int = Field(..., ge=0, le=99, description="Defending stat (0-99)")
    PHY: int = Field(..., ge=0, le=99, description="Physical stat (0-99)")


class DetailedPlayerStats(BaseModel):
    """
    Extended player statistics including 29 sub-attributes for attribute-based search.
    
    Validates:
    - Requirements 3.1-3.6: All sub-attribute fields for each category
    - Requirements 5.4: Detailed stats available for visualization
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "Acceleration": 96,
                "Sprint_Speed": 97,
                "Positioning": 88,
                "Finishing": 89,
                "Shot_Power": 85,
                "Long_Shots": 82,
                "Volleys": 85,
                "Penalties": 78,
                "Vision": 80,
                "Crossing": 75,
                "Free_Kick_Accuracy": 76,
                "Short_Passing": 82,
                "Long_Passing": 78,
                "Curve": 81,
                "Agility": 92,
                "Balance": 88,
                "Reactions": 92,
                "Ball_Control": 92,
                "Dribbling": 93,
                "Composure": 88,
                "Interceptions": 36,
                "Heading_Accuracy": 62,
                "Def_Awareness": 37,
                "Standing_Tackle": 35,
                "Sliding_Tackle": 33,
                "Jumping": 78,
                "Stamina": 84,
                "Strength": 70,
                "Aggression": 63
            }
        }
    )
    
    # Pace sub-attributes (2)
    Acceleration: Optional[int] = Field(None, ge=0, le=99, description="Acceleration stat")
    Sprint_Speed: Optional[int] = Field(None, ge=0, le=99, description="Sprint Speed stat")
    
    # Shooting sub-attributes (6)
    Positioning: Optional[int] = Field(None, ge=0, le=99, description="Positioning stat")
    Finishing: Optional[int] = Field(None, ge=0, le=99, description="Finishing stat")
    Shot_Power: Optional[int] = Field(None, ge=0, le=99, description="Shot Power stat")
    Long_Shots: Optional[int] = Field(None, ge=0, le=99, description="Long Shots stat")
    Volleys: Optional[int] = Field(None, ge=0, le=99, description="Volleys stat")
    Penalties: Optional[int] = Field(None, ge=0, le=99, description="Penalties stat")
    
    # Passing sub-attributes (6)
    Vision: Optional[int] = Field(None, ge=0, le=99, description="Vision stat")
    Crossing: Optional[int] = Field(None, ge=0, le=99, description="Crossing stat")
    Free_Kick_Accuracy: Optional[int] = Field(None, ge=0, le=99, description="Free Kick Accuracy stat")
    Short_Passing: Optional[int] = Field(None, ge=0, le=99, description="Short Passing stat")
    Long_Passing: Optional[int] = Field(None, ge=0, le=99, description="Long Passing stat")
    Curve: Optional[int] = Field(None, ge=0, le=99, description="Curve stat")
    
    # Dribbling sub-attributes (6)
    Agility: Optional[int] = Field(None, ge=0, le=99, description="Agility stat")
    Balance: Optional[int] = Field(None, ge=0, le=99, description="Balance stat")
    Reactions: Optional[int] = Field(None, ge=0, le=99, description="Reactions stat")
    Ball_Control: Optional[int] = Field(None, ge=0, le=99, description="Ball Control stat")
    Dribbling: Optional[int] = Field(None, ge=0, le=99, description="Dribbling stat")
    Composure: Optional[int] = Field(None, ge=0, le=99, description="Composure stat")
    
    # Defending sub-attributes (5)
    Interceptions: Optional[int] = Field(None, ge=0, le=99, description="Interceptions stat")
    Heading_Accuracy: Optional[int] = Field(None, ge=0, le=99, description="Heading Accuracy stat")
    Def_Awareness: Optional[int] = Field(None, ge=0, le=99, description="Defensive Awareness stat")
    Standing_Tackle: Optional[int] = Field(None, ge=0, le=99, description="Standing Tackle stat")
    Sliding_Tackle: Optional[int] = Field(None, ge=0, le=99, description="Sliding Tackle stat")
    
    # Physical sub-attributes (4)
    Jumping: Optional[int] = Field(None, ge=0, le=99, description="Jumping stat")
    Stamina: Optional[int] = Field(None, ge=0, le=99, description="Stamina stat")
    Strength: Optional[int] = Field(None, ge=0, le=99, description="Strength stat")
    Aggression: Optional[int] = Field(None, ge=0, le=99, description="Aggression stat")


class Player(BaseModel):
    """
    Player model with complete information and statistics.
    
    Validates:
    - Requirements 7.2: Player name is non-empty string
    - Requirements 7.3: All required fields present
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Kylian Mbappé",
                "club": "Paris Saint-Germain",
                "nation": "France",
                "position": "ST",
                "overall": 91,
                "stats": {
                    "PAC": 97,
                    "SHO": 89,
                    "PAS": 80,
                    "DRI": 92,
                    "DEF": 36,
                    "PHY": 77
                }
            }
        }
    )
    
    name: str = Field(..., min_length=1, description="Player name (non-empty)")
    club: str = Field(..., description="Player's club")
    nation: str = Field(..., description="Player's nation")
    position: str = Field(..., description="Player's position")
    overall: int = Field(..., ge=0, le=99, description="Overall rating (0-99)")
    stats: PlayerStats = Field(..., description="Player statistics")
    detailed_stats: Optional[DetailedPlayerStats] = Field(None, description="Detailed sub-attribute statistics for attribute search")
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v: str) -> str:
        """Ensure player name is not empty or whitespace only."""
        if not v or not v.strip():
            raise ValueError("Player name must be non-empty")
        return v


class SearchResponse(BaseModel):
    """
    Search response model containing searched player and hidden gem recommendations.
    
    Validates:
    - Requirements 6.3: Response has searched_player and hidden_gems fields
    - Requirements 7.4: Frontend can validate response structure
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "searched_player": {
                    "name": "Kylian Mbappé",
                    "club": "Paris Saint-Germain",
                    "nation": "France",
                    "position": "ST",
                    "overall": 91,
                    "stats": {
                        "PAC": 97,
                        "SHO": 89,
                        "PAS": 80,
                        "DRI": 92,
                        "DEF": 36,
                        "PHY": 77
                    }
                },
                "hidden_gems": [
                    {
                        "name": "Rafael Leão",
                        "club": "AC Milan",
                        "nation": "Portugal",
                        "position": "LW",
                        "overall": 84,
                        "stats": {
                            "PAC": 95,
                            "SHO": 78,
                            "PAS": 75,
                            "DRI": 90,
                            "DEF": 35,
                            "PHY": 75
                        }
                    }
                ]
            }
        }
    )
    
    searched_player: Player = Field(..., description="The player that was searched for")
    hidden_gems: List[Player] = Field(..., description="List of hidden gem recommendations (0-3 players)")


class AttributeSearchResponse(BaseModel):
    """
    Response model for attribute-based search.
    
    Contains the searched player, similar players based on attribute,
    and the attribute category used for search.
    
    Validates:
    - Requirements 6.1: Response has searched_player, similar_players, and attribute_category fields
    - Requirements 6.2: similar_players contains at most 3 players
    - Requirements 6.5: attribute_category is valid
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "searched_player": {
                    "name": "Kylian Mbappé",
                    "club": "Paris Saint-Germain",
                    "nation": "France",
                    "position": "ST",
                    "overall": 91,
                    "stats": {
                        "PAC": 97,
                        "SHO": 89,
                        "PAS": 80,
                        "DRI": 92,
                        "DEF": 36,
                        "PHY": 77
                    }
                },
                "similar_players": [
                    {
                        "name": "Rafael Leão",
                        "club": "AC Milan",
                        "nation": "Portugal",
                        "position": "LW",
                        "overall": 84,
                        "stats": {
                            "PAC": 95,
                            "SHO": 78,
                            "PAS": 75,
                            "DRI": 90,
                            "DEF": 35,
                            "PHY": 75
                        }
                    }
                ],
                "attribute_category": "pace"
            }
        }
    )
    
    searched_player: Player = Field(..., description="The player that was searched for")
    similar_players: List[Player] = Field(..., description="List of similar players based on attribute (0-3 players)")
    attribute_category: str = Field(..., description="Attribute category used for search")
    
    @field_validator('similar_players')
    @classmethod
    def validate_similar_players_count(cls, v: List[Player]) -> List[Player]:
        """Ensure 0-3 similar players."""
        if len(v) > 3:
            raise ValueError("similar_players must contain at most 3 players")
        return v
    
    @field_validator('attribute_category')
    @classmethod
    def validate_attribute_category(cls, v: str) -> str:
        """Ensure valid attribute category."""
        valid_categories = {'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'}
        if v not in valid_categories:
            raise ValueError(f"attribute_category must be one of {valid_categories}")
        return v
