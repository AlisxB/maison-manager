from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class OccurrenceBase(BaseModel):
    title: str
    description: str
    category: str
    photo_url: Optional[str] = None

class OccurrenceCreate(OccurrenceBase):
    is_anonymous: bool = False

class OccurrenceUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None
    # Residents might want to update description if OPEN, but let's keep it simple for now (Admin only updates usually)

class UserSummary(BaseModel):
    id: UUID
    name: str
    unit_id: Optional[UUID] = None

class OccurrenceRead(OccurrenceBase):
    id: UUID
    condominium_id: UUID
    user_id: UUID
    status: str
    is_anonymous: bool = False
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    user: Optional[UserSummary] = None

    class Config:
        from_attributes = True
