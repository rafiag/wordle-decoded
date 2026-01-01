from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from backend.db.database import get_db
from backend.db.schema import TrapAnalysis, Word
from backend.api.schemas import APIResponse

router = APIRouter(prefix="/traps", tags=["traps"])

@router.get("/top", response_model=APIResponse)
def get_top_traps(
    limit: int = Query(20, le=100, gt=0, description="Max 100 traps"), 
    db: Session = Depends(get_db)
):
    """
    Get the top 'trap' words (highest trap score).
    """
    traps = db.query(TrapAnalysis).join(Word).order_by(TrapAnalysis.trap_score.desc()).limit(limit).all()
    
    results = []
    for t in traps:
        results.append({
            "word": t.word.word,
            "date": str(t.word.date) if t.word.date else None,
            "trap_score": t.trap_score,
            "neighbor_count": t.neighbor_count,
            "deadly_neighbors": json.loads(t.deadly_neighbors) if t.deadly_neighbors else [],
            "avg_guesses": float(t.word.avg_guess_count) if t.word.avg_guess_count else None,
            "success_rate": float(t.word.success_rate) if t.word.success_rate else None
        })
        
    return APIResponse(
        status="success",
        data=results,
        meta={"count": len(results)}
    )

@router.get("/{word}", response_model=APIResponse)
def get_trap_by_word(word: str, db: Session = Depends(get_db)):
    """
    Get trap analysis for a specific word.
    """
    word_obj = db.query(Word).filter(Word.word == word.upper()).first()
    if not word_obj:
        raise HTTPException(status_code=404, detail="Word not found")
        
    trap = db.query(TrapAnalysis).filter(TrapAnalysis.word_id == word_obj.id).first()
    
    if not trap:
        # Not a trap or no analysis
        return APIResponse(
            status="success",
            data={
                "word": word.upper(),
                "date": str(word_obj.date) if word_obj.date else None,
                "is_trap": False,
                "message": "This word has no significant trap characteristics.",
                "avg_guesses": float(word_obj.avg_guess_count) if word_obj.avg_guess_count else None,
                "success_rate": float(word_obj.success_rate) if word_obj.success_rate else None
            }
        )
        
    return APIResponse(
        status="success",
        data={
            "word": word.upper(),
            "date": str(word_obj.date) if word_obj.date else None,
            "is_trap": True,
            "trap_score": trap.trap_score,
            "neighbor_count": trap.neighbor_count,
            "deadly_neighbors": json.loads(trap.deadly_neighbors) if trap.deadly_neighbors else [],
            "avg_guesses": float(word_obj.avg_guess_count) if word_obj.avg_guess_count else None,
            "success_rate": float(word_obj.success_rate) if word_obj.success_rate else None
        }
    )
