from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

# Helper for UUID PKs
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Condominium(Base):
    __tablename__ = "condominiums"
    
    id = uuid_pk()
    name = Column(String(255), nullable=False)
    sidebar_title = Column(String(255))
    login_title = Column(String(255))
    # Encrypted fields
    cnpj_encrypted = Column(Text, nullable=False)
    cnpj_hash = Column(String(64), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class Unit(Base):
    __tablename__ = "units"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    block = Column(String(50))
    number = Column(String(20), nullable=False)
    type = Column(String(20), default="Apartamento")
