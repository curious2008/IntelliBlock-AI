from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import TrainMovementModel
from app.schemas.domain import TrainMovementRead

router = APIRouter()


@router.get("/trains", response_model=List[TrainMovementRead])
def get_trains(
    corridor_id: Optional[str] = Query(None, description="Filter by corridor ID"),
    train_type: Optional[str] = Query(None, description="Filter by train type"),
    db: Session = Depends(get_db)
):
    query = db.query(TrainMovementModel)
    if corridor_id:
        query = query.filter(TrainMovementModel.corridor_id == corridor_id)
    if train_type:
        query = query.filter(TrainMovementModel.train_type == train_type)
    return query.all()
