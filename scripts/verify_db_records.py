import sys
from pathlib import Path

# Add project root and backend to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "backend"))

from app.database.session import SessionLocal
from app.database.base import OceanMeasurementModel, BiodiversityObservationModel, FisheriesRecordModel, MolecularSampleModel

def verify():
    db = SessionLocal()
    print("\n=== LIVE DATABASE PERSISTENCE VERIFICATION ===")
    print(f"Ocean Measurements (Argo):        {db.query(OceanMeasurementModel).count()} records")
    print(f"Biodiversity Observations (OBIS): {db.query(BiodiversityObservationModel).count()} records")
    print(f"Fisheries Records (FAO):          {db.query(FisheriesRecordModel).count()} records")
    print(f"Molecular Samples (MGnify):       {db.query(MolecularSampleModel).count()} records")
    print("==============================================\n")
    db.close()

if __name__ == "__main__":
    verify()