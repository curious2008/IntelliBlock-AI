from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import FreightForecastModel
from app.schemas.domain import FreightForecastRead

router = APIRouter()


@router.get("/freight-forecasts", response_model=List[FreightForecastRead])
def get_freight_forecasts(
    corridor_id: Optional[str] = Query(None, description="Filter by corridor ID"),
    db: Session = Depends(get_db)
):
    query = db.query(FreightForecastModel)
    if corridor_id:
        query = query.filter(FreightForecastModel.corridor_id == corridor_id)
    return query.all()
