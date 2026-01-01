from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.violations.repository import ViolationRepository
from app.violations.schemas import ViolationCreate, ViolationUpdate
from app.violations.models import Violation, Bylaw

class ViolationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ViolationRepository(db)

    async def list_violations(self, user_id: UUID, role: str, condo_id: UUID) -> List[Violation]:
        filter_user = user_id if role == 'RESIDENTE' else None
        return await self.repo.get_all(condo_id, filter_user)

    async def create_violation(self, data: ViolationCreate, role: str, condo_id: UUID) -> Violation:
        if role not in ['ADMIN', 'SINDICO']:
            raise HTTPException(status_code=403, detail="Not authorized")
             
        violation = Violation(
            condominium_id=condo_id,
            **data.model_dump()
        )
        # Ensure Status matches default
        if not violation.status:
            violation.status = 'ABERTO'
            
        await self.repo.create(violation)
        
        # Integration with Financial (Create Fine) can be added here
        # if violation.type == 'MULTA' and violation.amount > 0: ...
        
        await self.db.commit()
        # Fetch the created violation again to ensure relationships (bylaw) are loaded
        return await self.repo.get_by_id(violation.id, condo_id)

    async def update_violation(self, id: UUID, data: ViolationUpdate, role: str, condo_id: UUID) -> Violation:
        if role not in ['ADMIN', 'SINDICO']:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        v = await self.repo.get_by_id(id, condo_id)
        if not v:
            raise HTTPException(status_code=404, detail="Not found")
            
        for k, val in data.model_dump(exclude_unset=True).items():
            setattr(v, k, val)
            
        await self.db.commit()
        # Re-fetch to ensure relationships are up-to-date and loaded
        return await self.repo.get_by_id(v.id, condo_id)

    async def delete_violation(self, id: UUID, role: str, condo_id: UUID) -> None:
        if role not in ['ADMIN', 'SINDICO']:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        v = await self.repo.get_by_id(id, condo_id)
        if not v:
            raise HTTPException(status_code=404, detail="Not found")
            
        await self.repo.delete(v)
        await self.db.commit()

    async def list_bylaws(self, category: str, condo_id: UUID) -> List[Bylaw]:
        return await self.repo.get_bylaws(condo_id, category)
