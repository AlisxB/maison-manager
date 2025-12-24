from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, DECIMAL, text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

# Helper for UUID PKs
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Transaction(Base):
    __tablename__ = "transactions"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    
    type = Column(String(20), nullable=False) # income, expense
    description = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    category = Column(String(50))
    date = Column(TIMESTAMP(timezone=True), nullable=False)
    status = Column(String(20), default='PAGO')
    observation = Column(Text)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
