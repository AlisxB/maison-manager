from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import deps
from app.users.schemas import UserRead, UserCreate, UserUpdate
from app.users.service import UserService
# Note: AccessLog schema might be needed or we reuse UserRead logic which doesn't include it yet. 
# Service returns AccessLog model. We need a schema for AccessLog.
# For now, let's just return list of dicts or add AccessLog schema to user.py or locally.

router = APIRouter()

@router.get("/", response_model=List[UserRead])
async def read_users(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    skip: int = 0,
    limit: int = 100,
    status: str = None
):
    service = UserService(db)
    return await service.get_users(skip, limit, status)

@router.post("/", response_model=UserRead)
async def create_user(
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = UserService(db)
    return await service.create_user(user_in, current_user.role, current_user.condo_id)

@router.put("/{id}", response_model=UserRead)
async def update_user(
    id: str,
    user_in: UserUpdate,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = UserService(db)
    return await service.update_user(id, user_in, current_user.user_id, current_user.role)

@router.delete("/{id}")
async def delete_user(
    id: str,
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)]
):
    service = UserService(db)
    await service.delete_user(id, current_user.user_id, current_user.role)
    return {"status": "success"}

@router.get("/me/access-history")
async def get_access_history(
    db: Annotated[AsyncSession, Depends(deps.get_db)],
    current_user: Annotated[deps.TokenData, Depends(deps.get_current_user)],
    limit: int = 5
):
    service = UserService(db)
    return await service.get_my_history(current_user.user_id)
