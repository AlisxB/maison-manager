from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal

# --- Condominium Schemas ---
class CondominiumBase(BaseModel):
    name: str = Field(min_length=3)
    address: str = Field(min_length=5)
    contact_email: Optional[EmailStr] = None
    gate_phone: Optional[str] = None

class CondominiumUpdate(CondominiumBase):
    pass

class CondominiumRead(CondominiumBase):
    id: UUID
    cnpj: str = Field(..., description="Decrypted CNPJ")
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Common Area Schemas ---
class CommonAreaBase(BaseModel):
    name: str = Field(min_length=3)
    capacity: Optional[int] = Field(default=10, ge=1)
    price_per_hour: Decimal = Field(default=0, ge=0)
    min_booking_hours: int = Field(default=1, ge=1)
    max_booking_hours: int = Field(default=4, ge=1)
    monthly_limit_per_unit: int = Field(default=2, ge=1)
    opening_hours: Optional[Dict[str, Any]] = None # JSONB structure
    is_active: bool = True

class CommonAreaCreate(CommonAreaBase):
    pass

class CommonAreaUpdate(CommonAreaBase):
    pass

class CommonAreaRead(CommonAreaBase):
    id: UUID
    condominium_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Audit Schemas ---
class AuditLogRead(BaseModel):
    id: UUID
    actor_id: Optional[UUID]
    action: str
    table_name: str
    record_id: UUID
    old_data: Optional[Dict[str, Any]]
    new_data: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    
    actor_name: Optional[str] = None # Enriched field

    model_config = ConfigDict(from_attributes=True)
