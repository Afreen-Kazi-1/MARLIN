from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database.session import get_db
from app.schemas.query import QueryRequest, QueryResponse
from app.services.query_service import QueryInterpreterService
from app.services.reasoning_service import ReasoningService
from app.agents.provider import LLMProvider

router = APIRouter(prefix="/query", tags=["Query & Reasoning"])

def get_query_interpreter(db: Session = Depends(get_db)) -> QueryInterpreterService:
    return QueryInterpreterService(db)

def get_reasoning_service() -> ReasoningService:
    return ReasoningService()

@router.post("", response_model=QueryResponse)
def execute_query(
    request: QueryRequest,
    db: Session = Depends(get_db),
    query_interpreter: QueryInterpreterService = Depends(get_query_interpreter),
    reasoning_service: ReasoningService = Depends(get_reasoning_service)
):
    # 1. Parse natural language into structured query
    print("\n" + "="*80)
    print(f"[INPUT] RECEIVED USER QUESTION: '{request.question}'")
    print("="*80)
    
    structured_query = query_interpreter.parse_query(request.question)
    
    print("\n[STEP 1] CONVERTED NL TO STRUCTURED QUERY (JSON SCHEMA)")
    print("-" * 50)
    import json
    print(json.dumps(structured_query.model_dump(), indent=2))
    
    # 2. Persist query
    db_query = reasoning_service.create_query(
        db=db, 
        user_query=request.question, 
        structured_query=structured_query.model_dump()
    )
    
    # 3. Route datasets
    datasets = query_interpreter.route_datasets(structured_query)
    print("\n[STEP 2] ROUTED DATASETS / PLATFORMS FOR RETRIEVAL")
    print("-" * 50)
    print(f"Mapped variables/entities to datasets: {datasets}")
    
    from app.services.domain_services import OceanService
    from app.analytics.engine import ScientificAnalyticsEngine
    
    # 4. Generate evidence and claims by querying the database dynamically
    dynamic_evidence_text = "No relevant numerical data could be found for the requested variables."
    
    # Check if we need to analyze ocean variables (e.g. temperature, salinity)
    var = None
    for v in structured_query.variables:
        v_lower = v.lower()
        if "temp" in v_lower:
            var = "temperature"
            break
        elif "salin" in v_lower:
            var = "salinity"
            break
        elif "ph" in v_lower:
            var = "ph"
            break
 
    if var:
        ocean_service = OceanService()
        measurements = ocean_service.get_measurements(db, variable=var, region_id=structured_query.entities.region, limit=1000)
        
        if measurements and len(measurements) > 2:
            timestamps = [m.timestamp for m in measurements]
            values = [m.value for m in measurements]
            trend_data = ScientificAnalyticsEngine.calculate_trend(timestamps, values)
            
            direction = "increased" if trend_data['slope'] > 0 else "decreased" if trend_data['slope'] < 0 else "remained stable"
            dynamic_evidence_text = (
                f"Analysis of {var} in {structured_query.entities.region} using {len(measurements)} records: "
                f"The mean value is {trend_data['mean']:.2f}. "
                f"The data shows a slope of {trend_data['slope']:.4f}, meaning it has {direction} with a "
                f"total change of {trend_data['percentage_change']:.2f}% over the observed time period."
            )
        else:
            dynamic_evidence_text = f"Insufficient data points (found {len(measurements) if measurements else 0}) for {var} in {structured_query.entities.region}."
 
    evidence = reasoning_service.create_evidence(
        db=db,
        query_id=db_query.id,
        source_type="derived_analysis",
        evidence_text=dynamic_evidence_text,
        method="deterministic_analytics",
        confidence=0.9
    )
    
    claim = reasoning_service.create_claim(
        db=db,
        query_id=db_query.id,
        claim_text=f"Analyzed {', '.join(structured_query.variables)} for {', '.join(structured_query.entities.species)}.",
        claim_type="trend",
        status="supported",
        confidence=0.85,
        evidence_ids=[evidence.id]
    )
    
    print("\n[STEP 3] REASONING & GROUNDING (CLAIMS + EVIDENCE)")
    print("-" * 50)
    print(f"Claim [Status: {claim.status}]: {claim.claim_text}")
    print(f"Evidence [Method: {evidence.method}]: {evidence.evidence_text}")
    
    # 5. LLM Synthesis
    llm = LLMProvider()
    synthesis_prompt = (
        f"The user asked: '{request.question}'.\n"
        f"We found evidence: {evidence.evidence_text}\n"
        f"Our claim is: {claim.claim_text}\n"
        f"Synthesize a helpful natural language response."
    )
    print("\n[STEP 4] LLM SYNTHESIS PROMPT")
    print("-" * 50)
    print(synthesis_prompt)
    print("-" * 50)
    
    answer = llm.generate(synthesis_prompt)
    print(f"\n[FINAL RESPONSE]\n{answer}")
    print("="*80 + "\n")
    
    return QueryResponse(
        query_id=str(db_query.id),
        question=request.question,
        structured_query=structured_query,
        answer=answer,
        confidence="High",
        confidence_score=0.85,
        claims=[{"id": str(claim.id), "text": claim.claim_text}],
        evidence=[{"id": str(evidence.id), "text": evidence.evidence_text}]
    )

@router.get("/{query_id}/claims")
def get_query_claims(
    query_id: str,
    db: Session = Depends(get_db),
    reasoning_service: ReasoningService = Depends(get_reasoning_service)
):
    import uuid
    claims = reasoning_service.get_claims_by_query(db, uuid.UUID(query_id))
    return [{"id": str(c.id), "text": c.claim_text, "status": c.status, "confidence": c.confidence} for c in claims]

@router.get("/{query_id}/evidence")
def get_query_evidence(
    query_id: str,
    db: Session = Depends(get_db),
    reasoning_service: ReasoningService = Depends(get_reasoning_service)
):
    import uuid
    evidence = reasoning_service.get_evidence_by_query(db, uuid.UUID(query_id))
    return [{"id": str(e.id), "text": e.evidence_text, "source_type": e.source_type} for e in evidence]
