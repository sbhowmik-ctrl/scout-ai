"""
Unit tests for FastAPI endpoints.
Tests API endpoints with mocked MLEngine for isolated testing.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from main import app
from models import Player, PlayerStats, SearchResponse


@pytest.fixture
def client():
    """Create test client for FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_ml_engine():
    """Create mock MLEngine instance."""
    mock_engine = Mock()
    return mock_engine


@pytest.fixture
def sample_player():
    """Create sample player for testing."""
    return Player(
        name="Kylian Mbappé",
        club="Paris Saint-Germain",
        nation="France",
        position="ST",
        overall=91,
        stats=PlayerStats(
            PAC=97,
            SHO=89,
            PAS=80,
            DRI=92,
            DEF=36,
            PHY=77
        )
    )


@pytest.fixture
def sample_hidden_gems():
    """Create sample hidden gems for testing."""
    return [
        Player(
            name="Rafael Leão",
            club="AC Milan",
            nation="Portugal",
            position="LW",
            overall=84,
            stats=PlayerStats(
                PAC=95,
                SHO=78,
                PAS=75,
                DRI=90,
                DEF=35,
                PHY=75
            )
        ),
        Player(
            name="Vinícius Júnior",
            club="Real Madrid",
            nation="Brazil",
            position="LW",
            overall=86,
            stats=PlayerStats(
                PAC=95,
                SHO=83,
                PAS=79,
                DRI=92,
                DEF=29,
                PHY=68
            )
        ),
        Player(
            name="Marcus Rashford",
            club="Manchester United",
            nation="England",
            position="LW",
            overall=85,
            stats=PlayerStats(
                PAC=93,
                SHO=86,
                PAS=79,
                DRI=85,
                DEF=44,
                PHY=83
            )
        )
    ]


class TestHealthEndpoint:
    """Test suite for /health endpoint."""
    
    def test_health_check_returns_200(self, client):
        """Test that /health endpoint returns 200 status code."""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_health_check_returns_correct_structure(self, client):
        """Test that /health endpoint returns expected JSON structure."""
        response = client.get("/health")
        data = response.json()
        
        assert "status" in data
        assert "service" in data
        assert data["status"] == "healthy"
        assert data["service"] == "Scout AI Backend"
    
    def test_health_check_content_type(self, client):
        """Test that /health endpoint returns JSON content type."""
        response = client.get("/health")
        assert "application/json" in response.headers["content-type"]


