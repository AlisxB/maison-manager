from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, TIMESTAMP, Text, JSON, DECIMAL, CheckConstraint, text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
from datetime import datetime
# Helper for UUID PKs
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Condominium(Base):
    __tablename__ = "condominiums"
    
    id = uuid_pk()
    name = Column(String(255), nullable=False)
    sidebar_title = Column(String(255))
    login_title = Column(String(255))
    # Encrypted fields are just text to the app, handled by DB/pgcrypto
    cnpj_encrypted = Column(Text, nullable=False)
    cnpj_hash = Column(String(64), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class User(Base):
    __tablename__ = "users"

    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    
    name = Column(String(255), nullable=False)
    email_encrypted = Column(Text, nullable=False)
    email_hash = Column(String(64), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    role = Column(String(20), nullable=False) # ADMIN, RESIDENT, PORTER, FINANCIAL
    profile_type = Column(String(20)) # OWNER, TENANT
    status = Column(String(20), default="PENDING")
    
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

class Unit(Base):
    __tablename__ = "units"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    block = Column(String(50))
    number = Column(String(20), nullable=False)
    type = Column(String(20), default="Apartment")

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

class Pet(Base):
    __tablename__ = "pets"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    breed = Column(String(100))
    
    user = relationship("User", back_populates="pets")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class Reservation(Base):
    __tablename__ = "reservations"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    common_area_id = Column(UUID(as_uuid=True), ForeignKey("common_areas.id"), nullable=False)
    
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=False)
    status = Column(String(20), default="PENDING")
    reason = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class CommonArea(Base):
    __tablename__ = "common_areas"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, default=10)
    price_per_hour = Column(DECIMAL(10, 2), default=0)
    min_booking_hours = Column(Integer, default=1)
    max_booking_hours = Column(Integer, default=4)
    monthly_limit_per_unit = Column(Integer, default=2)
    opening_hours = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class ReadingWater(Base):
    __tablename__ = "readings_water"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=False)
    
    reading_date = Column(TIMESTAMP(timezone=True), nullable=False) # stored as Date in DB, mapped here
    image_url = Column(Text)
    value_m3 = Column(DECIMAL(10, 3), nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class ReadingGas(Base):
    __tablename__ = "readings_gas"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    
    supplier = Column(String(100), nullable=False)
    purchase_date = Column(TIMESTAMP(timezone=True), nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    
    cylinder_1_kg = Column(DECIMAL(10, 2), nullable=False)
    cylinder_2_kg = Column(DECIMAL(10, 2), nullable=False)
    cylinder_3_kg = Column(DECIMAL(10, 2), nullable=False)
    cylinder_4_kg = Column(DECIMAL(10, 2), nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class ReadingElectricity(Base):
    __tablename__ = "readings_electricity"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    
    due_date = Column(TIMESTAMP(timezone=True), nullable=False)
    consumption_kwh = Column(DECIMAL(10, 2), nullable=False)
    total_value = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(20), default='PENDING')
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

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

class Transaction(Base):
    __tablename__ = "transactions"
    id = uuid_pk()
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    
    type = Column(String(20), nullable=False) # income, expense
    description = Column(String(255), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    category = Column(String(50))
    date = Column(TIMESTAMP(timezone=True), nullable=False) # Store as date content in timestamp col or just Date type? DB says DATE. SQLAlchemy Date maps to python date.
    status = Column(String(20), default='paid')
    observation = Column(Text)
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

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
    type: Mapped[str] = mapped_column(String(50), nullable=False) # 'WARNING', 'FINE'
    status: Mapped[str] = mapped_column(String(50), default='OPEN') # 'OPEN', 'PAID', 'APPEALED', 'RESOLVED'
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Occurrence(Base):
    __tablename__ = "occurrences"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    condominium_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("condominiums.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # 'Maintenance', 'Noise', 'Security', 'Other'
    status: Mapped[str] = mapped_column(String(50), default='OPEN') # 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    
    admin_response: Mapped[str] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Announcement(Base):
    __tablename__ = "announcements"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    condominium_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("condominiums.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_audience: Mapped[str] = mapped_column(String(100), default="Todos os moradores")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    condominium_id = Column(UUID(as_uuid=True), ForeignKey("condominiums.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
