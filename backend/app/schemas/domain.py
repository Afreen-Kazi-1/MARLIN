from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime

class SpeciesResponse(BaseModel):
    id: int
    aphia_id: Optional[int]
    scientific_name: str
    canonical_name: str
    common_name: Optional[str]
    kingdom: Optional[str]
    phylum: Optional[str]
    class_name: Optional[str]
    order: Optional[str]
    family: Optional[str]
    genus: Optional[str]
    species: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class OceanMeasurementResponse(BaseModel):
    id: int
    location_id: int
    timestamp: datetime
    depth_m: float
    variable: str
    value: float
    unit: str
    quality_flag: str

    model_config = ConfigDict(from_attributes=True)

class BiodiversityObservationResponse(BaseModel):
    id: int
    species_id: int
    location_id: int
    timestamp: datetime
    depth_m: Optional[float]
    observation_type: str
    abundance: Optional[float]
    count: Optional[int]

    model_config = ConfigDict(from_attributes=True)

class FisheriesRecordResponse(BaseModel):
    id: int
    species_id: int
    region_id: str
    year: int
    catch: Optional[float]
    production: Optional[float]
    unit: str

    model_config = ConfigDict(from_attributes=True)

class MolecularSampleResponse(BaseModel):
    id: int
    sample_identifier: str
    location_id: int
    timestamp: datetime
    species_id: Optional[int]
    abundance: Optional[float]
    measurement_type: str
    value: Optional[float]
    unit: str

    model_config = ConfigDict(from_attributes=True)
