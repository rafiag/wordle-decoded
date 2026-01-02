import pandas as pd
import time
from datetime import datetime, timedelta
import numpy as np
import re
import math
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import logging
from typing import Optional
from collections import defaultdict
import multiprocessing
from functools import partial
import ast
from typing import Set

# Word frequency library for corpus-based rarity scoring
try:
    from wordfreq import word_frequency
    WORDFREQ_AVAILABLE = True
except ImportError:
    WORDFREQ_AVAILABLE = False
    logging.getLogger(__name__).warning("wordfreq library not available. Word rarity scoring will be disabled.")

import os
from dotenv import load_dotenv

# Load env if present
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)

# Constants from environment or defaults
FRUSTRATION_THRESHOLD = float(os.getenv("FRUSTRATION_THRESHOLD", "-0.1"))
MIN_GAME_ID = int(os.getenv("MIN_GAME_ID", "1"))
MAX_GAME_ID = int(os.getenv("MAX_GAME_ID", "2000"))

# Wordle start date configuration
wordle_start_str = os.getenv("WORDLE_START_DATE", "2021-06-19")
try:
    WORDLE_START_DATE = datetime.strptime(wordle_start_str, "%Y-%m-%d")
except ValueError:
    logger.error(f"Invalid WORDLE_START_DATE format: {wordle_start_str}. Using default.")
    WORDLE_START_DATE = datetime(2021, 6, 19)

# Initialize NLTK resources
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

from nltk.corpus import stopwords
EXTRA_STOPWORDS = {
    "wordle", "#wordle", "word", "words", "game", "guess", "letters", "guesses", "tries",
    "got", "get", "getting", "took", "take", "done", "going", "gonna", "made", "starting",
    "today", "day", "days", "time", "one", "another", "still", "back", "yet", "finally",
    "i’m", "im", "it’s", "really", "think", "know", "first", "second", "last",
    "2", "3", "4", "5", "nyt", "yesterday", "actually", "literally", "could", "would"
}
STOP_WORDS = set(stopwords.words('english')).union(EXTRA_STOPWORDS)

# Wordle-specific terms and sentiment-rich emojis
# VADER's logic often works better if we add them as they appear in text.
WORDLE_LEXICON_EXT = {
    # Slang / Keywords
    "phew": 2.0,
    "lucky": 2.0,
    "easy": 2.0,
    "nice": 1.5,
    "great": 2.0,
    "trap": -2.0,
    "frustrating": -2.5,
    "hard": -1.5,
    "tough": -1.5,
    "failed": -3.0,
    "phew!": 2.5,
    "impossible": -2.0,
    "clue": 0.5,
    "yikes": -1.5,
    "whew": 1.5,
    "slay": 1.0,
    "bruh": -1.0,
    # New Slang Injection (Moderate scores)
    "boom": 1.5,
    "oof": -0.5,
    "whee": 1.5,
    "sheesh": 1.0,
    "yesss": 1.5,
    "close": 0.5,
    "hooked": 1.0,
    # Emojis (Sentiment rich)
    "😊": 2.0, "🥳": 3.0, "😍": 3.0, "😎": 2.0, "🙌": 2.0, "✨": 1.0,
    "😫": -2.0, "🤯": -1.5, "😡": -3.0, "😤": -2.0, "😭": -1.5, "💀": -1.0, "❌": -2.0
}

# Protected keywords (don't remove these as stopwords)
PROTECTED_KEYWORDS = {"phew", "lucky", "easy", "hard", "tough", "failed", "great", "nice", "trap"}

sia = SentimentIntensityAnalyzer()
sia.lexicon.update(WORDLE_LEXICON_EXT)

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
    Also removes stopwords while protecting Wordle-specific keywords and strips punctuation.
    """
    if not isinstance(text, str):
        return ""
    
    # 1. Remove Wordle X/6 pattern
    text = re.sub(r'Wordle \d+ \w/\d', '', text)
    
    # 2. Remove URLs
    text = re.sub(r'http\S+', '', text)
    
    # 3. Remove box emojis/squares (strips the grid)
    text = re.sub(r'[⬛⬜🟨🟩🟦🟧🟫🟥]', '', text) 
    
    # 4. Remove punctuation (excluding emojis)
    # This keeps characters from major scripts and emojis while stripping standard symbols
    text = re.sub(r'[.,!?:;\"\'()\[\]{}]', ' ', text)
    
    # 5. Tokenize and remove stopwords, but protect specific keywords
    words = text.split()
    filtered_words = []
    for w in words:
        w_lower = w.lower()
        if w_lower in PROTECTED_KEYWORDS or w_lower not in STOP_WORDS:
            filtered_words.append(w)
            
    return " ".join(filtered_words).strip()

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
    Enhanced frequency scoring based on English letter frequency distribution.
    Higher scores indicate more common letter combinations.
    
    Returns:
        float: Normalized frequency score (0.0 to 1.0)
    """
    if not word: 
        return 0.0
    
    # Letter frequency weights based on English corpus analysis
    LETTER_WEIGHTS = {
        'e': 1.00, 'a': 0.85, 'r': 0.76, 'i': 0.75, 'o': 0.72, 't': 0.70,
        'n': 0.67, 's': 0.63, 'l': 0.55, 'c': 0.45, 'u': 0.43, 'd': 0.43,
        'p': 0.32, 'm': 0.30, 'h': 0.30, 'g': 0.25, 'b': 0.21, 'f': 0.18,
        'y': 0.17, 'w': 0.13, 'k': 0.11, 'v': 0.10, 'x': 0.05, 'z': 0.03,
        'j': 0.02, 'q': 0.01
    }
    
    word = word.lower()
    total_weight = sum(LETTER_WEIGHTS.get(c, 0.01) for c in word)
    
    # Normalize by word length (Wordle words are always 5 letters)
    return total_weight / len(word)

