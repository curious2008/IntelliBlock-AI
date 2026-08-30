from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import BlockOpportunityModel
from app.schemas.domain import BlockOpportunityRead

router = APIRouter()


@router.get("/block-opportunities", response_model=List[BlockOpportunityRead])
def get_block_opportunities(
    corridor_id: Optional[str] = Query(None, description="Filter by corridor ID"),
    db: Session = Depends(get_db)
):
    query = db.query(BlockOpportunityModel)
    if corridor_id:
        query = query.filter(BlockOpportunityModel.corridor_id == corridor_id)
    return query.all()
