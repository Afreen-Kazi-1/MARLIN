import os
import sys
import json
from datetime import datetime
from sqlalchemy import text

sys.path.append("/app")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database.session import engine, SessionLocal
from app.database.base import (
    Base,
    DatasetModel,
    SpeciesModel,
    LocationModel,
    OceanMeasurementModel,
    BiodiversityObservationModel,
    FisheriesRecordModel,
    MolecularSampleModel
)
from scripts.generate_demo_data import generate_synthetic_dataset

def seed_database():
    print("[INFO] Starting Phase 2: Supabase / PostgreSQL Schema & Seeding Setup...")
    
    # 1. Enable PostGIS extension on Supabase/Postgres
    with engine.connect() as conn:
        print("  - Enabling PostGIS extension...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.commit()

    # 2. Create tables
    print("  - Creating database tables from SQLAlchemy models...")
    Base.metadata.create_all(bind=engine)
    print("  - Tables created successfully!")

    # 3. Ensure synthetic dataset JSON exists
    json_path = "data/demo/synthetic_data.json"
    if not os.path.exists(json_path):
        print("  - Generating synthetic dataset...")
        generate_synthetic_dataset()

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        # Clear existing data to ensure clean seed state
        print("  - Clearing existing seed data...")
        db.query(MolecularSampleModel).delete()
        db.query(FisheriesRecordModel).delete()
        db.query(BiodiversityObservationModel).delete()
        db.query(OceanMeasurementModel).delete()
        db.query(LocationModel).delete()
        db.query(SpeciesModel).delete()
        db.query(DatasetModel).delete()
        db.commit()

        # Seed Datasets
        print(f"  - Seeding {len(data['datasets'])} dataset metadata records...")
        for item in data["datasets"]:
            db.add(DatasetModel(**item))
        db.commit()

        # Seed Species
        print(f"  - Seeding {len(data['species'])} species taxonomy records...")
        for item in data["species"]:
            db.add(SpeciesModel(**item))
        db.commit()

        # Seed Locations with PostGIS Point geometry
        print(f"  - Seeding {len(data['locations'])} PostGIS spatial location records...")
        for item in data["locations"]:
            geom_wkt = f"SRID=4326;POINT({item['longitude']} {item['latitude']})"
            loc_model = LocationModel(
                id=item["id"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                grid_cell_id=item["grid_cell_id"],
                region_id=item["region_id"],
                geometry=geom_wkt
            )
            db.add(loc_model)
        db.commit()

        # Seed Ocean Measurements
        print(f"  - Seeding {len(data['ocean_measurements'])} ocean measurement records...")
        for item in data["ocean_measurements"]:
            item_copy = item.copy()
            item_copy["timestamp"] = datetime.fromisoformat(item_copy["timestamp"].replace("Z", "+00:00"))
            db.add(OceanMeasurementModel(**item_copy))
        db.commit()

        # Seed Biodiversity Observations
        print(f"  - Seeding {len(data['biodiversity_observations'])} biodiversity observation records...")
        for item in data["biodiversity_observations"]:
            item_copy = item.copy()
            item_copy["timestamp"] = datetime.fromisoformat(item_copy["timestamp"].replace("Z", "+00:00"))
            db.add(BiodiversityObservationModel(**item_copy))
        db.commit()

        # Seed Fisheries Records
        print(f"  - Seeding {len(data['fisheries_records'])} fisheries landing records...")
        for item in data["fisheries_records"]:
            db.add(FisheriesRecordModel(**item))
        db.commit()

        # Seed Molecular Samples
        print(f"  - Seeding {len(data['molecular_samples'])} molecular sample records...")
        for item in data["molecular_samples"]:
            item_copy = item.copy()
            item_copy["timestamp"] = datetime.fromisoformat(item_copy["timestamp"].replace("Z", "+00:00"))
            db.add(MolecularSampleModel(**item_copy))
        db.commit()

        # 4. Phase 2 Verification Query
        print("\n[VERIFY] Executing Phase 2 Validation Query (Cross-Domain Joint Observation)...")
        verification_sql = text("""
            SELECT 
                l.region_id,
                l.grid_cell_id,
                s.canonical_name AS species_name,
                om.variable AS ocean_variable,
                ROUND(AVG(om.value), 2) AS avg_temperature,
                ROUND(AVG(bo.abundance), 2) AS avg_abundance
            FROM locations l
            JOIN ocean_measurements om ON om.location_id = l.id
            JOIN biodiversity_observations bo ON bo.location_id = l.id
            JOIN species s ON s.id = bo.species_id
            WHERE l.region_id = 'Arabian_Sea' 
              AND s.canonical_name = 'Thunnus albacares'
              AND om.variable = 'temperature'
            GROUP BY l.region_id, l.grid_cell_id, s.canonical_name, om.variable;
        """)

        results = db.execute(verification_sql).fetchall()
        print(f"[SUCCESS] Phase 2 Verification Successful! Retrieved {len(results)} aggregated spatial grid cells.")
        for row in results[:3]:
            print(f"   - Region: {row.region_id} | Grid: {row.grid_cell_id} | Species: {row.species_name} | Avg Temp: {row.avg_temperature}°C | Avg Abundance: {row.avg_abundance}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during database seeding: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
