import pytest
from app.agents.provider import LLMProvider
from app.services.rag_service import RAGService
from app.services.query_service import QueryInterpreterService
from app.schemas.query import StructuredQuery
from app.database.session import SessionLocal

def test_llm_provider_generate():
    provider = LLMProvider()
    response = provider.generate("What is the ocean temperature trend?")
    assert len(response) > 0
    assert "[DEMO_MODE]" in response or "[FALLBACK" in response or len(response) > 5

def test_llm_provider_structured_output():
    provider = LLMProvider()
    result = provider.structured_output("Parse query for yellowfin tuna in Arabian Sea", StructuredQuery)
    assert isinstance(result, StructuredQuery)
    assert hasattr(result, "intent")
    assert hasattr(result, "entities")

def test_rag_context_search():
    db = SessionLocal()
    try:
        rag = RAGService(db)
        context_items = rag.search_context("yellowfin tuna temperature warming Arabian Sea")
        assert isinstance(context_items, list)
        assert len(context_items) >= 1
        assert "source" in context_items[0]
        assert "content" in context_items[0]
    finally:
        db.close()

def test_query_interpreter_pydantic_parsing():
    db = SessionLocal()
    try:
        interpreter = QueryInterpreterService(db)
        prompt = "Why has yellowfin tuna changed in the Arabian Sea since 2021?"
        plan = interpreter.parse_query(prompt)
        
        assert isinstance(plan, StructuredQuery)
        assert plan.intent is not None
        assert "Thunnus albacares" in plan.entities.species
        assert plan.entities.region == "Arabian_Sea"
        
        sources = interpreter.route_datasets(plan)
        assert "argo" in sources or "obis" in sources
        assert "worms" in sources
    finally:
        db.close()
