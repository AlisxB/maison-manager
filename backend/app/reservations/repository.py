from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from sqlalchemy.orm import joinedload
from app.reservations.models import Reservation, CommonArea
from uuid import UUID
from datetime import datetime

class ReservationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Common Area CRUD
    async def get_common_areas(self, condo_id: UUID) -> List[CommonArea]:
        result = await self.db.execute(select(CommonArea).where(CommonArea.condominium_id == condo_id))
        return result.scalars().all()
        
    async def create_common_area(self, area: CommonArea) -> CommonArea:
        self.db.add(area)
        return area
        
    async def get_area_by_id(self, id: UUID, condo_id: UUID) -> Optional[CommonArea]:
        result = await self.db.execute(select(CommonArea).where(CommonArea.id == id, CommonArea.condominium_id == condo_id))
        return result.scalar_one_or_none()

    async def delete_area(self, area: CommonArea) -> None:
        await self.db.delete(area)

    # Reservation CRUD
    async def create_reservation(self, res: Reservation) -> Reservation:
        self.db.add(res)
        return res
        
    async def get_reservations(self, condo_id: UUID, user_id: Optional[UUID] = None) -> List[Reservation]:
        query = select(Reservation).where(Reservation.condominium_id == condo_id)
        if user_id:
            query = query.where(Reservation.user_id == user_id)
        query = query.options(joinedload(Reservation.user), joinedload(Reservation.common_area)).order_by(desc(Reservation.start_time))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_reservation_by_id(self, id: UUID, condo_id: UUID) -> Optional[Reservation]:
        query = select(Reservation).where(Reservation.id == id, Reservation.condominium_id == condo_id)
        query = query.options(joinedload(Reservation.user), joinedload(Reservation.common_area))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
        
    async def check_overlap(self, area_id: UUID, start: datetime, end: datetime) -> bool:
        # Check if any reservation overlaps
        # (StartA <= EndB) and (EndA >= StartB)
        query = select(Reservation).where(
            Reservation.common_area_id == area_id,
            Reservation.status.not_in(['REJEITADO', 'CANCELADO']), # Don't block rejected or cancelled
            Reservation.start_time < end,
            Reservation.end_time > start
        )
        result = await self.db.execute(query)
        return result.first() is not None
