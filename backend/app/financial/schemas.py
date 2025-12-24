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

    class Config:
        from_attributes = True

    from pydantic import field_validator
    
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

    @classmethod
    def from_orm(cls, obj):
        # Override to handle type mapping if needed, or use a validator
        # But from_attributes uses fields.
        pass

    @property
    def type_mapped(self):
        # This doesn't modify the 'type' field which is what Pydantic serializes by default
        return self.type

    # Pydantic V2 style validator or V1?
    # Using V1 style @validator for compatibility or V2 if available.
    # Assuming Pydantic V2 based on "model_dump".
    from pydantic import field_validator
    
    @field_validator('type', mode='before')
    @classmethod
    def map_type(cls, v):
        if v == 'RECEITA': return 'income'
        if v == 'DESPESA': return 'expense'
        return v
