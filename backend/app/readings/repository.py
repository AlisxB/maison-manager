from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from sqlalchemy.orm import joinedload
from app.readings.models import ReadingWater, ReadingGas, ReadingElectricity
from uuid import UUID

class ReadingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_water(self, reading: ReadingWater) -> ReadingWater:
        self.db.add(reading)
        return reading
        
    async def create_gas(self, reading: ReadingGas) -> ReadingGas:
        self.db.add(reading)
        return reading

    async def create_electricity(self, reading: ReadingElectricity) -> ReadingElectricity:
        self.db.add(reading)
        return reading

    async def get_water(self, condo_id: UUID) -> List[ReadingWater]:
        query = select(ReadingWater).where(ReadingWater.condominium_id == condo_id).order_by(desc(ReadingWater.reading_date))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_gas(self, condo_id: UUID) -> List[ReadingGas]:
        query = select(ReadingGas).where(ReadingGas.condominium_id == condo_id).order_by(desc(ReadingGas.created_at))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_electricity(self, condo_id: UUID) -> List[ReadingElectricity]:
        query = select(ReadingElectricity).where(ReadingElectricity.condominium_id == condo_id).order_by(desc(ReadingElectricity.created_at))
        result = await self.db.execute(query)
        return result.scalars().all()
        
    async def delete_water(self, reading_id: UUID, condo_id: UUID) -> None:
        await self.db.execute(delete(ReadingWater).where(ReadingWater.id == reading_id, ReadingWater.condominium_id == condo_id))
        
    async def get_water_by_id(self, reading_id: UUID, condo_id: UUID) -> Optional[ReadingWater]:
        result = await self.db.execute(select(ReadingWater).where(ReadingWater.id == reading_id, ReadingWater.condominium_id == condo_id))
        return result.scalar_one_or_none()
