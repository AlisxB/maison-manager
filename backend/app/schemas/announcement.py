
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class AnnouncementBase(BaseModel):
    title: str
    description: str
    type: str # 'Aviso', 'Urgente', 'Evento', 'Manutenção'
    target_audience: str = "Todos os moradores" # 'Todos os moradores', 'Apenas Proprietários', etc

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementRead(AnnouncementBase):
    id: UUID
    condominium_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
