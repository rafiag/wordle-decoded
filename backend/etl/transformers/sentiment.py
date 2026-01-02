"""
Sentiment analysis transformation module.

Handles sentiment calculation and aggregation for tweet data.
"""

import pandas as pd
import logging
import multiprocessing
from .shared import (
    clean_tweet_text,
    get_sentiment_score,
    derive_date_from_id,
    FRUSTRATION_THRESHOLD
)

logger = logging.getLogger(__name__)


def transform_tweets_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms tweets with sentiment analysis.

    Steps:
    1. Group by wordle_id
    2. Calculate sentiment for each tweet (parallelized)
    3. Aggregate daily stats (avg sentiment, frustration index)

    Args:
        df: Raw tweets DataFrame

    Returns:
        Aggregated sentiment DataFrame
    """
    logger.info("Transforming tweets data with multiprocessing...")

    # Get number of CPUs to use (leave one for the system)
    num_processes = max(1, multiprocessing.cpu_count() - 1)
    logger.info(f"Using {num_processes} processes for parallel sentiment analysis.")

    # Extract text column as a list for multiprocessing
    texts = df['tweet_text'].fillna("").tolist()

    # Clean tweets and filter out empty ones
    logger.info("Cleaning tweets and filtering functional posts...")
    with multiprocessing.Pool(processes=num_processes) as pool:
        df['cleaned_text'] = pool.map(clean_tweet_text, texts)

    # Remove empty/null after cleaning
    initial_count = len(df)
    df = df[df['cleaned_text'].str.strip() != ""].copy()
    filtered_count = len(df)
    logger.info(f"Filtered {initial_count - filtered_count} functional tweets. Remaining: {filtered_count}")

    # Calculate sentiment for the remaining expressive tweets
    logger.info("Calculating sentiment for expressive tweets...")
    cleaned_texts = df['cleaned_text'].tolist()
    with multiprocessing.Pool(processes=num_processes) as pool:
        df['sentiment'] = pool.map(get_sentiment_score, cleaned_texts)

    # Define Frustration and Sentiment Buckets (5-bucket)
    df['is_frustrated'] = df['sentiment'] < FRUSTRATION_THRESHOLD
    df['is_very_neg'] = df['sentiment'] < -0.5
    df['is_neg'] = (df['sentiment'] >= -0.5) & (df['sentiment'] < -0.1)
    df['is_neu'] = (df['sentiment'] >= -0.1) & (df['sentiment'] <= 0.1)
    df['is_pos'] = (df['sentiment'] > 0.1) & (df['sentiment'] <= 0.5)
    df['is_very_pos'] = df['sentiment'] > 0.5

    # Aggregate
    agg = df.groupby('wordle_id').agg({
        'sentiment': 'mean',
        'is_frustrated': 'mean',  # Proportion of frustrated tweets
        'tweet_id': 'count',
        'is_very_pos': 'sum',
        'is_pos': 'sum',
        'is_neu': 'sum',
        'is_neg': 'sum',
        'is_very_neg': 'sum'
    }).rename(columns={
        'sentiment': 'avg_sentiment',
        'is_frustrated': 'frustration_index',
        'tweet_id': 'sample_size',
        'is_very_pos': 'very_pos_count',
        'is_pos': 'pos_count',
        'is_neu': 'neu_count',
        'is_neg': 'neg_count',
        'is_very_neg': 'very_neg_count'
    })

    # Add date
    agg = agg.reset_index()
    agg['date'] = agg['wordle_id'].apply(derive_date_from_id)

    logger.info(f"Transformed tweets for {len(agg)} days.")
    return agg
