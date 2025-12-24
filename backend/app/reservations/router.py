from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.reservations.schemas import (
    ReservationRead, ReservationCreate, ReservationUpdate,
    CommonAreaRead, CommonAreaCreate
)
from app.reservations.service import ReservationService

router = APIRouter()
area_router = APIRouter() # Separate router for common areas if desired, but can merge.

# --- Common Areas ---
@router.get("/areas", response_model=List[CommonAreaRead])
async def list_areas(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReservationService(db)
    return await service.list_areas(current_user.condo_id)

@router.post("/areas", response_model=CommonAreaRead)
async def create_area(
    data: CommonAreaCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReservationService(db)
    return await service.create_area(data, current_user.role, current_user.condo_id)
    
@router.delete("/areas/{id}")
async def delete_area(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReservationService(db)
    await service.delete_area(id, current_user.role, current_user.condo_id)
    return {"message": "Deleted"}

# --- Reservations ---
@router.get("/", response_model=List[ReservationRead])
async def list_reservations(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReservationService(db)
    return await service.list_reservations(current_user.user_id, current_user.role, current_user.condo_id)

@router.post("/", response_model=ReservationRead)
async def create_reservation(
    data: ReservationCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReservationService(db)
    return await service.create_reservation(data, current_user.user_id, current_user.role, current_user.condo_id)

@router.patch("/{id}", response_model=ReservationRead)
async def update_reservation(
    id: UUID,
    data: ReservationUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReservationService(db)
    return await service.update_reservation(id, data, current_user.user_id, current_user.role, current_user.condo_id)
