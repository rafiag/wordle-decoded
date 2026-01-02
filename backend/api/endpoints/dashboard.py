from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from backend.db.database import get_db
from backend.db.schema import Distribution, TweetSentiment, Outlier, Word, GlobalStats
from backend.api.schemas import APIResponse, DashboardInitResponse
from backend.api.utils import calculate_success_rate
from backend.services.aggregations import get_distribution_totals

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Constants
NYT_TRANSITION_DATE = "2022-02-10"

# Helper functions for at-a-glance endpoint
def _fetch_hardest_word(db: Session) -> dict:
    """Fetch the hardest word statistics."""
    hardest = db.query(
        Word.word,
        Word.difficulty_rating,
        Word.success_rate,
        Word.avg_guess_count,
        Word.date
    ).filter(Word.avg_guess_count.isnot(None))\
     .order_by(Word.difficulty_rating.desc(), Word.success_rate.desc())\
     .first()

    return {
        "word": hardest.word if hardest else "N/A",
        "difficulty": hardest.difficulty_rating if hardest else 0,
        "success_rate": round(hardest.success_rate * 100, 1) if (hardest and hardest.success_rate) else 0.0,
        "avg_guesses": round(hardest.avg_guess_count, 2) if hardest else 0.0,
        "date": str(hardest.date) if hardest else ""
    }

def _fetch_easiest_word(db: Session) -> dict:
    """Fetch the easiest word statistics."""
    easiest = db.query(
        Word.word,
        Word.difficulty_rating,
        Word.success_rate,
        Word.avg_guess_count,
        Word.date
    ).filter(Word.avg_guess_count.isnot(None))\
     .filter(Word.success_rate.isnot(None))\
     .filter(Word.success_rate > 0.95)\
     .order_by(Word.difficulty_rating.asc(), Word.success_rate.asc())\
     .first()

    return {
        "word": easiest.word if easiest else "N/A",
        "difficulty": easiest.difficulty_rating if easiest else 0,
        "success_rate": round(easiest.success_rate * 100, 1) if (easiest and easiest.success_rate) else 0.0,
        "avg_guesses": round(easiest.avg_guess_count, 2) if easiest else 0.0,
        "date": str(easiest.date) if easiest else ""
    }

def _fetch_viral_moment(db: Session) -> dict:
    """Fetch the most viral moment statistics."""
    most_viral = db.query(
        Outlier.date,
        Outlier.actual_value,
        Outlier.z_score,
        Word.word
    ).join(Word, Outlier.date == Word.date)\
     .filter(Outlier.outlier_type.ilike('%viral%'))\
     .order_by(Outlier.actual_value.desc())\
     .first()

    # Calculate percent increase from actual average
    total_tweets_sum = db.query(func.sum(Distribution.total_tweets)).scalar() or 0
    total_days_count = db.query(func.count(Distribution.id)).scalar() or 1
    avg_tweets_daily = total_tweets_sum / total_days_count if total_days_count > 0 else 1

    if most_viral and avg_tweets_daily > 0:
        percent_increase = round(((most_viral.actual_value - avg_tweets_daily) / avg_tweets_daily) * 100, 0)
    else:
        percent_increase = 0

    return {
        "date": str(most_viral.date) if most_viral else "",
        "word": most_viral.word if most_viral else "N/A",
        "tweet_volume": int(most_viral.actual_value) if most_viral else 0,
        "percent_increase": int(percent_increase)
    }

def _calculate_nyt_effect(db: Session) -> dict:
    """Calculate the NYT acquisition effect on average guesses."""
    avg_before_nyt = db.query(func.avg(Word.avg_guess_count))\
        .filter(Word.avg_guess_count.isnot(None))\
        .filter(Word.date < NYT_TRANSITION_DATE)\
        .scalar() or 0.0

    avg_after_nyt = db.query(func.avg(Word.avg_guess_count))\
        .filter(Word.avg_guess_count.isnot(None))\
        .filter(Word.date >= NYT_TRANSITION_DATE)\
        .scalar() or 0.0

    nyt_delta = avg_after_nyt - avg_before_nyt

    return {
        "delta": round(nyt_delta, 2),
        "direction": "increase" if nyt_delta > 0 else "decrease"
    }

def _get_community_mood(db: Session) -> dict:
    """Calculate community mood statistics."""
    from backend.api.utils import get_mood_label

    avg_sentiment = db.query(func.avg(TweetSentiment.avg_sentiment)).scalar() or 0.0

    # Count positive tweets (sentiment > 0)
    total_days = db.query(func.count(TweetSentiment.id)).scalar() or 1
    positive_days = db.query(func.count(TweetSentiment.id))\
        .filter(TweetSentiment.avg_sentiment > 0)\
        .scalar() or 0

    positive_pct = (positive_days / total_days * 100) if total_days > 0 else 0
    mood_label = get_mood_label(positive_pct)

    return {
        "avg_sentiment": round(avg_sentiment, 3),
        "positive_pct": round(positive_pct, 1),
        "mood_label": mood_label
    }

