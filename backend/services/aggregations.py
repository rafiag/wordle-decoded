"""
Centralized database aggregation services.

This module provides reusable database query functions to avoid duplication
across API endpoints.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db.schema import Distribution


def get_distribution_totals(db: Session):
    """
    Reusable distribution aggregation query.

    Returns aggregate sums across all distribution records for:
    - Each guess count (1-6)
    - Failed attempts
    - Total games

    Args:
        db: SQLAlchemy database session

    Returns:
        SQLAlchemy result object with attributes: g1, g2, g3, g4, g5, g6, fail, total_games
    """
    return db.query(
        func.sum(Distribution.guess_1).label('g1'),
        func.sum(Distribution.guess_2).label('g2'),
        func.sum(Distribution.guess_3).label('g3'),
        func.sum(Distribution.guess_4).label('g4'),
        func.sum(Distribution.guess_5).label('g5'),
        func.sum(Distribution.guess_6).label('g6'),
        func.sum(Distribution.failed).label('fail'),
        func.count(Distribution.id).label('total_games')
    ).first()
