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
from backend.etl.transform import transform_games_data, transform_tweets_data, transform_pattern_data, transform_outlier_data, transform_trap_data, transform_global_stats_data
from backend.etl.load import load_games_data, load_tweets_data, load_patterns_data, load_outliers_data, load_trap_data, load_global_stats

def run_games_etl(date_filter=None):
    """Runs the Games Data ETL process using wordle_games.csv."""
    logger.info("Starting Games ETL...")
    
    # Load raw games from CSV
    raw_games = load_kaggle_games_raw()
    
    # Transform games data
    transformed_games = transform_games_data(raw_games)
    
    # Apply date filter if provided
    if date_filter is not None:
        logger.info(f"Filtering games to {len(date_filter)} common dates...")
        transformed_games = transformed_games[transformed_games['date'].isin(date_filter)]
    
    # Load to database
    load_games_data(transformed_games)
    logger.info(f"Games Data ETL Success ({len(transformed_games)} games loaded).")
    
    return raw_games, transformed_games

def run_tweets_etl(date_filter=None):
    """Runs the Tweets Data ETL process for sentiment analysis."""
    logger.info("Starting Tweets ETL...")
    raw_tweets = load_kaggle_tweets_raw()
    transformed_tweets = transform_tweets_data(raw_tweets)
    
    # Apply date filter if provided
    if date_filter is not None:
        logger.info(f"Filtering tweets to {len(date_filter)} common dates...")
        transformed_tweets = transformed_tweets[transformed_tweets['date'].isin(date_filter)]
    
    load_tweets_data(transformed_tweets)
    logger.info(f"Tweets Data ETL Success ({len(transformed_tweets)} tweets loaded).")
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
    common_dates = None

    # Calculate date intersection if running both games and tweets
    if args.all:
        try:
            logger.info("Calculating date intersection...")
            # Load both datasets to get dates
            temp_games = load_kaggle_games_raw()
            temp_tweets = load_kaggle_tweets_raw()
            
            # Transform to get dates
            temp_games_df = transform_games_data(temp_games)
            temp_tweets_df = transform_tweets_data(temp_tweets)
            
            # Calculate intersection
            games_dates = set(temp_games_df['date'].unique())
            tweets_dates = set(temp_tweets_df['date'].unique())
            common_dates = list(games_dates.intersection(tweets_dates))
            
            logger.info(f"Found {len(common_dates)} common dates between datasets")
            logger.info(f"Games date range: {len(games_dates)} dates")
            logger.info(f"Tweets date range: {len(tweets_dates)} dates")
        except Exception as e:
            logger.error(f"Failed to calculate date intersection: {e}", exc_info=True)
            common_dates = None

    # 1. Games Data (FROM WORDLE_GAMES.CSV)
    if args.all or args.games:
        try:
            raw_games, transformed_games = run_games_etl(common_dates)
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
                if raw_games is None:
                    raw_games = load_kaggle_games_raw()
                transformed_games = transform_games_data(raw_games)
            except Exception as e:
                logger.error(f"Failed to transform games: {e}", exc_info=True)

    # 2. Tweets Data
    if args.all or args.tweets or args.outliers:
        try:
            if args.tweets or args.all:
                transformed_tweets = run_tweets_etl(common_dates)
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
                if raw_games is None:
                    raw_games = load_kaggle_games_raw()
                transformed_games = transform_games_data(raw_games)
            
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
