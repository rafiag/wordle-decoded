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

@router.get("/volume-sentiment", response_model=APIResponse)
def get_volume_sentiment_scatter(db: Session = Depends(get_db)):
    """
    Get volume vs sentiment data for all days, with outlier tags.
    Used for Scatter Plot visualization.
    """
    # Query all words with their distribution and sentiment data
    # We join explicitly to ensure we only get days with data
    results = db.query(Word).join(Distribution).join(TweetSentiment).options(
        joinedload(Word.distribution),
        joinedload(Word.sentiment), 
        joinedload(Word.outliers)
    ).all()
    
    data_points = []
    for w in results:
        # Determine outlier type if exists
        outlier_type = None
        if w.outliers:
            # A word might have multiple outliers (rare), pick the first one's type
            outlier_type = w.outliers[0].outlier_type
            
        if w.distribution and w.sentiment:
            data_points.append({
                "date": w.date,
                "word": w.word,
                "volume": w.distribution.total_tweets,
                "sentiment": w.sentiment.avg_sentiment,
                "outlier_type": outlier_type
            })
            
    return APIResponse(
        status="success",
        data=data_points,
        meta={"count": len(data_points)}
    )



@router.get("", response_model=APIResponse)
def get_outliers(
    skip: int = 0, 
    limit: int = Query(100, le=100, gt=0, description="Max 100 records"),
    type: Optional[str] = Query(None, description="Filter by outlier type (e.g., viral_frustration, quiet_day)"),
    db: Session = Depends(get_db)
):
    """
    Get a list of outlier days.
    """
    query = db.query(Outlier).join(Word)
    
    if type:
        query = query.filter(Outlier.outlier_type == type)
        
    outliers = query.order_by(Word.date.desc()).offset(skip).limit(limit).all()
    
    # Enrich with Word info if needed, but the schema has relationships.
    # We'll return a flat structure or nested? 
    # Let's return the outlier data + the word it relates to.
    
    results = []
    for o in outliers:
        results.append({
            "id": o.id,
            "date": o.date,
            "word": o.word.word,
            "type": o.outlier_type,
            "metric": o.metric,
            "value": o.actual_value,
            "z_score": o.z_score,
            "context": o.context
        })

    return APIResponse(
        status="success",
        data=results,
        meta={"count": len(results), "skip": skip, "limit": limit}
    )

@router.get("/highlights", response_model=APIResponse)
def get_outlier_highlights(db: Session = Depends(get_db)):
    """
    Get 3 specific highlight cards: Highest Volume, Most Frustrating, Easiest.
    NOTE: This endpoint must come BEFORE /{date} to avoid route conflicts.
    """
    # 1. Highest Volume (Max total_tweets from Distribution)
    max_vol = db.query(Distribution, Word).join(Word).order_by(Distribution.total_tweets.desc()).first()
    
    # 2. Most Frustrating (Highest difficulty_rating for now, or could use sentiment)
    # Let's use Difficulty Rating from Word table as a proxy for "Hardest/Frustrating"
    max_diff = db.query(Word).order_by(Word.difficulty_rating.desc()).first()
    
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
    if max_diff:
        diff_card = format_card("Most Frustrating", max_diff, "Difficulty Score", max_diff.difficulty_rating, "Players struggled the most")
        
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

@router.get("/{date}", response_model=APIResponse)
def get_outlier_by_date(date: str, db: Session = Depends(get_db)):
    """
    Get outlier details for a specific date.
    NOTE: This endpoint must come AFTER /highlights to avoid route conflicts.
    """
    outlier = db.query(Outlier).filter(Outlier.date == date).first()
    if not outlier:
        raise HTTPException(status_code=404, detail="Outlier not found for this date")
    
    return APIResponse(
        status="success",
        data={
            "id": outlier.id,
            "date": outlier.date,
            "word": outlier.word.word,
            "type": outlier.outlier_type,
            "metric": outlier.metric,
            "value": outlier.actual_value,
            "expected_value": outlier.expected_value,
            "z_score": outlier.z_score,
            "context": outlier.context
        }
    )

