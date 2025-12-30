"""
Extract Wordle Solutions Map from wordle_games.csv
Creates a lightweight JSON file mapping Game ID -> {Date, Word}
This preserves the "ground truth" before migrating to tweets-only ETL.
"""
import pandas as pd
import json
from datetime import datetime, timedelta
from pathlib import Path

# Constants
WORDLE_START_DATE = datetime(2021, 6, 19)
GAMES_CSV = "data/raw/game_data/wordle_games.csv"
OUTPUT_JSON = "data/processed/wordle_solutions.json"

def derive_date_from_id(wordle_id: int) -> str:
    """Derive the ISO date string from Wordle Game ID."""
    return (WORDLE_START_DATE + timedelta(days=wordle_id - 1)).strftime("%Y-%m-%d")

def extract_solutions():
    print(f"Reading {GAMES_CSV}...")
    
    # Read only the columns we need
    df = pd.read_csv(GAMES_CSV, usecols=['Game', 'target'])
    
    # Get unique Game -> Target mapping
    solutions_df = df.groupby('Game')['target'].first().reset_index()
    
    print(f"Found {len(solutions_df)} unique game solutions")
    
    # Create the mapping
    solutions_map = {}
    for _, row in solutions_df.iterrows():
        game_id = int(row['Game'])
        target_word = str(row['target']).upper()
        date = derive_date_from_id(game_id)
        
        solutions_map[game_id] = {
            "date": date,
            "word": target_word
        }
    
    # Ensure output directory exists
    output_path = Path(OUTPUT_JSON)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write to JSON
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(solutions_map, f, indent=2)
    
    print(f"✅ Successfully wrote {len(solutions_map)} solutions to {OUTPUT_JSON}")
    print(f"   ID Range: {min(solutions_map.keys())} - {max(solutions_map.keys())}")
    print(f"   Date Range: {solutions_map[min(solutions_map.keys())]['date']} - {solutions_map[max(solutions_map.keys())]['date']}")
    print(f"   File Size: {output_path.stat().st_size / 1024:.2f} KB")

if __name__ == "__main__":
    extract_solutions()
