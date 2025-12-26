from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.assets.repository import InventoryRepository
from app.assets.inventory_schemas import InventoryItemCreate, InventoryItemUpdate
from app.assets.models import InventoryItem

class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = InventoryRepository(db)

    def _check_admin(self, role: str):
        if role != 'ADMIN':
            raise HTTPException(status_code=403, detail="Not authorized")

    async def list_items(self, condo_id: UUID) -> List[InventoryItem]:
        return await self.repo.get_all(condo_id)

    async def create_item(self, data: InventoryItemCreate, role: str, condo_id: UUID) -> InventoryItem:
        self._check_admin(role)
        item = InventoryItem(condominium_id=condo_id, **data.model_dump())
        await self.repo.create(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update_item(self, id: UUID, data: InventoryItemUpdate, role: str, condo_id: UUID) -> InventoryItem:
        self._check_admin(role)
        item = await self.repo.get_by_id(id, condo_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(item, k, v)
        
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete_item(self, id: UUID, role: str, condo_id: UUID) -> None:
        self._check_admin(role)
        item = await self.repo.get_by_id(id, condo_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        await self.repo.delete(item)
        await self.db.commit()
