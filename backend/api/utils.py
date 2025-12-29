
def get_difficulty_label(rating: float) -> str:
    """
    Returns a descriptive label for the difficulty rating (1-10).
    
    Logic:
    - Easy: 1.0 - 3.4
    - Medium: 3.5 - 6.4
    - Hard: 6.5 - 8.4
    - Expert: 8.5 - 10.0
    
    Note: A 'standard' word is usually around 3.5-4.0.
    """
    if rating is None:
        return "Unknown"
        
    if rating < 3.5:
        return "Easy"
    elif rating < 6.5:
        return "Medium"
    elif rating < 8.5:
        return "Hard"
    else:
        return "Expert"
