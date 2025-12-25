from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    is_active: bool = True

class DocumentCreate(DocumentBase):
    pass # file is handled separately via UploadFile

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class DocumentRead(DocumentBase):
    id: UUID
    condominium_id: UUID
    file_path: str # or signed url? For now path or download url
    mime_type: str
    file_size: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None

    class Config:
        from_attributes = True

class DocumentStatusUpdate(BaseModel):
    is_active: bool
