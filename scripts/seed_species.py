import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "backend"))

from app.database.session import SessionLocal
from app.database.models.core import SpeciesModel
from app.ingestion.worms.client import WoRMSClient

def seed_species():
    db = SessionLocal()
    client = WoRMSClient()
    species_names = ["Thunnus albacares", "Katsuwonus pelamis", "Sardinella longiceps"]
    common_names = {
        "Thunnus albacares": "Yellowfin tuna",
        "Katsuwonus pelamis": "Skipjack tuna",
        "Sardinella longiceps": "Indian oil sardine"
    }
    
    print("[INFO] Seeding WoRMS normalized species...")
    for name in species_names:
        existing = db.query(SpeciesModel).filter_by(scientific_name=name).first()
        if existing:
            print(f"  - Species '{name}' already exists.")
            continue
            
        print(f"  - Resolving and seeding species: {name}")
        res = client.resolve_name(name)
        if res:
            species_item = SpeciesModel(
                aphia_id=res["aphia_id"],
                scientific_name=res["scientific_name"],
                canonical_name=res["canonical_name"],
                common_name=common_names.get(name, res["common_name"]),
                kingdom=res["kingdom"],
                phylum=res["phylum"],
                class_name=res["class"],
                order=res["order"],
                family=res["family"],
                genus=res["genus"],
                species=res["species"],
                taxonomy_json=res["taxonomy_json"]
            )
            db.add(species_item)
            db.commit()
            print(f"    [SUCCESS] Seeded species '{name}' with AphiaID {res['aphia_id']}")
        else:
            print(f"    [ERROR] Could not resolve species '{name}' on WoRMS")
    db.close()

if __name__ == "__main__":
    seed_species()
