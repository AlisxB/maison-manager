from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract, func
from app.financial.models import Transaction
from uuid import UUID

class FinancialRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, transaction: Transaction) -> Transaction:
        self.db.add(transaction)
        # Service commits
        return transaction

    async def get_all(self, condo_id: UUID, month: Optional[int] = None, year: Optional[int] = None, 
                      type: Optional[str] = None, category: Optional[str] = None) -> List[Transaction]:
        
        stmt = select(Transaction).where(Transaction.condominium_id == condo_id)

        if month:
            stmt = stmt.where(extract('month', Transaction.date) == month)
        if year:
            stmt = stmt.where(extract('year', Transaction.date) == year)
        if type:
            stmt = stmt.where(Transaction.type == type)
        if category and category != "Todas as Categorias":
            stmt = stmt.where(Transaction.category == category)
            
        stmt = stmt.order_by(Transaction.date.desc())
        
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, id: UUID, condo_id: UUID) -> Optional[Transaction]:
        stmt = select(Transaction).where(Transaction.id == id, Transaction.condominium_id == condo_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, transaction: Transaction) -> None:
        await self.db.delete(transaction)

    async def get_summary_stats(self, condo_id: UUID, month: int, year: int) -> dict:
        # Income Month
        income_stmt = select(func.sum(Transaction.amount)).where(
            Transaction.condominium_id == condo_id,
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year,
            Transaction.type == 'RECEITA'
        )
        income = (await self.db.execute(income_stmt)).scalar() or 0

        # Expense Month
        expense_stmt = select(func.sum(Transaction.amount)).where(
            Transaction.condominium_id == condo_id,
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year,
            Transaction.type == 'DESPESA'
        )
        expense = (await self.db.execute(expense_stmt)).scalar() or 0

        # Total Balance
        total_income_stmt = select(func.sum(Transaction.amount)).where(
            Transaction.condominium_id == condo_id,
            Transaction.type == 'RECEITA'
        )
        total_expense_stmt = select(func.sum(Transaction.amount)).where(
            Transaction.condominium_id == condo_id,
            Transaction.type == 'DESPESA'
        )
        
        ti = (await self.db.execute(total_income_stmt)).scalar() or 0
        te = (await self.db.execute(total_expense_stmt)).scalar() or 0
        
        return {
            "income": income,
            "expense": expense,
            "balance": ti - te
        }
