from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.assets.models import InventoryItem
from uuid import UUID

class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, item: InventoryItem) -> InventoryItem:
        self.db.add(item)
        return item

    async def get_all(self, condo_id: UUID) -> List[InventoryItem]:
        query = select(InventoryItem).where(InventoryItem.condominium_id == condo_id).order_by(InventoryItem.name)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, id: UUID, condo_id: UUID) -> Optional[InventoryItem]:
        query = select(InventoryItem).where(InventoryItem.id == id, InventoryItem.condominium_id == condo_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def delete(self, item: InventoryItem) -> None:
        await self.db.delete(item)
