from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_query_pipeline_e2e():
    """
    Tests the full NLP query pipeline, from intent parsing to synthesis and evidence creation.
    """
    payload = {
        "question": "How has yellowfin tuna changed in the Arabian Sea between 2021 and 2025?"
    }
    
    # 1. Post Query
    response = client.post("/api/query", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    
    # Assert top-level structure
    assert "query_id" in data
    assert "answer" in data
    assert "claims" in data
    assert "evidence" in data
    assert len(data["claims"]) > 0
    assert len(data["evidence"]) > 0
    
    query_id = data["query_id"]
    
    # 2. Get Claims History
    claims_res = client.get(f"/api/query/{query_id}/claims")
    assert claims_res.status_code == 200
    claims_data = claims_res.json()
    assert len(claims_data) > 0
    assert claims_data[0]["status"] == "supported"
    
    # 3. Get Evidence History
    evidence_res = client.get(f"/api/query/{query_id}/evidence")
    assert evidence_res.status_code == 200
    evidence_data = evidence_res.json()
    assert len(evidence_data) > 0
