from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core import deps
from app.models.all import Reservation
from app.schemas.common import ReservationRead, ReservationCreate

router = APIRouter()

@router.get("/", response_model=List[ReservationRead])
async def read_reservations(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    skip: int = 0,
    limit: int = 100
):
    """
    Listar reservas.
    RLS Policy:
    - Admin: Vê todas do condomínio.
    - Resident: Vê apenas as próprias.
    """
    result = await db.execute(select(Reservation).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=ReservationRead)
async def create_reservation(
    res_in: ReservationCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Criar reserva.
    """
    db_res = Reservation(
        condominium_id=current_user.condo_id,
        user_id=current_user.user_id, # Backend forçando o dono como o usuário atual
        common_area_id=res_in.common_area_id,
        start_time=res_in.start_time,
        end_time=res_in.end_time,
        status="PENDING"
    )
    db.add(db_res)
    await db.commit()
    await db.refresh(db_res)
    return db_res
