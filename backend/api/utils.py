
def get_difficulty_label(rating: float) -> str:
    """
    Returns a descriptive label for the difficulty rating (1-10).
    
    Logic (Updated for balanced distribution):
    - Easy: 1.0 - 4.0 (~33%)
    - Medium: 4.1 - 6.0 (~33%)
    - Hard: 6.1 - 8.0 (~25%)
    - Expert: 8.1 - 10.0 (~9%)
    
    Thresholds are based on actual data distribution percentiles
    to create more balanced categories.
    """
    if rating is None:
        return "Unknown"
        
    if rating <= 4.0:
        return "Easy"
    elif rating <= 6.0:
        return "Medium"
    elif rating <= 8.0:
        return "Hard"
    else:
        return "Expert"

def get_mood_label(positive_pct: float) -> str:
    """
    Returns a unified mood label based on the percentage of positive tweets.

    Logic (V2 Standard):
    - > 90%: Positive
    - > 70%: Mostly Positive
    - > 50%: Neutral
    - > 30%: Mostly Negative
    - < 30%: Negative
    """
    if positive_pct > 90:
        return "Positive"
    elif positive_pct > 70:
        return "Mostly Positive"
    elif positive_pct > 50:
        return "Neutral"
    elif positive_pct > 30:
        return "Mostly Negative"
    else:
        return "Negative"

def calculate_success_rate(dist_result) -> float:
    """
    Calculate success rate from distribution aggregate result.

    Args:
        dist_result: SQLAlchemy result object with g1-g6 and fail attributes

    Returns:
        Success rate as percentage (0-100)
    """
    total = sum([
        dist_result.g1 or 0,
        dist_result.g2 or 0,
        dist_result.g3 or 0,
        dist_result.g4 or 0,
        dist_result.g5 or 0,
        dist_result.g6 or 0,
        dist_result.fail or 0
    ])
    if total == 0:
        return 0.0
    success = total - (dist_result.fail or 0)
    return (success / total) * 100
