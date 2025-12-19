from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.core import deps
from app.models.all import Violation as ViolationModel, Bylaw as BylawModel, Condominium, Unit as UnitModel, User as UserModel, Transaction
from app.schemas.violation import Violation, ViolationCreate, ViolationUpdate
from app.core.deps import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=List[Violation])
async def read_violations(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    resident_id: Optional[UUID] = None,
    db: AsyncSession = Depends(deps.get_db), 
    current_user = Depends(deps.get_current_user)
):
    query = select(ViolationModel)
    
    if type:
        query = query.where(ViolationModel.type == type)
    if resident_id:
        query = query.where(ViolationModel.resident_id == resident_id)
        
    query = query.offset(skip).limit(limit).order_by(ViolationModel.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()





@router.post("/", response_model=Violation)
async def create_violation(
    violation: ViolationCreate, 
    db: AsyncSession = Depends(deps.get_db), 
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can issue violations")
        
    # Ensure occurred_at is set
    occurred = violation.occurred_at if violation.occurred_at else datetime.now()
        
    new_violation = ViolationModel(
        condominium_id=current_user.condo_id,
        resident_id=violation.resident_id,
        bylaw_id=violation.bylaw_id,
        type=violation.type,
        description=violation.description,
        amount=violation.amount,
        status='OPEN',
        occurred_at=occurred,
        created_at=datetime.now()
    )
    db.add(new_violation)
    
    # Integration with Financial Module (Fines -> Income)
    try:
        await db.flush() # Ensure ID is generated
        if violation.type == 'FINE' and violation.amount and violation.amount > 0:
            new_transaction = Transaction(
                condominium_id=current_user.condo_id,
                type='income',
                description=f"Multa - Unidade do Infrator: {violation.resident_id}",
                amount=violation.amount,
                category='Multas',
                date=datetime.now(),
                status='pending',
                observation=f"Gerado automaticamente pela Infração ID: {new_violation.id}. Motivo: {violation.description}"
            )
            db.add(new_transaction)
    except Exception as e:
        print(f"Error creating transaction for fine: {e}")
        # Non-blocking error: we still want to save the violation

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"Commit failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create violation: {str(e)}")

    await db.refresh(new_violation)
    return new_violation

@router.put("/{id}", response_model=Violation)
async def update_violation(
    id: UUID,
    violation_update: ViolationUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can update violations")

    result = await db.execute(select(ViolationModel).where(ViolationModel.id == id))
    existing_violation = result.scalar_one_or_none()
    
    if not existing_violation:
        raise HTTPException(status_code=404, detail="Violation not found")
        
    for key, value in violation_update.dict(exclude_unset=True).items():
        setattr(existing_violation, key, value)
        
    await db.commit()
    await db.refresh(existing_violation)
    return existing_violation

@router.delete("/{id}")
async def delete_violation(
    id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can delete violations")

    result = await db.execute(select(ViolationModel).where(ViolationModel.id == id))
    existing_violation = result.scalar_one_or_none()
    
    if not existing_violation:
        raise HTTPException(status_code=404, detail="Violation not found")
        
    await db.delete(existing_violation)
    await db.commit()
    return {"message": "Violation deleted"}
