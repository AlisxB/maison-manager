from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.announcements.models import Announcement
from uuid import UUID

class AnnouncementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, announcement: Announcement) -> Announcement:
        self.db.add(announcement)
        return announcement

    async def get_all(self, condo_id: UUID) -> List[Announcement]:
        query = select(Announcement).where(Announcement.condominium_id == condo_id).order_by(desc(Announcement.created_at))
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_id(self, id: UUID, condo_id: UUID) -> Announcement:
        result = await self.db.execute(select(Announcement).where(Announcement.id == id, Announcement.condominium_id == condo_id))
        return result.scalar_one_or_none()
        
    async def delete(self, announcement: Announcement) -> None:
        await self.db.delete(announcement)
