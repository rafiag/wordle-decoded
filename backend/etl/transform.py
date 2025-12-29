import pandas as pd
import time
from datetime import datetime, timedelta
import numpy as np
import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import logging
from typing import Optional
from collections import defaultdict
import ast

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

def calculate_frequency_score(word: str) -> float:
    """
    Calculates a heuristic frequency score (0.0 to 1.0) based on letter composition.
    Uses 'eariotnsl' as common letters.
    """
    if not word: return 0.0
    word = word.lower()
    return sum(1 for c in word if c in 'eariotnsl') / 5.0

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

    # Calculate mock metrics for MVP since external corpus might be heavy
    # Frequency: simpler words (E, A, R, I, O) are more frequent.
    # Difficulty: (Avg Guesses * 2) + (10 - Frequency * 10) ... rough heuristic
    
    def calculate_metrics(row):
        word = str(row['target'])
        guesses = float(row['avg_guesses'])
        
        freq_score = calculate_frequency_score(word)
        
        # Difficulty Rating (1-10)
        # Higher avg_guesses -> Higher difficulty
        # Lower frequency -> Higher difficulty
        diff = (guesses - 3.5) * 4 # Center around 3.5. 4.0 -> 2, 4.5 -> 4, 5.0 -> 6...
        diff += (1.0 - freq_score) * 2 # Rare words add difficulty
        
        # Clamp 0-10
        diff = max(1, min(10, int(diff + 3))) # Baseline 3
        
        return pd.Series([freq_score, diff])

    result[['frequency_score', 'difficulty_rating']] = result.apply(calculate_metrics, axis=1)

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

def transform_pattern_data(df: pd.DataFrame):
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

def transform_trap_data(games_df: pd.DataFrame, guess_list: Optional[list[str]] = None) -> pd.DataFrame:
    """
    Analyzes all words to find 'Traps' - words with many neighbors (Hamming distance 1).
    Optimized with Masking Dictionary approach O(N*L) instead of O(N^2).
    """
    logger.info("Transforming trap data (Enhanced)...")
    start_time = time.time()
    
    unique_words_df = games_df[['Game', 'target', 'frequency_score']].drop_duplicates()
    target_words = unique_words_df['target'].dropna().astype(str).str.upper().unique()
    
    # define candidate pool: Official Guesses + Historical Answers
    candidate_pool = set(target_words)
    if guess_list:
        # Filter for 5-letter words just in case
        valid_guesses = {g.upper() for g in guess_list if len(g) == 5}
        candidate_pool.update(valid_guesses)
        logger.info(f"Using expanded candidate pool of {len(candidate_pool)} words.")
    else:
        logger.info(f"Using historical targets only ({len(candidate_pool)} words).")

    # 1. Build Mask Dictionary
    # Map "_IGHT" -> ["LIGHT", "NIGHT", "RIGHT", ...]
    mask_to_words = defaultdict(list)
    
    for word in candidate_pool:
        for i in range(5):
            mask = word[:i] + "_" + word[i+1:]
            mask_to_words[mask].append(word)
            
    results = []
    
    for _, row in unique_words_df.iterrows():
        target = str(row['target']).upper()
        if len(target) != 5: continue
        
        neighbors = set()
        
        # 2. Find Neighbors using Masks
        for i in range(5):
            mask = target[:i] + "_" + target[i+1:]
            candidates = mask_to_words.get(mask, [])
            for candidate in candidates:
                if candidate != target:
                    neighbors.add(candidate)
                    
        neighbor_list = sorted(list(neighbors))
        neighbor_count = len(neighbor_list)
        
        # 3. Trap Score: Sum of Neighbor Frequencies
        # This highlights words with MANY COMMON neighbors (which are the real traps).
        # We calculate frequency on the fly for neighbors since they might be from the raw list.
        neighbor_freq_sum = sum(calculate_frequency_score(n) for n in neighbor_list)
        
        # We can also weigh by the inverse of the target frequency (rare words with common neighbors are worse?)
        # But 'Sum of Neighbor Frequence' is a strong enough signal on its own.
        # Let's add a small multiplier if the target itself is rare, but keep it simple.
        trap_score = neighbor_freq_sum
        
        # Only store if it has neighbors
        if neighbor_count > 0:
            import json
            results.append({
                'word_id': row['Game'],
                'trap_score': trap_score,
                'neighbor_count': neighbor_count,
                'deadly_neighbors': json.dumps(neighbor_list)
            })
            
    duration = time.time() - start_time
    logger.info(f"Identified {len(results)} potential trap words in {duration:.2f} seconds.")
    return pd.DataFrame(results)
