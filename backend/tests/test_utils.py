"""
Tests for backend utility functions.
"""

import pytest
from backend.api.utils import (
    get_difficulty_label,
    get_mood_label,
    calculate_success_rate
)


class TestDifficultyLabel:
    """Tests for get_difficulty_label function."""

    def test_easy_label(self):
        assert get_difficulty_label(1.0) == "Easy"
        assert get_difficulty_label(2.5) == "Easy"
        assert get_difficulty_label(4.0) == "Easy"

    def test_medium_label(self):
        assert get_difficulty_label(4.1) == "Medium"
        assert get_difficulty_label(5.0) == "Medium"
        assert get_difficulty_label(6.0) == "Medium"

    def test_hard_label(self):
        assert get_difficulty_label(6.1) == "Hard"
        assert get_difficulty_label(7.0) == "Hard"
        assert get_difficulty_label(8.0) == "Hard"

    def test_expert_label(self):
        assert get_difficulty_label(8.1) == "Expert"
        assert get_difficulty_label(9.0) == "Expert"
        assert get_difficulty_label(10.0) == "Expert"

    def test_none_rating(self):
        assert get_difficulty_label(None) == "Unknown"


class TestMoodLabel:
    """Tests for get_mood_label function."""

    def test_positive_mood(self):
        assert get_mood_label(95.0) == "Positive"
        assert get_mood_label(91.0) == "Positive"

    def test_mostly_positive_mood(self):
        assert get_mood_label(90.0) == "Mostly Positive"
        assert get_mood_label(80.0) == "Mostly Positive"
        assert get_mood_label(71.0) == "Mostly Positive"

    def test_neutral_mood(self):
        assert get_mood_label(70.0) == "Neutral"
        assert get_mood_label(60.0) == "Neutral"
        assert get_mood_label(51.0) == "Neutral"

    def test_mostly_negative_mood(self):
        assert get_mood_label(50.0) == "Mostly Negative"
        assert get_mood_label(40.0) == "Mostly Negative"
        assert get_mood_label(31.0) == "Mostly Negative"

    def test_negative_mood(self):
        assert get_mood_label(30.0) == "Negative"
        assert get_mood_label(20.0) == "Negative"
        assert get_mood_label(0.0) == "Negative"


class TestCalculateSuccessRate:
    """Tests for calculate_success_rate function."""

    class MockDistResult:
        """Mock distribution result object."""
        def __init__(self, g1=0, g2=0, g3=0, g4=0, g5=0, g6=0, fail=0):
            self.g1 = g1
            self.g2 = g2
            self.g3 = g3
            self.g4 = g4
            self.g5 = g5
            self.g6 = g6
            self.fail = fail

    def test_perfect_success_rate(self):
        """Test 100% success rate (no failures)."""
        dist = self.MockDistResult(g1=10, g2=20, g3=30, g4=20, g5=10, g6=5, fail=0)
        assert calculate_success_rate(dist) == 100.0

    def test_partial_success_rate(self):
        """Test partial success rate."""
        # 80 successes out of 100 total = 80%
        dist = self.MockDistResult(g1=20, g2=20, g3=20, g4=10, g5=5, g6=5, fail=20)
        assert calculate_success_rate(dist) == 80.0

    def test_fifty_percent_success_rate(self):
        """Test 50% success rate."""
        dist = self.MockDistResult(g1=10, g2=10, g3=10, g4=10, g5=10, g6=0, fail=50)
        assert calculate_success_rate(dist) == 50.0

    def test_zero_total_returns_zero(self):
        """Test that zero total games returns 0% success rate."""
        dist = self.MockDistResult()
        assert calculate_success_rate(dist) == 0.0

    def test_none_values_handled(self):
        """Test that None values are treated as 0."""
        dist = self.MockDistResult(g1=10, g2=None, g3=10, g4=None, g5=10, g6=None, fail=None)
        # Total = 30, Success = 30, Rate = 100%
        assert calculate_success_rate(dist) == 100.0

    def test_all_failures(self):
        """Test 0% success rate (all failures)."""
        dist = self.MockDistResult(g1=0, g2=0, g3=0, g4=0, g5=0, g6=0, fail=100)
        assert calculate_success_rate(dist) == 0.0

    def test_realistic_distribution(self):
        """Test with realistic Wordle distribution."""
        # Typical Wordle distribution
        dist = self.MockDistResult(g1=5, g2=15, g3=25, g4=20, g5=10, g6=5, fail=20)
        # Total = 100, Success = 80, Rate = 80%
        assert calculate_success_rate(dist) == 80.0
