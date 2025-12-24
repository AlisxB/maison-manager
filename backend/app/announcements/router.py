from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.announcements.schemas import AnnouncementRead, AnnouncementCreate, AnnouncementUpdate
from app.announcements.service import AnnouncementService

router = APIRouter()

@router.get("/", response_model=List[AnnouncementRead])
async def list_announcements(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = AnnouncementService(db)
    return await service.list_announcements(current_user.condo_id)

@router.post("/", response_model=AnnouncementRead)
async def create_announcement(
    data: AnnouncementCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = AnnouncementService(db)
    return await service.create_announcement(data, current_user.role, current_user.condo_id)

@router.put("/{id}", response_model=AnnouncementRead)
async def update_announcement(
    id: UUID,
    data: AnnouncementUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = AnnouncementService(db)
    return await service.update_announcement(id, data, current_user.role, current_user.condo_id)

@router.delete("/{id}")
async def delete_announcement(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = AnnouncementService(db)
    await service.delete_announcement(id, current_user.role, current_user.condo_id)
    return {"message": "Deleted"}
