from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import DepartmentModel
from app.schemas.domain import DepartmentRead

router = APIRouter()


@router.get("/departments", response_model=List[DepartmentRead])
def get_departments(db: Session = Depends(get_db)):
    return db.query(DepartmentModel).all()
