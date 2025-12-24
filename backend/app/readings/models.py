from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, DECIMAL, text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class ReadingWater(Base):
    __tablename__ = "readings_water"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=False)
    
    reading_date = Column(TIMESTAMP(timezone=True), nullable=False) # stored as Date in DB, mapped here
    image_url = Column(Text)
    value_m3 = Column(DECIMAL(10, 3), nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class ReadingGas(Base):
    __tablename__ = "readings_gas"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    
    supplier = Column(String(100), nullable=False)
    purchase_date = Column(TIMESTAMP(timezone=True), nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    
    cylinder_1_kg = Column(DECIMAL(10, 2), nullable=False)
    cylinder_2_kg = Column(DECIMAL(10, 2), nullable=False)
    cylinder_3_kg = Column(DECIMAL(10, 2), nullable=False)
    cylinder_4_kg = Column(DECIMAL(10, 2), nullable=False)
    
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"))
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class ReadingElectricity(Base):
    __tablename__ = "readings_electricity"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    
    due_date = Column(TIMESTAMP(timezone=True), nullable=False)
    consumption_kwh = Column(DECIMAL(10, 2), nullable=False)
    total_value = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(20), default='PENDENTE')
    
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"))
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
