from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from backend.db.database import get_db
from backend.db.schema import Distribution
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
    dists = db.query(Distribution).order_by(Distribution.date.desc()).limit(limit).all()
    
    return APIResponse(
        status="success",
        data={"distributions": [DistributionSchema.from_orm(d).dict() for d in dists]},
        meta={"count": str(len(dists))}
    )
