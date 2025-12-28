from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.schema import TweetSentiment, Word
from backend.api.schemas import APIResponse # type: ignore

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
        Word.avg_guess_count,
        Word.difficulty_rating
    ).join(Word, TweetSentiment.word_id == Word.id)\
     .filter(Word.avg_guess_count.isnot(None))\
     .order_by(TweetSentiment.date).all()
     
    data = []
    for r in results:
        data.append({
            "date": r.date,
            "sentiment": r.avg_sentiment,
            "frustration": r.frustration_index,
            "avg_guesses": r.avg_guess_count,
            "difficulty": r.difficulty_rating
        })
        
    return APIResponse(
        status="success",
        data={"sentiment_correlation": data},
        meta={"count": str(len(data))}
    )
