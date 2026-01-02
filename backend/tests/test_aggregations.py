"""
Tests for aggregation service.
"""

import pytest
from unittest.mock import Mock, MagicMock
from backend.services.aggregations import get_distribution_totals


class TestGetDistributionTotals:
    """Tests for get_distribution_totals service function."""

    def test_returns_aggregated_distribution(self):
        """Test that the function returns properly aggregated distribution data."""
        # Create mock database session
        mock_db = Mock()

        # Create mock result object
        mock_result = Mock()
        mock_result.g1 = 100
        mock_result.g2 = 200
        mock_result.g3 = 300
        mock_result.g4 = 200
        mock_result.g5 = 100
        mock_result.g6 = 50
        mock_result.fail = 50
        mock_result.total_games = 500

        # Setup mock query chain
        mock_query = MagicMock()
        mock_query.first.return_value = mock_result
        mock_db.query.return_value = mock_query

        # Call the function
        result = get_distribution_totals(mock_db)

        # Verify result
        assert result.g1 == 100
        assert result.g2 == 200
        assert result.g3 == 300
        assert result.g4 == 200
        assert result.g5 == 100
        assert result.g6 == 50
        assert result.fail == 50
        assert result.total_games == 500

    def test_query_is_called(self):
        """Test that the database query is actually executed."""
        mock_db = Mock()
        mock_query = MagicMock()
        mock_query.first.return_value = Mock()
        mock_db.query.return_value = mock_query

        get_distribution_totals(mock_db)

        # Verify db.query was called
        mock_db.query.assert_called_once()
        # Verify .first() was called to get the result
        mock_query.first.assert_called_once()

    def test_handles_empty_result(self):
        """Test that function handles empty database gracefully."""
        mock_db = Mock()
        mock_query = MagicMock()
        mock_query.first.return_value = None
        mock_db.query.return_value = mock_query

        result = get_distribution_totals(mock_db)

        # Should return None when no data exists
        assert result is None
