from sqlalchemy.orm import Session
from backend.db.database import SessionLocal, engine, Base
from backend.db.schema import Word, Distribution, TweetSentiment, PatternStatistic, PatternTransition
import pandas as pd
import logging
import traceback

# Configure logger
logger = logging.getLogger(__name__)

# Create tables if they don't exist
logger.info("Ensuring database tables exist...")
Base.metadata.create_all(bind=engine)

def load_games_data(df: pd.DataFrame):
    """
    Loads transformed games data into 'words' and 'distributions' tables using bulk insert.
    Strategy: DELETE existing records for these IDs, then INSERT new ones (Idempotent).
    """
    logger.info(f"load_games_data called with {len(df)} rows")
    if df.empty:
        logger.warning("Games DataFrame is empty. Skipping load.")
        return

    db: Session = SessionLocal()
    try:
        words_data = [] # List of dicts
        dists_data = [] # List of dicts

        for i, row in df.iterrows():
            wordle_id = int(row['Game'])
            target_word = row['target']
            game_date_str = str(row['date'])
            
            # Word Data
            words_data.append({
                "id": wordle_id,
                "word": target_word,
                "date": game_date_str,
                "avg_guess_count": float(row['avg_guesses']),
                "success_rate": float(row['success_rate']),
                "frequency_score": float(row['frequency_score']),
                "difficulty_rating": int(row['difficulty_rating'])
            })
            
            # Distribution Data
            dists_data.append({
                "word_id": wordle_id,
                "date": game_date_str,
                "guess_1": int(row['guess_1']),
                "guess_2": int(row['guess_2']),
                "guess_3": int(row['guess_3']),
                "guess_4": int(row['guess_4']),
                "guess_5": int(row['guess_5']),
                "guess_6": int(row['guess_6']),
                "failed": int(row['failed']),
                "total_tweets": int(row['total_tweets']),
                "avg_guesses": float(row['avg_guesses'])
            })

        logger.info("Performing Bulk Upsert (DELETE + INSERT) for Games data...")
        
        ids_to_process = [d['id'] for d in words_data]
        
        # Clean existing
        db.query(Distribution).filter(Distribution.word_id.in_(ids_to_process)).delete(synchronize_session=False)
        db.query(Word).filter(Word.id.in_(ids_to_process)).delete(synchronize_session=False)
        db.flush()
        
        # Bulk Insert
        db.bulk_insert_mappings(Word, words_data)
        db.bulk_insert_mappings(Distribution, dists_data)
        
        db.commit()
        logger.info("Games data load complete.")
        
    except Exception as e:
        logger.error(f"Error loading games data: {e}")
        logger.debug(traceback.format_exc())
        db.rollback()
    finally:
        db.close()

def load_tweets_data(df: pd.DataFrame):
    """
    Loads transformed tweet sentiment data.
    Strategy: DELETE existing records for these word_ids, then INSERT new ones.
    """
    logger.info(f"load_tweets_data called with {len(df)} rows")
    if df.empty:
        return

    db: Session = SessionLocal()
    try:
        sentiment_data = []
        for _, row in df.iterrows():
            wordle_id = int(row['wordle_id'])
            
            sentiment_data.append({
                "word_id": wordle_id,
                "date": str(row['date']),
                "avg_sentiment": float(row['avg_sentiment']),
                "frustration_index": float(row['frustration_index']),
                "sample_size": int(row['sample_size'])
            })
            
        # Filter for valid Word IDs to avoid FK violations
        existing_ids = set(flat_id for (flat_id,) in db.query(Word.id).all())
        original_count = len(sentiment_data)
        sentiment_data = [d for d in sentiment_data if d['word_id'] in existing_ids]
        dropped_count = original_count - len(sentiment_data)
        
        if dropped_count > 0:
            logger.warning(f"Dropped {dropped_count} sentiment records due to missing Word IDs.")
            
        logger.info("Performing Bulk Upsert (DELETE + INSERT) for Sentiment data...")
        
        ids_to_process = [d['word_id'] for d in sentiment_data]
        
        # Clean existing
        db.query(TweetSentiment).filter(TweetSentiment.word_id.in_(ids_to_process)).delete(synchronize_session=False)
        db.flush()
        
        # Bulk Insert
        db.bulk_insert_mappings(TweetSentiment, sentiment_data)
        
        db.commit()
        logger.info("Tweet sentiment load complete.")
        
    except Exception as e:
        logger.error(f"Error loading tweet data: {e}")
        logger.debug(traceback.format_exc())
        db.rollback()
    finally:
        db.close()

def load_patterns_data(stats_df: pd.DataFrame, transitions_df: pd.DataFrame):
    """
    Loads pattern stats and transitions.
    Strategy: Truncate tables and reload (Full Refresh).
    """
    logger.info(f"load_patterns_data called with {len(stats_df)} stats and {len(transitions_df)} transitions")
    
    db: Session = SessionLocal()
    try:
        logger.info("Truncating pattern tables...")
        db.query(PatternTransition).delete()
        db.query(PatternStatistic).delete()
        db.flush()
        
        if not stats_df.empty:
            logger.info("Inserting Pattern Statistics...")
            db.bulk_insert_mappings(PatternStatistic, stats_df.to_dict(orient='records'))
            
        if not transitions_df.empty:
            logger.info("Inserting Pattern Transitions...")
            db.bulk_insert_mappings(PatternTransition, transitions_df.to_dict(orient='records'))
            
        db.commit()
        logger.info("Pattern data load complete.")
        
    except Exception as e:
        logger.error(f"Error loading pattern data: {e}")
        logger.debug(traceback.format_exc())
        db.rollback()
    finally:
        db.close()
