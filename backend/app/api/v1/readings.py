from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Annotated
from app.core import deps
from app.models.all import ReadingWater, ReadingGas, ReadingElectricity, Transaction
from app.schemas.readings import (
    WaterReadingCreate, WaterReadingRead,
    GasReadingCreate, GasReadingRead,
    ElectricityReadingCreate, ElectricityReadingRead
)

router = APIRouter()

# --- Water ---
@router.post("/water", response_model=WaterReadingRead)
async def create_water_reading(
    reading_in: WaterReadingCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    # RLS/Policy check happens at DB level, but explicit role check is safer for writes
    if current_user.role not in ['ADMIN', 'PORTER']:
         raise HTTPException(status_code=403, detail="Only Admin/Porter can submit water readings")

    db_obj = ReadingWater(
        condominium_id=current_user.condo_id,
        **reading_in.model_dump()
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/water", response_model=List[WaterReadingRead])
async def read_water_readings(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    query = select(ReadingWater)
    if current_user.role == 'RESIDENT':
        # Need to find the resident's unit_id to filter their readings
        # Since TokenData might not have unit_id, we fetch it or join.
        # Efficient way: Join User where id = cur_user.id
        from app.models.all import User
        # We can subquery or just fetch the user first.
        # Let's simple fetch user's unit_id
        res_user = await db.get(User, current_user.user_id)
        if not res_user or not res_user.unit_id:
            return [] # No unit, no readings
        
        query = query.where(ReadingWater.unit_id == res_user.unit_id)
        
    result = await db.execute(query)
    return result.scalars().all()

# --- Gas ---
@router.post("/gas", response_model=GasReadingRead)
async def create_gas_reading(
    reading_in: GasReadingCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
         raise HTTPException(status_code=403, detail="Only Admin/Financial can submit gas readings")

    db_obj = ReadingGas(
        condominium_id=current_user.condo_id,
        **reading_in.model_dump()
    )
    db.add(db_obj)
    
    # Auto-create Financial Expense
    expense = Transaction(
        condominium_id=current_user.condo_id,
        type='expense',
        description=f"Compra de Gás - {db_obj.supplier}",
        amount=db_obj.total_price,
        category='Utilidades',
        date=db_obj.purchase_date,
        status='paid', # Assume purchase is paid
        observation="Gerado automaticamente pelo Módulo de Leituras"
    )
    db.add(expense)

    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/gas", response_model=List[GasReadingRead])
async def read_gas_readings(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    result = await db.execute(select(ReadingGas))
    return result.scalars().all()

# --- Electricity ---
@router.post("/electricity", response_model=ElectricityReadingRead)
async def create_electricity_reading(
    reading_in: ElectricityReadingCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    if current_user.role not in ['ADMIN', 'FINANCIAL']:
         raise HTTPException(status_code=403, detail="Only Admin/Financial can submit electricity readings")

    db_obj = ReadingElectricity(
        condominium_id=current_user.condo_id,
        **reading_in.model_dump()
    )
    db.add(db_obj)
    
    # Auto-create Financial Expense
    expense = Transaction(
        condominium_id=current_user.condo_id,
        type='expense',
        description="Conta de Luz",
        amount=db_obj.total_value,
        category='Utilidades',
        date=db_obj.due_date,
        status='pending', # Bills start as pending
        observation="Gerado automaticamente pelo Módulo de Leituras"
    )
    db.add(expense)

    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/electricity", response_model=List[ElectricityReadingRead])
async def read_electricity_readings(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    result = await db.execute(select(ReadingElectricity))
    return result.scalars().all()
