from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Integer, text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

# Helper for UUID PKs
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    unit = Column(String(20), nullable=False)
    min_quantity = Column(Integer, default=5)
    location = Column(String(100))
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
