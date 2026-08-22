from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models.measurements import OceanMeasurementModel
from app.analytics.engine import ScientificAnalyticsEngine

router = APIRouter(prefix="/ocean", tags=["Oceanography"])

@app_router_get_measurements := router.get("/measurements")
def get_ocean_measurements(
    variable: str = Query("temperature", description="Variable to query: temperature, salinity, oxygen"),
    region_id: str = Query("Arabian_Sea", description="Target region identifier"),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    query = db.query(OceanMeasurementModel).filter(
        OceanMeasurementModel.variable == variable
    ).limit(limit).all()
    
    return [
        {
            "id": item.id,
            "timestamp": item.timestamp.isoformat(),
            "depth_m": float(item.depth_m),
            "variable": item.variable,
            "value": float(item.value),
            "unit": item.unit,
            "quality_flag": item.quality_flag
        }
        for item in query
    ]

@router.get("/trend")
def get_ocean_trend(
    variable: str = Query("temperature"),
    region_id: str = Query("Arabian_Sea"),
    db: Session = Depends(get_db)
):
    measurements = db.query(OceanMeasurementModel).filter(
        OceanMeasurementModel.variable == variable
    ).order_by(OceanMeasurementModel.timestamp.asc()).all()

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
    db: Session = Depends(get_db)
):
    measurements = db.query(OceanMeasurementModel).filter(
        OceanMeasurementModel.variable == variable
    ).order_by(OceanMeasurementModel.timestamp.asc()).all()

    timestamps = [m.timestamp for m in measurements]
    values = [float(m.value) for m in measurements]

    anomalies = ScientificAnalyticsEngine.detect_anomalies(values, timestamps, window=12)
    return {
        "variable": variable,
        "anomaly_count": len(anomalies),
        "anomalies": anomalies
    }
