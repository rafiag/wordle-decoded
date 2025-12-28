from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db.database import get_db
from backend.db.schema import PatternStatistic, PatternTransition
from backend.api.schemas import APIResponse
from typing import List, Dict, Any

router = APIRouter(
    prefix="/patterns",
    tags=["patterns"],
    responses={404: {"description": "Not found"}},
)

@router.get("/search")
async def search_pattern(
    pattern: str = Query(..., description="The emoji pattern string (e.g. 🟩⬜⬜🟨⬜)"),
    db: Session = Depends(get_db)
):
    """
    Get statistics for a specific pattern.
    """
    # Simply strip whitespace just in case
    pattern = pattern.strip()
    
    stat = db.query(PatternStatistic).filter(PatternStatistic.pattern == pattern).first()
    
    if not stat:
        # Instead of 404, we might return empty stats if it's a valid pattern format but not in DB?
        # But for now let's return 404 if data not found.
        raise HTTPException(status_code=404, detail=f"Pattern '{pattern}' not found in database.")
        
    return APIResponse(
        status="success",
        data={
            "pattern": stat.pattern,
            "count": stat.count,
            "success_count": stat.success_count,
            "success_rate": stat.success_count / stat.count if stat.count > 0 else 0.0,
            "avg_guesses": stat.avg_guesses,
            "rank": stat.rank
        }
    )

@router.get("/{pattern}/next")
async def get_next_patterns(
    pattern: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Get most common next patterns for a given pattern.
    """
    pattern = pattern.strip()
    
    transitions = db.query(PatternTransition)\
        .filter(PatternTransition.source_pattern == pattern)\
        .order_by(PatternTransition.count.desc())\
        .limit(limit)\
        .all()
        
    data = []
    total_transitions = sum(t.count for t in transitions) # Note: sum of TOP items, or total?
    # Ideally we'd want probability based on TOTAL transitions from this source.
    # Total count for source pattern is in PatternStatistic.count. 
    # But transition count sum might be slightly less if we only stored observed transitions?
    # Let's count total from DB for accuracy.
    
    total_from_source = db.query(func.sum(PatternTransition.count))\
        .filter(PatternTransition.source_pattern == pattern)\
        .scalar() or 1
        
    for t in transitions:
        data.append({
            "next_pattern": t.next_pattern,
            "count": t.count,
            "probability": t.count / total_from_source
        })
        
    return APIResponse(
        status="success",
        data=data
    )

@router.get("/top")
async def get_top_patterns(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get top occurring patterns overall.
    """
    stats = db.query(PatternStatistic).order_by(PatternStatistic.count.desc()).limit(limit).all()
    
    data = []
    for s in stats:
        data.append({
            "pattern": s.pattern,
            "count": s.count,
            "success_rate": s.success_count / s.count if s.count > 0 else 0.0,
            "rank": s.rank
        })
        
    return APIResponse(
        status="success",
        data=data
    )
