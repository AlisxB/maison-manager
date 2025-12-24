from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.reservations.repository import ReservationRepository
from app.reservations.schemas import (
    ReservationCreate, ReservationUpdate,
    CommonAreaCreate
)
from app.reservations.models import Reservation, CommonArea

class ReservationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReservationRepository(db)

    # Common Areas
    async def list_areas(self, condo_id: UUID) -> List[CommonArea]:
        return await self.repo.get_common_areas(condo_id)

    async def create_area(self, data: CommonAreaCreate, role: str, condo_id: UUID) -> CommonArea:
        if role != 'ADMIN': raise HTTPException(status_code=403, detail="Not authorized")
        area = CommonArea(condominium_id=condo_id, **data.model_dump())
        await self.repo.create_common_area(area)
        await self.db.commit()
        await self.db.refresh(area)
        return area
    
    async def delete_area(self, id: UUID, role: str, condo_id: UUID) -> None:
        if role != 'ADMIN': raise HTTPException(status_code=403, detail="Not authorized")
        area = await self.repo.get_area_by_id(id, condo_id)
        if not area: raise HTTPException(status_code=404, detail="Area not found")
        await self.repo.delete_area(area)
        await self.db.commit()

    # Reservations
    async def list_reservations(self, user_id: UUID, role: str, condo_id: UUID) -> List[Reservation]:
        filter_user = user_id if role == 'RESIDENTE' else None
        return await self.repo.get_reservations(condo_id, filter_user)

    async def create_reservation(self, data: ReservationCreate, user_id: UUID, role: str, condo_id: UUID) -> Reservation:
        # 1. Validate Area restrictions (min/max time, capacity) -> Skipped for brevity, focusing on structure
        
        # 2. Check overlap
        overlap = await self.repo.check_overlap(data.common_area_id, data.start_time, data.end_time)
        if overlap:
             raise HTTPException(status_code=409, detail="Horário indisponível.")
             
        initial_status = 'PENDENTE'
        if role == 'ADMIN' and data.status:
             initial_status = data.status
             
        res = Reservation(
            condominium_id=condo_id,
            user_id=user_id,
            status=initial_status,
            **data.model_dump(exclude={'user_id', 'status'})
        )
        await self.repo.create_reservation(res)
        await self.db.commit()
        # Fetch with relationships for Pydantic response
        return await self.repo.get_reservation_by_id(res.id, condo_id)

    async def update_reservation(self, id: UUID, data: ReservationUpdate, user_id: UUID, role: str, condo_id: UUID) -> Reservation:
        # Fetch first to check ownership
        res = await self.repo.get_reservation_by_id(id, condo_id)
        if not res:
             raise HTTPException(status_code=404, detail="Not found")

        # Permission Check
        is_owner = (res.user_id == user_id)
        is_admin = (role == 'ADMIN')
        
        # Admin can do anything. Resident can ONLY cancel their own.
        if not is_admin:
            if not is_owner:
                raise HTTPException(status_code=403, detail="Not authorized")
            if data.status != 'CANCELADO':
                raise HTTPException(status_code=403, detail="Residents can only cancel reservations")
             
        if data.status: res.status = data.status
        
        await self.db.commit()
        # Fetch status change with relationships
        return await self.repo.get_reservation_by_id(res.id, condo_id)
