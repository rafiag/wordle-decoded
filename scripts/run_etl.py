import sys
import os
import logging
import argparse

# Configure logging for the execution
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ETL_Runner")

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.extract import load_kaggle_games_raw, load_kaggle_tweets_raw, load_wordle_guesses, load_solutions_map
from backend.etl.transform import transform_games_data, transform_games_from_tweets, transform_tweets_data, transform_pattern_data, transform_outlier_data, transform_trap_data, transform_global_stats_data
from backend.etl.load import load_games_data, load_tweets_data, load_patterns_data, load_outliers_data, load_trap_data, load_global_stats

def run_games_etl():
    """Runs the Games Data ETL process - NOW USING TWEETS DATA."""
    logger.info("Starting Games ETL (Tweet-based)...")
    
    # Load solutions map
    solutions_map = load_solutions_map()
    
    # Load raw tweets
    raw_tweets = load_kaggle_tweets_raw()
    
    # Transform using new tweet-based approach
    transformed_games = transform_games_from_tweets(raw_tweets, solutions_map)
    
    # Load to database
    load_games_data(transformed_games)
    logger.info("Games Data ETL Success (Tweet-based).")
    
    # Return None for raw_games since we're not loading it anymore
    return None, transformed_games

def run_tweets_etl():
    """Runs the Tweets Data ETL process."""
    logger.info("Starting Tweets ETL...")
    raw_tweets = load_kaggle_tweets_raw()
    transformed_tweets = transform_tweets_data(raw_tweets)
    load_tweets_data(transformed_tweets)
    logger.info("Tweets Data ETL Success.")
    return transformed_tweets

def run_patterns_etl(raw_games=None):
    """Runs the Patterns Data ETL process."""
    logger.info("Starting Patterns ETL...")
    # Patterns still need raw game data for emoji patterns
    # Keep loading from wordle_games.csv for now as backup
    if raw_games is None:
        logger.info("WARNING: Patterns ETL still requires wordle_games.csv for emoji grid parsing.")
        logger.info("Loading raw games data for patterns...")
        raw_games = load_kaggle_games_raw()
    
    stats_df, trans_df = transform_pattern_data(raw_games)
    load_patterns_data(stats_df, trans_df)
    logger.info("Patterns Data ETL Success.")

def run_outliers_etl(raw_games=None, transformed_tweets=None):
    """
    Runs Outlier Detection ETL.
    Requires Games data (for volume) and Tweets data (for sentiment).
    """
    logger.info("Starting Outliers ETL...")
    
    # Needs Games Data
    if raw_games is None:
        logger.info("Loading raw games data for outliers...")
        raw_games = load_kaggle_games_raw()
        
    # Needs Transformed Games (with date/id mapping)
    # Actually, let's just re-transform or pass it. 
    # transform_outlier_data needs DataFrame with [date, target, total_tweets, id, difficulty_rating]
    # We can get this from transform_games_data.
    games_df = transform_games_data(raw_games)
    
    # Needs Transformed Tweets
    if transformed_tweets is None:
         logger.info("Loading and transforming tweets for outliers...")
         raw_tweets = load_kaggle_tweets_raw()
         transformed_tweets = transform_tweets_data(raw_tweets)
         
    outliers_df = transform_outlier_data(games_df, transformed_tweets)
    load_outliers_data(outliers_df)
    load_outliers_data(outliers_df)
    logger.info("Outliers ETL Success.")
    return outliers_df

def run_traps_etl(raw_games=None):
    """Runs Trap Analysis ETL."""
    logger.info("Starting Traps ETL...")
    
    if raw_games is None:
        raw_games = load_kaggle_games_raw()
        
    # Load enhanced guess list
    guess_list = load_wordle_guesses()
        
    # Needs frequency scores from transformed games
    games_df = transform_games_data(raw_games)
    
    traps_df = transform_trap_data(games_df, guess_list)
    load_trap_data(traps_df)
    logger.info("Traps ETL Success.")