def _get_avg_guesses_overall(db: Session) -> float:
    """Calculate overall average guesses."""
    return db.query(func.avg(Word.avg_guess_count))\
        .filter(Word.avg_guess_count.isnot(None))\
        .scalar() or 0.0

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

    # Hardest word (highest avg guess count) with stats
    hardest_word_query = db.query(Word.word, Word.avg_guess_count, Word.success_rate)\
        .filter(Word.avg_guess_count.isnot(None))\
        .order_by(Word.avg_guess_count.desc())\
        .first()

    hardest_word = hardest_word_query.word if hardest_word_query else "N/A"
    hardest_word_guesses = round(hardest_word_query.avg_guess_count, 1) if hardest_word_query else 0.0
    # Convert success_rate from fraction (0.0-1.0) to percentage (0-100)
    hardest_word_success = round(hardest_word_query.success_rate * 100, 1) if (hardest_word_query and hardest_word_query.success_rate) else 0.0

    # 2. Aggregate Distribution Query (also used for success rate calculation)
    dist_res = get_distribution_totals(db)
    
    # Calculate success rate from distribution data
    success_rate = calculate_success_rate(dist_res) if dist_res else 0.0

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

    # Build overview data with all metrics
    overview_data = {
        "total_puzzles": int(total_puzzles),
        "total_tweets": int(total_tweets),
        "avg_guesses": float(avg_guesses),
        "avg_sentiment": float(avg_sentiment),
        "viral_events_count": int(viral_count),
        "hardest_word": hardest_word,
        "hardest_word_guesses": hardest_word_guesses,
        "hardest_word_success": hardest_word_success,
        "success_rate": round(success_rate, 1)
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

@router.get("/at-a-glance", response_model=APIResponse)
def get_at_a_glance_stats(db: Session = Depends(get_db)):
    """
    Get 6 key statistics for the landing page "At a Glance" section.
    Returns:
    - Hardest word ever (highest avg guesses)
    - Easiest word (lowest avg guesses + highest success rate)
    - Most viral moment (highest tweet volume outlier)
    - Average guesses (overall)
    - NYT effect (delta in avg guesses before/after acquisition)
    - Community mood (sentiment distribution)
    """
    # Optimized: Query global_stats directly (no calculations needed)
    latest = db.query(GlobalStats).order_by(GlobalStats.date.desc()).first()

    if latest:
        # Calculate percent increase for viral moment (requires one small query)
        total_tweets_sum = db.query(func.sum(Distribution.total_tweets)).scalar() or 0
        total_days_count = db.query(func.count(Distribution.id)).scalar() or 1
        avg_tweets_daily = total_tweets_sum / total_days_count if total_days_count > 0 else 1

        viral_vol = latest.most_viral_tweets or 0
        percent_increase = round(((viral_vol - avg_tweets_daily) / avg_tweets_daily) * 100, 0) if avg_tweets_daily > 0 else 0

        return APIResponse(
            status="success",
            data={
                "hardest_word": {
                    "word": latest.hardest_word,
                    "date": latest.hardest_word_date,
                    "avg_guesses": latest.hardest_word_avg_guesses,
                    "success_rate": latest.hardest_word_success_rate,
                    "difficulty": 0  # Not stored in global stats
                },
                "easiest_word": {
                    "word": latest.easiest_word,
                    "date": latest.easiest_word_date,
                    "avg_guesses": latest.easiest_word_avg_guesses,
                    "success_rate": latest.easiest_word_success_rate,
                    "difficulty": 0  # Not stored in global stats
                },
                "most_viral": {
                    "word": latest.most_viral_word,
                    "date": latest.most_viral_date,
                    "tweet_volume": latest.most_viral_tweets,
                    "percent_increase": int(percent_increase)
                },
                "avg_guesses": latest.avg_guesses,
                "success_rate": latest.success_rate,
                "nyt_effect": {
                    "delta": latest.nyt_effect_delta,
                    "direction": latest.nyt_effect_direction
                },
                "community_mood": {
                    "avg_sentiment": latest.community_sentiment,
                    "positive_pct": latest.positive_pct,
                    "mood_label": latest.mood_label
                }
            }
        )

    # Fallback: Calculate stats from database
    hardest_word = _fetch_hardest_word(db)
    easiest_word = _fetch_easiest_word(db)
    most_viral_moment = _fetch_viral_moment(db)
    avg_guesses_overall = _get_avg_guesses_overall(db)
    nyt_effect = _calculate_nyt_effect(db)
    community_mood = _get_community_mood(db)

    # 7. Overall Success Rate
    dist_res = get_distribution_totals(db)
    success_rate = calculate_success_rate(dist_res) if dist_res else 0.0
    
    return APIResponse(
        status="success",
        data={
            "hardest_word": hardest_word,
            "easiest_word": easiest_word,
            "most_viral": most_viral_moment,
            "avg_guesses": round(avg_guesses_overall, 2),
            "nyt_effect": nyt_effect,
            "community_mood": community_mood,
            "success_rate": round(success_rate, 1)
        }
    )
