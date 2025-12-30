import pandas as pd
from backend.db.database import SessionLocal
from backend.db.schema import Word, TweetSentiment, Distribution

def verify_data_quality():
    db = SessionLocal()
    
    print("=== Data Quality Verification ===\n")
    
    # 1. Word Count
    word_count = db.query(Word).count()
    print(f"Total words in database: {word_count}")
    
    # 2. Success Rate Check
    print("\n--- Top 5 Hardest Words ---")
    hardest = db.query(Word.word, Word.avg_guess_count, Word.success_rate).order_by(Word.avg_guess_count.desc()).limit(5).all()
    for w in hardest:
        print(f"  {w[0]}: avg={w[1]:.2f}, success={w[2]*100:.1f}%")
    
    # 3. Sentiment Records
    sentiment_count = db.query(TweetSentiment).count()
    print(f"\nSentiment records: {sentiment_count}")
    
    # 4. Distribution Records
    dist_count = db.query(Distribution).count()
    print(f"Distribution records: {dist_count}")
    
    # 5. Check for realistic failure rates
    print("\n--- Failure Rate Analysis ---")
    total_attempts = db.query(
        (Distribution.guess_1 + Distribution.guess_2 + Distribution.guess_3 + 
         Distribution.guess_4 + Distribution.guess_5 + Distribution.guess_6 + Distribution.failed)
    ).all()
    total_failed = db.query(Distribution.failed).all()
    
    total_sum = sum(t[0] for t in total_attempts if t[0])
    failed_sum = sum(f[0] for f in total_failed if f[0])
    
    if total_sum > 0:
        failure_rate = (failed_sum / total_sum) * 100
        print(f"Overall failure rate: {failure_rate:.2f}%")
    
    db.close()

if __name__ == "__main__":
    verify_data_quality()
