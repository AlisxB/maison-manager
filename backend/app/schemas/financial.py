from typing import Optional
import datetime
from decimal import Decimal
import uuid
from pydantic import BaseModel

class TransactionBase(BaseModel):
    type: str # income, expense
    description: str
    amount: Decimal
    category: Optional[str] = None
    date: datetime.date
    status: Optional[str] = 'paid'
    observation: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    date: Optional[datetime.date] = None
    status: Optional[str] = None
    observation: Optional[str] = None

class TransactionRead(TransactionBase):
    id: uuid.UUID
    condominium_id: uuid.UUID
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True
