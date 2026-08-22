from sqlalchemy.orm import Session
from sqlalchemy import or_, text
from typing import List, Dict, Any
from app.database.models.core import DatasetModel, SpeciesModel

class RAGService:
    """
    Retrieval-Augmented Generation (RAG) Context Service.
    Retrieves textual and contextual documentation, metadata descriptions, and domain definitions
    over SQL text search and metadata tables.
    """
    def __init__(self, db_session: Session):
        self.db = db_session

    def search_context(self, query_str: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Executes text search over datasets, species metadata, and domain descriptions.
        """
        keywords = [w.strip() for w in query_str.lower().split() if len(w.strip()) > 3]
        results = []

        # 1. Search Datasets metadata & descriptions
        if keywords:
            dataset_filters = [
                or_(
                    DatasetModel.name.ilike(f"%{kw}%"),
                    DatasetModel.description.ilike(f"%{kw}%"),
                    DatasetModel.domain.ilike(f"%{kw}%")
                )
                for kw in keywords
            ]
            datasets = self.db.query(DatasetModel).filter(or_(*dataset_filters)).limit(limit).all()
            for d in datasets:
                results.append({
                    "source": f"Dataset Metadata [{d.id.upper()}]",
                    "domain": d.domain,
                    "title": d.name,
                    "content": f"Dataset {d.name} ({d.domain}): {d.description}. License: {d.license}. URL: {d.source_url}"
                })

        # 2. Search Species Taxonomy metadata
        if keywords:
            species_filters = [
                or_(
                    SpeciesModel.scientific_name.ilike(f"%{kw}%"),
                    SpeciesModel.canonical_name.ilike(f"%{kw}%"),
                    SpeciesModel.common_name.ilike(f"%{kw}%")
                )
                for kw in keywords
            ]
            species_recs = self.db.query(SpeciesModel).filter(or_(*species_filters)).limit(limit).all()
            for sp in species_recs:
                results.append({
                    "source": f"Taxonomy Reference [WoRMS AphiaID {sp.aphia_id}]",
                    "domain": "taxonomy",
                    "title": sp.canonical_name,
                    "content": f"Species {sp.canonical_name} (Common: {sp.common_name}). Kingdom: {sp.kingdom}, Phylum: {sp.phylum}, Family: {sp.family}, Genus: {sp.genus}."
                })

        # 3. Add Domain Scientific Guardrails Context
        if any(kw in query_str.lower() for kw in ["tuna", "temperature", "cause", "declining", "arabian"]):
            results.append({
                "source": "Scientific Guardrail & Domain Definition",
                "domain": "oceanography_and_fisheries",
                "title": "Correlation vs. Causation Guardrail",
                "content": "Statistical relationships between sea surface temperature increase and species abundance change indicate correlation and association, but do not establish causation without mechanistic causal modeling."
            })

        return results[:limit]
