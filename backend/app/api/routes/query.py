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
    structured_query = query_interpreter.parse_query(request.question)
    
    # 2. Persist query
    db_query = reasoning_service.create_query(
        db=db, 
        user_query=request.question, 
        structured_query=structured_query.model_dump()
    )
    
    # 3. Route datasets (mock/heuristic for now)
    datasets = query_interpreter.route_datasets(structured_query)
    
    # 4. Generate evidence and claims (Mocked logic for MVP to satisfy architecture)
    # In a full system, this would call DomainServices and AnalyticsEngine based on the structured query
    evidence = reasoning_service.create_evidence(
        db=db,
        query_id=db_query.id,
        source_type="derived_analysis",
        evidence_text="Calculated trend and correlation from routed datasets.",
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
    
    # 5. LLM Synthesis
    llm = LLMProvider()
    synthesis_prompt = (
        f"The user asked: '{request.question}'.\n"
        f"We found evidence: {evidence.evidence_text}\n"
        f"Our claim is: {claim.claim_text}\n"
        f"Synthesize a helpful natural language response."
    )
    answer = llm.generate(synthesis_prompt)
    
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
