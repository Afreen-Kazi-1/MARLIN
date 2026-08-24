from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.services.domain_services import MolecularService
from app.schemas.domain import MolecularSampleResponse

router = APIRouter(prefix="/molecular", tags=["Molecular (eDNA)"])

def get_molecular_service() -> MolecularService:
    return MolecularService()

@router.get("/samples", response_model=List[MolecularSampleResponse])
def get_samples(
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    molecular_service: MolecularService = Depends(get_molecular_service)
):
    samples = molecular_service.get_samples(db, limit)
    return samples
