import sys
from pathlib import Path
from sqlalchemy import text

# Add project root and backend to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "backend"))

from app.database.session import SessionLocal
from app.database.base import DatasetModel
from app.ingestion.argo.transformer import ArgoConnector
from app.ingestion.obis.client import OBISConnector
from app.ingestion.fishstat.transformer import FishStatConnector
from app.ingestion.mgnify.transformer import MGnifyConnector

def sync_db_sequences():
    """Resets integer primary key sequences individually without failing the transaction."""
    tables = [
        "locations", 
        "species", 
        "ocean_measurements", 
        "biodiversity_observations", 
        "fisheries_records", 
        "molecular_samples"
    ]
    for table in tables:
        db = SessionLocal()
        try:
            query = text(f"SELECT setval('{table}_id_seq', COALESCE((SELECT MAX(id) FROM {table}), 1));")
            db.execute(query)
            db.commit()
            print(f"  [SYNC] Reset sequence for '{table}' successfully.")
        except Exception as e:
            db.rollback()
            print(f"  [WARN] Failed sequence sync for '{table}': {e}")
        finally:
            db.close()

def ensure_datasets_exist():
    """Ensures required dataset records exist in the datasets table to satisfy foreign keys."""
    required_datasets = [
        {"id": "DS_ARGO_001", "name": "Argo Oceanographic Floats", "domain": "oceanography", "source_url": "https://erddap.ifremer.fr"},
        {"id": "DS_OBIS_002", "name": "OBIS Marine Biodiversity", "domain": "biodiversity", "source_url": "https://api.obis.org"},
        {"id": "DS_FISH_003", "name": "FAO FishStat Fisheries", "domain": "fisheries", "source_url": "https://www.fao.org/fishery/geoserver"},
        {"id": "DS_MGNF_004", "name": "MGnify Marine Metagenomics", "domain": "molecular", "source_url": "https://www.ebi.ac.uk/metagenomics"}
    ]
    db = SessionLocal()
    try:
        for ds in required_datasets:
            existing = db.query(DatasetModel).filter(DatasetModel.id == ds["id"]).first()
            if not existing:
                db.add(DatasetModel(
                    id=ds["id"],
                    name=ds["name"],
                    domain=ds["domain"],
                    source_url=ds["source_url"]
                ))
                print(f"  [BOOTSTRAP] Registered missing dataset: {ds['id']}")
        db.commit()
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Failed to ensure dataset records: {e}") from e
    finally:
        db.close()

def run_full_pipeline():
    print("\n[INFO] Synchronizing PostgreSQL Primary Key Sequences...")
    sync_db_sequences()
    
    print("\n[INFO] Bootstrapping Required Dataset Foreign Keys...")
    ensure_datasets_exist()
    
    db = SessionLocal()
    print("\n[INFO] Executing Full Live Ingestion Pipeline...\n")
    
    try:
        # 1. Argo Oceanography Pipeline
        print("--- 1. Processing Argo Oceanography ---")
        argo = ArgoConnector(dataset_id="DS_ARGO_001", db_session=db)
        raw_argo = list(argo.transform(""))
        print(f"  -> Extracted {len(raw_argo)} live records from IFREMER ERDDAP API")
        argo_res = argo.load(raw_argo)
        print(f"  -> Persisted to DB: {argo_res.get('records_ingested', 0)} records")
        
        # 2. OBIS Biodiversity Pipeline
        print("\n--- 2. Processing OBIS Biodiversity ---")
        obis = OBISConnector(dataset_id="DS_OBIS_002", db_session=db)
        raw_obis = []
        for sp_name in ["Thunnus albacares", "Katsuwonus pelamis", "Sardinella longiceps"]:
            print(f"  -> Fetching occurrences for '{sp_name}'...")
            raw_obis.extend(list(obis.transform(sp_name)))
        print(f"  -> Extracted {len(raw_obis)} total live records from OBIS v3 API")
        obis_res = obis.load(raw_obis)
        print(f"  -> Persisted to DB: {obis_res.get('records_processed', 0)} records")
        
        # 3. FAO FishStat Fisheries Pipeline
        print("\n--- 3. Processing FAO FishStat ---")
        fish = FishStatConnector(dataset_id="DS_FISH_003", db_session=db)
        raw_fish = list(fish.transform(""))
        print(f"  -> Extracted {len(raw_fish)} live landing records from FAO GeoServer")
        fish_res = fish.load(raw_fish)
        print(f"  -> Persisted to DB: {fish_res.get('records_ingested', 0)} records")
        
        # 4. MGnify Molecular Pipeline
        print("\n--- 4. Processing MGnify Molecular ---")
        mgnify = MGnifyConnector(dataset_id="DS_MGNF_004", db_session=db)
        raw_mgnify = list(mgnify.transform(""))
        print(f"  -> Extracted {len(raw_mgnify)} live marine sample records from EBI MGnify API")
        mgnify_res = mgnify.load(raw_mgnify)
        print(f"  -> Persisted to DB: {mgnify_res.get('records_ingested', 0)} records")
        
        print("\n[SUCCESS] All live domain data successfully ingested and written to PostGIS DB!\n")
    finally:
        db.close()

if __name__ == "__main__":
    run_full_pipeline()