import pytest
import pandas as pd
from unittest.mock import MagicMock
from backend.services.nyt_service import NYTService
from backend.api.schemas import NYTMetrics, NYTComparison

class MockWord:
    def __init__(self, date, word, avg_guesses, difficulty, success_rate):
        self.date = date
        self.word = word
        self.avg_guess_count = avg_guesses
        self.difficulty_rating = difficulty
        self.success_rate = success_rate

class MockDistribution:
    def __init__(self, word_id):
        self.word_id = word_id

@pytest.fixture
def mock_db():
    return MagicMock()

def test_nyt_service_get_comparison(mock_db):
    # Setup mock data
    # Pre-NYT: 2022-01-01
    w1 = MockWord("2022-01-01", "HELLO", 3.5, 2, 0.9)
    d1 = MockDistribution(1)
    
    # Post-NYT: 2022-03-01
    w2 = MockWord("2022-03-01", "WORLD", 4.5, 8, 0.8)
    d2 = MockDistribution(2)

    # Mock DB response for select(Word, Distribution).join...
    # The service iterates over results
    mock_db.execute.return_value.all.return_value = [
        (w1, d1),
        (w2, d2)
    ]

    service = NYTService(mock_db)
    comparison = service.get_comparison_summary()

    # Verify Pre-NYT metrics
    assert comparison.before.avg_guesses == 3.5
    assert comparison.before.avg_difficulty == 2.0
    assert comparison.before.total_games == 1

    # Verify Post-NYT metrics
    assert comparison.after.avg_guesses == 4.5
    assert comparison.after.avg_difficulty == 8.0
    assert comparison.after.total_games == 1

    # Verify Differences
    assert comparison.diff_guesses == 1.0  # 4.5 - 3.5
    assert comparison.diff_difficulty == 6.0 # 8.0 - 2.0

def test_nyt_timeline(mock_db):
    w1 = MockWord("2022-01-01", "HELLO", 3.5, 2, 0.9)
    d1 = MockDistribution(1)
    
    mock_db.execute.return_value.all.return_value = [(w1, d1)]
    
    service = NYTService(mock_db)
    timeline = service.get_timeline()
    
    assert len(timeline) == 1
    assert timeline[0].date == "2022-01-01"
    assert timeline[0].era == "Pre-NYT"

def test_statistical_tests_empty(mock_db):
    mock_db.execute.return_value.all.return_value = []
    service = NYTService(mock_db)
    results = service.run_statistical_tests()
    assert results == {}
