from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core import deps
from app.models.all import CommonArea
from app.schemas.common import CommonAreaRead, CommonAreaCreate

router = APIRouter()

@router.get("/", response_model=List[CommonAreaRead])
async def read_common_areas(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    skip: int = 0,
    limit: int = 100
):
    """
    Listar áreas comuns.
    """
    result = await db.execute(select(CommonArea).where(CommonArea.is_active == True).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=CommonAreaRead)
async def create_common_area(
    area_in: CommonAreaCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Criar área comum (Apenas Admin).
    """
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar áreas comuns")

    db_area = CommonArea(
        condominium_id=current_user.condo_id,
        **area_in.model_dump()
    )
    db.add(db_area)
    await db.commit()
    await db.refresh(db_area)
    return db_area
