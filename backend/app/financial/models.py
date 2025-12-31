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

class FinancialShare(Base):
    __tablename__ = "financial_shares"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    token = Column(String(64), unique=True, nullable=False)
    target_month = Column(DECIMAL(2,0), nullable=False) # or simple Integer
    target_year = Column(DECIMAL(4,0), nullable=False)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
