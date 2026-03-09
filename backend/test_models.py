"""
Unit tests for data models in models.py
Tests AttributeSearchResponse and DetailedPlayerStats validation.
"""

import pytest
from pydantic import ValidationError
from models import (
    Player,
    PlayerStats,
    DetailedPlayerStats,
    AttributeSearchResponse
)


class TestAttributeSearchResponse:
    """Test AttributeSearchResponse model validation."""
    
    def test_valid_attribute_search_response(self):
        """Test creating a valid AttributeSearchResponse."""
        searched_player = Player(
            name="Kylian Mbappé",
            club="Paris Saint-Germain",
            nation="France",
            position="ST",
            overall=91,
            stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
        )
        
        similar_player = Player(
            name="Rafael Leão",
            club="AC Milan",
            nation="Portugal",
            position="LW",
            overall=84,
            stats=PlayerStats(PAC=95, SHO=78, PAS=75, DRI=90, DEF=35, PHY=75)
        )
        
        response = AttributeSearchResponse(
            searched_player=searched_player,
            similar_players=[similar_player],
            attribute_category="pace"
        )
        
        assert response.searched_player.name == "Kylian Mbappé"
        assert len(response.similar_players) == 1
        assert response.attribute_category == "pace"
    
    def test_similar_players_count_validation_zero(self):
        """Test that 0 similar players is valid (Requirements 6.2)."""
        searched_player = Player(
            name="Kylian Mbappé",
            club="Paris Saint-Germain",
            nation="France",
            position="ST",
            overall=91,
            stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
        )
        
        response = AttributeSearchResponse(
            searched_player=searched_player,
            similar_players=[],
            attribute_category="pace"
        )
        
        assert len(response.similar_players) == 0
    
    def test_similar_players_count_validation_three(self):
        """Test that 3 similar players is valid (Requirements 6.2)."""
        searched_player = Player(
            name="Kylian Mbappé",
            club="Paris Saint-Germain",
            nation="France",
            position="ST",
            overall=91,
            stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
        )
        
        similar_players = [
            Player(
                name=f"Player {i}",
                club="Test Club",
                nation="Test Nation",
                position="ST",
                overall=80,
                stats=PlayerStats(PAC=80, SHO=80, PAS=80, DRI=80, DEF=80, PHY=80)
            )
            for i in range(3)
        ]
        
        response = AttributeSearchResponse(
            searched_player=searched_player,
            similar_players=similar_players,
            attribute_category="shooting"
        )
        
        assert len(response.similar_players) == 3
    
    def test_similar_players_count_validation_exceeds_max(self):
        """Test that more than 3 similar players raises ValidationError (Requirements 6.2)."""
        searched_player = Player(
            name="Kylian Mbappé",
            club="Paris Saint-Germain",
            nation="France",
            position="ST",
            overall=91,
            stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
        )
        
        similar_players = [
            Player(
                name=f"Player {i}",
                club="Test Club",
                nation="Test Nation",
                position="ST",
                overall=80,
                stats=PlayerStats(PAC=80, SHO=80, PAS=80, DRI=80, DEF=80, PHY=80)
            )
            for i in range(4)
        ]
        
        with pytest.raises(ValidationError) as exc_info:
            AttributeSearchResponse(
                searched_player=searched_player,
                similar_players=similar_players,
                attribute_category="passing"
            )
        
        assert "similar_players must contain at most 3 players" in str(exc_info.value)
    
    def test_valid_attribute_categories(self):
        """Test all valid attribute categories (Requirements 6.5)."""
        valid_categories = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical']
        
        searched_player = Player(
            name="Test Player",
            club="Test Club",
            nation="Test Nation",
            position="ST",
            overall=80,
            stats=PlayerStats(PAC=80, SHO=80, PAS=80, DRI=80, DEF=80, PHY=80)
        )
        
        for category in valid_categories:
            response = AttributeSearchResponse(
                searched_player=searched_player,
                similar_players=[],
                attribute_category=category
            )
            assert response.attribute_category == category
    
    def test_invalid_attribute_category(self):
        """Test that invalid attribute category raises ValidationError (Requirements 6.5)."""
        searched_player = Player(
            name="Test Player",
            club="Test Club",
            nation="Test Nation",
            position="ST",
            overall=80,
            stats=PlayerStats(PAC=80, SHO=80, PAS=80, DRI=80, DEF=80, PHY=80)
        )
        
        invalid_categories = ['speed', 'attack', 'defense', 'invalid', '']
        
        for category in invalid_categories:
            with pytest.raises(ValidationError) as exc_info:
                AttributeSearchResponse(
                    searched_player=searched_player,
                    similar_players=[],
                    attribute_category=category
                )
            
            assert "attribute_category must be one of" in str(exc_info.value)


