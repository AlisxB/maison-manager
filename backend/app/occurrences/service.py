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
        # Residents see own, Allowed Management roles see all.
        # Others (Financeiro, Conselho) should NOT see all occurrences.
        
        allowed_view_all = ['ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO']
        
        if role == 'RESIDENTE':
            filter_user = user_id
        elif role in allowed_view_all:
            filter_user = None
        else:
             # Example: Financeiro/Conselho trying to list occurrences.
             # Option A: Return empty list
             # Option B: Raise 403
             # Going with empty list (or own if they are also residents? Usually separate roles in this system).
             # Let's assume strict RBAC for now as requested "Only... can see".
             raise HTTPException(status_code=403, detail="Not authorized to view occurrences.")

        occurrences = await self.repo.get_all(condo_id, filter_user)
        
        # Anonymization Logic
        for occ in occurrences:
             if occ.is_anonymous and role == 'RESIDENTE' and str(occ.user_id) != str(user_id):
                  occ.user = None
        return occurrences

    async def create_occurrence(self, data: OccurrenceCreate, user_id: UUID, condo_id: UUID) -> Occurrence:
        occurrence = Occurrence(
            condominium_id=condo_id,
            user_id=user_id,
            **data.model_dump()
        )
        await self.repo.create(occurrence)
        await self.db.commit()
        # Return re-fetched object with relationships loaded
        return await self.repo.get_by_id(occurrence.id, condo_id)

    async def update_occurrence(self, id: UUID, data: OccurrenceUpdate, role: str, condo_id: UUID) -> Occurrence:
        if role not in ['ADMIN', 'SINDICO', 'SUBSINDICO', 'PORTEIRO']:
             raise HTTPException(status_code=403, detail="Only management roles (Admin, Sindico, Porteiro) can update occurrences.")
             
        occ = await self.repo.get_by_id(id, condo_id)
        if not occ:
             raise HTTPException(status_code=404, detail="Not found")
             
        if data.status: occ.status = data.status
        if data.admin_response: occ.admin_response = data.admin_response
        
        await self.db.commit()
        await self.db.refresh(occ)
        return occ
