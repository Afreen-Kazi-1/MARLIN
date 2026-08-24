from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.database.models.core import DatasetModel, SpeciesModel, LocationModel
from app.database.models.measurements import (
    OceanMeasurementModel,
    BiodiversityObservationModel,
    FisheriesRecordModel,
    MolecularSampleModel
)
from app.database.models.reasoning import (
    QueryModel,
    ClaimModel,
    EvidenceRecordModel,
    ClaimEvidenceModel
)

class DatasetRepository(BaseRepository[DatasetModel]):
    def __init__(self):
        super().__init__(DatasetModel)

class SpeciesRepository(BaseRepository[SpeciesModel]):
    def __init__(self):
        super().__init__(SpeciesModel)
        self._cache = {}
        
    def get_by_aphia_id(self, db: Session, aphia_id: int) -> Optional[SpeciesModel]:
        if aphia_id in self._cache:
            return self._cache[aphia_id]
        
        result = db.query(self.model).filter(self.model.aphia_id == aphia_id).first()
        if result:
            self._cache[aphia_id] = result
        return result

class LocationRepository(BaseRepository[LocationModel]):
    def __init__(self):
        super().__init__(LocationModel)

class OceanRepository(BaseRepository[OceanMeasurementModel]):
    def __init__(self):
        super().__init__(OceanMeasurementModel)
        
    def get_measurements(
        self, db: Session, variable: str, region_id: Optional[str] = None, limit: int = 100
    ) -> List[OceanMeasurementModel]:
        query = db.query(self.model).filter(self.model.variable == variable)
        # Note: In a fully fleshed out spatial model, region filtering might join with locations table.
        return query.order_by(self.model.timestamp.asc()).limit(limit).all()

    def get_all_for_variable(self, db: Session, variable: str) -> List[OceanMeasurementModel]:
        return db.query(self.model).filter(self.model.variable == variable).order_by(self.model.timestamp.asc()).all()

class BiodiversityRepository(BaseRepository[BiodiversityObservationModel]):
    def __init__(self):
        super().__init__(BiodiversityObservationModel)

    def get_observations(self, db: Session, limit: int = 100) -> List[BiodiversityObservationModel]:
        return db.query(self.model).order_by(self.model.timestamp.asc()).limit(limit).all()

class FisheriesRepository(BaseRepository[FisheriesRecordModel]):
    def __init__(self):
        super().__init__(FisheriesRecordModel)
        
    def get_records(self, db: Session, limit: int = 100) -> List[FisheriesRecordModel]:
        return db.query(self.model).order_by(self.model.year.asc()).limit(limit).all()

    def get_records_by_species(self, db: Session, species_id: int) -> List[FisheriesRecordModel]:
        return db.query(self.model).filter(self.model.species_id == species_id).order_by(self.model.year.asc()).all()

class MolecularRepository(BaseRepository[MolecularSampleModel]):
    def __init__(self):
        super().__init__(MolecularSampleModel)
        
    def get_samples(self, db: Session, limit: int = 100) -> List[MolecularSampleModel]:
        return db.query(self.model).order_by(self.model.timestamp.asc()).limit(limit).all()

class QueryRepository(BaseRepository[QueryModel]):
    def __init__(self):
        super().__init__(QueryModel)

class ClaimRepository(BaseRepository[ClaimModel]):
    def __init__(self):
        super().__init__(ClaimModel)

class EvidenceRepository(BaseRepository[EvidenceRecordModel]):
    def __init__(self):
        super().__init__(EvidenceRecordModel)
