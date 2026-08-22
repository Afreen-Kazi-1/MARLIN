import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database.session import SessionLocal
from app.ingestion.worms.client import WoRMSClient
from app.ingestion.obis.client import OBISConnector
from app.ingestion.argo.transformer import ArgoConnector
from app.ingestion.fishstat.transformer import FishStatConnector
from app.ingestion.mgnify.transformer import MGnifyConnector
from app.ingestion.quality import DataQualityReport

def run_ingest_all():
    print("[INFO] Starting Full 4-Domain Ingestion Pipelines Execution with Data Quality Auditing...")
    db = SessionLocal()
    
    try:
        species_target = "Thunnus albacares"

        # 1. WoRMS Taxonomy Normalization Audit
        print("\n--- 1. WoRMS Taxonomy Connector Audit ---")
        worms_client = WoRMSClient()
        worms_report = DataQualityReport("worms")
        resolved = worms_client.resolve_name(species_target)
        if resolved:
            worms_report.log_valid()
            print(f"  [SUCCESS] Resolved '{species_target}' -> AphiaID: {resolved['aphia_id']} | Canonical: {resolved['canonical_name']} | Family: {resolved['family']}")
        else:
            worms_report.log_unknown_taxa(species_target)
        worms_report.print_audit_report()

        # 2. Argo Oceanography Connector Audit
        print("\n--- 2. Argo Oceanography Connector Audit ---")
        argo = ArgoConnector("argo", db)
        argo_report = DataQualityReport("argo")
        argo_file = argo.download({})
        argo_records = list(argo.transform(argo_file))
        for r in argo_records:
            if -90 <= r["latitude"] <= 90 and -180 <= r["longitude"] <= 180:
                argo_report.log_valid()
            else:
                argo_report.log_invalid_coord()
        argo_report.print_audit_report()

        # 3. OBIS Biodiversity Connector Audit
        print("\n--- 3. OBIS Biodiversity Connector Audit ---")
        obis = OBISConnector("obis", db)
        obis_records, obis_report = obis.transform_with_audit(species_target)
        obis_report.print_audit_report()

        # 4. FAO FishStat Fisheries Connector Audit
        print("\n--- 4. FAO FishStat Fisheries Connector Audit ---")
        fishstat = FishStatConnector("fishstat", db)
        fish_report = DataQualityReport("fishstat")
        fish_file = fishstat.download({})
        fish_records = list(fishstat.transform(fish_file))
        for r in fish_records:
            if r.get("catch", 0) >= 0:
                fish_report.log_valid()
            else:
                fish_report.errors.append("Negative catch value")
        fish_report.print_audit_report()

        # 5. MGnify Molecular Biodiversity Connector Audit
        print("\n--- 5. MGnify Molecular Biodiversity Connector Audit ---")
        mgnify = MGnifyConnector("mgnify", db)
        mg_report = DataQualityReport("mgnify")
        mg_file = mgnify.download({})
        mg_records = list(mgnify.transform(mg_file))
        for r in mg_records:
            if 0.0 <= r.get("abundance", 0) <= 1.0:
                mg_report.log_valid()
            else:
                mg_report.log_invalid_coord("Abundance ratio out of range")
        mg_report.print_audit_report()

        print("\n[SUCCESS] Master Data Quality Audit Pipeline executed successfully for all domains!")

    except Exception as e:
        print(f"[ERROR] Master ingestion execution error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    run_ingest_all()
