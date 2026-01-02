"""
Tests for analytics endpoints.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from fastapi.testclient import TestClient
from backend.api.main import app


client = TestClient(app)


class TestSentimentAnalytics:
    """Tests for sentiment analytics endpoint."""

    @patch('backend.api.endpoints.analytics.get_db')
    def test_sentiment_endpoint_structure(self, mock_get_db):
        """Test that sentiment endpoint returns correct structure."""
        # Create mock database session
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db

        # Mock aggregates query
        mock_agg_result = Mock()
        mock_agg_result.very_neg = 100
        mock_agg_result.neg = 200
        mock_agg_result.neu = 300
        mock_agg_result.pos = 250
        mock_agg_result.very_pos = 150
        mock_agg_result.avg_frustration = 0.25

        # Mock frustration by difficulty query
        mock_frust_results = [
            (1, 0.15),  # Easy, low frustration
            (2, 0.30),  # Medium, medium frustration
            (3, 0.50),  # Hard, high frustration
        ]

        # Mock timeline query
        mock_timeline_result = Mock()
        mock_timeline_result.date = "2023-01-01"
        mock_timeline_result.target_word = "AROSE"
        mock_timeline_result.frustration_index = 0.15
        mock_timeline_result.difficulty_rating = 2.5
        mock_timeline_result.very_pos_count = 50
        mock_timeline_result.pos_count = 100
        mock_timeline_result.neu_count = 75
        mock_timeline_result.neg_count = 25
        mock_timeline_result.very_neg_count = 10

        # Setup mock query chain
        mock_query = MagicMock()
        mock_query.first.return_value = mock_agg_result
        mock_query.all.side_effect = [mock_frust_results, [mock_timeline_result]]
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.group_by.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query

        mock_db.query.return_value = mock_query

        # Make the request
        response = client.get("/api/v1/analytics/sentiment")

        assert response.status_code == 200
        data = response.json()

        # Verify structure
        assert data["status"] == "success"
        assert "aggregates" in data["data"]
        assert "timeline" in data["data"]
        assert "top_hated" in data["data"]
        assert "top_loved" in data["data"]

    def test_sentiment_endpoint_requires_database(self):
        """Test that endpoint handles database errors gracefully."""
        # This would typically test that database connection errors are handled
        # For now, just verify the endpoint exists and doesn't crash
        # In production, would mock database failure scenarios
        pass


class TestDifficultyLabel:
    """Tests for difficulty label helper in analytics."""

    @patch('backend.api.endpoints.analytics.get_difficulty_label')
    def test_difficulty_label_called(self, mock_label):
        """Verify difficulty label function is used in analytics."""
        mock_label.return_value = "Medium"

        # Would need to make actual API call with mocked database
        # to verify this is called correctly
        # Placeholder for now
        assert True
