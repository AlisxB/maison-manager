from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.assets.inventory_schemas import InventoryItemRead, InventoryItemCreate, InventoryItemUpdate
from app.assets.service import InventoryService

router = APIRouter()

@router.get("/", response_model=List[InventoryItemRead])
async def list_inventory(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = InventoryService(db)
    return await service.list_items(current_user.condo_id)

@router.post("/", response_model=InventoryItemRead)
async def create_item(
    data: InventoryItemCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = InventoryService(db)
    return await service.create_item(data, current_user.role, current_user.condo_id)

@router.put("/{id}", response_model=InventoryItemRead)
async def update_item(
    id: UUID,
    data: InventoryItemUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = InventoryService(db)
    return await service.update_item(id, data, current_user.role, current_user.condo_id)

@router.delete("/{id}")
async def delete_item(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = InventoryService(db)
    await service.delete_item(id, current_user.role, current_user.condo_id)
    return {"message": "Deleted"}
