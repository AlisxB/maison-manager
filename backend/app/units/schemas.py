from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class UnitBase(BaseModel):
    block: Optional[str] = None
    number: str
    type: str = "Apartamento"

class UnitCreate(UnitBase):
    pass

class UnitRead(UnitBase):
    id: UUID
    condominium_id: UUID

    class Config:
        from_attributes = True
