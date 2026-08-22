from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.database.session import Base

class QueryModel(Base):
    __tablename__ = "queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_query = Column(Text, nullable=False)
    structured_query = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ClaimModel(Base):
    __tablename__ = "claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(UUID(as_uuid=True), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    claim_text = Column(Text, nullable=False)
    claim_type = Column(String(50), nullable=False) # trend, anomaly, correlation, association
    status = Column(String(50), nullable=False) # supported, partially_supported, contradicted, insufficient_evidence
    confidence = Column(Numeric(3, 2), nullable=False)

class EvidenceRecordModel(Base):
    __tablename__ = "evidence_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(UUID(as_uuid=True), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False) # database_record, publication_reference, derived_analysis
    source_id = Column(String(100), nullable=True)
    evidence_text = Column(Text, nullable=False)
    numeric_value = Column(Numeric(12, 4), nullable=True)
    method = Column(String(100), nullable=True)
    confidence = Column(Numeric(3, 2), nullable=False)
    metadata_json = Column("metadata", JSONB, default={})

class ClaimEvidenceModel(Base):
    __tablename__ = "claim_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(UUID(as_uuid=True), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    evidence_id = Column(UUID(as_uuid=True), ForeignKey("evidence_records.id", ondelete="CASCADE"), nullable=False)
    relationship = Column(String(50), nullable=False) # supported_by, contradicted_by, derived_from
    weight = Column(Numeric(3, 2), default=1.00)
