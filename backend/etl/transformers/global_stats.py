"""
Global statistics transformation module.

Aggregates data across all datasets to produce global statistics.
"""

import pandas as pd
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)


def transform_global_stats_data(games_df: pd.DataFrame, tweets_df: pd.DataFrame, outliers_df: pd.DataFrame) -> dict:
    """
    Aggregates data across all datasets to produce a single 'GlobalStats' record.
    Returns: dict matching GlobalStats schema.
    """
    logger.info("Calculating Global Stats...")

    # 1. Overview Metrics
    total_games = len(games_df)

    # Overall Avg Guesses (Weighted by total_games or just avg of avgs?
    # Ideally weighted, but simple avg of avgs is often close if sample sizes are similar.
    # We have 'total_tweets' (volume) per game, can use that as weight.
    # games_df has 'avg_guesses' and 'total_tweets'.
    total_volume = games_df['total_tweets'].sum()
    weighted_sum_guesses = (games_df['avg_guesses'] * games_df['total_tweets']).sum()
    avg_guesses = weighted_sum_guesses / total_volume if total_volume > 0 else 0.0

    # Global Success Rate
    # We need aggregated wins / aggregated trials.
    # games_df has 'success_rate' and 'total_tweets' (trials).
    # wins = success_rate * total_tweets
    total_wins = (games_df['success_rate'] * games_df['total_tweets']).sum()
    success_rate = (total_wins / total_volume * 100) if total_volume > 0 else 0.0

    # 2. Key Highlights
    # Hardest Word
    if not games_df.empty:
        hardest = games_df.loc[games_df['avg_guesses'].idxmax()]
        easiest = games_df.loc[games_df['avg_guesses'].idxmin()]
    else:
        hardest = easiest = pd.Series()

    # Most Viral
    # Outliers DF has 'metric'='volume' and 'outlier_type' like 'viral%'.
    # Or just max 'actual_value' from volume outliers.
    most_viral = pd.Series()
    if not outliers_df.empty:
        viral_events = outliers_df[outliers_df['metric'] == 'volume']
        if not viral_events.empty:
            most_viral = viral_events.loc[viral_events['actual_value'].idxmax()]

    # Lookup viral word if found
    most_viral_word_str = "N/A"
    if not most_viral.empty:
        # Assuming most_viral['word_id'] exists and matches games_df['Game']
        # games_df set index to 'Game' for fast lookup? Or just filter.
        # games_df has 'Game' column.
        vid = most_viral.get('word_id')
        matches = games_df[games_df['Game'] == vid]
        if not matches.empty:
            most_viral_word_str = matches.iloc[0]['target']

    # 3. Community Stats
    if not tweets_df.empty:
        avg_sentiment = tweets_df['avg_sentiment'].mean()
        # Positive Pct (Rows with sentiment > 0 / Total Rows)
        positive_days = (tweets_df['avg_sentiment'] > 0).sum()
        positive_pct = (positive_days / len(tweets_df)) * 100

        from backend.api.utils import get_mood_label
        mood_label = get_mood_label(positive_pct)
    else:
        avg_sentiment = 0.0
        positive_pct = 0.0
        mood_label = "N/A"

    # NYT Effect
    # Hardcoded date or env var?
    # dashboard.py used "2022-02-01"
    NYT_DATE = os.getenv("NYT_ACQUISITION_DATE", "2022-02-01")

    pre_nyt = games_df[games_df['date'] < NYT_DATE]
    post_nyt = games_df[games_df['date'] >= NYT_DATE]

    avg_pre = pre_nyt['avg_guesses'].mean() if not pre_nyt.empty else 0.0
    avg_post = post_nyt['avg_guesses'].mean() if not post_nyt.empty else 0.0

    nyt_delta = avg_post - avg_pre

    return {
        "date": datetime.now().strftime("%Y-%m-%d"),

        "total_games": int(total_games),
        "avg_guesses": float(avg_guesses),
        "success_rate": float(success_rate),

        "hardest_word": hardest.get('target', 'N/A'),
        "hardest_word_date": str(hardest.get('date', '')),
        "hardest_word_avg_guesses": float(hardest.get('avg_guesses', 0.0)),
        "hardest_word_success_rate": float(hardest.get('success_rate', 0.0) * 100) if hardest.get('success_rate') else 0.0,

        "easiest_word": easiest.get('target', 'N/A'),
        "easiest_word_date": str(easiest.get('date', '')),
        "easiest_word_avg_guesses": float(easiest.get('avg_guesses', 0.0)),
        "easiest_word_success_rate": float(easiest.get('success_rate', 0.0) * 100) if easiest.get('success_rate') else 0.0,

        # Mapping outlier columns correctly
        # Outlier transform returns: 'word_id', 'date', 'outlier_type', 'metric', 'actual_value'...
        # We need the WORD. outliers_df has 'word_id'. We might need to join back to games to get the word string if not present.
        # Wait, the transform_outlier_data output does NOT include 'word' string, only 'word_id' and 'date'.
        # Actually, let's look at `transform_outlier_data`:
        # `merged` has 'Game' (id). `outliers.append({'word_id': row['Game']...})`
        # It does NOT store the word string in the DF?
        # Let's check `transform_outlier_data` again.
        # It merges `games_df` which has `target` but it doesn't add `target` to the outlier dict.
        # I should simply update `transform_outlier_data` to include the word OR lookup here.
        # `games_df` is indexed 0..N, but has 'Game' column.

        "most_viral_word": str(most_viral_word_str),
        "most_viral_date": str(most_viral.get('date', '')),
        "most_viral_tweets": int(most_viral.get('actual_value', 0)),

        "community_sentiment": float(avg_sentiment),
        "mood_label": mood_label,
        "positive_pct": float(positive_pct),

        "nyt_effect_delta": float(nyt_delta),
        "nyt_effect_direction": "increase" if nyt_delta > 0 else "decrease"
    }
