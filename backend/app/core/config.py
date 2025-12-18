from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Maison Manager API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "maison_manager"
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_TO_A_STRONG_RANDOM_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Encryption Key for PGCrypto (must match what was used in DB Setup if applicable, or for App-side logic)
    # In strictly DB-encrypted setup, this might be passed to DB session.
    APP_ENCRYPTION_KEY: str = "super_secure_key_for_pgcrypto" 

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
