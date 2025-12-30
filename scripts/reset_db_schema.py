from backend.db.database import engine, Base
from backend.db.schema import Word, Distribution, TweetSentiment, PatternStatistic, PatternTransition, Outlier, TrapAnalysis, GlobalStats

def reset_schema():
    print("Dropping all tables to apply the new CASCADE DELETE schema...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Schema reset complete.")

if __name__ == "__main__":
    reset_schema()
