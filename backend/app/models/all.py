from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, TIMESTAMP, Text, JSON, DECIMAL, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

# Helper for UUID PKs
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Condominium(Base):
    __tablename__ = "condominiums"
    
    id = uuid_pk()
    name = Column(String(255), nullable=False)
    # Encrypted fields are just text to the app, handled by DB/pgcrypto
    cnpj_encrypted = Column(Text, nullable=False)
    cnpj_hash = Column(String(64), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class User(Base):
    __tablename__ = "users"

    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    
    name = Column(String(255), nullable=False)
    email_encrypted = Column(Text, nullable=False)
    email_hash = Column(String(64), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    role = Column(String(20), nullable=False) # ADMIN, RESIDENT, PORTER, FINANCIAL
    profile_type = Column(String(20)) # OWNER, TENANT
    status = Column(String(20), default="PENDING")
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class Unit(Base):
    __tablename__ = "units"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    block = Column(String(50))
    number = Column(String(20), nullable=False)

class Reservation(Base):
    __tablename__ = "reservations"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    common_area_id = Column(UUID(as_uuid=True), ForeignKey("common_areas.id"), nullable=False)
    
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=False)
    status = Column(String(20), default="PENDING")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class CommonArea(Base):
    __tablename__ = "common_areas"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

