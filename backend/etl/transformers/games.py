"""
Games data transformation module.

Handles transformation of raw tweet/game data into structured format for
words and distributions tables.
"""

import pandas as pd
import logging
from .shared import (
    derive_date_from_id,
    extract_score_from_tweet,
    calculate_frequency_score
)

logger = logging.getLogger(__name__)


def transform_games_from_tweets(tweets_df: pd.DataFrame, solutions_map: dict) -> pd.DataFrame:
    """
    Transforms tweet data into games/distributions structure.

    Args:
        tweets_df: Raw tweets DataFrame with columns: wordle_id, tweet_text
        solutions_map: Dict mapping Game ID -> {date, word}

    Returns:
        DataFrame matching the schema for 'words' and 'distributions' tables
    """
    logger.info("Transforming games data from tweets...")

    # Extract scores from tweet text
    tweets_df = tweets_df.copy()
    tweets_df['trial'] = tweets_df['tweet_text'].apply(extract_score_from_tweet)

    # Filter out tweets where we couldn't extract a score
    initial_count = len(tweets_df)
    tweets_df = tweets_df[tweets_df['trial'].notna()].copy()
    extracted_count = len(tweets_df)
    logger.info(f"Extracted scores from {extracted_count}/{initial_count} tweets ({extracted_count/initial_count*100:.1f}%)")

    # Pivot to get distribution counts
    counts = tweets_df.pivot_table(index='wordle_id', columns='trial', aggfunc='size', fill_value=0)

    # Ensure all columns exist (1-7)
    for i in range(1, 8):
        if i not in counts.columns:
            counts[i] = 0

    counts = counts.rename(columns={1: 'guess_1', 2: 'guess_2', 3: 'guess_3',
                                   4: 'guess_4', 5: 'guess_5', 6: 'guess_6',
                                   7: 'failed'})

    result = counts.reset_index()
    result = result.rename(columns={'wordle_id': 'Game'})

    # Add target words and dates from solutions map
    solutions_lookup = {int(k): v for k, v in solutions_map.items()}

    result['target'] = result['Game'].map(lambda x: solutions_lookup.get(x, {}).get('word', 'UNKNOWN'))
    result['date'] = result['Game'].map(lambda x: solutions_lookup.get(x, {}).get('date', derive_date_from_id(x)))

    # Calculate statistics
    result['total_tweets'] = result[['guess_1', 'guess_2', 'guess_3', 'guess_4', 'guess_5', 'guess_6', 'failed']].sum(axis=1)

    weighted_sum = sum(result[f'guess_{i}'] * i for i in range(1, 7))
    successful_games = result['total_tweets'] - result['failed']

    # Avg guesses (avoid division by zero)
    result['avg_guesses'] = 0.0
    mask = successful_games > 0
    result.loc[mask, 'avg_guesses'] = weighted_sum[mask] / successful_games[mask]

    # Success rate
    result['success_rate'] = 0.0
    mask_total = result['total_tweets'] > 0
    result.loc[mask_total, 'success_rate'] = successful_games[mask_total] / result['total_tweets'][mask_total]

    # Calculate metrics
    def calculate_metrics(row):
        word = str(row['target'])
        guesses = float(row['avg_guesses'])

        freq_score = calculate_frequency_score(word)

        # Difficulty Rating (1-10)
        diff = (guesses - 3.5) * 4
        diff += (1.0 - freq_score) * 2
        diff = max(1, min(10, int(diff + 3)))

        return pd.Series([freq_score, diff])

    result[['frequency_score', 'difficulty_rating']] = result.apply(calculate_metrics, axis=1)

    logger.info(f"Transformed {len(result)} games/days from tweets.")
    return result


def transform_games_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms the raw games DataFrame into a structure ready for the 'words' and 'distributions' tables.

    Args:
        df: Raw games DataFrame

    Returns:
        Transformed DataFrame
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

    # Calculate metrics
    def calculate_metrics(row):
        word = str(row['target'])
        guesses = float(row['avg_guesses'])

        freq_score = calculate_frequency_score(word)

        # Difficulty Rating (1-10)
        diff = (guesses - 3.5) * 4
        diff += (1.0 - freq_score) * 2
        diff = max(1, min(10, int(diff + 3)))

        return pd.Series([freq_score, diff])

    result[['frequency_score', 'difficulty_rating']] = result.apply(calculate_metrics, axis=1)

    logger.info(f"Transformed {len(result)} games/days.")
    return result
