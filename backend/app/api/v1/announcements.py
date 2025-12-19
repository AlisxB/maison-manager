
from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core import deps
from app.models.all import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead

router = APIRouter()

@router.get("/", response_model=List[AnnouncementRead])
async def read_announcements(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    skip: int = 0,
    limit: int = 100
):
    """
    List announcements.
    RLS handles visibility (Admin/Resident).
    """
    result = await db.execute(select(Announcement).order_by(Announcement.created_at.desc()).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=AnnouncementRead)
async def create_announcement(
    announcement: AnnouncementCreate,
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(deps.get_db)]
):
    """
    Create announcement. Admin Only.
    """
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Only admins can create announcements")

    db_obj = Announcement(
        condominium_id=current_user.condo_id,
        **announcement.dict()
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    id: str,
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(deps.get_db)]
):
    """
    Delete announcement. Admin Only.
    """
    if current_user.role != 'ADMIN':
         raise HTTPException(status_code=403, detail="Only admins can delete announcements")
    
    stmt = select(Announcement).where(Announcement.id == id)
    result = await db.execute(stmt)
    db_obj = result.scalar_one_or_none()
    
    if not db_obj:
        raise HTTPException(status_code=404, detail="Announcement not found")
        
    await db.delete(db_obj)
    await db.commit()
    return None
