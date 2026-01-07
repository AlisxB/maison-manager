from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.violations.repository import ViolationRepository
from app.violations.schemas import ViolationCreate, ViolationUpdate
from app.violations.models import Violation, Bylaw

class ViolationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ViolationRepository(db)

    async def list_violations(self, user_id: UUID, role: str, condo_id: UUID, target_resident_id: UUID = None, type_filter: str = None) -> List[Violation]:
        # If user is a Resident, they can ONLY see their own violations
        if role == 'RESIDENTE':
            filter_user = user_id
        else:
            # If Admin/Sindico, allow filtering by specific resident if requested
            filter_user = target_resident_id

        return await self.repo.get_all(condo_id, filter_user, type_filter)

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
        await self.db.flush()

        # Integration with Financial (Create Fine)
        # Automatically create a generic 'income' transaction for the fine
        try:
            # Check if amount is present and greater than 0
            # Ensure amount is Decimal or float compatible
            is_valid_amount = False
            if data.amount is not None:
                try:
                    is_valid_amount = float(data.amount) > 0
                except:
                    pass

            if data.type == 'MULTA' and is_valid_amount:
                from app.financial.models import Transaction
                from app.users.models import User
                from sqlalchemy import select
                from sqlalchemy.orm import joinedload
                from datetime import timezone
                
                # Fetch resident name for description
                user_stmt = select(User).options(joinedload(User.unit)).where(User.id == data.resident_id)
                user_res = await self.db.execute(user_stmt)
                user_obj = user_res.scalar_one_or_none()
                
                user_name = "Morador"
                unit_info = ""
                if user_obj:
                    user_name = user_obj.name
                    if user_obj.unit:
                         unit_info = f" (Bloco {user_obj.unit.block or ''} - {user_obj.unit.number})"
                
                # Use timezone aware date
                tx_date = data.occurred_at or datetime.now(timezone.utc)
                
                transaction = Transaction(
                    condominium_id=condo_id,
                    type='RECEITA', # Check constraint: RECEITA, DESPESA
                    description=f"Multa - {user_name}",
                    amount=data.amount,
                    category='Multas',
                    date=tx_date,
                    status='PENDENTE', # Check constraint: PAGO, PENDENTE
                    observation=f"Infração ID: {violation.id}. Morador: {user_name}{unit_info}. Motivo: {data.description[:100]}..."
                )
                self.db.add(transaction)
                # Flush to check for errors immediately (optional, but good for debugging)
                await self.db.flush()
        except Exception as e:
            # print(f"Error creating transaction for fine: {e}")
            # Log error but don't stop flow
            pass
        
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
