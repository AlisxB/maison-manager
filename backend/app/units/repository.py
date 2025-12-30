from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.units.models import Unit, Condominium
from uuid import UUID

class UnitRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, condo_id: UUID) -> List[Unit]:
        # Enforce RLS by condo_id manually as well for safety
        query = select(Unit).where(Unit.condominium_id == condo_id).order_by(Unit.block, Unit.number)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create(self, unit: Unit) -> Unit:
        self.db.add(unit)
        return unit

    async def get_by_id(self, unit_id: UUID) -> Optional[Unit]:
        query = select(Unit).where(Unit.id == unit_id)
        result = await self.db.execute(query)
        return result.scalars().first()
