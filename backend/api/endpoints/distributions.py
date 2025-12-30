from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from backend.db.database import get_db
from backend.db.schema import Distribution, Word
from backend.api.schemas import APIResponse

router = APIRouter(prefix="/distributions", tags=["distributions"])

class DistributionSchema(BaseModel):
    date: str
    guess_1: int
    guess_2: int
    guess_3: int
    guess_4: int
    guess_5: int
    guess_6: int
    failed: int
    total_tweets: int
    avg_guesses: Optional[float]
    word_solution: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=APIResponse)
def get_distributions(
    limit: int = 365,
    db: Session = Depends(get_db)
):
    """
    Get guess distributions.
    """
    dists = db.query(Distribution).options(joinedload(Distribution.word)).order_by(Distribution.date.desc()).limit(limit).all()
    
    results = []
    for d in dists:
        schema = DistributionSchema.from_orm(d)
        schema.word_solution = d.word.word if d.word else None
        results.append(schema.dict())

    return APIResponse(
        status="success",
        data={"distributions": results},
        meta={"count": str(len(dists))}
    )

@router.get("/aggregate", response_model=APIResponse)
def get_aggregate_distribution(db: Session = Depends(get_db)):
    """
    Get aggregated guess distribution across all time.
    """
    results = db.query(
        func.sum(Distribution.guess_1).label('g1'),
        func.sum(Distribution.guess_2).label('g2'),
        func.sum(Distribution.guess_3).label('g3'),
        func.sum(Distribution.guess_4).label('g4'),
        func.sum(Distribution.guess_5).label('g5'),
        func.sum(Distribution.guess_6).label('g6'),
        func.sum(Distribution.failed).label('fail'),
        func.count(Distribution.id).label('total_games')
    ).first()
    
    if not results:
         return APIResponse(
            status="success",
            data={
                "guess_1": 0, "guess_2": 0, "guess_3": 0, 
                "guess_4": 0, "guess_5": 0, "guess_6": 0, 
                "failed": 0, "total_games": 0
            }
        )
        
    return APIResponse(
        status="success",
        data={
            "guess_1": int(results.g1 or 0),
            "guess_2": int(results.g2 or 0),
            "guess_3": int(results.g3 or 0),
            "guess_4": int(results.g4 or 0),
            "guess_5": int(results.g5 or 0),
            "guess_6": int(results.g6 or 0),
            "failed": int(results.fail or 0),
            "total_games": int(results.total_games or 0)
        }
    )
