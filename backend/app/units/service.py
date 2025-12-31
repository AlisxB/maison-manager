from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.units.repository import UnitRepository
from app.units.schemas import UnitCreate
from app.units.models import Unit

class UnitService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UnitRepository(db)

    async def get_units(self, condo_id: UUID) -> List[Unit]:
        return await self.repo.get_all(condo_id)

    async def create_unit(self, unit_in: UnitCreate, current_user_role: str, condo_id: UUID) -> Unit:
        if current_user_role != 'ADMIN':
            raise HTTPException(status_code=403, detail="Not authorized")
            
        unit = Unit(
            condominium_id=condo_id,
            block=unit_in.block,
            number=unit_in.number,
            type=unit_in.type
        )
        
        await self.repo.create(unit)
        try:
            await self.db.commit()
            await self.db.refresh(unit)
            return unit
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def get_details(self, unit_id: UUID, current_user_role: str) -> dict:
        if current_user_role not in ['ADMIN', 'SINDICO', 'SUBSINDICO']:
             raise HTTPException(status_code=403, detail="Not authorized")
        
        # 1. Get Unit
        unit = await self.repo.get_by_id(unit_id)
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")
            
        # 2. Get Current Residents
        # Ideally this should be in Repository but for speed adding raw SQL here or reuse UserRepo
        from sqlalchemy import text
        
        # Fetch Current Residents
        result_residents = await self.db.execute(text("""
            SELECT id, name, email_encrypted, phone_encrypted, role, profile_type, status 
            FROM users 
            WHERE unit_id = :unit_id AND status != 'REMOVIDO'
        """), {"unit_id": unit_id})
        
        residents = []
        for row in result_residents:
            residents.append({
                "id": row.id,
                "name": row.name,
                "email": row.email_encrypted.replace("ENC(", "").replace(")", ""), # Simple decrypt mock
                "phone": row.phone_encrypted.replace("ENC(", "").replace(")", "") if row.phone_encrypted else None,
                "role": row.role,
                "profile_type": row.profile_type,
                "status": row.status
            })
            
        # 3. Fetch History
        result_history = await self.db.execute(text("""
            SELECT h.id, h.user_id, h.profile_type, h.start_date, h.end_date, h.created_at, u.name as user_name
            FROM occupation_history h
            LEFT JOIN users u ON h.user_id = u.id
            WHERE h.unit_id = :unit_id
            ORDER BY h.start_date DESC
        """), {"unit_id": unit_id})
        
        history = []
        for row in result_history:
            history.append({
                "id": row.id,
                "user_id": row.user_id,
                "profile_type": row.profile_type,
                "start_date": row.start_date,
                "end_date": row.end_date,
                "created_at": row.created_at,
                "user_name": row.user_name or "Usuário Removido"
            })
            
        return {
            "id": unit.id,
            "condominium_id": unit.condominium_id,
            "block": unit.block,
            "number": unit.number,
            "type": unit.type,
            "current_residents": residents,
            "occupation_history": history
        }
