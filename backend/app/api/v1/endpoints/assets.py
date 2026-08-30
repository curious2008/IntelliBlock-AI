from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import AssetModel
from app.schemas.domain import AssetRead

router = APIRouter()


@router.get("/assets", response_model=List[AssetRead])
def get_assets(
    department: Optional[str] = Query(None, description="Filter by department code"),
    db: Session = Depends(get_db)
):
    query = db.query(AssetModel)
    if department:
        query = query.filter(AssetModel.department == department)
    return query.all()
