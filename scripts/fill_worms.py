import requests
import os
import time
from supabase import create_client
import dotenv

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_aphia_id(scientific_name):
    url = (
        "https://www.marinespecies.org/rest/"
        f"AphiaRecordsByName/{requests.utils.quote(scientific_name)}"
        "?like=false&marine_only=true"
    )

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        data = response.json()

        if not data:
            return None

        # Prefer the accepted record
        for record in data:
            if record.get("status") == "accepted":
                return record.get("AphiaID")

        return data[0].get("AphiaID")

    except requests.RequestException as e:
        print(f"WoRMS lookup failed for {scientific_name}: {e}")
        return None


# Get all species where AphiaID hasn't been populated
result = (
    supabase
    .table("species")
    .select("id, scientific_name")
    .is_("aphia_id", "null")
    .execute()
)

species = result.data

print(f"Found {len(species)} species without AphiaID")

for row in species:
    species_id = row["id"]
    scientific_name = row["scientific_name"]

    aphia_id = get_aphia_id(scientific_name)

    if aphia_id:
    # Check whether this AphiaID is already assigned
        existing = (
            supabase
            .table("species")
            .select("id, scientific_name")
            .eq("aphia_id", aphia_id)
            .execute()
        )

        if existing.data:
            existing_species = existing.data[0]["scientific_name"]

            print(
                f"⚠ Skipping {scientific_name} -> {aphia_id} "
                f"(already used by {existing_species})"
            )
        else:
            supabase.table("species").update({
                "aphia_id": aphia_id
            }).eq("id", species_id).execute()

            print(f"✓ {scientific_name} -> {aphia_id}")
    else:
        print(f"✗ No AphiaID found: {scientific_name}")

    # Be polite to the API
    time.sleep(0.2)