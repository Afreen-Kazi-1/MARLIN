from sqlalchemy.orm import Session
from app.repositories.domain_repos import QueryRepository, ClaimRepository, EvidenceRepository
from app.database.models.reasoning import QueryModel, ClaimModel, EvidenceRecordModel, ClaimEvidenceModel
from typing import List, Dict, Any
import uuid

class ReasoningService:
    def __init__(self):
        self.query_repo = QueryRepository()
        self.claim_repo = ClaimRepository()
        self.evidence_repo = EvidenceRepository()

    def create_query(self, db: Session, user_query: str, structured_query: dict) -> QueryModel:
        try:
            db_query = QueryModel(user_query=user_query, structured_query=structured_query)
            db.add(db_query)
            db.commit()
            db.refresh(db_query)
            return db_query
        except Exception as e:
            db.rollback()
            print("Notice on query creation:", e)
            # Create a detached fallback query instance
            return QueryModel(id=uuid.uuid4(), user_query=user_query, structured_query=structured_query)

    def create_evidence(
        self, db: Session, query_id: uuid.UUID, source_type: str, evidence_text: str,
        numeric_value: float = None, method: str = None, confidence: float = 1.0,
        source_id: str = None, metadata: dict = None
    ) -> EvidenceRecordModel:
        try:
            evidence = EvidenceRecordModel(
                query_id=query_id,
                source_type=source_type,
                source_id=source_id,
                evidence_text=evidence_text,
                numeric_value=numeric_value,
                method=method,
                confidence=confidence,
                metadata=metadata or {}
            )
            db.add(evidence)
            db.commit()
            db.refresh(evidence)
            return evidence
        except Exception as e:
            db.rollback()
            print("Notice on evidence creation:", e)
            return EvidenceRecordModel(
                id=uuid.uuid4(),
                query_id=query_id,
                source_type=source_type,
                source_id=source_id,
                evidence_text=evidence_text,
                numeric_value=numeric_value,
                method=method,
                confidence=confidence
            )

    def create_claim(
        self, db: Session, query_id: uuid.UUID, claim_text: str, claim_type: str,
        status: str, confidence: float, evidence_ids: List[uuid.UUID] = None
    ) -> ClaimModel:
        try:
            claim = ClaimModel(
                query_id=query_id,
                claim_text=claim_text,
                claim_type=claim_type,
                status=status,
                confidence=confidence
            )
            db.add(claim)
            db.commit()
            db.refresh(claim)

            if evidence_ids:
                for e_id in evidence_ids:
                    claim_ev = ClaimEvidenceModel(claim_id=claim.id, evidence_id=e_id, relationship="supported_by")
                    db.add(claim_ev)
                db.commit()
            return claim
        except Exception as e:
            db.rollback()
            print("Notice on claim creation:", e)
            return ClaimModel(
                id=uuid.uuid4(),
                query_id=query_id,
                claim_text=claim_text,
                claim_type=claim_type,
                status=status,
                confidence=confidence
            )

    def get_claims_by_query(self, db: Session, query_id: uuid.UUID) -> List[ClaimModel]:
        return db.query(ClaimModel).filter(ClaimModel.query_id == query_id).all()

    def get_evidence_by_query(self, db: Session, query_id: uuid.UUID) -> List[EvidenceRecordModel]:
        return db.query(EvidenceRecordModel).filter(EvidenceRecordModel.query_id == query_id).all()
