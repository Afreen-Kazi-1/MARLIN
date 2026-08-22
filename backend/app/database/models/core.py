from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.database.session import Base

class DatasetModel(Base):
    __tablename__ = "datasets"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    domain = Column(String(50), nullable=False) # oceanography, fisheries, biodiversity, molecular
    description = Column(Text, nullable=True)
    source_url = Column(String(255), nullable=True)
    license = Column(String(100), nullable=True)
    version = Column(String(50), nullable=True)
    retrieved_at = Column(DateTime(timezone=True), server_default=func.now())
    metadata_json = Column("metadata", JSONB, default={})

class SpeciesModel(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, autoincrement=True)
    aphia_id = Column(Integer, unique=True, nullable=True)
    scientific_name = Column(String(150), nullable=False)
    canonical_name = Column(String(150), nullable=False)
    common_name = Column(String(150), nullable=True)
    kingdom = Column(String(50), nullable=True)
    phylum = Column(String(50), nullable=True)
    class_name = Column("class", String(50), nullable=True)
    order = Column(String(50), nullable=True)
    family = Column(String(50), nullable=True)
    genus = Column(String(50), nullable=True)
    species = Column(String(100), nullable=True)
    taxonomy_json = Column(JSONB, default={})

class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Numeric(8, 5), nullable=False)
    longitude = Column(Numeric(8, 5), nullable=False)
    grid_cell_id = Column(String(50), nullable=False, index=True)
    region_id = Column(String(50), nullable=False, index=True)
    geometry = Column(Geometry("POINT", srid=4326), nullable=False)

    __table_args__ = (
        UniqueConstraint("latitude", "longitude", name="unique_lat_lon"),
    )
