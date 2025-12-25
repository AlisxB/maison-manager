from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.occurrences.repository import OccurrenceRepository
from app.occurrences.schemas import OccurrenceCreate, OccurrenceUpdate
from app.occurrences.models import Occurrence

class OccurrenceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = OccurrenceRepository(db)

    async def list_occurrences(self, user_id: UUID, role: str, condo_id: UUID) -> List[Occurrence]:
        # Residents see own, Admin sees all
        filter_user = user_id if role == 'RESIDENTE' else None
        occurrences = await self.repo.get_all(condo_id, filter_user)
        
        # Anonymization Logic
        for occ in occurrences:
             if occ.is_anonymous and role == 'RESIDENTE' and str(occ.user_id) != str(user_id):
                  # Should not happen as residents only see own, but if logic changes:
                  occ.user = None
             elif occ.is_anonymous and role != 'RESIDENTE':
                  # Admins see content but name is hidden? Or full anonymous?
                  # Rules say "Anonymous". So Admin shouldn't know who sent it if truly anonymous?
                  # Usually Admin sees it's anonymous, user relation might be kept for DB integrity but hidden in response.
                  pass
                  
        return occurrences

    async def create_occurrence(self, data: OccurrenceCreate, user_id: UUID, condo_id: UUID) -> Occurrence:
        occurrence = Occurrence(
            condominium_id=condo_id,
            user_id=user_id,
            **data.model_dump()
        )
        await self.repo.create(occurrence)
        await self.db.commit()
        # Return re-fetched object with relationships loaded to avoid MissingGreenlet error in Pydantic
        return await self.repo.get_by_id(occurrence.id, condo_id)

    async def update_occurrence(self, id: UUID, data: OccurrenceUpdate, role: str, condo_id: UUID) -> Occurrence:
        if role != 'ADMIN':
             raise HTTPException(status_code=403, detail="Only admins can update occurrences (respond/status).")
             
        occ = await self.repo.get_by_id(id, condo_id)
        if not occ:
             raise HTTPException(status_code=404, detail="Not found")
             
        if data.status: occ.status = data.status
        if data.admin_response: occ.admin_response = data.admin_response
        
        await self.db.commit()
        await self.db.refresh(occ)
        return occ
