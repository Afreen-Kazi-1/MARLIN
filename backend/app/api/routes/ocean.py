from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.services.domain_services import OceanService
from app.schemas.domain import OceanMeasurementResponse
from app.analytics.engine import ScientificAnalyticsEngine

router = APIRouter(prefix="/ocean", tags=["Oceanography"])

def get_ocean_service() -> OceanService:
    return OceanService()

@router.get("/measurements", response_model=List[OceanMeasurementResponse])
def get_ocean_measurements(
    variable: str = Query("temperature", description="Variable to query: temperature, salinity, oxygen"),
    region_id: str = Query("Arabian_Sea", description="Target region identifier"),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    ocean_service: OceanService = Depends(get_ocean_service)
):
    measurements = ocean_service.get_measurements(db, variable, region_id, limit)
    return measurements

@router.get("/trend")
def get_ocean_trend(
    variable: str = Query("temperature"),
    region_id: str = Query("Arabian_Sea"),
    db: Session = Depends(get_db),
    ocean_service: OceanService = Depends(get_ocean_service)
):
    measurements = ocean_service.get_all_for_variable(db, variable)

    timestamps = [m.timestamp for m in measurements]
    values = [float(m.value) for m in measurements]

    stats = ScientificAnalyticsEngine.calculate_trend(timestamps, values)
    return {
        "variable": variable,
        "region_id": region_id,
        "record_count": len(values),
        "metrics": stats
    }

@router.get("/anomalies")
def get_ocean_anomalies(
    variable: str = Query("temperature"),
    db: Session = Depends(get_db),
    ocean_service: OceanService = Depends(get_ocean_service)
):
    measurements = ocean_service.get_all_for_variable(db, variable)

    timestamps = [m.timestamp for m in measurements]
    values = [float(m.value) for m in measurements]

    anomalies = ScientificAnalyticsEngine.detect_anomalies(values, timestamps, window=12)
    return {
        "variable": variable,
        "anomaly_count": len(anomalies),
        "anomalies": anomalies
    }
