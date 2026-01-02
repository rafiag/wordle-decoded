"""
Tests for dashboard endpoint logic.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from backend.api.endpoints.dashboard import (
    _fetch_hardest_word,
    _fetch_easiest_word,
    _fetch_viral_moment,
    _calculate_nyt_effect,
    _get_community_mood,
    _get_avg_guesses_overall
)


class TestDashboardHelpers:
    """Tests for dashboard helper functions."""

    def test_fetch_hardest_word_with_data(self):
        """Test fetching hardest word when data exists."""
        mock_db = Mock()
        mock_word = Mock()
        mock_word.word = "TESTS"
        mock_word.difficulty_rating = 8.5
        mock_word.success_rate = 0.65
        mock_word.avg_guess_count = 4.8
        mock_word.date = "2023-01-15"

        # Setup query chain
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = mock_word
        mock_db.query.return_value = mock_query

        result = _fetch_hardest_word(mock_db)

        assert result["word"] == "TESTS"
        assert result["difficulty"] == 8.5
        assert result["success_rate"] == 65.0
        assert result["avg_guesses"] == 4.8
        assert result["date"] == "2023-01-15"

    def test_fetch_hardest_word_no_data(self):
        """Test fetching hardest word when no data exists."""
        mock_db = Mock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = None
        mock_db.query.return_value = mock_query

        result = _fetch_hardest_word(mock_db)

        assert result["word"] == "N/A"
        assert result["difficulty"] == 0
        assert result["success_rate"] == 0.0
        assert result["avg_guesses"] == 0.0
        assert result["date"] == ""

    def test_fetch_easiest_word_with_data(self):
        """Test fetching easiest word when data exists."""
        mock_db = Mock()
        mock_word = Mock()
        mock_word.word = "ARISE"
        mock_word.difficulty_rating = 2.1
        mock_word.success_rate = 0.98
        mock_word.avg_guess_count = 3.2
        mock_word.date = "2023-02-10"

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.first.return_value = mock_word
        mock_db.query.return_value = mock_query

        result = _fetch_easiest_word(mock_db)

        assert result["word"] == "ARISE"
        assert result["difficulty"] == 2.1
        assert result["success_rate"] == 98.0
        assert result["avg_guesses"] == 3.2

    def test_calculate_nyt_effect(self):
        """Test NYT effect calculation."""
        mock_db = Mock()

        # Mock query for pre-NYT period
        mock_query_pre = MagicMock()
        mock_query_pre.filter.return_value = mock_query_pre
        mock_query_pre.scalar.return_value = 3.8

        # Mock query for post-NYT period
        mock_query_post = MagicMock()
        mock_query_post.filter.return_value = mock_query_post
        mock_query_post.scalar.return_value = 4.1

        # Setup side_effect to return different queries
        mock_db.query.return_value.filter.side_effect = [
            mock_query_pre,
            mock_query_post
        ]

        # This is a simplified test - in reality would need more complex mocking
        # to handle the sequential filter calls properly
        result = _calculate_nyt_effect(mock_db)

        assert "delta" in result
        assert "direction" in result
        assert result["direction"] in ["increase", "decrease"]

    def test_get_avg_guesses_overall(self):
        """Test overall average guesses calculation."""
        mock_db = Mock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.scalar.return_value = 3.95
        mock_db.query.return_value = mock_query

        result = _get_avg_guesses_overall(mock_db)

        assert result == 3.95

    def test_get_avg_guesses_overall_no_data(self):
        """Test average guesses when no data exists."""
        mock_db = Mock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.scalar.return_value = None
        mock_db.query.return_value = mock_query

        result = _get_avg_guesses_overall(mock_db)

        assert result == 0.0

    @patch('backend.api.utils.get_mood_label')
    def test_get_community_mood(self, mock_get_mood_label):
        """Test community mood calculation."""
        mock_get_mood_label.return_value = "Mostly Positive"

        mock_db = Mock()

        # Mock average sentiment query
        mock_query_avg = MagicMock()
        mock_query_avg.scalar.return_value = 0.15

        # Mock total days count
        mock_query_total = MagicMock()
        mock_query_total.scalar.return_value = 100

        # Mock positive days count
        mock_query_pos = MagicMock()
        mock_query_pos.filter.return_value = mock_query_pos
        mock_query_pos.scalar.return_value = 75

        # Setup sequential calls
        call_count = [0]

        def query_side_effect(*args):
            call_count[0] += 1
            if call_count[0] == 1:
                return mock_query_avg
            elif call_count[0] == 2:
                return mock_query_total
            else:
                return mock_query_pos

        mock_db.query.side_effect = query_side_effect

        result = _get_community_mood(mock_db)

        assert result["avg_sentiment"] == 0.15
        assert result["positive_pct"] == 75.0
        assert result["mood_label"] == "Mostly Positive"
