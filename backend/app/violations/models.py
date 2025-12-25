from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, Numeric, func, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid
from datetime import datetime

class Bylaw(Base):
    __tablename__ = "bylaws"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    condominium_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("condominiums.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Violation(Base):
    __tablename__ = "violations"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    condominium_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("condominiums.id"), nullable=False)
    resident_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    bylaw_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bylaws.id"), nullable=True)
    
    bylaw = relationship("Bylaw")
    
    type: Mapped[str] = mapped_column(String(50), nullable=False) # 'ADVERTENCIA', 'MULTA'
    status: Mapped[str] = mapped_column(String(50), default='ABERTO') # 'ABERTO', 'PAGO', 'RECORRIDO', 'RESOLVIDO'
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
