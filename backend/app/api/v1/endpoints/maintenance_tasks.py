from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import MaintenanceTaskModel
from app.schemas.domain import MaintenanceTaskRead

router = APIRouter()


@router.get("/maintenance-tasks", response_model=List[MaintenanceTaskRead])
def get_maintenance_tasks(
    department: Optional[str] = Query(None, description="Filter by department code"),
    status: Optional[str] = Query(None, description="Filter by task status"),
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceTaskModel)
    if department:
        query = query.filter(MaintenanceTaskModel.department == department)
    if status:
        query = query.filter(MaintenanceTaskModel.status == status)
    return query.all()
