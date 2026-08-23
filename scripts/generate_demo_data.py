import json
import math
import random
import os
from datetime import datetime, timedelta

def compute_grid_cell(lat: float, lon: float, grid_size: float = 0.25) -> str:
    grid_lat = (math.floor(lat / grid_size) * grid_size) + (grid_size / 2)
    grid_lon = (math.floor(lon / grid_size) * grid_size) + (grid_size / 2)
    return f"G_{round(grid_lat, 4)}_{round(grid_lon, 4)}"

def generate_synthetic_dataset():
    random.seed(42)  # Deterministic seed for reproducible demo data
    
    os.makedirs("data/demo", exist_ok=True)

    # 1. Datasets Registry
    datasets = [
        {
            "id": "argo",
            "name": "Argo Global Array of Profiling Floats",
            "domain": "oceanography",
            "description": "Temperature and salinity ocean vertical profiles",
            "source_url": "https://argo.ucsd.edu/",
            "license": "CC-BY-4.0",
            "version": "2025.1"
        },
        {
            "id": "obis",
            "name": "Ocean Biodiversity Information System",
            "domain": "biodiversity",
            "description": "Marine species occurrence records",
            "source_url": "https://obis.org/",
            "license": "CC-BY-4.0",
            "version": "2025.1"
        },
        {
            "id": "fishstat",
            "name": "FAO FishStat Global Production",
            "domain": "fisheries",
            "description": "Commercial fisheries landing statistics",
            "source_url": "https://www.fao.org/fishery/en/fishstat",
            "license": "Public Domain",
            "version": "2024.1"
        },
        {
            "id": "mgnify",
            "name": "EMBL-EBI MGnify Metagenomics",
            "domain": "molecular",
            "description": "Marine microbiome amplicon and OTU relative abundance profiles",
            "source_url": "https://www.ebi.ac.uk/metagenomics/",
            "license": "CC0",
            "version": "2024.2"
        }
    ]

    # 2. Species Reference Layer (WoRMS Normalized)
    species_list = [
        {
            "id": 1,
            "aphia_id": 127405,
            "scientific_name": "Thunnus albacares",
            "canonical_name": "Thunnus albacares",
            "common_name": "Yellowfin tuna",
            "kingdom": "Animalia",
            "phylum": "Chordata",
            "class_name": "Actinopteri",
            "order": "Scombriformes",
            "family": "Scombridae",
            "genus": "Thunnus",
            "species": "albacares"
        },
        {
            "id": 2,
            "aphia_id": 127404,
            "scientific_name": "Katsuwonus pelamis",
            "canonical_name": "Katsuwonus pelamis",
            "common_name": "Skipjack tuna",
            "kingdom": "Animalia",
            "phylum": "Chordata",
            "class_name": "Actinopteri",
            "order": "Scombriformes",
            "family": "Scombridae",
            "genus": "Katsuwonus",
            "species": "pelamis"
        },
        {
            "id": 3,
            "aphia_id": 126987,
            "scientific_name": "Sardinella longiceps",
            "canonical_name": "Sardinella longiceps",
            "common_name": "Indian oil sardine",
            "kingdom": "Animalia",
            "phylum": "Chordata",
            "class_name": "Actinopteri",
            "order": "Clupeiformes",
            "family": "Dorosomatidae",
            "genus": "Sardinella",
            "species": "longiceps"
        }
    ]

    # 3. Spatial Locations (Arabian Sea Bounding Box: 12.0 - 20.0 N, 62.0 - 74.0 E)
    locations = []
    loc_id = 1
    for lat_step in range(120, 200, 20): # step 2.0 degrees
        for lon_step in range(620, 740, 20):
            lat = lat_step / 10.0
            lon = lon_step / 10.0
            grid_id = compute_grid_cell(lat, lon, 0.25)
            locations.append({
                "id": loc_id,
                "latitude": lat,
                "longitude": lon,
                "grid_cell_id": grid_id,
                "region_id": "Arabian_Sea"
            })
            loc_id += 1

    # 4. Oceanographic Measurements (2021 to 2025: Showing a ~0.9°C warming trend)
    ocean_measurements = []
    meas_id = 1
    start_date = datetime(2021, 1, 1)

    for month_offset in range(60): # 5 years monthly data
        current_time = start_date + timedelta(days=month_offset * 30.5)
        time_str = current_time.isoformat() + "Z"
        
        # Linear warming component (+0.9°C over 60 months) + seasonal cycle
        warming_trend = (month_offset / 60.0) * 0.9
        seasonal_temp = 2.5 * math.sin(2 * math.pi * (current_time.month / 12.0))
        base_temp = 27.2 + warming_trend + seasonal_temp

        for loc in locations[:8]: # Sub-sample locations
            temp_val = round(base_temp + random.uniform(-0.3, 0.3), 2)
            sal_val = round(35.5 + random.uniform(-0.2, 0.2), 2)
            
            ocean_measurements.append({
                "id": meas_id,
                "dataset_id": "argo",
                "location_id": loc["id"],
                "timestamp": time_str,
                "depth_m": 10.0,
                "variable": "temperature",
                "value": temp_val,
                "unit": "degC",
                "quality_flag": "valid",
                "source_record_id": f"ARGO_T_{meas_id}"
            })
            meas_id += 1

            ocean_measurements.append({
                "id": meas_id,
                "dataset_id": "argo",
                "location_id": loc["id"],
                "timestamp": time_str,
                "depth_m": 10.0,
                "variable": "salinity",
                "value": sal_val,
                "unit": "PSU",
                "quality_flag": "valid",
                "source_record_id": f"ARGO_S_{meas_id}"
            })
            meas_id += 1

    # 5. Biodiversity Observations (Showing ~15% occurrence decline correlated with warming)
    biodiversity_observations = []
    bio_id = 1
    for month_offset in range(60):
        current_time = start_date + timedelta(days=month_offset * 30.5)
        time_str = current_time.isoformat() + "Z"
        
        # Abundance decline component (-15% over 60 months)
        decline_factor = 1.0 - ((month_offset / 60.0) * 0.15)

        for loc in locations[:8]:
            for sp in species_list:
                base_count = 50 if sp["id"] == 1 else 80
                count_val = int(base_count * decline_factor * random.uniform(0.85, 1.15))
                
                biodiversity_observations.append({
                    "id": bio_id,
                    "dataset_id": "obis",
                    "species_id": sp["id"],
                    "location_id": loc["id"],
                    "timestamp": time_str,
                    "depth_m": 15.0,
                    "observation_type": "abundance_count",
                    "abundance": float(count_val),
                    "count": count_val,
                    "source_record_id": f"OBIS_REC_{bio_id}"
                })
                bio_id += 1

    # 6. Fisheries Catch Records (Annual 2021-2025)
    fisheries_records = []
    fish_id = 1
    for year in range(2021, 2026):
        year_idx = year - 2021
        catch_decline = 1.0 - (year_idx * 0.03) # Slight catch reduction
        
        for sp in species_list:
            base_catch = 125000.0 if sp["id"] == 1 else 95000.0
            catch_val = round(base_catch * catch_decline * random.uniform(0.95, 1.05), 2)
            
            fisheries_records.append({
                "id": fish_id,
                "dataset_id": "fishstat",
                "species_id": sp["id"],
                "region_id": "Arabian_Sea",
                "year": year,
                "catch": catch_val,
                "production": 0.0,
                "unit": "tonnes",
                "source_record_id": f"FAO_FISH_{fish_id}"
            })
            fish_id += 1

    # 7. Molecular Metagenomic Samples
    molecular_samples = []
    mol_id = 1
    for month_offset in range(0, 60, 6): # bi-annual sampling
        current_time = start_date + timedelta(days=month_offset * 30.5)
        time_str = current_time.isoformat() + "Z"
        
        for loc in locations[:4]:
            molecular_samples.append({
                "id": mol_id,
                "dataset_id": "mgnify",
                "sample_identifier": f"MGYS0000{mol_id}",
                "location_id": loc["id"],
                "timestamp": time_str,
                "species_id": 1,
                "abundance": round(0.045 * (1.0 - (month_offset / 60.0) * 0.12), 4),
                "measurement_type": "metabarcoding_amplicon",
                "value": 1420.0,
                "unit": "reads_ratio",
                "source_record_id": f"MGNIFY_S_{mol_id}"
            })
            mol_id += 1

    synthetic_payload = {
        "datasets": datasets,
        "species": species_list,
        "locations": locations,
        "ocean_measurements": ocean_measurements,
        "biodiversity_observations": biodiversity_observations,
        "fisheries_records": fisheries_records,
        "molecular_samples": molecular_samples
    }

    output_path = "data/demo/synthetic_data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(synthetic_payload, f, indent=2)

    print(f"[SUCCESS] Generated synthetic dataset successfully: {output_path}")
    print(f"   - Datasets: {len(datasets)}")
    print(f"   - Species: {len(species_list)}")
    print(f"   - Locations: {len(locations)}")
    print(f"   - Ocean Measurements: {len(ocean_measurements)}")
    print(f"   - Biodiversity Observations: {len(biodiversity_observations)}")
    print(f"   - Fisheries Records: {len(fisheries_records)}")
    print(f"   - Molecular Samples: {len(molecular_samples)}")

if __name__ == "__main__":
    generate_synthetic_dataset()
