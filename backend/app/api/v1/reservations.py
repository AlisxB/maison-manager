from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core import deps
from app.models.all import Reservation
from app.schemas.common import ReservationRead, ReservationCreate, ReservationUpdate
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[ReservationRead])
async def read_reservations(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    skip: int = 0,
    limit: int = 100
):
    """
    Listar reservas.
    RLS Policy:
    - Admin: Vê todas do condomínio.
    - Resident: Vê apenas as próprias.
    """
    stmt = select(Reservation).where(Reservation.condominium_id == current_user.condo_id)
    if current_user.role != 'ADMIN':
        stmt = stmt.where(Reservation.user_id == current_user.user_id)
    
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
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
    # Determine Owner
    owner_id = current_user.user_id
    if current_user.role == 'ADMIN' and res_in.user_id:
        owner_id = res_in.user_id
        
    # Check for overlaps
    # Logic: (StartA < EndB) and (EndA > StartB)
    existing_q = select(Reservation).where(
        Reservation.common_area_id == res_in.common_area_id,
        Reservation.status.in_(['PENDING', 'CONFIRMED']),
        Reservation.start_time < res_in.end_time,
        Reservation.end_time > res_in.start_time
    )
    existing = await db.execute(existing_q)
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Conflict: This time slot is already reserved.")


    # Status Logic (only Admin can set status != PENDING)
    initial_status = "PENDING"
    if current_user.role == 'ADMIN' and res_in.status:
        initial_status = res_in.status

    db_res = Reservation(
        condominium_id=current_user.condo_id,
        user_id=owner_id,
        common_area_id=res_in.common_area_id,
        start_time=res_in.start_time,
        end_time=res_in.end_time,
        status=initial_status,
        reason=res_in.reason
    )
    db.add(db_res)
    await db.commit()
    await db.refresh(db_res)
    return db_res

@router.patch("/{reservation_id}", response_model=ReservationRead)
async def update_reservation_status(
    reservation_id: UUID,
    res_update: ReservationUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Atualizar status da reserva (Aprovar/Recusar/Cancelar).
    Apenas Admin ou o próprio usuário (para cancelar) podem fazer isso.
    """
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id))
    db_res = result.scalars().first()
    
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    print(f"DEBUG: User Role: {current_user.role}")
    print(f"DEBUG: Req Status: {res_update.status}")
    print(f"DEBUG: Owner: {db_res.user_id} (Type: {type(db_res.user_id)})")
    print(f"DEBUG: Current: {current_user.user_id} (Type: {type(current_user.user_id)})")

    # Permission Check
    # Ensure comparison is string vs string
    if current_user.role != 'ADMIN' and str(db_res.user_id) != str(current_user.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Logic: Owner can only CANCEL. Admin can CONFIRM/REJECT.
    if current_user.role != 'ADMIN' and res_update.status != 'CANCELLED':
         raise HTTPException(status_code=403, detail="Residents can only cancel their own reservations")
         
    db_res.status = res_update.status
    await db.commit()
    await db.refresh(db_res)
    return db_res
