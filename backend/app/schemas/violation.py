from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ViolationBase(BaseModel):
    resident_id: UUID
    bylaw_id: Optional[UUID] = None
    type: str  # 'WARNING', 'FINE'
    description: str
    amount: Optional[float] = None
    occurred_at: Optional[datetime] = None

class ViolationCreate(ViolationBase):
    pass

class ViolationUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    occurred_at: Optional[datetime] = None

class Violation(ViolationBase):
    id: UUID
    condominium_id: UUID
    status: str
    created_at: datetime
    occurred_at: Optional[datetime] = None

    class Config:
        from_attributes = True
