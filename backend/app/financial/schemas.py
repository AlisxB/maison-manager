from typing import Optional, List, Dict
import datetime
from decimal import Decimal
import uuid
from pydantic import BaseModel, ConfigDict, field_validator

class TransactionBase(BaseModel):
    type: str # income, expense
    description: str
    amount: Decimal
    category: Optional[str] = None
    date: datetime.date
    status: Optional[str] = 'PAGO'
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

    model_config = ConfigDict(from_attributes=True)

    @field_validator('type', mode='before')
    @classmethod
    def map_type(cls, v):
        if v == 'RECEITA': return 'income'
        if v == 'DESPESA': return 'expense'
        return v

    @field_validator('status', mode='before')
    @classmethod
    def map_status(cls, v):
        if v == 'PAGO': return 'paid'
        if v == 'PENDENTE': return 'pending'
        return v

class ShareCreate(BaseModel):
    month: int
    year: int

class ShareLinkResponse(BaseModel):
    link: str
    expires_at: datetime.datetime

class PublicReportResponse(BaseModel):
    condominium_name: str
    month: int
    year: int
    summary: dict # FinancialSummary
    transactions: List[TransactionRead]
    generated_at: datetime.datetime
