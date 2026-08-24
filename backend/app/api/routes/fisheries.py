from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.services.domain_services import FisheriesService
from app.schemas.domain import FisheriesRecordResponse
from app.analytics.engine import ScientificAnalyticsEngine

router = APIRouter(prefix="/fisheries", tags=["Fisheries"])

def get_fisheries_service() -> FisheriesService:
    return FisheriesService()

@router.get("/records", response_model=List[FisheriesRecordResponse])
def get_records(
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    fisheries_service: FisheriesService = Depends(get_fisheries_service)
):
    records = fisheries_service.get_records(db, limit)
    return records

@router.get("/trend", response_model=Dict[str, Any])
def get_fisheries_trend(
    species_id: int = Query(..., description="Species ID to calculate trend for"),
    db: Session = Depends(get_db),
    fisheries_service: FisheriesService = Depends(get_fisheries_service)
):
    records = fisheries_service.get_records_by_species(db, species_id)
    if not records:
        return {"metrics": ScientificAnalyticsEngine.calculate_trend([], [])}
        
    timestamps = [f"{r.year}-01-01T00:00:00Z" for r in records if r.catch is not None]
    values = [float(r.catch) for r in records if r.catch is not None]
    
    stats = ScientificAnalyticsEngine.calculate_trend(timestamps, values)
    return {
        "species_id": species_id,
        "record_count": len(values),
        "metrics": stats
    }
