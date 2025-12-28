import sys
import os
import logging
import argparse

# Configure logging for the execution
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ETL_Runner")

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.extract import load_kaggle_games_raw, load_kaggle_tweets_raw
from backend.etl.transform import transform_games_data, transform_tweets_data, transform_pattern_data
from backend.etl.load import load_games_data, load_tweets_data, load_patterns_data

def run_games_etl():
    """Runs the Games Data ETL process."""
    logger.info("Starting Games ETL...")
    raw_games = load_kaggle_games_raw()
    transformed_games = transform_games_data(raw_games)
    load_games_data(transformed_games)
    logger.info("Games Data ETL Success.")
    return raw_games

def run_tweets_etl():
    """Runs the Tweets Data ETL process."""
    logger.info("Starting Tweets ETL...")
    raw_tweets = load_kaggle_tweets_raw()
    transformed_tweets = transform_tweets_data(raw_tweets)
    load_tweets_data(transformed_tweets)
    logger.info("Tweets Data ETL Success.")

def run_patterns_etl(raw_games=None):
    """Runs the Patterns Data ETL process."""
    logger.info("Starting Patterns ETL...")
    if raw_games is None:
        logger.info("Loading raw games data for patterns...")
        raw_games = load_kaggle_games_raw()
    
    stats_df, trans_df = transform_pattern_data(raw_games)
    load_patterns_data(stats_df, trans_df)
    logger.info("Patterns Data ETL Success.")

def main():
    parser = argparse.ArgumentParser(description="Run Wordle ETL pipeline processes.")
    parser.add_argument("--games", action="store_true", help="Run Games ETL process")
    parser.add_argument("--tweets", action="store_true", help="Run Tweets ETL process")
    parser.add_argument("--patterns", action="store_true", help="Run Patterns ETL process")
    parser.add_argument("--all", action="store_true", help="Run all ETL processes (default)")
    
    args = parser.parse_args()
    
    # If no specific flags are provided, default to all
    if not (args.games or args.tweets or args.patterns or args.all):
        args.all = True

    logger.info(f"Starting ETL Pipeline with flags: games={args.games or args.all}, "
                f"tweets={args.tweets or args.all}, patterns={args.patterns or args.all}")
    
    raw_games = None

    # 1. Games Data
    if args.all or args.games:
        try:
            raw_games = run_games_etl()
        except Exception as e:
            logger.error(f"Games ETL Failed: {e}", exc_info=True)

    # 2. Tweets Data
    if args.all or args.tweets:
        try:
            run_tweets_etl()
        except Exception as e:
            logger.error(f"Tweets ETL Failed: {e}", exc_info=True)

    # 3. Pattern Data
    if args.all or args.patterns:
        try:
            run_patterns_etl(raw_games)
        except Exception as e:
            logger.error(f"Patterns ETL Failed: {e}", exc_info=True)

if __name__ == "__main__":
    main()
