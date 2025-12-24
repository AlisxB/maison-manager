from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, Boolean, text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import datetime

class Occurrence(Base):
    __tablename__ = "occurrences"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    condominium_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("condominiums.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # 'Manutenção', 'Barulho', 'Segurança', 'Outro'
    status: Mapped[str] = mapped_column(String(50), default='ABERTO') # 'ABERTO', 'EM ANDAMENTO', 'RESOLVIDO', 'FECHADO'
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    
    admin_response: Mapped[str] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
