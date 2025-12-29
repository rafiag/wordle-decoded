from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.schema import TweetSentiment, Word
from backend.api.schemas import APIResponse 
from backend.api.utils import get_difficulty_label

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/sentiment", response_model=APIResponse)
def get_sentiment_analytics(db: Session = Depends(get_db)):
    """
    Get correlation data between sentiment and game performance.
    """
    # Join TweetSentiment with Word to get avg_guess_count
    results = db.query(
        TweetSentiment.date,
        TweetSentiment.avg_sentiment,
        TweetSentiment.frustration_index,
        TweetSentiment.very_pos_count,
        TweetSentiment.pos_count,
        TweetSentiment.neu_count,
        TweetSentiment.neg_count,
        TweetSentiment.very_neg_count,
        Word.avg_guess_count,
        Word.difficulty_rating,
        Word.success_rate,
        Word.word.label("target_word")
    ).join(Word, TweetSentiment.word_id == Word.id)\
     .filter(Word.avg_guess_count.isnot(None))\
     .order_by(TweetSentiment.date).all()
     
    timeline_data = []
    full_data = [] # To sort for top 5
    
    for r in results:
        # Full object for top 5 sorting
        full_obj = {
            "date": r.date,
            "target_word": r.target_word,
            "sentiment": r.avg_sentiment,
            "frustration": r.frustration_index,
            "very_pos_count": r.very_pos_count,
            "pos_count": r.pos_count,
            "neu_count": r.neu_count,
            "neg_count": r.neg_count,
            "very_neg_count": r.very_neg_count,
            "avg_guesses": r.avg_guess_count,
            "difficulty": r.difficulty_rating,
            "difficulty_label": get_difficulty_label(r.difficulty_rating),
            "success_rate": r.success_rate
        }
        full_data.append(full_obj)
        
        # Use full object for timeline to ensure tooltips have all data (target_word, etc.)
        timeline_data.append(full_obj)

    # Sort for top lists
    # Top Hated: Highest Frustration
    top_hated = sorted(full_data, key=lambda x: x['frustration'] or -1, reverse=True)[:5]
    
    # Top Loved: Highest Sentiment
    top_loved = sorted(full_data, key=lambda x: x['sentiment'] or -1, reverse=True)[:5]
        
    return APIResponse(
        status="success",
        data={
            "timeline": timeline_data,
            "top_hated": top_hated,
            "top_loved": top_loved
        },
        meta={"count": str(len(timeline_data))}
    )

@router.get("/overview", response_model=APIResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get high-level overview statistics for the dashboard hero section.
    """
    from sqlalchemy import func
    from backend.db.schema import Distribution, TweetSentiment, Outlier
    
    # Total Games Tracked (sum of total_tweets across all days)
    total_games = db.query(func.sum(Distribution.total_tweets)).scalar() or 0
    
    # Average Daily Players
    avg_players = db.query(func.avg(Distribution.total_tweets)).scalar() or 0.0
    
    # Global Average Sentiment
    avg_sentiment = db.query(func.avg(TweetSentiment.avg_sentiment)).scalar() or 0.0
    
    # Count of Viral Events
    viral_count = db.query(func.count(Outlier.id)).filter(Outlier.outlier_type.ilike('%viral%')).scalar() or 0
    
    return APIResponse(
        status="success",
        data={
            "total_games_tracked": int(total_games),
            "avg_daily_players": float(avg_players),
            "avg_sentiment": float(avg_sentiment),
            "viral_events_count": int(viral_count)
        }
    )
