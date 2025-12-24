from typing import AsyncGenerator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import text
from app.core import config, security, database
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{config.settings.API_V1_STR}/auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
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

async def get_db(current_user: Annotated[TokenData, Depends(get_current_user)]) -> AsyncGenerator:
    """
    CRITICAL: This dependency injects security context into the DB session.
    RLS policies rely on these settings.
    """
    async with database.AsyncSessionLocal() as session:
        # Set Session Context (Zero Trust)
        try:
             # Using parameters in set_config can be tricky with some drivers, but text() handles binding.
             # Note: current_setting values are strings.
             await session.execute(
                 text("SELECT set_config('app.current_user_id', :uid, false), set_config('app.current_condo_id', :cid, false), set_config('app.current_role', :role, false), set_config('app.current_user_key', :key, false)"),
                 {"uid": current_user.user_id, "cid": current_user.condo_id, "role": current_user.role, "key": config.settings.APP_ENCRYPTION_KEY}
             )
        except Exception as e:
            # If we can't set context, we must not yield a session.
             raise HTTPException(status_code=500, detail="Failed to initialize security context")

        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Special dependency for Auth (Login) which doesn't have a user yet
async def get_db_no_context() -> AsyncGenerator:
    """
    Limited session generator for login flows.
    ONLY use this for initial authentication where context is not yet established.
    Be extremely careful with queries using this session.
    """
    async with database.AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
