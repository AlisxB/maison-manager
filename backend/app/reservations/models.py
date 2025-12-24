from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, Integer, JSON, DECIMAL, Boolean, text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Reservation(Base):
    __tablename__ = "reservations"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    common_area_id = Column(UUID(as_uuid=True), ForeignKey("common_areas.id"), nullable=False)
    
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=False)
    status = Column(String(20), default="PENDENTE")
    reason = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    
    user = relationship("User")
    common_area = relationship("CommonArea")

class CommonArea(Base):
    __tablename__ = "common_areas"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, default=10)
    price_per_hour = Column(DECIMAL(10, 2), default=0)
    min_booking_hours = Column(Integer, default=1)
    max_booking_hours = Column(Integer, default=4)
    monthly_limit_per_unit = Column(Integer, default=2)
    opening_hours = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
