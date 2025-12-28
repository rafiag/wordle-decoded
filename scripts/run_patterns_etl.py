import sys
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Pattern_ETL_Runner")

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.extract import load_kaggle_games_raw
from backend.etl.transform import transform_pattern_data
from backend.etl.load import load_patterns_data

def main():
    logger.info("Starting Pattern Analysis ETL...")
    
    try:
        # 1. Load Raw Games
        raw_games = load_kaggle_games_raw()
        logger.info(f"Loaded {len(raw_games)} raw game rows.")
        
        # 2. Transform Patterns
        stats_df, trans_df = transform_pattern_data(raw_games)
        logger.info(f"Transformed: {len(stats_df)} unique patterns, {len(trans_df)} transitions.")
        
        # 3. Load Data
        load_patterns_data(stats_df, trans_df)
        logger.info("Pattern Data Load Success.")
        
    except Exception as e:
        logger.error(f"Pattern ETL Failed: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
