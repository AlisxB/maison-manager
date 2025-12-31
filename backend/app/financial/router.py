from typing import Annotated, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.financial.schemas import TransactionRead, TransactionCreate, TransactionUpdate, ShareCreate, PublicReportResponse
from app.financial.service import FinancialService

router = APIRouter()

@router.post("/", response_model=TransactionRead)
async def create_transaction(
    tx_in: TransactionCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = FinancialService(db)
    return await service.create_transaction(tx_in, current_user.role, current_user.condo_id)

@router.get("/", response_model=List[TransactionRead])
async def list_transactions(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    type: Optional[str] = None,
    category: Optional[str] = None
):
    service = FinancialService(db)
    return await service.list_transactions(
        current_user.role, 
        current_user.condo_id, 
        month=month, year=year, type=type, category=category
    )

@router.put("/{id}", response_model=TransactionRead)
async def update_transaction(
    id: UUID,
    tx_in: TransactionUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = FinancialService(db)
    return await service.update_transaction(id, tx_in, current_user.role, current_user.condo_id)

@router.delete("/{id}")
async def delete_transaction(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = FinancialService(db)
    await service.delete_transaction(id, current_user.role, current_user.condo_id)
    return {"message": "Transaction deleted"}

@router.get("/summary")
async def get_summary(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100)
):
    service = FinancialService(db)
    return await service.get_summary(month, year, current_user.role, current_user.condo_id)

@router.post("/share/create", response_model=dict)
async def create_share_link(
    data: ShareCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = FinancialService(db)
    token = await service.create_share_link(data.month, data.year, current_user.user_id, current_user.role, current_user.condo_id)
    # Construct full URL or just return token?
    # Usually frontend constructs URL. Returning token and expiration info inside dict
    from datetime import datetime, timedelta
    return {
        "token": token,
        "link": f"/relatorio-financeiro/{token}", # Path for frontend
        "expires_in": "7 dias"
    }

@router.get("/public/report/{token}", response_model=PublicReportResponse)
async def get_public_report(
    token: str,
    db: Annotated[AsyncSession, Depends(deps.get_db)]
):
    # No user auth required here, it's public link
    service = FinancialService(db)
    return await service.get_public_report(token)
