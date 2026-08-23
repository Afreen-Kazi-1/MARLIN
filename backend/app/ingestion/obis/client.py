import httpx
import datetime
from typing import Dict, Any, Generator
from app.ingestion.base import DatasetConnector
from app.ingestion.quality import DataQualityReport
from app.database.base import BiodiversityObservationModel, LocationModel, SpeciesModel
from app.analytics.spatial import SpatialService

class OBISConnector(DatasetConnector):
    """
    OBIS (Ocean Biodiversity Information System) API connector.
    Includes data quality auditing logs (rows processed, invalid coords, unknown taxa, duplicates).
    """
    BASE_URL = "https://api.obis.org/v3"

    def download(self, config: Dict[str, Any]) -> str:
        return config.get("scientificname", "Thunnus albacares")

    def validate(self, filepath: str) -> bool:
        return len(filepath) > 0

    def transform_with_audit(self, filepath: str) -> tuple[list[Dict[str, Any]], DataQualityReport]:
        scientific_name = filepath
        url = f"{self.BASE_URL}/occurrence"
        params = {
            "scientificname": scientific_name,
            "size": 50
        }
        report = DataQualityReport(dataset_id=self.dataset_id)
        valid_records = []
        seen_ids = set()

        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.get(url, params=params)
                if resp.status_code == 200:
                    records = resp.json().get("results", [])
                    for item in records:
                        rec_id = str(item.get("id", ""))
                        if rec_id in seen_ids:
                            report.log_duplicate()
                            continue
                        if rec_id:
                            seen_ids.add(rec_id)

                        lat = item.get("decimalLatitude")
                        lon = item.get("decimalLongitude")

                        if lat is None or lon is None or not (-90.0 <= float(lat) <= 90.0) or not (-180.0 <= float(lon) <= 180.0):
                            report.log_invalid_coord(f"Lat: {lat}, Lon: {lon}")
                            continue

                        event_date = item.get("eventDate")
                        if not event_date:
                            report.log_invalid_time("Missing timestamp")
                            continue

                        report.log_valid()
                        valid_records.append({
                            "dataset_id": self.dataset_id,
                            "scientific_name": item.get("scientificName", scientific_name),
                            "latitude": float(lat),
                            "longitude": float(lon),
                            "timestamp": event_date,
                            "depth_m": float(item.get("depth", 0.0)) if item.get("depth") else 0.0,
                            "count": item.get("individualCount", 1),
                            "source_record_id": rec_id
                        })
        except Exception as e:
            report.errors.append(f"Network/API Error: {str(e)}")

        return valid_records, report

    def transform(self, filepath: str) -> Generator[Dict[str, Any], None, None]:
        records, _ = self.transform_with_audit(filepath)
        for r in records:
            yield r

    def load(self, records: Generator[Dict[str, Any], None, None]) -> Dict[str, Any]:
        count = 0
        spatial_service = SpatialService(grid_size=0.25)
        
        for rec in records:
            # 1. Spatial Normalization & DB Lookup
            grid_id = spatial_service.compute_grid_cell(rec["latitude"], rec["longitude"])
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
                self.db.commit() # Commit to get loc.id
                
            # 2. Taxonomic DB Lookup
            species = self.db.query(SpeciesModel).filter_by(scientific_name=rec["scientific_name"]).first()
            if not species:
                continue # Skip if species wasn't pre-resolved by WoRMS
                
            # 3. Insert Database Record
            obs = BiodiversityObservationModel(
                dataset_id=self.dataset_id,
                species_id=species.id,
                location_id=loc.id,
                timestamp=datetime.datetime.fromisoformat(rec["timestamp"].replace("Z", "+00:00")),
                depth_m=rec["depth_m"],
                observation_type="abundance_count",
                abundance=float(rec["count"]),
                count=rec["count"],
                source_record_id=rec["source_record_id"]
            )
            self.db.add(obs)
            count += 1
            
            # Batch commit
            if count % 100 == 0:
                self.db.commit()
                
        self.db.commit()
        return {"records_processed": count, "status": "completed"}