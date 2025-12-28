import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.database import SessionLocal, engine, Base
from backend.db.schema import Word
from sqlalchemy import text
import sys
import datetime

def test_insert():
    print("DEBUG: Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("DEBUG: Inserting test word...")
        # Direct SQL check
        # db.execute(text("INSERT INTO words (id, word, date) VALUES (9999, 'TESTY', '2099-01-01')"))
        
        # ORM Check
        w = Word(id=8888, word="DT_TEST", date=datetime.date(2088, 1, 1))
        db.add(w)
        db.commit()
        print("DEBUG: Committed.")
        
        # Check immediately
        cnt = db.query(Word).filter(Word.id == 8888).count()
        print(f"DEBUG: Immediate count for 8888: {cnt}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_insert()
