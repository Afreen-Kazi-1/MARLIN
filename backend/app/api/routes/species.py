from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.services.domain_services import SpeciesService, FisheriesService
from app.schemas.domain import SpeciesResponse
from app.analytics.engine import ScientificAnalyticsEngine
import datetime

router = APIRouter(prefix="/species", tags=["Species"])

def get_species_service() -> SpeciesService:
    return SpeciesService()

def get_fisheries_service() -> FisheriesService:
    return FisheriesService()

@router.get("/{species_id}", response_model=SpeciesResponse)
def get_species_info(
    species_id: int,
    db: Session = Depends(get_db),
    species_service: SpeciesService = Depends(get_species_service)
):
    species = species_service.get_species(db, species_id)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    return species

@router.get("/{species_id}/trend", response_model=Dict[str, Any])
def get_species_trend(
    species_id: int,
    db: Session = Depends(get_db),
    species_service: SpeciesService = Depends(get_species_service),
    fisheries_service: FisheriesService = Depends(get_fisheries_service)
):
    species = species_service.get_species(db, species_id)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
        
    records = fisheries_service.get_records_by_species(db, species_id)
    if not records:
        return {"metrics": ScientificAnalyticsEngine.calculate_trend([], [])}
        
    # Create mock timestamps from years to use the engine
    timestamps = [f"{r.year}-01-01T00:00:00Z" for r in records if r.catch is not None]
    values = [float(r.catch) for r in records if r.catch is not None]
    
    stats = ScientificAnalyticsEngine.calculate_trend(timestamps, values)
    return {
        "species_id": species_id,
        "record_count": len(values),
        "metrics": stats
    }
