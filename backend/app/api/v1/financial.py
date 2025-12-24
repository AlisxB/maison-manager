from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
from datetime import date

from app.core.deps import get_current_user, get_db
from app.models.all import Transaction, User
from app.schemas.financial import TransactionCreate, TransactionRead, TransactionUpdate
from app.schemas.token import TokenData

router = APIRouter()

@router.post("/", response_model=TransactionRead)
async def create_transaction(
    tx_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
        raise HTTPException(status_code=403, detail="Not authorized")

    db_tx = Transaction(
        condominium_id=current_user.condo_id,
        **tx_in.model_dump()
    )
    db.add(db_tx)
    await db.commit()
    await db.refresh(db_tx)
    return db_tx

@router.get("/", response_model=List[TransactionRead])
async def list_transactions(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    type: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
        raise HTTPException(status_code=403, detail="Not authorized")

    stmt = select(Transaction).where(Transaction.condominium_id == current_user.condo_id)

    if month:
        # Extract month from date
        from sqlalchemy import extract
        stmt = stmt.where(extract('month', Transaction.date) == month)
    if year:
        from sqlalchemy import extract
        stmt = stmt.where(extract('year', Transaction.date) == year)
    if type:
        stmt = stmt.where(Transaction.type == type)
    if category and category != "Todas as Categorias":
        stmt = stmt.where(Transaction.category == category)
        
    stmt = stmt.order_by(Transaction.date.desc())
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{id}")
async def delete_transaction(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.execute(select(Transaction).where(Transaction.id == id, Transaction.condominium_id == current_user.condo_id))
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    await db.delete(tx)
    await db.commit()
    return {"message": "Transaction deleted"}



@router.put("/{id}", response_model=TransactionRead)
async def update_transaction(
    id: uuid.UUID,
    tx_in: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.execute(select(Transaction).where(Transaction.id == id, Transaction.condominium_id == current_user.condo_id))
    db_tx = result.scalar_one_or_none()
    
    if not db_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    update_data = tx_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tx, field, value)
        
    db.add(db_tx)
    await db.commit()
    await db.refresh(db_tx)
    return db_tx

@router.get("/summary")
async def get_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
        raise HTTPException(status_code=403, detail="Not authorized")

    from sqlalchemy import extract, func

    # Income
    income_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.condominium_id == current_user.condo_id,
        extract('month', Transaction.date) == month,
        extract('year', Transaction.date) == year,
        Transaction.type == 'RECEITA'
    )
    income_res = await db.execute(income_stmt)
    income = income_res.scalar() or 0

    # Expense
    expense_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.condominium_id == current_user.condo_id,
        extract('month', Transaction.date) == month,
        extract('year', Transaction.date) == year,
        Transaction.type == 'DESPESA'
    )
    expense_res = await db.execute(expense_stmt)
    expense = expense_res.scalar() or 0

    # Balance (Global or Monthly? Usually Month Balance is Income - Expense, but "Saldo Atual" implies accumulated. 
    # Let's return Monthly Balance for now as per cards "Receitas (Dez)" and "Despesas (Dez)". 
    # But "Saldo Atual" usually means total cash on hand. Let's calculate total balance separately.)

    total_income_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.condominium_id == current_user.condo_id,
        Transaction.type == 'RECEITA'
    )
    total_expense_stmt = select(func.sum(Transaction.amount)).where(
        Transaction.condominium_id == current_user.condo_id,
        Transaction.type == 'DESPESA'
    )
    
    ti_res = await db.execute(total_income_stmt)
    te_res = await db.execute(total_expense_stmt)
    
    total_income = ti_res.scalar() or 0
    total_expense = te_res.scalar() or 0
    current_balance = total_income - total_expense

    return {
        "income": income,
        "expense": expense,
        "balance": current_balance
    }
