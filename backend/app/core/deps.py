from typing import AsyncGenerator, Annotated
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import text
from app.core import config, security, database
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{config.settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(request: Request, token: Annotated[str | None, Depends(oauth2_scheme)] = None) -> TokenData:
    # If token is not in header (oauth2_scheme), check cookie
    if not token:
        token = request.cookies.get("access_token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        user_id: str = payload.get("sub")
        condo_id: str = payload.get("condo_id")
        role: str = payload.get("role")
        
        if user_id is None or condo_id is None or role is None:
            raise credentials_exception
            
        return TokenData(user_id=user_id, condo_id=condo_id, role=role)
    except JWTError:
        raise credentials_exception

async def get_db(request: Request, current_user: Annotated[TokenData, Depends(get_current_user)]) -> AsyncGenerator:
    """
    IMPORTANTE: Esta dependência injeta o contexto de segurança na sessão do banco.
    As políticas de RLS (Segurança ao nível de linha) dependem dessas configurações.
    """
    async with database.AsyncSessionLocal() as session:
        # Define o contexto da sessão (Zero Trust)
        try:
             # Extrai o IP (FastAPI Request.client.host já lida com X-Forwarded-For se proxy-headers estiver ativo)
             client_ip = request.client.host if request.client else None
             
             # O uso de parâmetros no set_config garante segurança contra injeção de SQL.
             # Nota: os valores de current_setting no Postgres são sempre strings.
             await session.execute(
                 text("SELECT set_config('app.current_user_id', :uid, false), set_config('app.current_condo_id', :cid, false), set_config('app.current_role', :role, false), set_config('app.current_user_key', :key, false), set_config('app.current_user_ip', :ip, false)"),
                 {
                     "uid": current_user.user_id, 
                     "cid": current_user.condo_id, 
                     "role": current_user.role, 
                     "key": config.settings.APP_ENCRYPTION_KEY,
                     "ip": client_ip
                 }
             )
        except Exception as e:
            # Se não conseguir definir o contexto, não deve liberar a sessão.
             raise HTTPException(status_code=500, detail="Falha ao inicializar o contexto de segurança")

        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Dependência especial para Autenticação (Login) que ainda não possui usuário logado
async def get_db_no_context() -> AsyncGenerator:
    """
    Gerador de sessão limitado para fluxos de login.
    USE APENAS para autenticação inicial onde o contexto ainda não foi estabelecido.
    """
    async with database.AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
