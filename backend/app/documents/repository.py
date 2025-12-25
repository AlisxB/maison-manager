from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.documents.models import Document

class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, condo_id: UUID, active_only: bool = False) -> List[Document]:
        query = select(Document).where(Document.condominium_id == condo_id)
        if active_only:
            query = query.where(Document.is_active == True)
        
        query = query.order_by(desc(Document.created_at))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, id: UUID, condo_id: UUID) -> Optional[Document]:
        # RLS handles access, but explicitly checking condo_id is safer
        query = select(Document).where(Document.id == id, Document.condominium_id == condo_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, doc: Document) -> Document:
        self.db.add(doc)
        return doc

    async def delete(self, doc: Document) -> None:
        await self.db.delete(doc)
