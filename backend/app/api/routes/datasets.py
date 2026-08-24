from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models.core import DatasetModel
from app.repositories.domain_repos import DatasetRepository

router = APIRouter(prefix="/datasets", tags=["Datasets"])
dataset_repo = DatasetRepository()

@router.get("")
def list_datasets(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    db: Session = Depends(get_db)
):
    """
    List all ingested datasets, their domain, version, and metadata.
    Supports the Dataset Registry UI.
    """
    query = db.query(DatasetModel)
    if domain:
        query = query.filter(DatasetModel.domain == domain)
        
    datasets = query.all()
    
    return [
        {
            "id": d.id,
            "name": d.name,
            "domain": d.domain,
            "description": d.description,
            "source_url": d.source_url,
            "license": d.license,
            "version": d.version,
            "retrieved_at": d.retrieved_at.isoformat() if d.retrieved_at else None,
            "metadata": d.metadata_json
        }
        for d in datasets
    ]
