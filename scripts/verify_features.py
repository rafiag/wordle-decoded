import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.database import SessionLocal, engine
from backend.db.schema import Outlier, TrapAnalysis, Word

def verify():
    db = SessionLocal()
    try:
        print("Verifying Outliers...")
        outlier_count = db.query(Outlier).count()
        print(f"Total Outliers: {outlier_count}")
        
        if outlier_count > 0:
            sample = db.query(Outlier).first()
            print(f"Sample Outlier: Date={sample.date}, Type={sample.outlier_type}, Context={sample.context}")
            
        print("\nVerifying Traps...")
        trap_count = db.query(TrapAnalysis).count()
        print(f"Total Traps: {trap_count}")
        
        if trap_count > 0:
            sample = db.query(TrapAnalysis).join(Word).order_by(TrapAnalysis.trap_score.desc()).first()
            print(f"Top Trap: Word={sample.word.word}, Score={sample.trap_score}, Neighbors={sample.neighbor_count}")
            
    finally:
        db.close()

if __name__ == "__main__":
    verify()
