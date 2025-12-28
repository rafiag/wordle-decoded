import sys
import os
import traceback
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.extract import load_kaggle_games_raw
from backend.etl.transform import transform_games_data
from backend.etl.load import load_games_data
from backend.db.database import SessionLocal
from backend.db.schema import Word

def debug_games():
    print("DEBUG: Extracting Games...")
    df_raw = load_kaggle_games_raw()
    print(f"DEBUG: Raw Games: {len(df_raw)}")
    
    print("DEBUG: Transforming Games...")
    df_trans = transform_games_data(df_raw)
    print(f"DEBUG: Transformed Games: {len(df_trans)}")
    print(df_trans[['Game', 'target', 'date']].head())
    
    print("DEBUG: Loading Games...")
    try:
        load_games_data(df_trans)
    except Exception:
        traceback.print_exc()
    
    db = SessionLocal()
    cnt = db.query(Word).count()
    print(f"DEBUG: Final Word Count: {cnt}")
    db.close()

if __name__ == "__main__":
    debug_games()
