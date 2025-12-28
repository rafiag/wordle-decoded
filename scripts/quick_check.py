import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.database import SessionLocal
from backend.db.schema import Word, Distribution, TweetSentiment

def check():
    db = SessionLocal()
    try:
        w = db.query(Word).count()
        d = db.query(Distribution).count()
        t = db.query(TweetSentiment).count()
        print(f"WORDS: {w}")
        print(f"DISTRIBUTIONS: {d}")
        print(f"TWEETS: {t}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
