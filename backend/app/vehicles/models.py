from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    model = Column(String(100), nullable=False)
    color = Column(String(50))
    plate = Column(String(10), nullable=False)
    
    user = relationship("User", back_populates="vehicles")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
