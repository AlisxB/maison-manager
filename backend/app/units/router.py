from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.units.schemas import UnitRead, UnitCreate
from app.units.service import UnitService

router = APIRouter()

@router.get("/", response_model=List[UnitRead])
async def read_units(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    skip: int = 0,
    limit: int = 100
):
    service = UnitService(db)
    return await service.get_units(current_user.condo_id)

@router.post("/", response_model=UnitRead)
async def create_unit(
    unit_in: UnitCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = UnitService(db)
    return await service.create_unit(unit_in, current_user.role, current_user.condo_id)
