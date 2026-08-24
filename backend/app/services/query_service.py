from sqlalchemy.orm import Session
from app.schemas.query import StructuredQuery, TimeRange, QueryEntities
from app.agents.provider import LLMProvider
from app.services.rag_service import RAGService

class QueryInterpreterService:
    """
    Natural Language Query Interpreter.
    Translates user questions into validated Pydantic StructuredQuery plans,
    routes required datasets, and retrieves RAG text context.
    """
    def __init__(self, db_session: Session):
        self.db = db_session
        self.llm_provider = LLMProvider()
        self.rag_service = RAGService(db_session)

    def parse_query(self, user_question: str) -> StructuredQuery:
        """
        Parses natural language prompt into Pydantic StructuredQuery model.
        """
        system_instruction = (
            "You are a marine intelligence query parser. Convert the user's question into a JSON object "
            "matching the StructuredQuery schema with fields: intent, entities (species, region), "
            "time_range (start, end), variables, requested_analysis."
        )

        prompt = f"Parse this marine user question into a structured query plan: '{user_question}'"
        
        # Use LLM provider structured output target validation
        structured_plan = self.llm_provider.structured_output(
            prompt=prompt,
            target_schema=StructuredQuery,
            system_instruction=system_instruction
        )
        
        # Heuristic entity extraction for fallback/demo mode completeness
        question_lower = user_question.lower()
        if "yellowfin" in question_lower or "tuna" in question_lower or "thunnus" in question_lower:
            if "Thunnus albacares" not in structured_plan.entities.species:
                structured_plan.entities.species.append("Thunnus albacares")
        
        if "arabian sea" in question_lower or "arabian" in question_lower:
            structured_plan.entities.region = "Arabian_Sea"

        return structured_plan

    def route_datasets(self, structured_query: StructuredQuery) -> list[str]:
        """
        Dataset Router: maps query variables to required dataset IDs.
        """
        sources = set()
        for var in structured_query.variables:
            var_lower = var.lower()
            if "temp" in var_lower or "salin" in var_lower or "ocean" in var_lower or "environment" in var_lower:
                sources.add("argo")
            if "occur" in var_lower or "abund" in var_lower or "bio" in var_lower or "species" in var_lower or "populat" in var_lower:
                sources.add("obis")
            if "catch" in var_lower or "land" in var_lower or "fish" in var_lower or "biomass" in var_lower:
                sources.add("fishstat")
            if "mol" in var_lower or "dna" in var_lower or "otu" in var_lower or "sample" in var_lower:
                sources.add("mgnify")
        
        if structured_query.entities.species:
            sources.add("obis")
            sources.add("fishstat")
        
        sources.add("worms") # Always include taxonomy reference
        return sorted(list(sources))