def calculate_word_rarity_score(word: str) -> float:
    """
    Calculate word rarity based on corpus frequency.
    Uses the wordfreq library which analyzes word usage across multiple sources.
    
    Returns:
        float: Rarity score (0.0 to 1.0), where higher = rarer word
    """
    if not WORDFREQ_AVAILABLE or not word:
        return 0.0
    
    # Get word frequency (returns value between 0 and 1e-3 typically)
    # Common words like "RAISE" ~1e-4, rare words like "JAZZY" ~1e-7
    freq = word_frequency(word.lower(), 'en')
    
    if freq == 0:
        return 1.0  # Extremely rare/unknown word
    
    # Convert to rarity score using log scale
    # Map common range (1e-3 to 1e-8) to (0.0 to 1.0)
    log_freq = math.log10(freq)
    
    # Normalize: -3 (common) -> 0.0, -8 (rare) -> 1.0
    rarity = (-log_freq - 3) / 5
    return max(0.0, min(1.0, rarity))

def extract_score_from_tweet(text: str) -> Optional[int]:
    """
    Extract the score (1-6 or 'X' for fail) from a Wordle tweet.
    Returns the trial number (1-7, where 7 = failed), or None if not found.
    """
    if not isinstance(text, str):
        return None
    
    # Pattern: "Wordle <ID> <Score>/6"
    # Score can be 1,2,3,4,5,6 or X
    match = re.search(r'Wordle \d+ ([X1-6])/6', text)
    if match:
        score_str = match.group(1)
        if score_str == 'X':
            return 7  # Failed = 7 (for consistency with old data)
        return int(score_str)
    return None

def transform_games_from_tweets(tweets_df: pd.DataFrame, solutions_map: dict) -> pd.DataFrame:
    """
    NEW: Transforms tweet data into games/distributions structure.
    Replaces the old transform_games_data which relied on wordle_games.csv.
    
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
    # Convert solutions_map keys from str to int if needed
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
        rarity_score = calculate_word_rarity_score(word)
        
        # Difficulty Rating (1-10)
        # Component 1: Performance-based (60% weight)
        diff = (guesses - 3.5) * 4
        
        # Component 2: Lexical complexity (40% weight)
        # - Letter frequency (20%)
        diff += (1.0 - freq_score) * 2
        # - Word rarity (20%)
        diff += rarity_score * 2
        
        # Clamp 1-10
        diff = max(1, min(10, int(diff + 3)))
        
        return pd.Series([freq_score, diff])
    
    result[['frequency_score', 'difficulty_rating']] = result.apply(calculate_metrics, axis=1)
    
    logger.info(f"Transformed {len(result)} games/days from tweets.")
    return result

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
        rarity_score = calculate_word_rarity_score(word)
        
        # Difficulty Rating (1-10)
        # Component 1: Performance-based (60% weight)
        # Higher avg_guesses -> Higher difficulty
        diff = (guesses - 3.5) * 4  # Center around 3.5
        
        # Component 2: Lexical complexity (40% weight)
        # - Letter frequency (20%): Lower frequency -> Higher difficulty
        diff += (1.0 - freq_score) * 2
        # - Word rarity (20%): Rarer words -> Higher difficulty
        diff += rarity_score * 2
        
        # Clamp 1-10
        diff = max(1, min(10, int(diff + 3)))  # Baseline 3
        
        return pd.Series([freq_score, diff])

    result[['frequency_score', 'difficulty_rating']] = result.apply(calculate_metrics, axis=1)

    logger.info(f"Transformed {len(result)} games/days.")
    return result

def transform_tweets_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms tweets:
    1. Group by wordle_id
    2. Calculate sentiment for each tweet (parallelized)
    3. Aggregate daily stats (avg sentiment, frustration index)
    """
    logger.info("Transforming tweets data with multiprocessing...")
    
    # Get number of CPUs to use (leave one for the system)
    num_processes = max(1, multiprocessing.cpu_count() - 1)
    logger.info(f"Using {num_processes} processes for parallel sentiment analysis.")
    
    # Extract text column as a list for multiprocessing
    texts = df['tweet_text'].fillna("").tolist()
    
    # Define cleaned text and filter out empty ones
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
    # Use a top-level function for multiprocessing map to avoid lambda/pickling issues
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
        'is_frustrated': 'mean', # Proportion of frustrated tweets
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

# ============================================================================
# TRANSFORMER FUNCTIONS (Modularized)
# ============================================================================
# The following transformer functions have been extracted to separate modules
# in the transformers/ directory for better code organization and maintainability.
# Importing them here maintains backward compatibility with existing code.
# ============================================================================

from .transformers.patterns import transform_pattern_data
from .transformers.outliers import transform_outlier_data
from .transformers.traps import transform_trap_data
from .transformers.global_stats import transform_global_stats_data
