from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core import deps
from app.models.all import Occurrence
from app.schemas.occurrence import OccurrenceCreate, OccurrenceRead, OccurrenceUpdate
from app.core.security import get_password_hash # Not needed here but good import checks

router = APIRouter()

@router.get("/", response_model=List[OccurrenceRead])
async def read_occurrences(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    skip: int = 0,
    limit: int = 100
):
    """
    List occurrences.
    RLS Policy:
    - Admin: Sees all (for current condo).
    - Resident: Sees own.
    """
    query = select(Occurrence).order_by(Occurrence.created_at.desc())
    
    # Explicit Application-Level Security (Defense in Depth)
    # Even if RLS is on, we filter here to be 100% sure.
    if current_user.role == 'RESIDENT':
        query = query.where(Occurrence.user_id == current_user.user_id)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=OccurrenceRead)
async def create_occurrence(
    occurrence: OccurrenceCreate,
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(deps.get_db)]
):
    """
    Report a new issue.
    """
    db_obj = Occurrence(
        condominium_id=current_user.condo_id,
        user_id=current_user.user_id,
        **occurrence.dict()
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.patch("/{id}", response_model=OccurrenceRead)
async def update_occurrence(
    id: str,
    occurrence_update: OccurrenceUpdate,
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(deps.get_db)]
):
    """
    Update occurrence status/response.
    Normally Admin only for Status/Response.
    RLS Policy handles permission check essentially, but we add role check for safety if modifying restricted fields.
    """
    stmt = select(Occurrence).where(Occurrence.id == id)
    result = await db.execute(stmt)
    db_obj = result.scalar_one_or_none()
    
    if not db_obj:
        raise HTTPException(status_code=404, detail="Occurrence not found")

    # If updating status or admin_response, must be ADMIN
    if (occurrence_update.status or occurrence_update.admin_response) and current_user.role != 'ADMIN':
         raise HTTPException(status_code=403, detail="Only admins can update status or response")

    update_data = occurrence_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_obj, key, value)
        
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
