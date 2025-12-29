from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from backend.db.database import get_db
from backend.db.schema import Distribution, TweetSentiment, Outlier, Word
from backend.api.schemas import APIResponse, DashboardInitResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/init", response_model=APIResponse)
def get_dashboard_init(db: Session = Depends(get_db)):
    """
    Get initial data for the dashboard in a single request.
    Aggregates:
    - Analytics Overview (Hero Section)
    - Aggregate Distributions (Chart)
    - Difficulty Stats (Timeline)
    """
    
    # 1. Overview Query
    # Total unique puzzles (count of unique words/dates)
    total_puzzles = db.query(func.count(Word.id)).scalar() or 0
    
    # Total player tweets analyzed
    total_tweets = db.query(func.sum(Distribution.total_tweets)).scalar() or 0
    
    # Actual average guesses across all puzzles
    avg_guesses = db.query(func.avg(Word.avg_guess_count)).filter(Word.avg_guess_count.isnot(None)).scalar() or 0.0
    
    # Average sentiment (-1 to 1)
    avg_sentiment = db.query(func.avg(TweetSentiment.avg_sentiment)).scalar() or 0.0
    
    # Viral events count
    viral_count = db.query(func.count(Outlier.id)).filter(Outlier.outlier_type.ilike('%viral%')).scalar() or 0
    
    overview_data = {
        "total_puzzles": int(total_puzzles),
        "total_tweets": int(total_tweets),
        "avg_guesses": float(avg_guesses),
        "avg_sentiment": float(avg_sentiment),
        "viral_events_count": int(viral_count)
    }
    
    # 2. Aggregate Distribution Query
    dist_res = db.query(
        func.sum(Distribution.guess_1).label('g1'),
        func.sum(Distribution.guess_2).label('g2'),
        func.sum(Distribution.guess_3).label('g3'),
        func.sum(Distribution.guess_4).label('g4'),
        func.sum(Distribution.guess_5).label('g5'),
        func.sum(Distribution.guess_6).label('g6'),
        func.sum(Distribution.failed).label('fail'),
        func.count(Distribution.id).label('total_games')
    ).first()
    
    if dist_res:
         dist_data = {
            "guess_1": int(dist_res.g1 or 0),
            "guess_2": int(dist_res.g2 or 0),
            "guess_3": int(dist_res.g3 or 0),
            "guess_4": int(dist_res.g4 or 0),
            "guess_5": int(dist_res.g5 or 0),
            "guess_6": int(dist_res.g6 or 0),
            "failed": int(dist_res.fail or 0),
            "total_games": int(dist_res.total_games or 0)
        }
    else:
        dist_data = {
            "guess_1": 0, "guess_2": 0, "guess_3": 0, 
            "guess_4": 0, "guess_5": 0, "guess_6": 0, 
            "failed": 0, "total_games": 0
        }

    # 3. Difficulty Stats Query
    diff_stats = db.query(
        Word.date, 
        Word.difficulty_rating, 
        Word.avg_guess_count,
        Word.frequency_score
    ).filter(Word.avg_guess_count.isnot(None))\
     .order_by(Word.date).all()
     
    diff_points = [
        {
            "date": s.date,
            "difficulty": s.difficulty_rating,
            "avg_guesses": s.avg_guess_count,
            "frequency": s.frequency_score
        } for s in diff_stats
    ]

    return APIResponse(
        status="success",
        data={
            "overview": overview_data,
            "distribution": dist_data,
            "difficulty": diff_points
        }
    )
