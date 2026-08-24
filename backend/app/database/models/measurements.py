from sqlalchemy import Column, BigInteger, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.database.session import Base

class OceanMeasurementModel(Base):
    __tablename__ = "ocean_measurements"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    dataset_id = Column(String(50), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    depth_m = Column(Numeric(6, 2), nullable=False)
    variable = Column(String(50), nullable=False, index=True) # temperature, salinity, oxygen, chlorophyll
    value = Column(Numeric(10, 4), nullable=False)
    unit = Column(String(20), nullable=False)
    quality_flag = Column(String(20), default="valid")
    source_record_id = Column(String(100), nullable=True)
    metadata_json = Column("metadata", JSONB, default={})

class BiodiversityObservationModel(Base):
    __tablename__ = "biodiversity_observations"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    dataset_id = Column(String(50), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    depth_m = Column(Numeric(6, 2), nullable=True)
    observation_type = Column(String(50), nullable=False) # occurrence, abundance_count, biomass
    abundance = Column(Numeric(12, 4), nullable=True)
    count = Column(Integer, nullable=True)
    source_record_id = Column(String(100), nullable=True)
    metadata_json = Column("metadata", JSONB, default={})

class FisheriesRecordModel(Base):
    __tablename__ = "fisheries_records"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    dataset_id = Column(String(50), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=False, index=True)
    region_id = Column(String(50), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    catch = Column(Numeric(12, 3), nullable=True) # landings in tonnes
    production = Column(Numeric(12, 3), nullable=True) # aquaculture yield
    unit = Column(String(20), default="tonnes")
    source_record_id = Column(String(100), nullable=True)
    metadata_json = Column("metadata", JSONB, default={})

class MolecularSampleModel(Base):
    __tablename__ = "molecular_samples"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    dataset_id = Column(String(50), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    sample_identifier = Column(String(100), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=True, index=True)
    abundance = Column(Numeric(8, 6), nullable=True)
    measurement_type = Column(String(50), default="metabarcoding_amplicon")
    value = Column(Numeric(10, 4), nullable=True)
    unit = Column(String(20), default="reads_ratio")
    source_record_id = Column(String(100), nullable=True)
    metadata_json = Column("metadata", JSONB, default={})
    
