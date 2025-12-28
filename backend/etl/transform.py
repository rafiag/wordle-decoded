import pandas as pd
from datetime import datetime, timedelta
import numpy as np
import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import logging
from typing import Optional

import os
from dotenv import load_dotenv

# Load env if present
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)

# Constants from environment or defaults
FRUSTRATION_THRESHOLD = float(os.getenv("FRUSTRATION_THRESHOLD", "-0.2"))
MIN_GAME_ID = int(os.getenv("MIN_GAME_ID", "1"))
MAX_GAME_ID = int(os.getenv("MAX_GAME_ID", "2000"))

# Wordle start date configuration
wordle_start_str = os.getenv("WORDLE_START_DATE", "2021-06-19")
try:
    WORDLE_START_DATE = datetime.strptime(wordle_start_str, "%Y-%m-%d")
except ValueError:
    logger.error(f"Invalid WORDLE_START_DATE format: {wordle_start_str}. Using default.")
    WORDLE_START_DATE = datetime(2021, 6, 19)

# Initialize NLTK
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()

def derive_date_from_id(wordle_id: int) -> str:
    """
    Derive the ISO date string from the Wordle Game ID.
    Raises ValueError if ID is out of expected bounds (1-2000).
    """
    if not (MIN_GAME_ID <= wordle_id <= MAX_GAME_ID):
        # We might have some outliers in raw data, so logging a warning 
        # is safer than crashing unless strict validation is required.
        # But per code review "medium-2", we want bounds checking.
        logger.warning(f"Deriving date for out-of-bounds Wordle ID: {wordle_id}")
    
    
    return (WORDLE_START_DATE + timedelta(days=wordle_id - 1)).strftime("%Y-%m-%d")

def clean_tweet_text(text: str) -> str:
    """
    Removes Wordle grids (squares) and common urls to leave just the user commentary.
    """
    if not isinstance(text, str):
        return ""
    
    # Remove squares (roughly covers most variations)
    # Unicode ranges for squares are broad, but let's try a simpler regex first.
    # Black/White/Yellow/Green squares.
    text = re.sub(r'[⬛⬜🟨🟩🟦🟧🟫]', '', text) 
    
    # Remove Wordle X/6 pattern
    text = re.sub(r'Wordle \d+ \w/\d', '', text)
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    
    return text.strip()

def get_sentiment_score(text: str) -> float:
    """
    Returns compound sentiment score (-1 to 1).
    """
    cleaned = clean_tweet_text(text)
    if not cleaned:
        return 0.0 # Neutral if empty
    return sia.polarity_scores(cleaned)['compound']

def transform_games_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms the raw games DataFrame into a structure ready for the 'words' and 'distributions' tables.
    """
    logger.info("Transforming games data...")
    counts = df.pivot_table(index='Game', columns='Trial', aggfunc='size', fill_value=0)
    for i in range(1, 8):
        if i not in counts.columns:
            counts[i] = 0
            
    counts = counts.rename(columns={1: 'guess_1', 2: 'guess_2', 3: 'guess_3', 
                                  4: 'guess_4', 5: 'guess_5', 6: 'guess_6', 
                                  7: 'failed'})
    
    targets = df.groupby('Game')['target'].first()
    result = counts.join(targets).reset_index()
    
    result['date'] = result['Game'].apply(derive_date_from_id)
    result['total_tweets'] = result[['guess_1', 'guess_2', 'guess_3', 'guess_4', 'guess_5', 'guess_6', 'failed']].sum(axis=1)
    
    weighted_sum = sum(result[f'guess_{i}'] * i for i in range(1, 7))
    successful_games = result['total_tweets'] - result['failed']
    
    # Avoid division by zero
    result['avg_guesses'] = 0.0
    mask = successful_games > 0
    result.loc[mask, 'avg_guesses'] = weighted_sum[mask] / successful_games[mask]
    
    result['success_rate'] = 0.0
    mask_total = result['total_tweets'] > 0
    result.loc[mask_total, 'success_rate'] = successful_games[mask_total] / result['total_tweets'][mask_total]

    logger.info(f"Transformed {len(result)} games/days.")
    return result

def transform_tweets_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms tweets:
    1. Group by wordle_id
    2. Calculate sentiment for each tweet
    3. Aggregate daily stats (avg sentiment, frustration index)
    """
    logger.info("Transforming tweets data (this may take a moment)...")
    
    # Apply sentiment
    df['sentiment'] = df['tweet_text'].apply(get_sentiment_score)
    
    # Define Frustration
    df['is_frustrated'] = df['sentiment'] < FRUSTRATION_THRESHOLD
    
    # Aggregate
    agg = df.groupby('wordle_id').agg({
        'sentiment': 'mean',
        'is_frustrated': 'mean', # Proportion of frustrated tweets
        'tweet_id': 'count'
    }).rename(columns={
        'sentiment': 'avg_sentiment', 
        'is_frustrated': 'frustration_index',
        'tweet_id': 'sample_size'
    })
    
    # Add date
    agg = agg.reset_index()
    agg['date'] = agg['wordle_id'].apply(derive_date_from_id)
    
    logger.info(f"Transformed tweets for {len(agg)} days.")
    return agg
