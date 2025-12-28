import sys
import os
import logging
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Pattern_ETL_Runner_Sample")

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.extract import load_kaggle_games_raw
from backend.etl.transform import transform_pattern_data
from backend.etl.load import load_patterns_data

def main():
    logger.info("Starting Pattern Analysis ETL (SAMPLE)...")
    
    try:
        # 1. Load Raw Games
        # Ideally extraction supports limits, but our extract function loads full CSV.
        # We'll load full then head(). load_kaggle_games_raw might be slowish but 20s is fine.
        raw_games = load_kaggle_games_raw()
        
        # Sample
        SAMPLE_SIZE = 1000
        logger.info(f"Taking sample of {SAMPLE_SIZE} form {len(raw_games)} rows.")
        raw_games = raw_games.head(SAMPLE_SIZE)
        
        
        with open("etl_debug_stats.txt", "w", encoding="utf-8") as f:
            f.write(f"DEBUG: Sample Raw Games Shape: {raw_games.shape}\n")
            f.write(f"DEBUG: Sample Raw Games Text:\n{raw_games['processed_text'].head()}\n")
            
            # 2. Transform Patterns
            stats_df, trans_df = transform_pattern_data(raw_games)
            
            f.write(f"DEBUG: Stats DF Shape: {stats_df.shape}\n")
            if not stats_df.empty:
                f.write(str(stats_df.head()) + "\n")
            else:
                f.write("DEBUG: Stats DF is EMPTY!\n")
                
            f.write(f"DEBUG: Transitions DF Shape: {trans_df.shape}\n")
            
            logger.info(f"Transformed: {len(stats_df)} unique patterns, {len(trans_df)} transitions.")
        
        # 3. Load Data
        load_patterns_data(stats_df, trans_df)
        logger.info("Pattern Data Load Success.")
        
    except Exception as e:
        logger.error(f"Pattern ETL Failed: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
