from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, func

from app.core import deps
from app.models.all import Condominium
from app.schemas.settings import CondominiumRead, CondominiumUpdate

router = APIRouter()

@router.get("/me", response_model=CondominiumRead)
async def get_my_condominium(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Get current user's condominium details.
    Decrypts sensitive data (CNPJ) on the fly using PGCrypto keys.
    """
    # We select specific columns to decrypt them
    # Note: RLS ensures we only get our own condo
    query = text("""
        SELECT 
            id, 
            name, 
            pgp_sym_decrypt(cnpj_encrypted::bytea, 'super_secure_key_for_pgcrypto') as cnpj,
            address,
            pgp_sym_decrypt(contact_email_encrypted::bytea, 'super_secure_key_for_pgcrypto') as contact_email,
            pgp_sym_decrypt(gate_phone_encrypted::bytea, 'super_secure_key_for_pgcrypto') as gate_phone,
            created_at
        FROM condominiums
        WHERE id = :condo_id
    """)
    
    result = await db.execute(query, {"condo_id": current_user.condo_id})
    row = result.mappings().first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Condominium not found")
        
    return row

@router.put("/me", response_model=CondominiumRead)
async def update_my_condominium(
    condo_in: CondominiumUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    """
    Update condominium details. Only ADMIN can do this.
    """
    if current_user.role != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized to update condominium settings")

    # Update logic handling encryption if email/phone changed
    # For simplicity using SQL with pgp_sym_encrypt
    
    update_query = text("""
        UPDATE condominiums
        SET 
            name = :name,
            address = :address
            -- Add encryption logic for contacts if needed future
        WHERE id = :condo_id
        RETURNING id
    """)
    
    await db.execute(update_query, {
        "name": condo_in.name,
        "address": condo_in.address,
        "condo_id": current_user.condo_id
    })
    
    await db.commit()
    
    # Return updated
    return await get_my_condominium(db, current_user)
