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

class BylawSummary(BaseModel):
    title: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

class ViolationRead(ViolationBase):
    id: UUID
    condominium_id: UUID
    status: str
    created_at: datetime
    occurred_at: Optional[datetime] = None
    
    bylaw: Optional[BylawSummary] = None

    class Config:
        from_attributes = True

# Bylaws
class BylawBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Geral"

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
    updated_at: datetime = datetime.now()

    class Config:
        from_attributes = True

class BylawRead(Bylaw):
    pass