def main():
    parser = argparse.ArgumentParser(description="Run Wordle ETL pipeline processes.")
    parser.add_argument("--games", action="store_true", help="Run Games ETL process")
    parser.add_argument("--tweets", action="store_true", help="Run Tweets ETL process")
    parser.add_argument("--patterns", action="store_true", help="Run Patterns ETL process")
    parser.add_argument("--outliers", action="store_true", help="Run Outliers ETL process")
    parser.add_argument("--traps", action="store_true", help="Run Traps ETL process")
    parser.add_argument("--global-stats", action="store_true", help="Run Global Stats aggregation")
    parser.add_argument("--all", action="store_true", help="Run all ETL processes (default)")
    
    args = parser.parse_args()
    
    # If no specific flags are provided, default to all
    if not (args.games or args.tweets or args.patterns or args.outliers or args.traps or args.global_stats or args.all):
        args.all = True

    logger.info(f"Starting ETL Pipeline...")
    
    # Shared Data containers to avoid re-loading/re-processing
    raw_games = None
    transformed_games = None
    transformed_tweets = None
    outliers_df = None

    # 1. Games Data (NOW FROM TWEETS)
    if args.all or args.games:
        try:
            raw_games, transformed_games = run_games_etl()  # Uses tweets now
        except Exception as e:
            logger.error(f"Games ETL/Load Failed: {e}", exc_info=True)
    
    # For patterns/traps that still need raw games CSV (emoji grids)
    if args.patterns or args.traps:
        if raw_games is None:
            try:
                logger.info("Loading raw games CSV for patterns/traps (emoji grids required)...")
                raw_games = load_kaggle_games_raw()
            except Exception as e:
                logger.error(f"Failed to load raw games: {e}", exc_info=True)
    
    # For outliers that need transformed games
    if args.outliers:
        if transformed_games is None:
            try:
                logger.info("Running games transform for outliers dependency...")
                raw_tweets = load_kaggle_tweets_raw()
                solutions_map = load_solutions_map()
                transformed_games = transform_games_from_tweets(raw_tweets, solutions_map)
            except Exception as e:
                logger.error(f"Failed to transform games: {e}", exc_info=True)

    # 2. Tweets Data
    if args.all or args.tweets or args.outliers:
        try:
            if args.tweets or args.all:
                transformed_tweets = run_tweets_etl()
            else:
                logger.info("Loading and transforming tweets (dependency)...")
                raw_tweets = load_kaggle_tweets_raw()
                transformed_tweets = transform_tweets_data(raw_tweets)
        except Exception as e:
            logger.error(f"Tweets ETL Failed: {e}", exc_info=True)

    # 3. Pattern Data
    if args.all or args.patterns:
        try:
            run_patterns_etl(raw_games)
        except Exception as e:
            logger.error(f"Patterns ETL Failed: {e}", exc_info=True)
            
    # 4. Outliers Data
    if args.all or args.outliers:
        try:
            outliers_df = run_outliers_etl(raw_games, transformed_tweets)
        except Exception as e:
            logger.error(f"Outliers ETL Failed: {e}", exc_info=True)

    # 5. Traps Data
    if args.all or args.traps:
        try:
             run_traps_etl(raw_games)
        except Exception as e:
            logger.error(f"Traps ETL Failed: {e}", exc_info=True)

    # 6. Global Stats (Final Aggregation)
    if args.all or args.global_stats:
        try:
            logger.info("Starting Global Stats ETL...")
            if transformed_games is None:
                raw_tweets = load_kaggle_tweets_raw()
                solutions_map = load_solutions_map()
                transformed_games = transform_games_from_tweets(raw_tweets, solutions_map)
            
            if transformed_tweets is None:
                raw_tweets = load_kaggle_tweets_raw()
                transformed_tweets = transform_tweets_data(raw_tweets)
                
            if outliers_df is None:
                # Need to re-run transform if not available
                outliers_df = transform_outlier_data(transformed_games, transformed_tweets)
            
            global_stats = transform_global_stats_data(transformed_games, transformed_tweets, outliers_df)
            load_global_stats(global_stats)
            logger.info("Global Stats ETL Success.")
            
        except Exception as e:
            logger.error(f"Global Stats ETL Failed: {e}", exc_info=True)

if __name__ == "__main__":
    main()
