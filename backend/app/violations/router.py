from typing import Annotated, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.violations.schemas import ViolationRead, ViolationCreate, ViolationUpdate, BylawRead
from app.violations.service import ViolationService

router = APIRouter()

@router.get("/", response_model=List[ViolationRead])
async def list_violations(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    resident_id: Optional[UUID] = None,
    type: Optional[str] = None
):
    service = ViolationService(db)
    return await service.list_violations(current_user.user_id, current_user.role, current_user.condo_id, resident_id, type)

@router.post("/", response_model=ViolationRead)
async def create_violation(
    data: ViolationCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ViolationService(db)
    return await service.create_violation(data, current_user.role, current_user.condo_id)

@router.put("/{id}", response_model=ViolationRead)
async def update_violation(
    id: UUID,
    data: ViolationUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ViolationService(db)
    return await service.update_violation(id, data, current_user.role, current_user.condo_id)

@router.delete("/{id}")
async def delete_violation(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ViolationService(db)
    await service.delete_violation(id, current_user.role, current_user.condo_id)
    return {"message": "Deleted"}

@router.get("/bylaws", response_model=List[BylawRead])
async def list_bylaws(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    category: Optional[str] = None
):
    service = ViolationService(db)
    return await service.list_bylaws(category, current_user.condo_id)
