from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_ocean_measurements():
    response = client.get("/api/ocean/measurements?variable=temperature&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_ocean_trend():
    response = client.get("/api/ocean/trend?variable=temperature")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "slope" in data["metrics"]

def test_get_ocean_anomalies():
    response = client.get("/api/ocean/anomalies?variable=temperature")
    assert response.status_code == 200
    data = response.json()
    assert "anomalies" in data

def test_get_biodiversity_observations():
    response = client.get("/api/biodiversity/observations?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_biodiversity_distribution():
    response = client.get("/api/biodiversity/distribution?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_fisheries_records():
    response = client.get("/api/fisheries/records?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_molecular_samples():
    response = client.get("/api/molecular/samples?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

# We cannot easily test /api/species/{id} or /api/fisheries/trend without knowing a valid species_id 
# from the seeded DB. In a real test suite, we would use a fixture to insert test data.
# For this E2E pass against the seeded DB, we expect a 404 or a successful empty/populated list for invalid ID.
def test_get_species_not_found():
    response = client.get("/api/species/9999999")
    assert response.status_code == 404
