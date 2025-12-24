from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload
from app.occurrences.models import Occurrence
from app.users.models import User
from uuid import UUID

class OccurrenceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, occurrence: Occurrence) -> Occurrence:
        self.db.add(occurrence)
        return occurrence

    async def get_all(self, condo_id: UUID, user_id: Optional[UUID] = None) -> List[Occurrence]:
        query = select(Occurrence).where(Occurrence.condominium_id == condo_id)
        
        if user_id:
            query = query.where(Occurrence.user_id == user_id)
            
        query = query.order_by(desc(Occurrence.created_at)).options(joinedload(Occurrence.user))
        
        result = await self.db.execute(query)
        occurrences = result.scalars().all()
        
        # Handle Anonymous logic here or in Service? Service usually.
        # But if we return models, service can scrub them.
        return occurrences

    async def get_by_id(self, id: UUID, condo_id: UUID) -> Optional[Occurrence]:
        query = select(Occurrence).where(Occurrence.id == id, Occurrence.condominium_id == condo_id).options(joinedload(Occurrence.user))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
