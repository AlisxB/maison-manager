from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class BylawBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str  # e.g., 'Norma', 'Multa', 'Aviso'

class BylawCreate(BylawBase):
    pass

class BylawUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class Bylaw(BylawBase):
    id: UUID
    condominium_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