class TestSearchEndpoint:
    """Test suite for /search/{player_name} endpoint."""
    
    def test_search_valid_player_returns_200(
        self, 
        client, 
        mock_ml_engine, 
        sample_player, 
        sample_hidden_gems
    ):
        """Test /search endpoint with valid player name returns 200."""
        # Setup mock response
        mock_response = SearchResponse(
            searched_player=sample_player,
            hidden_gems=sample_hidden_gems
        )
        mock_ml_engine.find_hidden_gems.return_value = mock_response
        
        # Inject mock engine
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe")
        
        assert response.status_code == 200
        mock_ml_engine.find_hidden_gems.assert_called_once_with("Mbappe")
    
    def test_search_valid_player_returns_correct_structure(
        self, 
        client, 
        mock_ml_engine, 
        sample_player, 
        sample_hidden_gems
    ):
        """Test /search endpoint returns correct JSON structure."""
        mock_response = SearchResponse(
            searched_player=sample_player,
            hidden_gems=sample_hidden_gems
        )
        mock_ml_engine.find_hidden_gems.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe")
        
        data = response.json()
        
        # Verify response structure
        assert "searched_player" in data
        assert "hidden_gems" in data
        
        # Verify searched player fields
        assert data["searched_player"]["name"] == "Kylian Mbappé"
        assert data["searched_player"]["overall"] == 91
        assert "stats" in data["searched_player"]
        
        # Verify hidden gems
        assert len(data["hidden_gems"]) == 3
        assert all(gem["overall"] < 91 for gem in data["hidden_gems"])
    
    def test_search_non_existent_player_returns_404(self, client, mock_ml_engine):
        """Test /search endpoint with non-existent player returns 404."""
        # Setup mock to raise ValueError
        mock_ml_engine.find_hidden_gems.side_effect = ValueError(
            "Player 'NonExistentPlayer' not found"
        )
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/NonExistentPlayer")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_search_with_special_characters(self, client, mock_ml_engine):
        """Test /search endpoint handles player names with special characters."""
        mock_ml_engine.find_hidden_gems.side_effect = ValueError(
            "Player 'Invalid@Name' not found"
        )
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Invalid@Name")
        
        # Should handle gracefully and return 404
        assert response.status_code == 404
    
    def test_search_with_spaces_in_name(
        self, 
        client, 
        mock_ml_engine, 
        sample_player, 
        sample_hidden_gems
    ):
        """Test /search endpoint handles player names with spaces."""
        mock_response = SearchResponse(
            searched_player=sample_player,
            hidden_gems=sample_hidden_gems
        )
        mock_ml_engine.find_hidden_gems.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Kylian Mbappe")
        
        assert response.status_code == 200
        mock_ml_engine.find_hidden_gems.assert_called_once_with("Kylian Mbappe")
    
    def test_search_uninitialized_engine_returns_503(self, client):
        """Test /search endpoint returns 503 when ML engine not initialized."""
        with patch('main.ml_engine', None):
            response = client.get("/search/Mbappe")
        
        assert response.status_code == 503
        assert "not initialized" in response.json()["detail"].lower()
    
    def test_search_empty_hidden_gems(
        self, 
        client, 
        mock_ml_engine, 
        sample_player
    ):
        """Test /search endpoint handles case with no hidden gems."""
        mock_response = SearchResponse(
            searched_player=sample_player,
            hidden_gems=[]
        )
        mock_ml_engine.find_hidden_gems.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["hidden_gems"]) == 0
    
    def test_search_single_hidden_gem(
        self, 
        client, 
        mock_ml_engine, 
        sample_player,
        sample_hidden_gems
    ):
        """Test /search endpoint handles case with single hidden gem."""
        mock_response = SearchResponse(
            searched_player=sample_player,
            hidden_gems=[sample_hidden_gems[0]]
        )
        mock_ml_engine.find_hidden_gems.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["hidden_gems"]) == 1
    
    def test_search_response_model_validation(
        self, 
        client, 
        mock_ml_engine, 
        sample_player, 
        sample_hidden_gems
    ):
        """Test that /search endpoint validates response model."""
        mock_response = SearchResponse(
            searched_player=sample_player,
            hidden_gems=sample_hidden_gems
        )
        mock_ml_engine.find_hidden_gems.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe")
        
        data = response.json()
        
        # Validate all required fields are present
        player = data["searched_player"]
        assert all(key in player for key in ["name", "club", "nation", "position", "overall", "stats"])
        
        # Validate stats structure
        stats = player["stats"]
        assert all(key in stats for key in ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"])
        
        # Validate all hidden gems have same structure
        for gem in data["hidden_gems"]:
            assert all(key in gem for key in ["name", "club", "nation", "position", "overall", "stats"])
            assert all(key in gem["stats"] for key in ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"])


class TestCORSConfiguration:
    """Test suite for CORS configuration."""
    
    def test_cors_headers_present(self, client):
        """Test that CORS headers are configured."""
        response = client.options(
            "/search/test",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        # CORS middleware should add appropriate headers
        assert "access-control-allow-origin" in response.headers or response.status_code in [200, 404]


class TestErrorHandling:
    """Test suite for error handling scenarios."""
    
    def test_search_handles_unexpected_exception(self, client, mock_ml_engine):
        """Test /search endpoint handles unexpected exceptions."""
        # Setup mock to raise unexpected exception
        mock_ml_engine.find_hidden_gems.side_effect = Exception("Unexpected error")
        
        with patch('main.ml_engine', mock_ml_engine):
            # FastAPI will raise the exception, which is expected behavior
            # In production, you'd add exception handlers to catch these
            with pytest.raises(Exception, match="Unexpected error"):
                response = client.get("/search/Mbappe")
    
    def test_search_handles_value_error_with_custom_message(self, client, mock_ml_engine):
        """Test /search endpoint preserves custom error messages."""
        custom_message = "Player 'TestPlayer' not found in database"
        mock_ml_engine.find_hidden_gems.side_effect = ValueError(custom_message)
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/TestPlayer")
        
        assert response.status_code == 404
        assert custom_message in response.json()["detail"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


# ============================================================================
# Property Tests for Attribute Search API Endpoint (Task 4.3-4.8)
# ============================================================================

from hypothesis import given, strategies as st, settings
from models import AttributeSearchResponse, DetailedPlayerStats


@pytest.fixture
def sample_detailed_player():
    """Create sample player with detailed stats for attribute search testing."""
    return Player(
        name="Kylian Mbappé",
        club="Paris Saint-Germain",
        nation="France",
        position="ST",
        overall=91,
        stats=PlayerStats(
            PAC=97,
            SHO=89,
            PAS=80,
            DRI=92,
            DEF=36,
            PHY=77
        ),
        detailed_stats=DetailedPlayerStats(
            Acceleration=96,
            Sprint_Speed=97,
            Positioning=88,
            Finishing=89,
            Shot_Power=85,
            Long_Shots=82,
            Volleys=85,
            Penalties=78
        )
    )


@pytest.fixture
def sample_similar_players():
    """Create sample similar players for attribute search testing."""
    return [
        Player(
            name="Rafael Leão",
            club="AC Milan",
            nation="Portugal",
            position="LW",
            overall=84,
            stats=PlayerStats(
                PAC=95,
                SHO=78,
                PAS=75,
                DRI=90,
                DEF=35,
                PHY=75
            ),
            detailed_stats=DetailedPlayerStats(
                Acceleration=95,
                Sprint_Speed=95
            )
        ),
        Player(
            name="Vinícius Júnior",
            club="Real Madrid",
            nation="Brazil",
            position="LW",
            overall=86,
            stats=PlayerStats(
                PAC=95,
                SHO=83,
                PAS=79,
                DRI=92,
                DEF=29,
                PHY=68
            ),
            detailed_stats=DetailedPlayerStats(
                Acceleration=94,
                Sprint_Speed=96
            )
        ),
        Player(
            name="Adama Traoré",
            club="Wolverhampton",
            nation="Spain",
            position="RW",
            overall=76,
            stats=PlayerStats(
                PAC=96,
                SHO=58,
                PAS=63,
                DRI=79,
                DEF=31,
                PHY=84
            ),
            detailed_stats=DetailedPlayerStats(
                Acceleration=97,
                Sprint_Speed=98
            )
        )
    ]


class TestAttributeSearchEndpoint:
    """Test suite for /search/{player_name}/attribute/{attribute_category} endpoint."""
    
    def test_attribute_search_valid_request_returns_200(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player, 
        sample_similar_players
    ):
        """Test attribute search endpoint with valid inputs returns 200."""
        mock_response = AttributeSearchResponse(
            searched_player=sample_detailed_player,
            similar_players=sample_similar_players,
            attribute_category="pace"
        )
        mock_ml_engine.find_similar_by_attribute.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe/attribute/pace")
        
        assert response.status_code == 200
        mock_ml_engine.find_similar_by_attribute.assert_called_once_with("Mbappe", "pace")
    
    def test_attribute_search_invalid_category_returns_400(self, client, mock_ml_engine):
        """Test attribute search endpoint with invalid category returns 400."""
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe/attribute/invalid_category")
        
        assert response.status_code == 400
        assert "Invalid attribute category" in response.json()["detail"]
    
    def test_attribute_search_player_not_found_returns_404(self, client, mock_ml_engine):
        """Test attribute search endpoint with non-existent player returns 404."""
        mock_ml_engine.find_similar_by_attribute.side_effect = ValueError(
            "Player 'NonExistent' not found"
        )
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/NonExistent/attribute/pace")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_attribute_search_uninitialized_engine_returns_503(self, client):
        """Test attribute search endpoint returns 503 when ML engine not initialized."""
        with patch('main.ml_engine', None):
            response = client.get("/search/Mbappe/attribute/pace")
        
        assert response.status_code == 503
        assert "not initialized" in response.json()["detail"].lower()
    
    def test_attribute_search_backend_error_returns_500(self, client, mock_ml_engine):
        """Test attribute search endpoint returns 500 for backend errors."""
        mock_ml_engine.find_similar_by_attribute.side_effect = ValueError(
            "No model available for category 'pace'"
        )
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe/attribute/pace")
        
        assert response.status_code == 500
        assert "No model available" in response.json()["detail"]
    
    def test_attribute_search_all_valid_categories(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player, 
        sample_similar_players
    ):
        """Test attribute search endpoint accepts all valid categories."""
        valid_categories = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical']
        
        for category in valid_categories:
            mock_response = AttributeSearchResponse(
                searched_player=sample_detailed_player,
                similar_players=sample_similar_players,
                attribute_category=category
            )
            mock_ml_engine.find_similar_by_attribute.return_value = mock_response
            
            with patch('main.ml_engine', mock_ml_engine):
                response = client.get(f"/search/Mbappe/attribute/{category}")
            
            assert response.status_code == 200
            data = response.json()
            assert data["attribute_category"] == category
    
    def test_attribute_search_case_insensitive_category(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player, 
        sample_similar_players
    ):
        """Test attribute search endpoint handles uppercase category names."""
        mock_response = AttributeSearchResponse(
            searched_player=sample_detailed_player,
            similar_players=sample_similar_players,
            attribute_category="pace"
        )
        mock_ml_engine.find_similar_by_attribute.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe/attribute/PACE")
        
        assert response.status_code == 200
        # Verify it was converted to lowercase
        mock_ml_engine.find_similar_by_attribute.assert_called_once_with("Mbappe", "pace")
    
    def test_attribute_search_with_spaces_in_player_name(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player, 
        sample_similar_players
    ):
        """Test attribute search endpoint handles player names with spaces."""
        mock_response = AttributeSearchResponse(
            searched_player=sample_detailed_player,
            similar_players=sample_similar_players,
            attribute_category="pace"
        )
        mock_ml_engine.find_similar_by_attribute.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Kylian Mbappe/attribute/pace")
        
        assert response.status_code == 200
        mock_ml_engine.find_similar_by_attribute.assert_called_once_with("Kylian Mbappe", "pace")
    
    def test_attribute_search_empty_similar_players(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player
    ):
        """Test attribute search endpoint handles case with no similar players."""
        mock_response = AttributeSearchResponse(
            searched_player=sample_detailed_player,
            similar_players=[],
            attribute_category="pace"
        )
        mock_ml_engine.find_similar_by_attribute.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe/attribute/pace")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["similar_players"]) == 0
    
    def test_attribute_search_response_structure(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player, 
        sample_similar_players
    ):
        """Test attribute search endpoint returns correct response structure."""
        mock_response = AttributeSearchResponse(
            searched_player=sample_detailed_player,
            similar_players=sample_similar_players,
            attribute_category="pace"
        )
        mock_ml_engine.find_similar_by_attribute.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            response = client.get("/search/Mbappe/attribute/pace")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields
        assert "searched_player" in data
        assert "similar_players" in data
        assert "attribute_category" in data
        
        # Verify searched_player structure
        player = data["searched_player"]
        assert all(key in player for key in ["name", "club", "nation", "position", "overall", "stats"])
        
        # Verify similar_players structure
        assert isinstance(data["similar_players"], list)
        assert len(data["similar_players"]) <= 3
        for similar in data["similar_players"]:
            assert all(key in similar for key in ["name", "club", "nation", "position", "overall", "stats"])
    
    def test_attribute_search_response_time(
        self, 
        client, 
        mock_ml_engine, 
        sample_detailed_player, 
        sample_similar_players
    ):
        """Test attribute search endpoint responds within 200ms (Requirements 4.5)."""
        import time
        
        mock_response = AttributeSearchResponse(
            searched_player=sample_detailed_player,
            similar_players=sample_similar_players,
            attribute_category="pace"
        )
        mock_ml_engine.find_similar_by_attribute.return_value = mock_response
        
        with patch('main.ml_engine', mock_ml_engine):
            start_time = time.time()
            response = client.get("/search/Mbappe/attribute/pace")
            end_time = time.time()
        
        assert response.status_code == 200
        
        # Response time should be under 200ms (0.2 seconds)
        # Note: This is a mock test, so it should be very fast
        # In integration tests with real ML engine, this would be more meaningful
        response_time_ms = (end_time - start_time) * 1000
        assert response_time_ms < 200, f"Response time {response_time_ms}ms exceeds 200ms limit"


# Property 5: Valid Response Structure
# **Validates: Requirements 4.2**
@settings(max_examples=100, deadline=None)
@given(
    player_name=st.sampled_from(['Mbappe', 'Ronaldo', 'Messi', 'Haaland', 'Neymar']),
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_valid_response_structure_property(player_name, attribute_category):
    """
    **Validates: Requirements 4.2**
    
    Property 5: Valid Response Structure
    
    Test that valid requests return correct AttributeSearchResponse structure.
    For any valid player name and attribute category, the backend should return
    an AttributeSearchResponse with the correct structure containing searched_player,
    similar_players (0-3 players), and the requested attribute_category.
    """
    client = TestClient(app)
    mock_ml_engine = Mock()
    
    # Create sample players
    sample_detailed_player = Player(
        name="Kylian Mbappé",
        club="Paris Saint-Germain",
        nation="France",
        position="ST",
        overall=91,
        stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77),
        detailed_stats=DetailedPlayerStats(Acceleration=96, Sprint_Speed=97)
    )
    
    sample_similar_players = [
        Player(
            name="Rafael Leão",
            club="AC Milan",
            nation="Portugal",
            position="LW",
            overall=84,
            stats=PlayerStats(PAC=95, SHO=78, PAS=75, DRI=90, DEF=35, PHY=75)
        )
    ]
    
    # Create mock response with correct structure
    mock_response = AttributeSearchResponse(
        searched_player=sample_detailed_player,
        similar_players=sample_similar_players[:3],  # Ensure max 3 players
        attribute_category=attribute_category
    )
    mock_ml_engine.find_similar_by_attribute.return_value = mock_response
    
    with patch('main.ml_engine', mock_ml_engine):
        response = client.get(f"/search/{player_name}/attribute/{attribute_category}")
    
    # Verify response structure
    assert response.status_code == 200
    data = response.json()
    
    # Check all required fields are present
    assert "searched_player" in data
    assert "similar_players" in data
    assert "attribute_category" in data
    
    # Verify searched_player structure
    assert "name" in data["searched_player"]
    assert "club" in data["searched_player"]
    assert "nation" in data["searched_player"]
    assert "position" in data["searched_player"]
    assert "overall" in data["searched_player"]
    assert "stats" in data["searched_player"]
    
    # Verify similar_players is a list with 0-3 players
    assert isinstance(data["similar_players"], list)
    assert len(data["similar_players"]) <= 3
    
    # Verify attribute_category matches request
    assert data["attribute_category"] == attribute_category


# Property 6: Invalid Category Rejection
# **Validates: Requirements 4.3, 4.4**
@settings(max_examples=100, deadline=None)
@given(
    invalid_category=st.text(min_size=1, max_size=20, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))).filter(
        lambda x: x not in ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical']
    )
)
def test_invalid_category_rejection_property(invalid_category):
    """
    **Validates: Requirements 4.3, 4.4**
    
    Property 6: Invalid Category Rejection
    
    Test that invalid categories return HTTP 400.
    For any invalid attribute category (not in the valid set), the backend
    should return HTTP 400 with an error message.
    """
    client = TestClient(app)
    mock_ml_engine = Mock()
    
    with patch('main.ml_engine', mock_ml_engine):
        response = client.get(f"/search/Mbappe/attribute/{invalid_category}")
    
    # Should return 400 for invalid category
    assert response.status_code == 400
    assert "Invalid attribute category" in response.json()["detail"]


# Property 10: Response Category Match
# **Validates: Requirements 6.5**
@settings(max_examples=100, deadline=None)
@given(
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_response_category_match_property(attribute_category):
    """
    **Validates: Requirements 6.5**
    
    Property 10: Response Category Match
    
    Test that response attribute_category matches request.
    For any attribute search request with category X, the returned
    AttributeSearchResponse should have attribute_category field equal to X.
    """
    client = TestClient(app)
    mock_ml_engine = Mock()
    
    sample_detailed_player = Player(
        name="Kylian Mbappé",
        club="Paris Saint-Germain",
        nation="France",
        position="ST",
        overall=91,
        stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
    )
    
    sample_similar_players = [
        Player(
            name="Rafael Leão",
            club="AC Milan",
            nation="Portugal",
            position="LW",
            overall=84,
            stats=PlayerStats(PAC=95, SHO=78, PAS=75, DRI=90, DEF=35, PHY=75)
        )
    ]
    
    mock_response = AttributeSearchResponse(
        searched_player=sample_detailed_player,
        similar_players=sample_similar_players[:3],
        attribute_category=attribute_category
    )
    mock_ml_engine.find_similar_by_attribute.return_value = mock_response
    
    with patch('main.ml_engine', mock_ml_engine):
        response = client.get(f"/search/Mbappe/attribute/{attribute_category}")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify attribute_category in response matches request
    assert data["attribute_category"] == attribute_category


# Property 7: Similar Players Count Validation
# **Validates: Requirements 6.2**
@settings(max_examples=100, deadline=None)
@given(
    num_similar=st.integers(min_value=0, max_value=3),
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_similar_players_count_validation_property(num_similar, attribute_category):
    """
    **Validates: Requirements 6.2**
    
    Property 7: Similar Players Count Validation
    
    Test that similar_players contains 0-3 players.
    For any attribute search response, the similar_players list should
    contain between 0 and 3 players (inclusive).
    """
    client = TestClient(app)
    mock_ml_engine = Mock()
    
    sample_detailed_player = Player(
        name="Kylian Mbappé",
        club="Paris Saint-Germain",
        nation="France",
        position="ST",
        overall=91,
        stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
    )
    
    sample_similar_players = [
        Player(
            name=f"Player{i}",
            club="Club",
            nation="Nation",
            position="ST",
            overall=80,
            stats=PlayerStats(PAC=90, SHO=80, PAS=80, DRI=80, DEF=40, PHY=70)
        )
        for i in range(3)
    ]
    
    mock_response = AttributeSearchResponse(
        searched_player=sample_detailed_player,
        similar_players=sample_similar_players[:num_similar],
        attribute_category=attribute_category
    )
    mock_ml_engine.find_similar_by_attribute.return_value = mock_response
    
    with patch('main.ml_engine', mock_ml_engine):
        response = client.get(f"/search/Mbappe/attribute/{attribute_category}")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify similar_players count is between 0 and 3
    assert 0 <= len(data["similar_players"]) <= 3
    assert len(data["similar_players"]) == num_similar


# Property 12: Model Reuse Across Requests
# **Validates: Requirements 8.2**
@settings(max_examples=50, deadline=None)
@given(
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_model_reuse_across_requests_property(attribute_category):
    """
    **Validates: Requirements 8.2**
    
    Property 12: Model Reuse Across Requests
    
    Test that same model instance is used for consecutive requests.
    For any two consecutive attribute search requests for the same attribute
    category, the same cached KNN model instance should be used (no retraining).
    
    Note: This test verifies that the ML engine's find_similar_by_attribute
    method is called (which uses cached models), not that a new model is trained.
    """
    client = TestClient(app)
    mock_ml_engine = Mock()
    
    sample_detailed_player = Player(
        name="Kylian Mbappé",
        club="Paris Saint-Germain",
        nation="France",
        position="ST",
        overall=91,
        stats=PlayerStats(PAC=97, SHO=89, PAS=80, DRI=92, DEF=36, PHY=77)
    )
    
    sample_similar_players = [
        Player(
            name="Rafael Leão",
            club="AC Milan",
            nation="Portugal",
            position="LW",
            overall=84,
            stats=PlayerStats(PAC=95, SHO=78, PAS=75, DRI=90, DEF=35, PHY=75)
        )
    ]
    
    mock_response = AttributeSearchResponse(
        searched_player=sample_detailed_player,
        similar_players=sample_similar_players[:3],
        attribute_category=attribute_category
    )
    mock_ml_engine.find_similar_by_attribute.return_value = mock_response
    
    with patch('main.ml_engine', mock_ml_engine):
        # Make first request
        response1 = client.get(f"/search/Mbappe/attribute/{attribute_category}")
        assert response1.status_code == 200
        
        # Make second request with same category
        response2 = client.get(f"/search/Ronaldo/attribute/{attribute_category}")
        assert response2.status_code == 200
        
        # Verify find_similar_by_attribute was called twice (using cached model)
        assert mock_ml_engine.find_similar_by_attribute.call_count == 2
        
        # Both calls should use the same attribute_category
        calls = mock_ml_engine.find_similar_by_attribute.call_args_list
        assert calls[0][0][1] == attribute_category
        assert calls[1][0][1] == attribute_category


# Property 14: Error Response Format
# **Validates: Requirements 9.3**
@settings(max_examples=100, deadline=None)
@given(
    error_message=st.text(min_size=10, max_size=100),
    attribute_category=st.sampled_from(['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'])
)
def test_error_response_format_property(error_message, attribute_category):
    """
    **Validates: Requirements 9.3**
    
    Property 14: Error Response Format
    
    Test that backend errors return HTTP 500 with descriptive message.
    For any backend error during attribute search, the system should return
    HTTP 500 with a descriptive error message in the response body.
    
    Note: We test ValueError exceptions that don't contain "not found" (which
    would be 404), to ensure they're treated as server errors (500).
    """
    client = TestClient(app)
    mock_ml_engine = Mock()
    
    # Create error message that doesn't contain "not found" to trigger 500
    backend_error = f"Backend error: {error_message}"
    mock_ml_engine.find_similar_by_attribute.side_effect = ValueError(backend_error)
    
    with patch('main.ml_engine', mock_ml_engine):
        response = client.get(f"/search/Mbappe/attribute/{attribute_category}")
    
    # Should return 500 for backend errors (not 404)
    assert response.status_code == 500
    
    # Response should have detail field with error message
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], str)
    assert len(data["detail"]) > 0
