"""
Pattern data transformation module.

Extracts pattern statistics and transitions from games data.
"""

import pandas as pd
import logging
from typing import Tuple

# Configure logger
logger = logging.getLogger(__name__)


def transform_pattern_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Transforms games data to extract pattern statistics and transitions.
    Returns a tuple: (pattern_stats_df, transitions_df)
    """
    logger.info("Transforming pattern data (Vectorized)...")

    # 1. Deduplicate (though it seems distinct already, harmless)
    df = df.sort_values('Trial').drop_duplicates(['Game', 'Username'], keep='last')

    logger.info(f"Extracting patterns from {len(df)} games...")
    # Vectorized pattern extraction
    # Regex findall returns list of matches
    df['patterns'] = df['processed_text'].astype(str).str.findall(r'[🟩🟨⬜]{5}')

    # Filter out empty
    df = df[df['patterns'].map(len) > 0]

    # Determine success and length
    # Check if last pattern is all green
    df['final_pattern'] = df['patterns'].map(lambda x: x[-1])
    df['is_success'] = (df['final_pattern'] == '🟩🟩🟩🟩🟩')
    df['guesses'] = df['patterns'].map(len)

    logger.info("Aggregating Statistics (Chunked to save memory)...")

    # 2. Pattern Counts (Total) & 3. Success Counts
    # We will process in chunks to avoid OOM on huge explode
    total_counts = pd.Series(dtype=int)
    success_counts = pd.Series(dtype=int)

    # Process in chunks of 500k rows
    chunk_size = 500000
    num_chunks = (len(df) // chunk_size) + 1

    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = start_idx + chunk_size
        chunk = df.iloc[start_idx:end_idx].copy()

        if chunk.empty: continue

        # Explode this chunk only
        exploded_chunk = chunk.explode('patterns')

        # Counts for this chunk
        chunk_counts = exploded_chunk['patterns'].value_counts()
        total_counts = total_counts.add(chunk_counts, fill_value=0)

        # Success counts for this chunk
        # Filter for success rows in this chunk
        success_chunk = chunk[chunk['is_success']]
        if not success_chunk.empty:
            exploded_success = success_chunk.explode('patterns')
            chunk_success_counts = exploded_success['patterns'].value_counts()
            success_counts = success_counts.add(chunk_success_counts, fill_value=0)

        # Clean up
        del exploded_chunk
        del chunk

    total_counts.name = 'count'
    success_counts.name = 'success_count'

    # 4. Avg Guesses (Only for successful games)
    # This one doesn't need explode on patterns, but grouping by pattern.
    # We can iterate or use the counts.
    # Actually we stored 'guesses' per game.
    # If pattern P appears in game G, we added G's guesses to P's list.
    # To do this without massive explode:
    # We need sum_guesses and count per pattern.
    # We can re-use the chunk loop or do a separate pass.
    # Let's add it to the chunk loop above?
    # Wait, 'exploded_success' matches patterns to the game's guess count.
    # exploded_success['guesses'] would have the value.

    # Re-writing the chunk loop to gather sum_guesses too.
    sum_guesses = pd.Series(dtype=float)

    # Reset accumulators
    total_counts = pd.Series(dtype=int)
    success_counts = pd.Series(dtype=int)

    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = start_idx + chunk_size
        chunk = df.iloc[start_idx:end_idx] # View might be enough, but copy safe

        # Total Counts
        # Using simple iteration for list expansion might be slow but memory safe?
        # No, explode on 500k is fine (3M rows). 40M was the problem.
        exploded = chunk.explode('patterns')
        chunk_vc = exploded['patterns'].value_counts()
        total_counts = total_counts.add(chunk_vc, fill_value=0)

        # Success Stats
        success_chunk = chunk[chunk['is_success']]
        if not success_chunk.empty:
            # We need to associate the 'guesses' count with each pattern
            # exploded_success has index from original df, so we can join?
            # Or just explode specific columns
            exp_success = success_chunk[['patterns', 'guesses']].explode('patterns')

            # Count successes
            chunk_succ_vc = exp_success['patterns'].value_counts()
            success_counts = success_counts.add(chunk_succ_vc, fill_value=0)

            # Sum guesses
            chunk_sum_guesses = exp_success.groupby('patterns')['guesses'].sum()
            sum_guesses = sum_guesses.add(chunk_sum_guesses, fill_value=0)

    # Calculate avg
    avg_guesses = (sum_guesses / success_counts).rename('avg_guesses')


    # Create DataFrame explicitly to ensure column names
    stats_df = pd.DataFrame({
        'count': total_counts,
        'success_count': success_counts,
        'avg_guesses': avg_guesses
    }).fillna(0)

    stats_df.index.name = 'pattern'
    stats_df = stats_df.reset_index()

    if not stats_df.empty:
        stats_df['rank'] = stats_df['count'].rank(ascending=False, method='min').astype(int)
    else:
        stats_df['rank'] = pd.Series(dtype=int)

    logger.info("Calculating Transitions (Chunked)...")

    # 5. Transitions
    # Define helper to pair up patterns
    def get_transitions(p_list):
        if len(p_list) < 2:
            return []
        return list(zip(p_list[:-1], p_list[1:]))

    # Apply on chunks?
    # df['patterns'] size is 6.8M. The result column is 6.8M lists of tuples.
    # Then explode -> 40M tuples.
    # Just chunk the explode + value_counts part.

    trans_counts = pd.Series(dtype=int)

    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = start_idx + chunk_size
        chunk_patterns = df['patterns'].iloc[start_idx:end_idx]

        # Get transitions
        chunk_trans = chunk_patterns.apply(get_transitions)

        # Explode and count
        exploded_trans = chunk_trans.explode()
        chunk_trans_counts = exploded_trans.value_counts()

        trans_counts = trans_counts.add(chunk_trans_counts, fill_value=0)

    trans_data = []
    for (src, next_p), count in trans_counts.items():
        if not isinstance(src, str): continue
        trans_data.append({
            'source_pattern': src,
            'next_pattern': next_p,
            'count': int(count)
        })

    trans_df = pd.DataFrame(trans_data)

    logger.info(f"Generated {len(stats_df)} pattern stats and {len(trans_df)} transitions.")
    return stats_df, trans_df
