from typing import Optional
import datetime
import uuid
from pydantic import BaseModel

class InventoryItemBase(BaseModel):
    name: str
    category: str
    quantity: int
    unit: str
    min_quantity: Optional[int] = 5
    location: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    min_quantity: Optional[int] = None
    location: Optional[str] = None

class InventoryItemRead(InventoryItemBase):
    id: uuid.UUID
    condominium_id: uuid.UUID
    created_at: datetime.datetime

    class Config:
        from_attributes = True
