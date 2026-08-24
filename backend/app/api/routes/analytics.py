from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.session import get_db
from app.services.domain_services import OceanService, FisheriesService
from app.analytics.engine import ScientificAnalyticsEngine

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_ocean_service() -> OceanService:
    return OceanService()

def get_fisheries_service() -> FisheriesService:
    return FisheriesService()

@router.get("/correlation/ocean-fisheries", response_model=Dict[str, Any])
def correlate_ocean_and_fisheries(
    species_id: int = Query(..., description="Species ID for fisheries catch"),
    ocean_variable: str = Query("temperature", description="Ocean variable to correlate with (e.g. temperature)"),
    db: Session = Depends(get_db),
    ocean_service: OceanService = Depends(get_ocean_service),
    fisheries_service: FisheriesService = Depends(get_fisheries_service)
):
    """
    Computes Pearson and Spearman correlation between an ocean variable and fisheries catch over time.
    """
    fish_records = fisheries_service.get_records_by_species(db, species_id)
    ocean_records = ocean_service.get_all_for_variable(db, ocean_variable)
    
    if not fish_records or not ocean_records:
        raise HTTPException(status_code=400, detail="Insufficient data for correlation")
        
    # Simple naive temporal alignment (yearly aggregation)
    # 1. Aggregate ocean measurements by year
    yearly_ocean = {}
    for o in ocean_records:
        year = o.timestamp.year
        if year not in yearly_ocean:
            yearly_ocean[year] = []
        yearly_ocean[year].append(float(o.value))
        
    for year in yearly_ocean:
        yearly_ocean[year] = sum(yearly_ocean[year]) / len(yearly_ocean[year])
        
    # 2. Align with fisheries records
    aligned_x = []
    aligned_y = []
    for f in fish_records:
        if f.year in yearly_ocean and f.catch is not None:
            aligned_x.append(yearly_ocean[f.year]) # X = Ocean Var (temperature)
            aligned_y.append(float(f.catch))       # Y = Fisheries Catch
            
    if len(aligned_x) < 3:
        return {
            "error": "Not enough overlapping data points for correlation. Requires at least 3 overlapping years.",
            "sample_count": len(aligned_x)
        }
        
    correlation_metrics = ScientificAnalyticsEngine.calculate_correlation(aligned_x, aligned_y)
    
    return {
        "ocean_variable": ocean_variable,
        "species_id": species_id,
        "metrics": correlation_metrics
    }
