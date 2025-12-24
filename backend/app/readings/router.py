from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.readings.schemas import (
    WaterReadingCreate, WaterReadingRead, WaterReadingUpdate,
    GasReadingCreate, GasReadingRead,
    ElectricityReadingCreate, ElectricityReadingRead
)
from app.readings.service import ReadingService

router = APIRouter()

@router.get("/water", response_model=List[WaterReadingRead])
async def list_water(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.list_water(current_user.role, current_user.condo_id)

@router.post("/water", response_model=WaterReadingRead)
async def create_water(
    data: WaterReadingCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.create_water(data, current_user.role, current_user.condo_id)

@router.put("/water/{id}", response_model=WaterReadingRead)
async def update_water(
    id: UUID,
    data: WaterReadingUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.update_water(id, data, current_user.role, current_user.condo_id)

@router.delete("/water/{id}")
async def delete_water(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    await service.delete_water(id, current_user.role, current_user.condo_id)
    return {"message": "Delted"}

@router.get("/gas", response_model=List[GasReadingRead])
async def list_gas(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.list_gas(current_user.role, current_user.condo_id)

@router.post("/gas", response_model=GasReadingRead)
async def create_gas(
    data: GasReadingCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.create_gas(data, current_user.role, current_user.condo_id)

@router.get("/electricity", response_model=List[ElectricityReadingRead])
async def list_electricity(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.list_electricity(current_user.role, current_user.condo_id)

@router.post("/electricity", response_model=ElectricityReadingRead)
async def create_electricity(
    data: ElectricityReadingCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = ReadingService(db)
    return await service.create_electricity(data, current_user.role, current_user.condo_id)
