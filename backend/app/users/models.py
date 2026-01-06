from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, text
from sqlalchemy.dialects.postgresql import UUID, INET
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
    occupation_history = relationship("OccupationHistory", back_populates="user", cascade="all, delete-orphan")
    
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

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = uuid_pk()
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(64), nullable=False, index=True)
    family_id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("refresh_tokens.id"), nullable=True)
    
    device_info = Column(Text, nullable=True)
    ip_address = Column(INET, nullable=True)
    
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    revoked_at = Column(TIMESTAMP(timezone=True), nullable=True)
    replaced_by = Column(UUID(as_uuid=True), ForeignKey("refresh_tokens.id"), nullable=True)

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ip_address = Column(INET, nullable=True) 
    user_agent = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class OccupationHistory(Base):
    __tablename__ = "occupation_history"
    
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    
    profile_type = Column(String(50), nullable=False) # PROPRIETARIO, INQUILINO
    
    start_date = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    end_date = Column(TIMESTAMP(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="occupation_history")
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
