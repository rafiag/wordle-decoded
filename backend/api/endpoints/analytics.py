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
        
        # Optimized object for timeline (charts only)
        # Removes: sentiment, avg_guesses, difficulty, success_rate to save bandwidth
        timeline_data.append({
            "date": r.date,
            "target_word": r.target_word,
            "frustration": r.frustration_index,
            "difficulty_label": get_difficulty_label(r.difficulty_rating),
            "very_pos_count": r.very_pos_count,
            "pos_count": r.pos_count,
            "neu_count": r.neu_count,
            "neg_count": r.neg_count,
            "very_neg_count": r.very_neg_count,
        })

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
