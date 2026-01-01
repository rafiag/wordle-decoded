from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db.database import get_db
from backend.db.schema import TweetSentiment, Word
from backend.api.schemas import APIResponse 
from backend.api.utils import get_difficulty_label

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/sentiment", response_model=APIResponse)
def get_sentiment_analytics(db: Session = Depends(get_db)):
    """
    Get correlation data between sentiment and game performance.
    Optimized: Returns aggregates for all-time stats, but limits detailed daily timeline to 90 days.
    """
    # 1. Calculate All-Time Aggregates
    # Sentiment Distribution sum
    dist_agg = db.query(
        func.sum(TweetSentiment.very_pos_count).label('very_pos'),
        func.sum(TweetSentiment.pos_count).label('pos'),
        func.sum(TweetSentiment.neu_count).label('neu'),
        func.sum(TweetSentiment.neg_count).label('neg'),
        func.sum(TweetSentiment.very_neg_count).label('very_neg'),
        func.avg(TweetSentiment.frustration_index).label('avg_frustration')
    ).first()

    # Frustration by Difficulty
    frust_by_difficulty_query = db.query(
        Word.difficulty_rating,
        func.avg(TweetSentiment.frustration_index).label('avg_score')
    ).join(TweetSentiment, Word.id == TweetSentiment.word_id)\
     .filter(Word.difficulty_rating.isnot(None))\
     .group_by(Word.difficulty_rating).all()


    frust_by_difficulty = {
        'Easy': 0.0, 'Medium': 0.0, 'Hard': 0.0
    }
    
    # Map back to simple dictionary
    if frust_by_difficulty_query:
        for row in frust_by_difficulty_query:
            label = get_difficulty_label(row[0]) if isinstance(row[0], int) else row[0] # Handle both raw int or already labeled
            if label in frust_by_difficulty:
                frust_by_difficulty[label] = round(float(row[1] or 0) * 100, 2)
            # Map raw difficulty integers if stored that way
            elif row[0] == 1 or row[0] == 'Easy': frust_by_difficulty['Easy'] = round(float(row[1] or 0) * 100, 2)
            elif row[0] == 2 or row[0] == 'Medium': frust_by_difficulty['Medium'] = round(float(row[1] or 0) * 100, 2)
            elif row[0] >= 3 or row[0] == 'Hard': frust_by_difficulty['Hard'] = round(float(row[1] or 0) * 100, 2)
        
    aggregates = {
        "distribution": [
            {"name": "Very Neg", "value": int(dist_agg.very_neg or 0)},
            {"name": "Negative", "value": int(dist_agg.neg or 0)},
            {"name": "Neutral", "value": int(dist_agg.neu or 0)},
            {"name": "Positive", "value": int(dist_agg.pos or 0)},
            {"name": "Very Pos", "value": int(dist_agg.very_pos or 0)},
        ],
        "avg_frustration": round((dist_agg.avg_frustration or 0) * 100, 2),
        "frustration_by_difficulty": frust_by_difficulty
    }

    # 2. Get Timeline (Last 90 Days Only)
    results = db.query(
        TweetSentiment.date,
        TweetSentiment.frustration_index,
        TweetSentiment.very_pos_count,
        TweetSentiment.pos_count,
        TweetSentiment.neu_count,
        TweetSentiment.neg_count,
        TweetSentiment.very_neg_count,
        Word.difficulty_rating,
        Word.word.label("target_word")
    ).join(Word, TweetSentiment.word_id == Word.id)\
     .filter(Word.avg_guess_count.isnot(None))\
     .order_by(TweetSentiment.date.desc())\
     .limit(90)\
     .all()
    
    # Reverse to chronological order for charts
    results = list(reversed(results))
    
    timeline_data = []
    for r in results:
        total = (r.very_pos_count or 0) + (r.pos_count or 0) + (r.neu_count or 0) + (r.neg_count or 0) + (r.very_neg_count or 0)
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
            "total_tweets": total
        })

    # 3. Top Lists (All Time)
    # Re-using the join logic but optimized for sorting
    def get_top_list(sort_col, order_desc=True, limit=5, secondary_sort_col=None, secondary_order_desc=True):
        q = db.query(
            Word.word.label("target_word"),
            Word.date,
            TweetSentiment.avg_sentiment.label("sentiment"),
            TweetSentiment.frustration_index.label("frustration"),
            Word.difficulty_rating,
            Word.success_rate,
            TweetSentiment.very_pos_count,
            TweetSentiment.pos_count,
            TweetSentiment.neu_count,
            TweetSentiment.neg_count,
            TweetSentiment.very_neg_count
        ).join(Word, TweetSentiment.word_id == Word.id)\
         .filter(Word.avg_guess_count.isnot(None))
        
        # Collect sort criteria
        sort_criteria = []
        
        # Primary Sort
        if order_desc:
            sort_criteria.append(sort_col.desc())
        else:
            sort_criteria.append(sort_col.asc())

        # Secondary Sort (if provided)
        if secondary_sort_col is not None:
             if secondary_order_desc:
                 sort_criteria.append(secondary_sort_col.desc())
             else:
                 sort_criteria.append(secondary_sort_col.asc())
        
        # Tertiary Sort (Date) for stable tie-breaking
        sort_criteria.append(Word.date.desc())
            
        return q.order_by(*sort_criteria).limit(limit).all()

    # Frustrating: Frustration Index desc, then by Sentiment score desc
    top_hated_raw = get_top_list(
        sort_col=TweetSentiment.frustration_index, 
        order_desc=True,
        secondary_sort_col=TweetSentiment.avg_sentiment,
        secondary_order_desc=True
    )

    # Loved: Sentiment score desc, then by Frustration index asc
    top_loved_raw = get_top_list(
        sort_col=TweetSentiment.avg_sentiment, 
        order_desc=True,
        secondary_sort_col=TweetSentiment.frustration_index,
        secondary_order_desc=False
    )

    def format_top_item(r):
        total_tweets = (r.very_pos_count or 0) + (r.pos_count or 0) + (r.neu_count or 0) + (r.neg_count or 0) + (r.very_neg_count or 0)
        return {
            "date": r.date,
            "target_word": r.target_word,
            "sentiment": r.sentiment,
            "frustration": r.frustration,
            "difficulty": r.difficulty_rating,
            "difficulty_label": get_difficulty_label(r.difficulty_rating),
            "success_rate": r.success_rate,
            "total_tweets": total_tweets
        }

    top_hated = [format_top_item(r) for r in top_hated_raw]
    top_loved = [format_top_item(r) for r in top_loved_raw]

    return APIResponse(
        status="success",
        data={
            "aggregates": aggregates,
            "timeline": timeline_data,
            "top_hated": top_hated,
            "top_loved": top_loved
        },
        meta={
            "count": str(len(timeline_data)),
            "note": "Timeline limited to last 90 days. Aggregates and Top Lists are all-time."
        }
    )
