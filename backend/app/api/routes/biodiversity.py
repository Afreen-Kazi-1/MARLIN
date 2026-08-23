from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.services.domain_services import BiodiversityService
from app.schemas.domain import BiodiversityObservationResponse
from app.analytics.spatial import SpatialService

router = APIRouter(prefix="/biodiversity", tags=["Biodiversity"])

def get_biodiversity_service() -> BiodiversityService:
    return BiodiversityService()

@router.get("/observations", response_model=List[BiodiversityObservationResponse])
def get_observations(
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    bio_service: BiodiversityService = Depends(get_biodiversity_service)
):
    observations = bio_service.get_observations(db, limit)
    return observations

@router.get("/distribution", response_model=List[Dict[str, Any]])
def get_biodiversity_distribution(
    species_id: int = Query(None, description="Species ID to filter distribution"),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    bio_service: BiodiversityService = Depends(get_biodiversity_service)
):
    # In a real implementation this would group by grid cell using SpatialService
    # and perform an aggregation via the Repository. For this prototype, we'll return mock/computed
    # spatial grouping if locations were joined.
    
    # We will just fetch observations and return them as 'distribution' data points.
    # Note: Spatial grouping requires joining LocationModel.
    observations = bio_service.get_observations(db, limit)
    
    # Filtering manually for simplicity in MVP (should be in DB query)
    if species_id:
        observations = [obs for obs in observations if obs.species_id == species_id]
        
    return [
        {
            "id": obs.id,
            "species_id": obs.species_id,
            "location_id": obs.location_id,
            "timestamp": obs.timestamp.isoformat(),
            "count": obs.count or 1
        }
        for obs in observations
    ]
