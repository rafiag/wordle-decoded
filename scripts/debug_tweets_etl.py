import pandas as pd
import sys
import os
sys.path.append(os.getcwd())
try:
    from backend.etl.extract import load_kaggle_tweets_raw
    from backend.etl.transform import transform_tweets_data
    from backend.etl.load import load_tweets_data
except ImportError:
    # Fix path for running inside docker root
    sys.path.append('/app')
    from backend.etl.extract import load_kaggle_tweets_raw
    from backend.etl.transform import transform_tweets_data
    from backend.etl.load import load_tweets_data

print("Loading raw tweets...")
df = load_kaggle_tweets_raw()
print(f"Raw shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Sample wordle_id: {df['wordle_id'].head().tolist()}")

print("Transforming...")
transformed = transform_tweets_data(df.head(1000)) # Test with small subset
print(f"Transformed shape: {transformed.shape}")
print(transformed.head())

if transformed.empty:
    print("Transformed is empty!")
else:
    print(f"Transformed has {len(transformed)} rows.")
    print("Attempting validation load...")
    try:
        from backend.db.database import SessionLocal
        from backend.db.schema import TweetSentiment
        
        # Clear table first to be sure
        db = SessionLocal()
        db.query(TweetSentiment).delete()
        db.commit()
        db.close()
        
        load_tweets_data(transformed)
        print("Load function returned.")
        
        db = SessionLocal()
        count = db.query(TweetSentiment).count()
        print(f"Count in DB after load: {count}")
    except Exception as e:
        print(f"Load failed with error: {e}")
        import traceback
        traceback.print_exc()

