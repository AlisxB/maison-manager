from typing import List, Annotated, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os

from app.core import deps
from app.documents.schemas import DocumentRead, DocumentUpdate, DocumentStatusUpdate
from app.documents.service import DocumentService

router = APIRouter()

@router.get("/", response_model=List[DocumentRead])
async def list_documents(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = DocumentService(db)
    return await service.list_documents(current_user.condo_id, current_user.role)

@router.post("/", response_model=DocumentRead)
async def create_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    db: Annotated[AsyncSession, Depends(deps.get_db)] = None, # Depends trick
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)] = None
):
    if current_user.role not in ['ADMIN', 'SINDICO']:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    service = DocumentService(db)
    return await service.create_document(file, title, category, current_user.condo_id, current_user.user_id, description)

@router.get("/{id}/download")
async def download_document(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = DocumentService(db)
    doc = await service.get_document(id, current_user.condo_id)
    
    # Check permissions (Resident can only see if Active, unless Admin)
    if current_user.role != 'ADMIN' and not doc.is_active:
        raise HTTPException(status_code=403, detail="Document not available")
        
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(doc.file_path, filename=f"{doc.title}.{doc.mime_type.split('/')[-1]}", media_type=doc.mime_type)

@router.patch("/{id}/status", response_model=DocumentRead)
async def toggle_status(
    id: UUID,
    status_update: DocumentStatusUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = DocumentService(db)
    return await service.toggle_status(id, status_update.is_active, current_user.condo_id, current_user.role)

@router.delete("/{id}")
async def delete_document(
    id: UUID,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = DocumentService(db)
    await service.delete_document(id, current_user.condo_id, current_user.role)
    return {"message": "Deleted"}
