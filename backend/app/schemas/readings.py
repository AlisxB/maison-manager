from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional

# --- Water (Individual) ---
class WaterReadingBase(BaseModel):
    unit_id: UUID
    reading_date: date
    value_m3: float
    image_url: Optional[str] = None

class WaterReadingCreate(WaterReadingBase):
    pass

class WaterReadingRead(WaterReadingBase):
    id: UUID
    condominium_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Gas (Collective) ---
class GasReadingBase(BaseModel):
    supplier: str
    purchase_date: date
    total_price: float
    cylinder_1_kg: float
    cylinder_2_kg: float
    cylinder_3_kg: float
    cylinder_4_kg: float

class GasReadingCreate(GasReadingBase):
    pass

class GasReadingRead(GasReadingBase):
    id: UUID
    condominium_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Electricity (Collective) ---
class ElectricityReadingBase(BaseModel):
    due_date: date
    consumption_kwh: float
    total_value: float
    status: str = 'PENDENTE' # PENDENTE, PAGO, ATRASADO

class ElectricityReadingCreate(ElectricityReadingBase):
    pass

class ElectricityReadingRead(ElectricityReadingBase):
    id: UUID
    condominium_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
