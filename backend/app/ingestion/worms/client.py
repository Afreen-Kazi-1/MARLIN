import httpx
from typing import Optional, Dict, Any

class WoRMSClient:
    """
    Client for interacting with the World Register of Marine Species (WoRMS) REST API.
    Resolves scientific & common names to canonical AphiaIDs and taxonomy trees.
    """
    BASE_URL = "https://www.marinespecies.org/rest"

    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    def resolve_name(self, name: str) -> Optional[Dict[str, Any]]:
        clean_name = name.strip()
        try:
            with httpx.Client(base_url=self.BASE_URL, timeout=self.timeout) as client:
                # 1. Fetch AphiaID by Name
                id_resp = client.get(f"/AphiaIDByName/{clean_name}", params={"marine_only": True})
                if id_resp.status_code != 200:
                    return None
                
                aphia_id = id_resp.json()
                if not aphia_id or aphia_id == -999: # WoRMS unmapped ID
                    return None

                # 2. Fetch Detailed Taxonomic Record by AphiaID
                record_resp = client.get(f"/AphiaRecordByAphiaID/{aphia_id}")
                if record_resp.status_code != 200:
                    return None

                record = record_resp.json()
                valid_name = record.get("valid_name", clean_name)
                
                return {
                    "aphia_id": aphia_id,
                    "scientific_name": record.get("scientificname", clean_name),
                    "canonical_name": valid_name,
                    "common_name": record.get("vernacular") or clean_name,
                    "kingdom": record.get("kingdom"),
                    "phylum": record.get("phylum"),
                    "class": record.get("class"),
                    "order": record.get("order"),
                    "family": record.get("family"),
                    "genus": record.get("genus"),
                    "species": valid_name.split(" ")[-1] if " " in valid_name else valid_name,
                    "taxonomy_json": record
                }
        except Exception as e:
            print(f"[WARN] WoRMS lookup failed for '{name}': {str(e)}")
            return None
