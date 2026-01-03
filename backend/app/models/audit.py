from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)  # INSERT, UPDATE, DELETE, LOGIN
    table_name = Column(String, nullable=False)
    record_id = Column(String, nullable=False)
    old_data = Column(JSON, nullable=True)
    new_data = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=True)

    # Relationships
    actor = relationship("User", foreign_keys=[actor_id])
    condominium = relationship("Condominium", foreign_keys=[condominium_id])
