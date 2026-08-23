from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.domain_repos import (
    SpeciesRepository,
    OceanRepository,
    BiodiversityRepository,
    FisheriesRepository,
    MolecularRepository
)
from app.database.models.core import SpeciesModel
from app.database.models.measurements import (
    OceanMeasurementModel,
    BiodiversityObservationModel,
    FisheriesRecordModel,
    MolecularSampleModel
)

class SpeciesService:
    def __init__(self):
        self.repo = SpeciesRepository()

    def get_species(self, db: Session, species_id: int) -> Optional[SpeciesModel]:
        return self.repo.get(db, species_id)

    def get_species_by_aphia(self, db: Session, aphia_id: int) -> Optional[SpeciesModel]:
        return self.repo.get_by_aphia_id(db, aphia_id)

class OceanService:
    def __init__(self):
        self.repo = OceanRepository()

    def get_measurements(
        self, db: Session, variable: str, region_id: Optional[str] = None, limit: int = 100
    ) -> List[OceanMeasurementModel]:
        return self.repo.get_measurements(db, variable, region_id, limit)

    def get_all_for_variable(self, db: Session, variable: str) -> List[OceanMeasurementModel]:
        return self.repo.get_all_for_variable(db, variable)

class BiodiversityService:
    def __init__(self):
        self.repo = BiodiversityRepository()

    def get_observations(self, db: Session, limit: int = 100) -> List[BiodiversityObservationModel]:
        return self.repo.get_observations(db, limit)

class FisheriesService:
    def __init__(self):
        self.repo = FisheriesRepository()

    def get_records(self, db: Session, limit: int = 100) -> List[FisheriesRecordModel]:
        return self.repo.get_records(db, limit)

    def get_records_by_species(self, db: Session, species_id: int) -> List[FisheriesRecordModel]:
        return self.repo.get_records_by_species(db, species_id)

class MolecularService:
    def __init__(self):
        self.repo = MolecularRepository()

    def get_samples(self, db: Session, limit: int = 100) -> List[MolecularSampleModel]:
        return self.repo.get_samples(db, limit)
