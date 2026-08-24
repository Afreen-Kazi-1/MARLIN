from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TimeRange(BaseModel):
    start: str = Field(default="2021-01-01", description="Start date ISO string YYYY-MM-DD")
    end: str = Field(default="2025-12-31", description="End date ISO string YYYY-MM-DD")

class QueryEntities(BaseModel):
    species: List[str] = Field(default_factory=list, description="Target species scientific or common names")
    region: str = Field(default="Arabian_Sea", description="Target geographical region identifier")

class StructuredQuery(BaseModel):
    intent: str = Field(default="trend_and_relationship", description="User intent classification: e.g. trend_and_relationship, species_decline, anomaly_detection")
    entities: QueryEntities = Field(default_factory=QueryEntities)
    time_range: TimeRange = Field(default_factory=TimeRange)
    variables: List[str] = Field(default_factory=lambda: ["temperature", "species_occurrence"])
    requested_analysis: List[str] = Field(default_factory=lambda: ["trend", "correlation"])

class QueryRequest(BaseModel):
    question: Optional[str] = Field(default=None, example="Why has yellowfin tuna changed in the Arabian Sea since 2021?")
    query: Optional[str] = Field(default=None, example="Why has yellowfin tuna changed in the Arabian Sea since 2021?")

class QueryResponse(BaseModel):
    query_id: str
    question: Optional[str] = None
    user_query: Optional[str] = None
    structured_query: StructuredQuery
    answer: Optional[str] = None
    synthesis_summary: Optional[str] = None
    confidence: Optional[str] = "High"
    confidence_score: Optional[float] = 0.85
    overall_confidence: Optional[float] = 0.85
    unsupported_claim_rate: Optional[float] = 0.0
    grounding_score: Optional[float] = 1.0
    agent_trace: List[Dict[str, Any]] = Field(default_factory=list)
    claims: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    bridges: List[Dict[str, Any]] = Field(default_factory=list)
    visualizations: List[Dict[str, Any]] = Field(default_factory=list)
