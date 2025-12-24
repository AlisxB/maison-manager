from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.occurrences.schemas import OccurrenceRead, OccurrenceCreate, OccurrenceUpdate
from app.occurrences.service import OccurrenceService

router = APIRouter()

@router.get("/", response_model=List[OccurrenceRead])
async def list_occurrences(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = OccurrenceService(db)
    return await service.list_occurrences(current_user.user_id, current_user.role, current_user.condo_id)

@router.post("/", response_model=OccurrenceRead)
async def create_occurrence(
    data: OccurrenceCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = OccurrenceService(db)
    return await service.create_occurrence(data, current_user.user_id, current_user.condo_id)

@router.put("/{id}", response_model=OccurrenceRead)
async def update_occurrence(
    id: UUID,
    data: OccurrenceUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = OccurrenceService(db)
    return await service.update_occurrence(id, data, current_user.role, current_user.condo_id)
