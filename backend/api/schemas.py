from pydantic import BaseModel
from typing import List, Optional, Dict

class WordSchema(BaseModel):
    id: int
    word: str
    date: str
    frequency_score: Optional[float] = None
    difficulty_rating: Optional[int] = None
    difficulty_label: Optional[str] = None
    avg_guess_count: Optional[float] = None
    success_rate: Optional[float] = None

    class Config:
        from_attributes = True

class DistributionSchema(BaseModel):
    word_id: int
    date: str
    guess_1: int
    guess_2: int
    guess_3: int
    guess_4: int
    guess_5: int
    guess_6: int
    failed: int
    total_tweets: int
    avg_guesses: Optional[float] = None

    class Config:
        from_attributes = True

class StatTestResult(BaseModel):
    test_name: str
    statistic: float
    p_value: float
    significant: bool
    interpretation: str

class NYTMetrics(BaseModel):
    avg_guesses: float
    avg_difficulty: float
    avg_success_rate: float
    total_games: int
    variance_guesses: float

class NYTComparison(BaseModel):
    before: NYTMetrics
    after: NYTMetrics
    diff_guesses: float
    diff_difficulty: float

class NYTTimelinePoint(BaseModel):
    date: str
    word: str
    era: str  # "Pre-NYT" or "Post-NYT"
    avg_guesses: float
    difficulty: Optional[int]



class NYTFullAnalysis(BaseModel):
    summary: NYTComparison
    tests: Dict[str, StatTestResult]
    timeline: List[NYTTimelinePoint]

class OutlierPoint(BaseModel):
    date: str
    word: str
    volume: int
    sentiment: float
    outlier_type: Optional[str]

class OutlierEvent(BaseModel):
    id: int
    date: str
    word: str
    type: str
    metric: str
    value: float
    z_score: float
    context: str

class OutliersOverviewResponse(BaseModel):
    plot_data: List[OutlierPoint]
    top_outliers: List[OutlierEvent]

from typing import Dict, Any

class APIResponse(BaseModel):
    status: str
    data: Any
    meta: Optional[Dict[str, Any]] = None

class OverviewStats(BaseModel):
    total_games_tracked: int
    avg_daily_players: float
    avg_sentiment: float
    viral_events_count: int

class AggregateDistribution(BaseModel):
    guess_1: int
    guess_2: int
    guess_3: int
    guess_4: int
    guess_5: int
    guess_6: int
    failed: int
    total_games: int

class HighlightCard(BaseModel):
    title: str
    word: str
    date: str
    metric: str
    value: Any
    description: str

class OutlierHighlights(BaseModel):
    highest_volume: Optional[HighlightCard]
    most_frustrating: Optional[HighlightCard]
    easiest: Optional[HighlightCard]

class DashboardInitResponse(BaseModel):
    overview: OverviewStats
    distribution: AggregateDistribution
    difficulty: List[Dict[str, Any]] # Or a specific model if we had one for stats points

