from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Annotated
import uuid

from app.core import deps
from app.models.all import InventoryItem
from app.schemas.inventory import InventoryItemCreate, InventoryItemRead, InventoryItemUpdate

router = APIRouter()

@router.post("/", response_model=InventoryItemRead)
async def create_item(
    item_in: InventoryItemCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    if current_user.role not in ['ADMIN', 'PORTER', 'SYNDIC', 'FINANCIAL']: # Broad access for staff
         raise HTTPException(status_code=403, detail="Not authorized")

    db_item = InventoryItem(
        condominium_id=current_user.condo_id,
        **item_in.model_dump()
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[InventoryItemRead])
async def list_items(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    # Staff access check? Implicit by RLS or explicit.
    # Policy allows access.
    result = await db.execute(select(InventoryItem).order_by(InventoryItem.name))
    return result.scalars().all()

@router.put("/{id}", response_model=InventoryItemRead)
async def update_item(
    id: uuid.UUID,
    item_in: InventoryItemUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    if current_user.role not in ['ADMIN', 'PORTER']: # Restrict updates to Admin/Porter?
         raise HTTPException(status_code=403, detail="Not authorized")

    db_item = await db.get(InventoryItem, id)
    
    if not db_item or str(db_item.condominium_id) != str(current_user.condo_id):
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
        
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/{id}")
async def delete_item(
    id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    if current_user.role not in ['ADMIN']: # Only Admin deletes
         raise HTTPException(status_code=403, detail="Not authorized")

    db_item = await db.get(InventoryItem, id)
    if not db_item or str(db_item.condominium_id) != str(current_user.condo_id):
         raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(db_item)
    await db.commit()
    return {"message": "Item deleted"}
