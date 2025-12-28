import sys
import os
import logging

# Configure logging for the execution
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ETL_Runner")

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.extract import load_kaggle_games_raw, load_kaggle_tweets_raw
from backend.etl.transform import transform_games_data, transform_tweets_data
from backend.etl.load import load_games_data, load_tweets_data

def main():
    logger.info("Starting ETL Pipeline...")
    
    # 1. Games Data
    try:
        raw_games = load_kaggle_games_raw()
        transformed_games = transform_games_data(raw_games)
        load_games_data(transformed_games)
        logger.info("Games Data ETL Success.")
    except Exception as e:
        logger.error(f"Games ETL Failed: {e}", exc_info=True)

    # 2. Tweets Data
    try:
        raw_tweets = load_kaggle_tweets_raw()
        transformed_tweets = transform_tweets_data(raw_tweets)
        load_tweets_data(transformed_tweets)
        logger.info("Tweets Data ETL Success.")
    except Exception as e:
        logger.error(f"Tweets ETL Failed: {e}", exc_info=True)

if __name__ == "__main__":
    main()
