from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from backend.db.database import get_db
from backend.db.schema import Word, Distribution
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

@router.get("/{word_str}", response_model=APIResponse)
def get_word_details(word_str: str, db: Session = Depends(get_db)):
    word = db.query(Word).filter(Word.word == word_str.upper()).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
        
    return APIResponse(
        status="success",
        data={"word": WordSchema.from_orm(word).dict()},
        meta={}
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
