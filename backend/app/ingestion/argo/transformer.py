import os
import httpx
from typing import Generator, Dict, Any
from datetime import datetime
from app.ingestion.base import DatasetConnector
from app.analytics.spatial import SpatialService
from app.database.base import OceanMeasurementModel, LocationModel

class ArgoConnector(DatasetConnector):
    def __init__(self, dataset_id: str, db_session):
        super().__init__(dataset_id, db_session)
        self.spatial_service = SpatialService(grid_size=0.25)

    def download(self, config: Dict[str, Any]) -> str:
        return "live_erddap"

    def validate(self, filepath: str) -> bool:
        return True

    def transform(self, filepath: str) -> Generator[Dict[str, Any], None, None]:
        # Bounding box for Arabian Sea: 12-20N, 62-74E
        url = (
            "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.json"
            "?latitude,longitude,time,pres,temp"
            "&time>=2024-01-01T00:00:00Z&time<=2024-01-10T23:59:59Z"
            "&latitude>=12.0&latitude<=20.0&longitude>=62.0&longitude<=74.0"
            "&pres<=20"
        )   

        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                rows = data["table"]["rows"]
                for row in rows:
                    lat, lon, iso_time, pres, temp = row[0], row[1], row[2], row[3], row[4]
                    if temp is not None and lat is not None and lon is not None:
                        yield {
                            "latitude": float(lat),
                            "longitude": float(lon),
                            "timestamp": iso_time,
                            "depth_m": float(pres) if pres is not None else 0.0,
                            "variable": "temperature",
                            "value": float(temp),
                            "unit": "degC",
                            "quality_flag": "valid",
                            "source_record_id": f"ARGO_{iso_time}_{lat}_{lon}"
                        }     

    def load(self, records: Generator[Dict[str, Any], None, None]) -> Dict[str, Any]:
        count = 0
        for rec in records:
            grid_id = self.spatial_service.compute_grid_cell(rec["latitude"], rec["longitude"])
            loc = self.db.query(LocationModel).filter_by(grid_cell_id=grid_id).first()
            if not loc:
                loc = LocationModel(
                    latitude=rec["latitude"], 
                    longitude=rec["longitude"], 
                    grid_cell_id=grid_id, 
                    region_id="Arabian_Sea",
                    geometry=f"SRID=4326;POINT({rec['longitude']} {rec['latitude']})"
                )
                self.db.add(loc)
                self.db.commit()
            
            # Map into OceanMeasurement database table
            meas = OceanMeasurementModel(
                dataset_id=self.dataset_id,
                location_id=loc.id,
                timestamp=datetime.fromisoformat(rec["timestamp"].replace("Z", "+00:00")),
                depth_m=rec["depth_m"],
                variable=rec["variable"],
                value=rec["value"],
                unit=rec["unit"],
                quality_flag=rec["quality_flag"],
                source_record_id=rec["source_record_id"]
            )
            self.db.add(meas)
            count += 1
            if count % 100 == 0:
                self.db.commit()
                
        self.db.commit()
        return {"dataset": "argo", "records_ingested": count, "status": "completed"}