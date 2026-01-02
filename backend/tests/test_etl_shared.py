"""
Tests for ETL shared utilities.
"""

import pytest
from backend.etl.transformers.shared import (
    derive_date_from_id,
    clean_tweet_text,
    get_sentiment_score,
    calculate_frequency_score,
    extract_score_from_tweet
)


class TestDeriveDateFromId:
    """Tests for derive_date_from_id function."""

    def test_first_wordle_id(self):
        """Test that Wordle #1 maps to the start date."""
        result = derive_date_from_id(1)
        assert result == "2021-06-19"

    def test_second_wordle_id(self):
        """Test that Wordle #2 is one day after start."""
        result = derive_date_from_id(2)
        assert result == "2021-06-20"

    def test_wordle_100(self):
        """Test a larger Wordle ID."""
        result = derive_date_from_id(100)
        # 99 days after 2021-06-19 = 2021-09-26
        assert result == "2021-09-26"

    def test_out_of_bounds_id_logs_warning(self):
        """Test that out-of-bounds IDs log a warning but still return a date."""
        # Should log warning but not crash
        result = derive_date_from_id(3000)
        assert isinstance(result, str)
        assert len(result) == 10  # YYYY-MM-DD format


class TestCleanTweetText:
    """Tests for clean_tweet_text function."""

    def test_removes_wordle_pattern(self):
        """Test that 'Wordle X/6' pattern is removed."""
        text = "Wordle 123 4/6\nThis was hard!"
        result = clean_tweet_text(text)
        assert "Wordle 123 4/6" not in result
        assert "hard" in result.lower()

    def test_removes_urls(self):
        """Test that URLs are removed."""
        text = "Check this out https://example.com great game!"
        result = clean_tweet_text(text)
        assert "https://example.com" not in result
        assert "great" in result.lower()

    def test_removes_grid_emojis(self):
        """Test that Wordle grid emojis are removed."""
        text = "⬛⬛🟨🟩🟩 solved!"
        result = clean_tweet_text(text)
        assert "⬛" not in result
        assert "🟨" not in result
        assert "🟩" not in result
        # "solved" should remain after cleaning
        assert "solved" in result.lower()

    def test_removes_punctuation(self):
        """Test that punctuation is removed."""
        text = "This is awesome!!! Really, really good."
        result = clean_tweet_text(text)
        assert "!" not in result
        assert "," not in result
        assert "." not in result

    def test_handles_non_string_input(self):
        """Test that non-string input returns empty string."""
        result = clean_tweet_text(None)
        assert result == ""

        result = clean_tweet_text(123)
        assert result == ""

    def test_protects_wordle_keywords(self):
        """Test that Wordle-specific keywords are preserved."""
        text = "This was so hard but I got lucky in the end phew"
        result = clean_tweet_text(text)
        # Protected keywords should remain
        assert "hard" in result.lower()
        assert "lucky" in result.lower()
        assert "phew" in result.lower()


class TestGetSentimentScore:
    """Tests for get_sentiment_score function."""

    def test_positive_sentiment(self):
        """Test that positive text returns positive score."""
        text = "This was so easy and fun! Great game!"
        score = get_sentiment_score(text)
        assert score > 0

    def test_negative_sentiment(self):
        """Test that negative text returns negative score."""
        text = "This was impossible and frustrating! Failed again!"
        score = get_sentiment_score(text)
        assert score < 0

    def test_neutral_sentiment(self):
        """Test that neutral text returns near-zero score."""
        text = "The puzzle was okay."
        score = get_sentiment_score(text)
        # Should be close to neutral (allow wider range for VADER)
        assert -0.5 < score < 0.5

    def test_empty_text_returns_neutral(self):
        """Test that empty text returns 0.0."""
        score = get_sentiment_score("")
        assert score == 0.0


class TestCalculateFrequencyScore:
    """Tests for calculate_frequency_score function."""

    def test_common_letters_high_score(self):
        """Test that words with common letters get higher scores."""
        # ARISE has A, R, I, S, E - all common
        score = calculate_frequency_score("ARISE")
        assert score > 0.6

    def test_uncommon_letters_low_score(self):
        """Test that words with uncommon letters get lower scores."""
        # QUIRK has Q, U, K - uncommon
        score = calculate_frequency_score("QUIRK")
        assert score < 0.5

    def test_empty_word_returns_zero(self):
        """Test that empty string returns 0.0."""
        score = calculate_frequency_score("")
        assert score == 0.0

    def test_case_insensitive(self):
        """Test that function handles both upper and lower case."""
        score_upper = calculate_frequency_score("AROSE")
        score_lower = calculate_frequency_score("arose")
        assert score_upper == score_lower


class TestExtractScoreFromTweet:
    """Tests for extract_score_from_tweet function."""

    def test_extracts_score_1(self):
        """Test extracting score of 1."""
        text = "Wordle 123 1/6\n🟩🟩🟩🟩🟩"
        score = extract_score_from_tweet(text)
        assert score == 1

    def test_extracts_score_6(self):
        """Test extracting score of 6."""
        text = "Wordle 456 6/6\nBarely made it!"
        score = extract_score_from_tweet(text)
        assert score == 6

    def test_extracts_fail_as_7(self):
        """Test extracting X (fail) as 7."""
        text = "Wordle 789 X/6\nFailed today!"
        score = extract_score_from_tweet(text)
        assert score == 7

    def test_no_pattern_returns_none(self):
        """Test that tweets without pattern return None."""
        text = "Just talking about Wordle in general"
        score = extract_score_from_tweet(text)
        assert score is None

    def test_handles_non_string(self):
        """Test that non-string input returns None."""
        score = extract_score_from_tweet(None)
        assert score is None

        score = extract_score_from_tweet(123)
        assert score is None
