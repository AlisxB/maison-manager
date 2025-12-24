from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.units.repository import UnitRepository
from app.units.schemas import UnitCreate
from app.units.models import Unit

class UnitService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UnitRepository(db)

    async def get_units(self, condo_id: UUID) -> List[Unit]:
        return await self.repo.get_all(condo_id)

    async def create_unit(self, unit_in: UnitCreate, current_user_role: str, condo_id: UUID) -> Unit:
        if current_user_role != 'ADMIN':
            raise HTTPException(status_code=403, detail="Not authorized")
            
        unit = Unit(
            condominium_id=condo_id,
            block=unit_in.block,
            number=unit_in.number,
            type=unit_in.type
        )
        
        await self.repo.create(unit)
        try:
            await self.db.commit()
            await self.db.refresh(unit)
            return unit
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))
