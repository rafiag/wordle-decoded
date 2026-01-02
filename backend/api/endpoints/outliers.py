from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.database import get_db
from backend.db.schema import Outlier, Word, Distribution, TweetSentiment
from backend.api.schemas import APIResponse, OutliersOverviewResponse, OutlierPoint, OutlierEvent
from sqlalchemy.orm import Session, joinedload

router = APIRouter(prefix="/outliers", tags=["outliers"])

@router.get("/overview", response_model=OutliersOverviewResponse)
def get_outliers_dashboard(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get combined data for the Outliers dashboard:
    1. Scatter plot data (volume vs sentiment) for all days
    2. List of top/recent outliers
    """
    # 1. Scatter Plot Data
    scatter_results = db.query(Word).join(Distribution).join(TweetSentiment).options(
        joinedload(Word.distribution),
        joinedload(Word.sentiment), 
        joinedload(Word.outliers)
    ).all()
    
    plot_data = []
    for w in scatter_results:
        outlier_type = None
        if w.outliers:
            outlier_type = w.outliers[0].outlier_type
            
        if w.distribution and w.sentiment:
            plot_data.append(OutlierPoint(
                date=w.date.strftime("%Y-%m-%d") if hasattr(w.date, 'strftime') else str(w.date),
                word=w.word,
                volume=w.distribution.total_tweets,
                sentiment=w.sentiment.avg_sentiment,
                outlier_type=outlier_type
            ))
            
    # 2. Recent Outliers List
    outliers_query = db.query(Outlier).join(Word).order_by(Word.date.desc()).limit(limit).all()
    
    top_outliers = []
    for o in outliers_query:
        top_outliers.append(OutlierEvent(
            id=o.id,
            date=o.date.strftime("%Y-%m-%d") if hasattr(o.date, 'strftime') else str(o.date),
            word=o.word.word,
            type=o.outlier_type,
            metric=o.metric,
            value=o.actual_value,
            z_score=o.z_score,
            context=o.context or ""
        ))
        
    return OutliersOverviewResponse(
        plot_data=plot_data,
        top_outliers=top_outliers
    )

# ... existing code ...




@router.get("/highlights", response_model=APIResponse)
def get_outlier_highlights(db: Session = Depends(get_db)):
    """
    Get 3 specific highlight cards: Highest Volume, Most Frustrating, Easiest.
    NOTE: This endpoint must come BEFORE /{date} to avoid route conflicts.
    """
    # 1. Highest Volume (Max total_tweets from Distribution)
    max_vol = db.query(Distribution, Word).join(Word).order_by(Distribution.total_tweets.desc()).first()
    
    # 2. Most Frustrating (Highest Frustration Index)
    # Using TweetSentiment.frustration_index as the primary metric
    max_diff_res = db.query(Word, TweetSentiment.frustration_index)\
        .join(TweetSentiment)\
        .order_by(TweetSentiment.frustration_index.desc(), TweetSentiment.avg_sentiment.desc())\
        .first()
    
    # 3. Easiest (Lowest difficulty_rating)
    min_diff = db.query(Word).filter(Word.difficulty_rating > 0).order_by(Word.difficulty_rating.asc()).first()
    
    def format_card(title, word_obj, metric_name, metric_value, desc):
        if not word_obj: 
            return None
        return {
            "title": title,
            "word": word_obj.word,
            "date": word_obj.date,
            "metric": metric_name,
            "value": metric_value,
            "description": desc
        }
        
    vol_card = None
    if max_vol:
        dist, word = max_vol
        vol_card = format_card("Highest Volume", word, "Tweets", dist.total_tweets, "Most discussed Wordle day")
        
    diff_card = None
    if max_diff_res:
        word_obj, frust_val = max_diff_res
        # Format as percentage
        frust_pct = f"{round((frust_val or 0) * 100, 1)}%"
        diff_card = format_card("Most Frustrating", word_obj, "Frustration Index", frust_pct, "Players struggled the most")
        
    easy_card = None
    if min_diff:
        easy_card = format_card("Easiest Day", min_diff, "Difficulty Score", min_diff.difficulty_rating, "Players solved it quickly")
        
    return APIResponse(
        status="success",
        data={
            "highest_volume": vol_card,
            "most_frustrating": diff_card,
            "easiest": easy_card
        }
    )



