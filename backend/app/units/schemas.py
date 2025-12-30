from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
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

class OccupationHistoryRead(BaseModel):
    id: UUID
    user_id: UUID
    profile_type: str
    start_date: datetime
    end_date: Optional[datetime]
    created_at: datetime
    # Nested minimal User
    user_name: Optional[str] = None 

    class Config:
        from_attributes = True

class UnitResidentRead(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    profile_type: Optional[str] = None
    role: str
    status: str

    class Config:
        from_attributes = True

class UnitDetails(UnitRead):
    current_residents: List[UnitResidentRead] = []
    occupation_history: List[OccupationHistoryRead] = []
