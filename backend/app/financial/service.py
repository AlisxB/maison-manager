from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.financial.repository import FinancialRepository
from app.financial.schemas import TransactionCreate, TransactionUpdate
from app.financial.models import Transaction

class FinancialService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = FinancialRepository(db)

    def _check_auth(self, role: str):
        # Base auth check - endpoints will refine
        if role not in ['ADMIN', 'FINANCEIRO', 'RESIDENTE', 'PORTEIRO', 'SINDICO', 'SUBSINDICO', 'CONSELHO']:
             raise HTTPException(status_code=403, detail="Not authorized")

    def _check_admin(self, role: str):
         if role not in ['ADMIN', 'FINANCEIRO', 'SINDICO']:
             raise HTTPException(status_code=403, detail="Not authorized")

    async def create_transaction(self, tx_in: TransactionCreate, role: str, condo_id: UUID) -> Transaction:
        self._check_admin(role)
        
        # Map Frontend types (lowercase) to DB types (uppercase)
        db_type = tx_in.type
        if tx_in.type.lower() == 'income':
            db_type = 'RECEITA'
        elif tx_in.type.lower() == 'expense':
            db_type = 'DESPESA'
        
        # Create a dict from model and override type
        tx_data = tx_in.model_dump()
        tx_data['type'] = db_type
        
        # Map Status
        if tx_in.status:
            s = tx_in.status.lower()
            if s == 'paid': tx_data['status'] = 'PAGO'
            elif s == 'pending': tx_data['status'] = 'PENDENTE'

        db_tx = Transaction(
            condominium_id=condo_id,
            **tx_data
        )
        await self.repo.create(db_tx)
        await self.db.commit()
        await self.db.refresh(db_tx)
        return db_tx

    async def list_transactions(self, role: str, condo_id: UUID, **filters) -> List[Transaction]:
        self._check_auth(role)
        return await self.repo.get_all(condo_id, **filters)

    async def update_transaction(self, id: UUID, tx_in: TransactionUpdate, role: str, condo_id: UUID) -> Transaction:
        self._check_admin(role)
        
        db_tx = await self.repo.get_by_id(id, condo_id)
        if not db_tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        update_data = tx_in.model_dump(exclude_unset=True)
        
        # Map Type if present
        if 'type' in update_data:
            t = update_data['type'].lower()
            if t == 'income':
                update_data['type'] = 'RECEITA'
            elif t == 'expense':
                update_data['type'] = 'DESPESA'

        # Map Status if present
        if 'status' in update_data:
            s = update_data['status'].lower()
            if s == 'paid':
                update_data['status'] = 'PAGO'
            elif s == 'pending':
                update_data['status'] = 'PENDENTE'

        for field, value in update_data.items():
            setattr(db_tx, field, value)
            
        await self.db.commit()
        await self.db.refresh(db_tx)
        return db_tx

    async def delete_transaction(self, id: UUID, role: str, condo_id: UUID) -> None:
        self._check_admin(role)
        
        db_tx = await self.repo.get_by_id(id, condo_id)
        if not db_tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        await self.repo.delete(db_tx)
        await self.db.commit()

    async def get_summary(self, month: int, year: int, role: str, condo_id: UUID) -> dict:
        self._check_auth(role)
        return await self.repo.get_summary_stats(condo_id, month, year)
