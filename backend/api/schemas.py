from pydantic import BaseModel
from typing import List, Optional, Dict

class WordSchema(BaseModel):
    id: int
    word: str
    date: str
    frequency_score: Optional[float] = None
    difficulty_rating: Optional[int] = None
    avg_guess_count: Optional[float] = None
    success_rate: Optional[float] = None

    class Config:
        orm_mode = True

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
        orm_mode = True

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

class NYTEffectResponse(BaseModel):
    summary: NYTComparison
    tests: Dict[str, StatTestResult]

from typing import Dict, Any

class APIResponse(BaseModel):
    status: str
    data: Any
    meta: Optional[Dict[str, Any]] = None
