from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.db.database import get_db
from backend.services.nyt_service import NYTService
from backend.api.schemas import NYTEffectResponse, NYTTimelinePoint, NYTFullAnalysis

router = APIRouter()

@router.get("/analysis", response_model=NYTFullAnalysis)
def get_nyt_analysis(db: Session = Depends(get_db)):
    """
    Returns the complete NYT effect analysis: summary, statistical tests, and timeline.
    Combines previous /summary and /timeline endpoints for faster initial load.
    """
    service = NYTService(db)
    
    summary = service.get_comparison_summary()
    tests = service.run_statistical_tests()
    timeline = service.get_timeline()
    
    return NYTFullAnalysis(
        summary=summary,
        tests=tests,
        timeline=timeline
    )

@router.get("/summary", response_model=NYTEffectResponse)
def get_nyt_summary(db: Session = Depends(get_db)):
    """
    Returns the comprehensive before/after comparison including statistical tests.
    """
    service = NYTService(db)
    
    summary = service.get_comparison_summary()
    tests = service.run_statistical_tests()
    
    return NYTEffectResponse(
        summary=summary,
        tests=tests
    )

@router.get("/timeline", response_model=List[NYTTimelinePoint])
def get_nyt_timeline(db: Session = Depends(get_db)):
    """
    Returns daily metrics tagged with Pre-NYT / Post-NYT status for timeline visualization.
    """
    service = NYTService(db)
    timeline = service.get_timeline()

    return timeline

@router.get("/periods")
def get_nyt_period_comparison(db: Session = Depends(get_db)):
    """
    Returns metrics for before and multiple post-acquisition periods (1m, 3m, 6m).
    Used for NYT Effect table display.
    """
    service = NYTService(db)
    return service.get_period_comparison()
