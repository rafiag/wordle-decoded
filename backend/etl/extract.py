import pandas as pd
from pathlib import Path
import logging

import os
from dotenv import load_dotenv

# Load env if present
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)

# Use environment variables for data directories
BASE_DIR = Path(os.getenv("DATA_DIR", "data"))
RAW_DATA_DIR = Path(os.getenv("RAW_DATA_DIR", str(BASE_DIR / "raw")))

def validate_games_csv(df: pd.DataFrame) -> None:
    """
    Validate the schema of the Wordle Games CSV.
    Raises ValueError if required columns are missing.
    """
    required_columns = {'Game', 'Trial', 'Username', 'processed_text', 'target'}
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"Games CSV missing required columns: {missing}")
    
    # Basic data sanity check
    if df['Game'].min() < 1:
        logger.warning(f"Found non-positive Game IDs: min={df['Game'].min()}")

def validate_tweets_csv(df: pd.DataFrame) -> None:
    """
    Validate the schema of the Wordle Tweets CSV.
    """
    required_columns = {'tweet_text', 'tweet_date', 'wordle_id'}
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"Tweets CSV missing required columns: {missing}")

def _find_largest_csv(directory: Path) -> Path:
    """Helper to find the largest CSV file in a directory recursively."""
    csv_files = list(directory.rglob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV file found in {directory}")
    
    # Sort by size descending to get the main dataset
    csv_files.sort(key=lambda f: f.stat().st_size, reverse=True)
    return csv_files[0]

def load_kaggle_games_raw() -> pd.DataFrame:
    """
    Loads the raw Wordle games dataset.
    Returns:
        pd.DataFrame: DataFrame containing Game, Trial, processed_text, etc.
    """
    game_dir = RAW_DATA_DIR / "game_data"
    file_path = _find_largest_csv(game_dir)
    
    logger.info(f"Loading games data from {file_path}")
    df = pd.read_csv(file_path)
    
    validate_games_csv(df)
    return df

def load_kaggle_tweets_raw() -> pd.DataFrame:
    """
    Loads the raw Wordle tweets dataset.
    Returns:
        pd.DataFrame: DataFrame containing tweet_text, tweet_date, etc.
    """
    tweet_dir = RAW_DATA_DIR / "tweet_data"
    file_path = _find_largest_csv(tweet_dir)
    
    logger.info(f"Loading tweets data from {file_path}")
    
    # Read CSV
    df = pd.read_csv(file_path, parse_dates=['tweet_date'])
    
    return df

def load_wordle_guesses() -> list[str]:
    """
    Loads the official Wordle guess list (solutions + allowed).
    Returns:
        list[str]: List of ~13k valid 5-letter words in uppercase.
    """
    file_path = RAW_DATA_DIR / "wordle_guesses.txt"
    
    if not file_path.exists():
        logger.warning(f"Wordle guesses file not found at {file_path}. Using fallback list.")
        return []
        
    with open(file_path, 'r') as f:
        # Read lines, strip whitespace, filtering for 5-letter words just in case
        words = [line.strip().upper() for line in f if len(line.strip()) == 5]
        
    logger.info(f"Loaded {len(words)} words from validation list.")
    return words
