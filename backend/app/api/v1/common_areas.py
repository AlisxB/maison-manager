from typing import Annotated, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core import deps
from app.models.all import CommonArea
from app.schemas.settings import CommonAreaRead, CommonAreaCreate, CommonAreaUpdate

router = APIRouter()

@router.get("/", response_model=List[CommonAreaRead])
async def list_common_areas(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """List all common areas for the condo."""
    query = select(CommonArea).where(CommonArea.condominium_id == current_user.condo_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=CommonAreaRead)
async def create_common_area(
    area_in: CommonAreaCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """Create a new common area (Admin only)."""
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    new_area = CommonArea(
        condominium_id=current_user.condo_id,
        **area_in.model_dump()
    )
    db.add(new_area)
    await db.commit()
    await db.refresh(new_area)
    return new_area

@router.put("/{id}", response_model=CommonAreaRead)
async def update_common_area(
    id: UUID,
    area_in: CommonAreaUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """Update common area details/rules (Admin only)."""
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_area = await db.get(CommonArea, id)
    if not db_area or str(db_area.condominium_id) != str(current_user.condo_id):
        raise HTTPException(status_code=404, detail="Area not found")
        
    update_data = area_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_area, field, value)
        
    db.add(db_area)
    await db.commit()
    await db.refresh(db_area)
    return db_area

@router.delete("/{id}")
async def delete_common_area(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """Delete (or deactivate) a common area."""
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_area = await db.get(CommonArea, id)
    if not db_area or str(db_area.condominium_id) != str(current_user.condo_id):
        raise HTTPException(status_code=404, detail="Area not found")
        
    # Hard delete allowed if no reservations exist? 
    # For now, we will just delete, DB foreign keys might restrict it if reservations exist.
    # Optionally we could set is_active=False instead.
    try:
        await db.delete(db_area)
        await db.commit()
    except Exception as e:
         # Likely foreign key constraint
         raise HTTPException(status_code=400, detail="Cannot delete area with existing reservations. Try deactivating it.")
    
    return {"status": "success"}
