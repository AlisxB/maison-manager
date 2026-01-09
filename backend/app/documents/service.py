import os
import shutil
import uuid
from typing import List, Optional
from uuid import UUID
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.documents.repository import DocumentRepository
from app.documents.models import Document
from app.documents.schemas import DocumentCreate, DocumentUpdate
from app.utils.file_optimizer import optimize_pdf, optimize_image

UPLOAD_DIR = "backend/storage/uploads/documents"

class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DocumentRepository(db)

    async def list_documents(self, condo_id: UUID, role: str) -> List[Document]:
        # Residents only see Active docs
        active_only = (role != 'ADMIN') 
        return await self.repo.get_all(condo_id, active_only)

    async def get_document(self, id: UUID, condo_id: UUID) -> Document:
        doc = await self.repo.get_by_id(id, condo_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    async def create_document(self, 
                              file: UploadFile, 
                              title: str, 
                              category: str, 
                              condo_id: UUID, 
                              user_id: UUID,
                              description: Optional[str] = None) -> Document:
        
        # 1. Validação do Arquivo
        if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Tipo de arquivo inválido. Apenas PDF, JPG, PNG são permitidos.")
        
        # 2. Preparação do Armazenamento
        # Nota: a extensão pode mudar se a otimização converter PNG -> JPG
        original_ext = os.path.splitext(file.filename)[1]
        
        # Pasta específica do condomínio
        save_dir = os.path.join(UPLOAD_DIR, str(condo_id))
        os.makedirs(save_dir, exist_ok=True)
        
        final_mime_type = file.content_type
        
        try:
            # Lê o conteúdo para memória
            content = await file.read()
            file_size = len(content)
            
            # 3. Otimiza se for maior que 1MB
            if file_size > 1 * 1024 * 1024:
                import asyncio
                
                if file.content_type == "application/pdf":
                    content = await asyncio.to_thread(optimize_pdf, content)
                    
                elif file.content_type in ["image/jpeg", "image/png"]:
                    content, new_mime = await asyncio.to_thread(optimize_image, content)
                    final_mime_type = new_mime
                    
                    # Atualiza extensão se o mime mudou
                    if new_mime == "image/jpeg" and original_ext.lower() != ".jpg" and original_ext.lower() != ".jpeg":
                        original_ext = ".jpg"
                        
                file_size = len(content) # Atualiza o tamanho final

            # Gera nome seguro com a extensão correta
            safe_filename = f"{uuid.uuid4()}{original_ext}"
            file_path = os.path.join(save_dir, safe_filename)

            # Escreve no disco
            with open(file_path, "wb") as buffer:
                buffer.write(content)
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Falha no processamento do arquivo: {str(e)}")
            
        # 4. Cria o registro no Banco de Dados
        doc = Document(
            condominium_id=condo_id,
            title=title,
            description=description,
            category=category,
            file_path=file_path,
            mime_type=final_mime_type,
            file_size=file_size,
            is_active=True,
            created_by=user_id
        )
        
        await self.repo.create(doc)
        await self.db.commit()
        await self.db.refresh(doc)
        return doc

    async def update_document(self, id: UUID, data: DocumentUpdate, condo_id: UUID, role: str) -> Document:
        if role not in ['ADMIN', 'SINDICO']:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        doc = await self.get_document(id, condo_id)
        
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(doc, k, v)
            
        await self.db.commit()
        await self.db.refresh(doc)
        return doc
        
    async def toggle_status(self, id: UUID, is_active: bool, condo_id: UUID, role: str) -> Document:
        if role not in ['ADMIN', 'SINDICO']:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        doc = await self.get_document(id, condo_id)
        doc.is_active = is_active
        await self.db.commit()
        await self.db.refresh(doc)
        return doc

    async def delete_document(self, id: UUID, condo_id: UUID, role: str) -> None:
        if role not in ['ADMIN', 'SINDICO']:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        doc = await self.get_document(id, condo_id)
        
        # Delete file from disk
        if os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
            except Exception:
                pass # Log error but proceed
        
        await self.repo.delete(doc)
        await self.db.commit()
