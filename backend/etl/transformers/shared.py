"""
Shared utilities, constants, and helper functions for ETL transformers.
"""

import os
import re
import logging
import nltk
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords

# Load environment variables
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

# Stopwords configuration
EXTRA_STOPWORDS = {
    "wordle", "#wordle", "word", "words", "game", "guess", "letters", "guesses", "tries",
    "got", "get", "getting", "took", "take", "done", "going", "gonna", "made", "starting",
    "today", "day", "days", "time", "one", "another", "still", "back", "yet", "finally",
    "i'm", "im", "it's", "really", "think", "know", "first", "second", "last",
    "2", "3", "4", "5", "nyt", "yesterday", "actually", "literally", "could", "would"
}
STOP_WORDS = set(stopwords.words('english')).union(EXTRA_STOPWORDS)

# Wordle-specific lexicon for sentiment analysis
WORDLE_LEXICON_EXT = {
    # Slang / Keywords
    "phew": 2.0, "lucky": 2.0, "easy": 2.0, "nice": 1.5, "great": 2.0,
    "trap": -2.0, "frustrating": -2.5, "hard": -1.5, "tough": -1.5,
    "failed": -3.0, "phew!": 2.5, "impossible": -2.0, "clue": 0.5,
    "yikes": -1.5, "whew": 1.5, "slay": 1.0, "bruh": -1.0,
    # New Slang
    "boom": 1.5, "oof": -0.5, "whee": 1.5, "sheesh": 1.0,
    "yesss": 1.5, "close": 0.5, "hooked": 1.0,
    # Emojis (Sentiment rich)
    "😊": 2.0, "🥳": 3.0, "😍": 3.0, "😎": 2.0, "🙌": 2.0, "✨": 1.0,
    "😫": -2.0, "🤯": -1.5, "😡": -3.0, "😤": -2.0, "😭": -1.5, "💀": -1.0, "❌": -2.0
}

# Protected keywords (don't remove as stopwords)
PROTECTED_KEYWORDS = {"phew", "lucky", "easy", "hard", "tough", "failed", "great", "nice", "trap"}

# Initialize sentiment analyzer
sia = SentimentIntensityAnalyzer()
sia.lexicon.update(WORDLE_LEXICON_EXT)


# Utility functions
def derive_date_from_id(wordle_id: int) -> str:
    """
    Derive the ISO date string from the Wordle Game ID.
    Raises ValueError if ID is out of expected bounds (1-2000).
    """
    if not (MIN_GAME_ID <= wordle_id <= MAX_GAME_ID):
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
        return 0.0  # Neutral if empty
    return sia.polarity_scores(cleaned)['compound']


def calculate_frequency_score(word: str) -> float:
    """
    Calculates a heuristic frequency score (0.0 to 1.0) based on letter composition.
    Uses 'eariotnsl' as common letters.
    """
    if not word:
        return 0.0
    word = word.lower()
    return sum(1 for c in word if c in 'eariotnsl') / 5.0


def extract_score_from_tweet(text: str) -> Optional[int]:
    """
    Extract the score (1-6 or 'X' for fail) from a Wordle tweet.
    Returns the trial number (1-7, where 7 = failed), or None if not found.
    """
    if not isinstance(text, str):
        return None

    # Pattern: "Wordle <ID> <Score>/6"
    match = re.search(r'Wordle \d+ ([X1-6])/6', text)
    if match:
        score_str = match.group(1)
        if score_str == 'X':
            return 7  # Failed = 7
        return int(score_str)
    return None
