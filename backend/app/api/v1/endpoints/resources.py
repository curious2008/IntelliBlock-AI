from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import ResourceModel
from app.schemas.domain import ResourceRead

router = APIRouter()


@router.get("/resources", response_model=List[ResourceRead])
def get_resources(
    department: Optional[str] = Query(None, description="Filter by department code"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    db: Session = Depends(get_db)
):
    query = db.query(ResourceModel)
    if department:
        query = query.filter(ResourceModel.department == department)
    if resource_type:
        query = query.filter(ResourceModel.resource_type == resource_type)
    return query.all()
