import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from backend.db.database import get_db
from backend.db.schema import Word, Distribution, TweetSentiment, TrapAnalysis, Outlier
from backend.api.schemas import APIResponse

router = APIRouter(prefix="/words", tags=["words"])

# Response Models
class WordSchema(BaseModel):
    id: int
    word: str
    date: str
    frequency_score: Optional[float]
    difficulty_rating: Optional[int]
    difficulty_label: Optional[str]
    avg_guess_count: Optional[float]
    success_rate: Optional[float]

    class Config:
        from_attributes = True

class DifficultyStats(BaseModel):
    date: str
    difficulty_rating: Optional[int]
    avg_guess_count: Optional[float]

@router.get("/", response_model=APIResponse)
def get_words(
    skip: int = 0, 
    limit: int = 100, 
    sort: str = "date", 
    order: str = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Word)
    
    # Sorting logic
    # Sorting logic
    if sort == "avg_guess_count":
        # Hardest/Easiest Logic: Difficulty then Success Rate
        if order == "desc":
            query = query.order_by(Word.difficulty_rating.desc(), Word.success_rate.desc())
        else:
            query = query.order_by(Word.difficulty_rating.asc(), Word.success_rate.asc())
    elif order == "desc":
        query = query.order_by(getattr(Word, sort).desc())
    else:
        query = query.order_by(getattr(Word, sort).asc())
        
    words = query.offset(skip).limit(limit).all()
    
    return APIResponse(
        status="success",
        data={"words": [WordSchema.from_orm(w).dict() for w in words], "total": query.count()},
        meta={"limit": str(limit), "skip": str(skip)}
    )



@router.get("/stats/difficulty", response_model=APIResponse)
def get_difficulty_stats(db: Session = Depends(get_db)):
    """
    Get aggregated difficulty stats for visualizations.
    Returns data for:
    1. Timeline (Date vs Difficulty/Guesses)
    2. Correlation (Frequency vs Guesses)
    """
    stats = db.query(
        Word.date, 
        Word.difficulty_rating, 
        Word.avg_guess_count,
        Word.frequency_score
    ).filter(Word.avg_guess_count.isnot(None))\
     .order_by(Word.date).all()
    
    return APIResponse(
        status="success",
        data={
            "points": [
                {
                    "date": s.date,
                    "difficulty": s.difficulty_rating,
                    "avg_guesses": s.avg_guess_count,
                    "frequency": s.frequency_score
                } for s in stats
            ]
        },
        meta={"count": str(len(stats))}
    )


class WordDetailsSchema(BaseModel):
    """Comprehensive word details for Word Explorer."""
    word: str
    date: str
    difficulty_rating: Optional[int]
    difficulty_label: Optional[str]
    success_rate: Optional[float]
    avg_guess_count: Optional[float]
    tweet_volume: Optional[int]
    sentiment_score: Optional[float]
    frustration_index: Optional[float]
    trap_score: Optional[float]
    neighbor_count: Optional[int]
    deadly_neighbors: Optional[List[str]]
    is_outlier: bool
    outlier_z_score: Optional[float]


@router.get("/{word_str}/details", response_model=APIResponse)
def get_word_full_details(word_str: str, db: Session = Depends(get_db)):
    """
    Get comprehensive details for a word including sentiment, trap analysis, and outlier status.
    Used by the Word Explorer feature.
    """
    word = db.query(Word).filter(Word.word == word_str.upper()).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found in database")
    
    # Get distribution data
    distribution = word.distribution
    tweet_volume = distribution.total_tweets if distribution else None
    
    # Get sentiment data (join by date)
    sentiment = db.query(TweetSentiment).filter(TweetSentiment.date == word.date).first()
    sentiment_score = sentiment.avg_sentiment if sentiment else None
    frustration_index = sentiment.frustration_index if sentiment else None
    
    # Get trap analysis (direct query to avoid relationship lazy loading issues)
    trap = db.query(TrapAnalysis).filter(TrapAnalysis.word_id == word.id).first()
    trap_score = trap.trap_score if trap else None
    neighbor_count = trap.neighbor_count if trap else None
    deadly_neighbors = None
    if trap and trap.deadly_neighbors:
        try:
            deadly_neighbors = json.loads(trap.deadly_neighbors)
        except json.JSONDecodeError:
            deadly_neighbors = None
    
    # Get outlier status
    outlier = db.query(Outlier).filter(Outlier.word_id == word.id).first()
    is_outlier = outlier is not None
    outlier_z_score = outlier.z_score if outlier else None

    details = WordDetailsSchema(
        word=word.word,
        date=word.date,
        difficulty_rating=word.difficulty_rating,
        difficulty_label=word.difficulty_label,
        success_rate=word.success_rate,
        avg_guess_count=word.avg_guess_count,
        tweet_volume=tweet_volume,
        sentiment_score=sentiment_score,
        frustration_index=frustration_index,
        trap_score=trap_score,
        neighbor_count=neighbor_count,
        deadly_neighbors=deadly_neighbors,
        is_outlier=is_outlier,
        outlier_z_score=outlier_z_score
    )
    
    return APIResponse(
        status="success",
        data={"details": details.dict()},
        meta={}
    )

