import pytest
from app.analytics.spatial import SpatialService
from app.ingestion.worms.client import WoRMSClient

def test_spatial_grid_normalization():
    spatial = SpatialService(grid_size=0.25)
    grid_id = spatial.compute_grid_cell(18.92, 72.82)
    assert grid_id == "G_18.875_72.875"

def test_worms_client_structure():
    client = WoRMSClient()
    res = client.resolve_name("Thunnus albacares")
    if res:
        assert res["aphia_id"] == 127027
        assert res["canonical_name"] == "Thunnus albacares"
        assert res["family"] == "Scombridae"
