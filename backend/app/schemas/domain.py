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
    dataset_id: Optional[str] = 'argo_floats_global'
    location_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    grid_cell_id: Optional[str] = None
    region_id: Optional[str] = None
    timestamp: datetime
    depth_m: float
    variable: str
    value: float
    unit: str
    quality_flag: str

    model_config = ConfigDict(from_attributes=True)

class BiodiversityObservationResponse(BaseModel):
    id: int
    dataset_id: Optional[str] = 'obis_occurrences_io'
    species_id: int
    species_name: Optional[str] = 'Thunnus albacares'
    common_name: Optional[str] = 'Yellowfin Tuna'
    location_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region_id: Optional[str] = None
    timestamp: datetime
    depth_m: Optional[float] = None
    observation_type: str
    abundance: Optional[float] = None
    count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class FisheriesRecordResponse(BaseModel):
    id: int
    dataset_id: Optional[str] = 'fao_fishstat_area51'
    species_id: int
    species_name: Optional[str] = 'Thunnus albacares'
    common_name: Optional[str] = 'Yellowfin Tuna'
    region_id: str
    year: int
    catch: Optional[float] = None
    production: Optional[float] = None
    unit: str

    model_config = ConfigDict(from_attributes=True)

class MolecularSampleResponse(BaseModel):
    id: int
    dataset_id: Optional[str] = 'mgnify_metagenomics_sea'
    sample_identifier: str
    location_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region_id: Optional[str] = None
    timestamp: datetime
    species_id: Optional[int] = None
    species_name: Optional[str] = None
    abundance: Optional[float] = None
    measurement_type: str
    value: Optional[float] = None
    unit: str

    model_config = ConfigDict(from_attributes=True)
