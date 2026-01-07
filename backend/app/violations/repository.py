from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload
from app.violations.models import Violation, Bylaw
from uuid import UUID

class ViolationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, violation: Violation) -> Violation:
        self.db.add(violation)
        return violation

    async def get_all(self, condo_id: UUID, user_id: Optional[UUID] = None, type_filter: Optional[str] = None) -> List[Violation]:
        query = select(Violation).options(joinedload(Violation.bylaw)).where(Violation.condominium_id == condo_id)
        if user_id:
            query = query.where(Violation.resident_id == user_id)
        if type_filter:
            query = query.where(Violation.type == type_filter)
            
        query = query.order_by(desc(Violation.created_at))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, id: UUID, condo_id: UUID) -> Optional[Violation]:
        query = select(Violation).options(joinedload(Violation.bylaw)).where(Violation.id == id, Violation.condominium_id == condo_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def delete(self, violation: Violation) -> None:
        await self.db.delete(violation)

    async def get_bylaws(self, condo_id: UUID, category: Optional[str] = None) -> List[Bylaw]:
        query = select(Bylaw).where(Bylaw.condominium_id == condo_id)
        if category:
            query = query.where(Bylaw.category == category)
        result = await self.db.execute(query)
        return result.scalars().all()
