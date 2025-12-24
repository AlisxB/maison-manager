from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

# Helper for UUID PKs
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class User(Base):
    __tablename__ = "users"

    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    
    name = Column(String(255), nullable=False)
    email_encrypted = Column(Text, nullable=False)
    email_hash = Column(String(64), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    role = Column(String(20), nullable=False) # ADMIN, RESIDENTE, PORTEIRO, FINANCEIRO
    profile_type = Column(String(20)) # PROPRIETARIO, INQUILINO, STAFF
    status = Column(String(20), default="PENDENTE")
    
    # Relationships
    # Note: Strings used for forward reference. 
    # Logic: Modular Monoliths still share database, so relationships work IF mapped correctly.
    # However, for strict separation, we often avoid relationship objects across domains or import carefully.
    # Here we keep them for standard functionality, assuming models are registered.
    unit = relationship("Unit") 
    vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")
    pets = relationship("Pet", back_populates="user", cascade="all, delete-orphan")
    
    phone_encrypted = Column(Text, nullable=True)
    phone_hash = Column(String(64), nullable=True)
    
    department = Column(String(100), nullable=True)
    work_hours = Column(String(100), nullable=True)
    
    last_notification_check = Column(TIMESTAMP(timezone=True), nullable=True)

    cpf_encrypted = Column(Text, nullable=True)
    cpf_hash = Column(String(64), nullable=True)
    photo_url = Column(Text, nullable=True)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    deleted_at = Column(TIMESTAMP(timezone=True), nullable=True)

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ip_address = Column(String(255), nullable=True) # Changed from INET to String for simplicity in model if INET issues arise
    user_agent = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
