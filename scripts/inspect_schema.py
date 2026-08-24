from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

tables = [
    "datasets",
    "species",
    "locations",
    "ocean_measurements",
    "biodiversity_observations",
    "fisheries_records",
    "molecular_samples",
]

for table in tables:
    try:
        response = (
            supabase
            .table(table)
            .select("*")
            .limit(1)
            .execute()
        )

        print(f"\n===== {table} =====")

        if response.data:
            print(
                list(response.data[0].keys())
            )
        else:
            print("(empty table)")

    except Exception as e:
        print(f"{table}: ERROR: {e}")