from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import joinedload
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security, config, deps
from app.models.all import User, AccessLog
from app.models.all import User, AccessLog, Unit
from app.schemas.token import Token
from app.schemas.user import UserRegister
import hashlib

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)],
    request: Request
):
    """
    Login para obter token JWT (compatível com OAuth2).
    """
    try:
        # 1. Gerar Hash do email para busca (devido à criptografia no banco)
        email_hash = hashlib.sha256(form_data.username.lower().encode('utf-8')).hexdigest()
        
        # 2. Buscar usuário pelo hash do email (Via Função Segura para Bypassar RLS)
        # Nota: RLS impede select direto sem contexto. A função SECURITY DEFINER resolve isso.
        stmt = select(User).from_statement(
            text("SELECT * FROM get_user_by_email_hash(CAST(:hash AS VARCHAR))")
        ).params(hash=email_hash)
        
        result = await db.execute(stmt)
        user = result.scalars().first()
        
        # 3. Validar senha
        if not user or not security.verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if user.status == 'PENDENTE':
             raise HTTPException(status_code=403, detail="Seu cadastro está em análise. Aguarde a aprovação da administração.")
        
        if user.status != 'ATIVO':
            raise HTTPException(status_code=400, detail="Usuário inativo")

        # 4. Gerar Token com Payload rico
        # Fetch Unit safely (RLS might hide it unless we set context, or we just try)
        unit_label = None
        if user.unit_id:
            try:
                # Set context to allow reading unit if RLS is strict
                await db.execute(text("SELECT set_config('app.current_condo_id', :cid, false)"), {"cid": str(user.condominium_id)})
                
                # Fetch unit explicitly
                unit_res = await db.execute(select(Unit).where(Unit.id == user.unit_id))
                unit_obj = unit_res.scalars().first()
                
                if unit_obj:
                    unit_label = unit_obj.number
                    if unit_obj.block:
                        unit_label = f"{unit_obj.block}-{unit_obj.number}"
            except Exception as e:
                print(f"Failed to fetch unit for token: {e}")
                # Fallback: ignore unit in token

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
        
        # 5. Registrar Histórico de Acesso
        try:
            access_log = AccessLog(
                condominium_id=user.condominium_id,
                user_id=user.id,
                ip_address=request.client.host,
                user_agent=request.headers.get("user-agent"),
                location="São Paulo, SP" # Mocked GeoIP for now
            )
            db.add(access_log)
            await db.commit()
        except Exception as e:
            print(f"Failed to log access: {e}")
            # Non-blocking error
        
        return Token(access_token=access_token, token_type="bearer")

    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login Error: {str(e)}")

@router.get("/units")
async def get_public_units(
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)]
):
    """
    Listar unidades (Publico - para cadastro).
    """
    try:
        # Busca todas as unidades para o usuario escolher no cadastro
        stmt = select(Unit).order_by(Unit.block, Unit.number)
        result = await db.execute(stmt)
        units = result.scalars().all()
        
        return [
            {
                "id": str(u.id), 
                "block": u.block, 
                "number": u.number, 
                "condominium_id": str(u.condominium_id)
            } 
            for u in units
        ]
    except Exception as e:
         print(f"Error fetching units: {e}")
         return []

@router.post("/register")
async def register_user(
    user_in: UserRegister,
    db: Annotated[AsyncSession, Depends(deps.get_db_no_context)]
):
    """
    Cadastro público de moradores. Status inicial = PENDENTE.
    """
    try:
        # 1. Check if email exists
        email_hash = hashlib.sha256(user_in.email.lower().encode('utf-8')).hexdigest()
        
        stmt = select(User).from_statement(
             text("SELECT * FROM get_user_by_email_hash(CAST(:hash AS VARCHAR))")
        ).params(hash=email_hash)
        result = await db.execute(stmt)
        if result.scalars().first():
             raise HTTPException(status_code=400, detail="Este email já está cadastrado.")

        # 2. Get Unit to get Condominium ID
        unit = await db.get(Unit, user_in.unit_id)
        if not unit:
             raise HTTPException(status_code=404, detail="Unidade não encontrada.")
             
        # 3. Create User
        db_user = User(
            condominium_id=unit.condominium_id,
            unit_id=unit.id,
            name=user_in.name,
            email_encrypted=f"ENC({user_in.email})",
            email_hash=email_hash,
            phone_encrypted=f"ENC({user_in.phone})",
            password_hash=security.get_password_hash(user_in.password),
            role='RESIDENTE',
            profile_type='INQUILINO', # Default
            status='PENDENTE'
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        return {"message": "Cadastro realizado com sucesso. Aguarde aprovação."}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao registrar: {str(e)}")
