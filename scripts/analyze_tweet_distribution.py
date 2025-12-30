import pandas as pd
import re
import os
from pathlib import Path
from dotenv import load_dotenv

# Re-implement extraction logic locally to be self-contained
def extract_score_from_tweet(text: str) -> str:
    """
    Extracts 'X/6' or 'N/6' from tweet text.
    Returns: string '1'..'6' or 'X' (for failure), or None if not found.
    """
    if not isinstance(text, str):
        return None
    
    # 1. Look for standard "Wordle <ID> X/6" pattern
    # The 'X' can be 1-6 or X.
    # Note: Regex needs to be robust for spaces/newlines
    match = re.search(r'Wordle\s+\d+\s+([1-6X])/6', text, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    
    return None

def analyze_distribution():
    print("Loading raw tweets...")
    # Manually constructed path or use the one from extract.py logic if needed.
    # User's env shows d:\Project\Wordle Exploration\data\raw\tweet_data\tweets.csv
    # But extract.py uses _find_largest_csv. We'll try direct path based on user prompt info.
    
    data_path = Path("data/raw/tweet_data/tweets.csv")
    if not data_path.exists():
        print(f"File not found at {data_path}. Checking recursively...")
        data_path = list(Path("data").rglob("tweets.csv"))[0]
        
    print(f"Reading {data_path}...")
    # Read only needed column to be fast
    df = pd.read_csv(data_path, usecols=['tweet_text'])
    print(f"Loaded {len(df)} tweets.")
    
    print("Extracting scores...")
    df['score'] = df['tweet_text'].apply(extract_score_from_tweet)
    
    # Filter only found scores
    found = df[df['score'].notna()]
    print(f"Found scores in {len(found)} tweets ({len(found)/len(df)*100:.1f}%)")
    
    # Calculate distribution
    counts = found['score'].value_counts().sort_index()
    total = len(found)
    
    print("\n--- Guess Distribution (Raw Data) ---")
    print(f"{'Guess':<6} | {'Count':<10} | {'Percentage':<10}")
    print("-" * 32)
    
    for score in ['1', '2', '3', '4', '5', '6', 'X']:
        count = counts.get(score, 0)
        pct = (count / total) * 100
        print(f"{score:<6} | {count:<10} | {pct:<10.2f}%")
        
    print("-" * 32)
    print(f"Total  | {total:<10} | 100.00%")

if __name__ == "__main__":
    analyze_distribution()
