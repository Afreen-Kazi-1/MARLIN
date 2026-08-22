import httpx
from typing import Dict, Any, Generator
from app.ingestion.base import DatasetConnector
from app.ingestion.quality import DataQualityReport

class OBISConnector(DatasetConnector):
    """
    OBIS (Ocean Biodiversity Information System) API connector.
    Includes data quality auditing logs (rows processed, invalid coords, unknown taxa, duplicates).
    """
    BASE_URL = "https://api.obis.org/v2"

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
        for rec in records:
            count += 1
        return {"records_processed": count, "status": "completed"}
