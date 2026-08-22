import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Unified Marine Intelligence & Ecosystem Reasoning Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/marine_db"
    
    # AI / LLM Settings
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    
    # Defaults
    DEFAULT_REGION: str = "Arabian_Sea"
    DEFAULT_START_DATE: str = "2021-01-01"
    DEFAULT_END_DATE: str = "2025-12-31"
    
    # Feature Flags & Modes
    DEMO_MODE: bool = True
    ARGO_ENABLED: bool = True
    OBIS_ENABLED: bool = True
    FISHSTAT_ENABLED: bool = True
    MGNIFY_ENABLED: bool = True
    WORMS_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
