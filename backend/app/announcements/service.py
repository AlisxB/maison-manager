from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.announcements.repository import AnnouncementRepository
from app.announcements.schemas import AnnouncementCreate, AnnouncementUpdate
from app.announcements.models import Announcement

class AnnouncementService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AnnouncementRepository(db)

    async def list_announcements(self, condo_id: UUID) -> List[Announcement]:
        return await self.repo.get_all(condo_id)

    async def create_announcement(self, data: AnnouncementCreate, role: str, condo_id: UUID) -> Announcement:
        if role != 'ADMIN':
             raise HTTPException(status_code=403, detail="Not authorized")
             
        announcement = Announcement(
            condominium_id=condo_id,
            **data.model_dump()
        )
        await self.repo.create(announcement)
        await self.db.commit()
        await self.db.refresh(announcement)
        return announcement

    async def update_announcement(self, id: UUID, data: AnnouncementUpdate, role: str, condo_id: UUID) -> Announcement:
        if role != 'ADMIN':
             raise HTTPException(status_code=403, detail="Not authorized")
             
        announcement = await self.repo.get_by_id(id, condo_id)
        if not announcement:
             raise HTTPException(status_code=404, detail="Announcement not found")
             
        if data.title: announcement.title = data.title
        if data.description: announcement.description = data.description
        if data.type: announcement.type = data.type
        if data.target_audience: announcement.target_audience = data.target_audience
        
        await self.db.commit()
        await self.db.refresh(announcement)
        return announcement

    async def delete_announcement(self, id: UUID, role: str, condo_id: UUID) -> None:
        if role != 'ADMIN':
             raise HTTPException(status_code=403, detail="Not authorized")
             
        announcement = await self.repo.get_by_id(id, condo_id)
        if not announcement:
             raise HTTPException(status_code=404, detail="Announcement not found")
             
        await self.repo.delete(announcement)
        await self.db.commit()
