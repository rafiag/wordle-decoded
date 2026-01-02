"""
Mock data fixtures for testing.
"""

from datetime import datetime


class MockWord:
    """Mock Word model for testing."""

    def __init__(self, word_id, word, date, difficulty_rating, avg_guess_count, success_rate, frequency_score):
        self.id = word_id
        self.word = word
        self.date = date
        self.difficulty_rating = difficulty_rating
        self.avg_guess_count = avg_guess_count
        self.success_rate = success_rate
        self.frequency_score = frequency_score


class MockDistribution:
    """Mock Distribution model for testing."""

    def __init__(self, dist_id, word_id, date, guess_1, guess_2, guess_3, guess_4, guess_5, guess_6, failed, total_tweets):
        self.id = dist_id
        self.word_id = word_id
        self.date = date
        self.guess_1 = guess_1
        self.guess_2 = guess_2
        self.guess_3 = guess_3
        self.guess_4 = guess_4
        self.guess_5 = guess_5
        self.guess_6 = guess_6
        self.failed = failed
        self.total_tweets = total_tweets


class MockTweetSentiment:
    """Mock TweetSentiment model for testing."""

    def __init__(self, sent_id, word_id, date, avg_sentiment, frustration_index,
                 very_pos_count, pos_count, neu_count, neg_count, very_neg_count):
        self.id = sent_id
        self.word_id = word_id
        self.date = date
        self.avg_sentiment = avg_sentiment
        self.frustration_index = frustration_index
        self.very_pos_count = very_pos_count
        self.pos_count = pos_count
        self.neu_count = neu_count
        self.neg_count = neg_count
        self.very_neg_count = very_neg_count


class MockOutlier:
    """Mock Outlier model for testing."""

    def __init__(self, outlier_id, word_id, date, outlier_type, metric, actual_value, z_score):
        self.id = outlier_id
        self.word_id = word_id
        self.date = date
        self.outlier_type = outlier_type
        self.metric = metric
        self.actual_value = actual_value
        self.z_score = z_score


# Sample test data
SAMPLE_WORDS = [
    MockWord(1, "AROSE", "2023-01-01", 2.5, 3.2, 0.98, 0.8),
    MockWord(2, "TESTS", "2023-01-02", 8.5, 4.8, 0.65, 0.4),
    MockWord(3, "CAULK", "2023-01-03", 7.2, 4.5, 0.72, 0.3),
]

SAMPLE_DISTRIBUTIONS = [
    MockDistribution(1, 1, "2023-01-01", 100, 200, 300, 200, 100, 50, 50, 1000),
    MockDistribution(2, 2, "2023-01-02", 50, 100, 150, 200, 150, 100, 250, 1000),
    MockDistribution(3, 3, "2023-01-03", 75, 150, 200, 175, 125, 75, 200, 1000),
]

SAMPLE_SENTIMENTS = [
    MockTweetSentiment(1, 1, "2023-01-01", 0.25, 0.15, 100, 200, 150, 50, 25),
    MockTweetSentiment(2, 2, "2023-01-02", -0.15, 0.45, 50, 100, 150, 200, 100),
    MockTweetSentiment(3, 3, "2023-01-03", 0.05, 0.30, 80, 150, 180, 120, 70),
]

SAMPLE_OUTLIERS = [
    MockOutlier(1, 2, "2023-01-02", "viral_frustration", "volume", 5000, 3.5),
    MockOutlier(2, 1, "2023-01-01", "viral_fun", "volume", 4500, 3.2),
]


def get_sample_words():
    """Returns sample word data."""
    return SAMPLE_WORDS.copy()


def get_sample_distributions():
    """Returns sample distribution data."""
    return SAMPLE_DISTRIBUTIONS.copy()


def get_sample_sentiments():
    """Returns sample sentiment data."""
    return SAMPLE_SENTIMENTS.copy()


def get_sample_outliers():
    """Returns sample outlier data."""
    return SAMPLE_OUTLIERS.copy()
