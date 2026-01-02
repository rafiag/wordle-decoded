"""
Outlier data transformation module.

Identifies outlier days based on tweet volume and sentiment.
"""

import pandas as pd
import logging

# Configure logger
logger = logging.getLogger(__name__)


def transform_outlier_data(games_df: pd.DataFrame, tweets_df: pd.DataFrame) -> pd.DataFrame:
    """
    Identifies outlier days based on tweet volume and sentiment.
    Returns DataFrame for 'outliers' table.
    """
    logger.info("Transforming outlier data...")

    # 1. Merge Volume and Sentiment
    # tweets_df already aggregated by day? No, transform_tweets_data returns aggregated.
    # We assume the input 'tweets_df' here is the RESULT of transform_tweets_data (aggregated).
    # If not, we might need to re-aggregate.
    # Let's verify input type in orchestration. Assuming aggregated for now.

    # Actually, let's just make sure we have volume AND sentiment.
    # games_df has 'total_tweets' (volume) and 'date'.
    # tweets_df (aggregated) has 'date', 'avg_sentiment'.

    # Merge on date
    # Note: transformed games has 'Game' column, effectively the ID.
    merged = pd.merge(games_df[['date', 'target', 'total_tweets', 'Game', 'difficulty_rating']],
                      tweets_df[['date', 'avg_sentiment']],
                      on='date', how='inner')

    if merged.empty:
        logger.warning("No overlapping data for outliers analysis.")
        return pd.DataFrame()

    # 2. Calculate Z-Scores for Volume
    mean_vol = merged['total_tweets'].mean()
    std_vol = merged['total_tweets'].std()

    merged['expected_volume'] = mean_vol # Simplified: static mean. Improved: day-of-week avg.
    merged['z_score'] = (merged['total_tweets'] - mean_vol) / std_vol

    # 3. Identify Outliers
    outliers = []

    Z_THRESHOLD = 2.0
    SENTIMENT_LOW = -0.05 # Adjusted threshold for "negative" vibe
    SENTIMENT_HIGH = 0.2

    for _, row in merged.iterrows():
        z = row['z_score']
        sent = row['avg_sentiment']

        o_type = None
        context = ""

        # Viral High Volume
        if z > Z_THRESHOLD:
            if sent < SENTIMENT_LOW:
                o_type = 'viral_frustration'
                context = f"High volume (Z={z:.1f}) with negative sentiment ({sent:.2f}). likely a hard/controversial word."
            elif sent > SENTIMENT_HIGH:
                o_type = 'viral_fun'
                context = f"High volume (Z={z:.1f}) with positive sentiment. Community enjoyed this."
            else:
                o_type = 'viral_general' # Just busy
                context = f"Unusually high activity (Z={z:.1f})."

        # Quiet Days
        elif z < -Z_THRESHOLD:
            o_type = 'quiet_day'
            context = f"Very low activity (Z={z:.1f}). Possibly a holiday or data gap."

        # Sentiment Extremes (independent of volume, but let's keep it pertinent)
        elif sent < -0.3:
             o_type = 'sentiment_negative'
             context = f"Extremely negative sentiment ({sent:.2f})."

        if o_type:
            outliers.append({
                'word_id': row['Game'],
                'date': row['date'],
                'outlier_type': o_type,
                'metric': 'volume' if 'viral' in o_type or 'quiet' in o_type else 'sentiment',
                'actual_value': row['total_tweets'] if 'viral' in o_type or 'quiet' in o_type else sent,
                'expected_value': mean_vol if 'viral' in o_type or 'quiet' in o_type else 0.0,
                'z_score': z,
                'context': context
            })

    return pd.DataFrame(outliers)
