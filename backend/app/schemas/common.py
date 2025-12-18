from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# --- Units ---
class UnitBase(BaseModel):
    block: Optional[str] = None
    number: str
    type: str = "Apartment"

class UnitCreate(UnitBase):
    pass

class UnitRead(UnitBase):
    id: UUID
    condominium_id: UUID
    
    class Config:
        from_attributes = True

# --- Reservations ---
class ReservationBase(BaseModel):
    common_area_id: UUID
    start_time: datetime
    end_time: datetime

class ReservationCreate(ReservationBase):
    user_id: Optional[UUID] = None

class ReservationUpdate(BaseModel):
    status: str

class ReservationRead(ReservationBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Common Areas ---
class CommonAreaBase(BaseModel):
    name: str
    capacity: Optional[int] = None
    price_per_hour: Optional[float] = 0.0
    min_booking_hours: Optional[int] = 1
    max_booking_hours: Optional[int] = 4
    is_active: bool = True

class CommonAreaCreate(CommonAreaBase):
    pass

class CommonAreaRead(CommonAreaBase):
    id: UUID
    condominium_id: UUID
    
    class Config:
        from_attributes = True
