import pytest
import pandas as pd
from unittest.mock import patch
from backend.etl import extract, transform, load
from backend.db.schema import Word, Distribution, TweetSentiment

# Sample Data
GAMES_DATA = {
    'Game': [500, 500, 501],
    'Trial': [3, 4, 1],
    'target': ['react', 'react', 'vuejs'],
    'Username': ['user1', 'user2', 'user3'],
    'processed_text': ['...', '...', '...']
}

TWEETS_DATA = {
    'tweet_text': ['I love Wordle!', 'This is hard...', 'Impossible today'],
    'tweet_date': pd.to_datetime(['2022-01-01', '2022-01-01', '2022-01-02']),
    'wordle_id': [500, 500, 501],
    'tweet_id': [101, 102, 103] # Added required column
}

@pytest.fixture
def mock_extract():
    with patch('backend.etl.extract.load_kaggle_games_raw') as mock_games, \
         patch('backend.etl.extract.load_kaggle_tweets_raw') as mock_tweets:
        
        mock_games.return_value = pd.DataFrame(GAMES_DATA)
        mock_tweets.return_value = pd.DataFrame(TWEETS_DATA)
        yield mock_games, mock_tweets

def test_full_pipeline_execution(db_session, mock_extract):
    """
    Test the full Extract-Transform-Load cycle using mocked source data
    and a real in-memory SQLite database.
    """
    # 1. Extract (Mocked)
    games_df = extract.load_kaggle_games_raw()
    tweets_df = extract.load_kaggle_tweets_raw()
    
    # 2. Transform
    games_transformed = transform.transform_games_data(games_df)
    tweets_transformed = transform.transform_tweets_data(tweets_df)
    
    assert len(games_transformed) == 2 # ID 500, 501
    assert len(tweets_transformed) == 2 # ID 500, 501
    
    # 3. Load
    # We need to monkeypatch SessionLocal in load.py to use our test session
    # OR we can just check if load functions accept a session? 
    # Current implementation instantiates SessionLocal() inside the function.
    # To test properly without writing to disk DB, we'd need to dependency inject the session.
    # Refactoring load.py to accept session is better engineering, but let's patch SessionLocal.
    
    with patch('backend.etl.load.SessionLocal') as mock_session_cls:
        mock_session_cls.return_value = db_session
        
        load.load_games_data(games_transformed)
        load.load_tweets_data(tweets_transformed)
        
        # 4. Verify in DB
        words = db_session.query(Word).all()
        dists = db_session.query(Distribution).all()
        sents = db_session.query(TweetSentiment).all()
        
        assert len(words) == 2
        assert len(dists) == 2
        assert len(sents) == 2
        
        # Check specific values
        w500 = next(w for w in words if w.id == 500)
        assert w500.word == 'react'
        
        s500 = next(s for s in sents if s.word_id == 500)
        # 2 tweets for 500: "I love" (pos), "This is hard" (neg/neutral)
        assert s500.sample_size == 2

def test_idempotency(db_session, mock_extract):
    """Verify loading same data twice doesn't duplicate records."""
    games_df = extract.load_kaggle_games_raw()
    games_transformed = transform.transform_games_data(games_df)
    
    with patch('backend.etl.load.SessionLocal') as mock_session_cls:
        mock_session_cls.return_value = db_session
        
        # Run 1
        load.load_games_data(games_transformed)
        count1 = db_session.query(Word).count()
        
        # Run 2
        load.load_games_data(games_transformed)
        count2 = db_session.query(Word).count()
        
        assert count1 == count2 == 2