class TestDetailedPlayerStats:
    """Test DetailedPlayerStats model field types and validation."""
    
    def test_all_fields_optional(self):
        """Test that all DetailedPlayerStats fields are optional."""
        # Should be able to create with no fields
        stats = DetailedPlayerStats()
        assert stats.Acceleration is None
        assert stats.Sprint_Speed is None
        assert stats.Positioning is None
    
    def test_pace_sub_attributes(self):
        """Test Pace sub-attributes (Requirements 3.1)."""
        stats = DetailedPlayerStats(
            Acceleration=96,
            Sprint_Speed=97
        )
        assert stats.Acceleration == 96
        assert stats.Sprint_Speed == 97
    
    def test_shooting_sub_attributes(self):
        """Test Shooting sub-attributes (Requirements 3.2)."""
        stats = DetailedPlayerStats(
            Positioning=88,
            Finishing=89,
            Shot_Power=85,
            Long_Shots=82,
            Volleys=85,
            Penalties=78
        )
        assert stats.Positioning == 88
        assert stats.Finishing == 89
        assert stats.Shot_Power == 85
        assert stats.Long_Shots == 82
        assert stats.Volleys == 85
        assert stats.Penalties == 78
    
    def test_passing_sub_attributes(self):
        """Test Passing sub-attributes (Requirements 3.3)."""
        stats = DetailedPlayerStats(
            Vision=80,
            Crossing=75,
            Free_Kick_Accuracy=76,
            Short_Passing=82,
            Long_Passing=78,
            Curve=81
        )
        assert stats.Vision == 80
        assert stats.Crossing == 75
        assert stats.Free_Kick_Accuracy == 76
        assert stats.Short_Passing == 82
        assert stats.Long_Passing == 78
        assert stats.Curve == 81
    
    def test_dribbling_sub_attributes(self):
        """Test Dribbling sub-attributes (Requirements 3.4)."""
        stats = DetailedPlayerStats(
            Agility=92,
            Balance=88,
            Reactions=92,
            Ball_Control=92,
            Dribbling=93,
            Composure=88
        )
        assert stats.Agility == 92
        assert stats.Balance == 88
        assert stats.Reactions == 92
        assert stats.Ball_Control == 92
        assert stats.Dribbling == 93
        assert stats.Composure == 88
    
    def test_defending_sub_attributes(self):
        """Test Defending sub-attributes (Requirements 3.5)."""
        stats = DetailedPlayerStats(
            Interceptions=36,
            Heading_Accuracy=62,
            Def_Awareness=37,
            Standing_Tackle=35,
            Sliding_Tackle=33
        )
        assert stats.Interceptions == 36
        assert stats.Heading_Accuracy == 62
        assert stats.Def_Awareness == 37
        assert stats.Standing_Tackle == 35
        assert stats.Sliding_Tackle == 33
    
    def test_physical_sub_attributes(self):
        """Test Physical sub-attributes (Requirements 3.6)."""
        stats = DetailedPlayerStats(
            Jumping=78,
            Stamina=84,
            Strength=70,
            Aggression=63
        )
        assert stats.Jumping == 78
        assert stats.Stamina == 84
        assert stats.Strength == 70
        assert stats.Aggression == 63
    
    def test_all_29_sub_attributes(self):
        """Test all 29 sub-attributes can be set (Requirements 3.1-3.6, 5.4)."""
        stats = DetailedPlayerStats(
            # Pace (2)
            Acceleration=96,
            Sprint_Speed=97,
            # Shooting (6)
            Positioning=88,
            Finishing=89,
            Shot_Power=85,
            Long_Shots=82,
            Volleys=85,
            Penalties=78,
            # Passing (6)
            Vision=80,
            Crossing=75,
            Free_Kick_Accuracy=76,
            Short_Passing=82,
            Long_Passing=78,
            Curve=81,
            # Dribbling (6)
            Agility=92,
            Balance=88,
            Reactions=92,
            Ball_Control=92,
            Dribbling=93,
            Composure=88,
            # Defending (5)
            Interceptions=36,
            Heading_Accuracy=62,
            Def_Awareness=37,
            Standing_Tackle=35,
            Sliding_Tackle=33,
            # Physical (4)
            Jumping=78,
            Stamina=84,
            Strength=70,
            Aggression=63
        )
        
        # Verify all 29 fields are set
        assert stats.Acceleration == 96
        assert stats.Sprint_Speed == 97
        assert stats.Positioning == 88
        assert stats.Finishing == 89
        assert stats.Shot_Power == 85
        assert stats.Long_Shots == 82
        assert stats.Volleys == 85
        assert stats.Penalties == 78
        assert stats.Vision == 80
        assert stats.Crossing == 75
        assert stats.Free_Kick_Accuracy == 76
        assert stats.Short_Passing == 82
        assert stats.Long_Passing == 78
        assert stats.Curve == 81
        assert stats.Agility == 92
        assert stats.Balance == 88
        assert stats.Reactions == 92
        assert stats.Ball_Control == 92
        assert stats.Dribbling == 93
        assert stats.Composure == 88
        assert stats.Interceptions == 36
        assert stats.Heading_Accuracy == 62
        assert stats.Def_Awareness == 37
        assert stats.Standing_Tackle == 35
        assert stats.Sliding_Tackle == 33
        assert stats.Jumping == 78
        assert stats.Stamina == 84
        assert stats.Strength == 70
        assert stats.Aggression == 63
    
    def test_field_type_validation(self):
        """Test that sub-attribute fields only accept integers."""
        # Valid integer
        stats = DetailedPlayerStats(Acceleration=96)
        assert stats.Acceleration == 96
        
        # Invalid type should raise ValidationError
        with pytest.raises(ValidationError):
            DetailedPlayerStats(Acceleration="not_an_int")
    
    def test_field_range_validation(self):
        """Test that sub-attribute fields validate range 0-99."""
        # Valid range
        stats = DetailedPlayerStats(Acceleration=0, Sprint_Speed=99)
        assert stats.Acceleration == 0
        assert stats.Sprint_Speed == 99
        
        # Below range
        with pytest.raises(ValidationError):
            DetailedPlayerStats(Acceleration=-1)
        
        # Above range
        with pytest.raises(ValidationError):
            DetailedPlayerStats(Sprint_Speed=100)


class TestPlayerModelExtension:
    """Test Player model extension with detailed_stats field."""
    
    def test_player_without_detailed_stats(self):
        """Test Player can be created without detailed_stats (backward compatibility)."""
        player = Player(
            name="Test Player",
            club="Test Club",
            nation="Test Nation",
            position="ST",
            overall=80,
            stats=PlayerStats(PAC=80, SHO=80, PAS=80, DRI=80, DEF=80, PHY=80)
        )
        assert player.detailed_stats is None
    
    def test_player_with_detailed_stats(self):
        """Test Player can be created with detailed_stats."""
        detailed = DetailedPlayerStats(
            Acceleration=96,
            Sprint_Speed=97,
            Positioning=88
        )
        
        player = Player(
            name="Test Player",
            club="Test Club",
            nation="Test Nation",
            position="ST",
            overall=80,
            stats=PlayerStats(PAC=80, SHO=80, PAS=80, DRI=80, DEF=80, PHY=80),
            detailed_stats=detailed
        )
        
        assert player.detailed_stats is not None
        assert player.detailed_stats.Acceleration == 96
        assert player.detailed_stats.Sprint_Speed == 97
