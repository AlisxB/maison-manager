from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from app.core import deps
from app.violations.models import Bylaw as BylawModel
from app.violations.schemas import Bylaw, BylawCreate, BylawUpdate

router = APIRouter()

@router.get("/", response_model=List[Bylaw])
async def read_bylaws(db: AsyncSession = Depends(deps.get_db), current_user = Depends(deps.get_current_user)):
    result = await db.execute(select(BylawModel))
    return result.scalars().all()

@router.post("/", response_model=Bylaw)
async def create_bylaw(
    bylaw: BylawCreate, 
    db: AsyncSession = Depends(deps.get_db), 
    current_user = Depends(deps.get_current_user)
):
    if current_user.role not in ["ADMIN", "SINDICO"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can create bylaws")
        
    new_bylaw = BylawModel(
        condominium_id=current_user.condo_id,
        **bylaw.dict()
    )
    db.add(new_bylaw)
    await db.commit()
    await db.refresh(new_bylaw)
    return new_bylaw

@router.put("/{id}", response_model=Bylaw)
async def update_bylaw(
    id: UUID,
    bylaw_update: BylawUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role not in ["ADMIN", "SINDICO"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can update bylaws")

    result = await db.execute(select(BylawModel).where(BylawModel.id == id))
    existing_bylaw = result.scalar_one_or_none()
    
    if not existing_bylaw:
        raise HTTPException(status_code=404, detail="Bylaw not found")
        
    for key, value in bylaw_update.dict(exclude_unset=True).items():
        setattr(existing_bylaw, key, value)
        
    await db.commit()
    await db.refresh(existing_bylaw)
    return existing_bylaw

@router.delete("/{id}")
async def delete_bylaw(
    id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role not in ["ADMIN", "SINDICO"]:
        raise HTTPException(status_code=403, detail="Only admins and managers can delete bylaws")

    result = await db.execute(select(BylawModel).where(BylawModel.id == id))
    existing_bylaw = result.scalar_one_or_none()
    
    if not existing_bylaw:
        raise HTTPException(status_code=404, detail="Bylaw not found")
        
    await db.delete(existing_bylaw)
    await db.commit()
    return {"message": "Bylaw deleted"}
