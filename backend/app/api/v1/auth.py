from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security, config, deps
from app.models.all import User
from app.schemas.token import Token
import hashlib

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)]
):
    """
    Login para obter token JWT (compatível com OAuth2).
    """
    # 1. Gerar Hash do email para busca (devido à criptografia no banco)
    email_hash = hashlib.sha256(form_data.username.lower().encode('utf-8')).hexdigest()
    
    # 2. Buscar usuário pelo hash do email
    # Nota: Usamos get_db_no_context porque ainda não temos usuário autenticado
    # Eager load unit for token claims
    result = await db.execute(
        select(User)
        .options(joinedload(User.unit))
        .where(User.email_hash == email_hash)
    )
    user = result.scalars().first()
    
    # 3. Validar senha
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.status != 'ACTIVE':
        raise HTTPException(status_code=400, detail="Usuário inativo")

    # 4. Gerar Token com Payload rico (User, Condo, Role)
    unit_label = None
    if user.unit:
        unit_label = user.unit.number
        if user.unit.block:
            unit_label = f"{user.unit.block}-{user.unit.number}"

    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id,
        claims={
            "condo_id": str(user.condominium_id),
            "role": user.role,
            "name": user.name,
            "email": form_data.username,
            "unit": unit_label
        },
        expires_delta=access_token_expires,
    )
    
    return Token(access_token=access_token, token_type="bearer")
