from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import CorridorModel
from app.schemas.domain import CorridorRead

router = APIRouter()


@router.get("/corridors", response_model=List[CorridorRead])
def get_corridors(db: Session = Depends(get_db)):
    return db.query(CorridorModel).all()
