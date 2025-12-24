from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.users.repository import UserRepository
from app.users.schemas import UserCreate, UserUpdate
from app.users.models import User, AccessLog
from app.core import security
import hashlib

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def get_users(self, skip: int = 0, limit: int = 100, status: str = None) -> List[User]:
        return await self.repo.get_all(skip, limit, status)

    async def create_user(self, user_in: UserCreate, current_user_role: str, current_condo_id: UUID) -> User:
        if current_user_role != 'ADMIN':
            raise HTTPException(status_code=403, detail="Apenas administradores podem criar usuários")

        email_hash = hashlib.sha256(user_in.email.lower().encode('utf-8')).hexdigest()
        
        db_user = User(
            condominium_id=current_condo_id,
            name=user_in.name,
            email_encrypted=f"ENC({user_in.email})", 
            email_hash=email_hash,
            password_hash=security.get_password_hash(user_in.password),
            role=user_in.role,
            profile_type=user_in.profile_type,
            unit_id=user_in.unit_id,
            phone_encrypted=f"ENC({user_in.phone})" if user_in.phone else None,
            status="ATIVO"
        )
        
        await self.repo.create(db_user)
        try:
            await self.db.commit()
            # Fetch to load relationship
            saved_user = await self.repo.get_by_id(db_user.id, load_unit=True)
            saved_user.email = user_in.email # Artificial injection for response
            return saved_user
        except Exception as e:
            await self.db.rollback()
            if "users_condominium_id_email_hash_key" in str(e):
                 raise HTTPException(status_code=409, detail="Email já cadastrado.")
            raise HTTPException(status_code=400, detail=f"Erro ao criar usuário: {str(e)}")

    async def update_user(self, user_id: str, user_in: UserUpdate, current_user_id: str, current_user_role: str) -> User:
        if current_user_role != 'ADMIN':
             raise HTTPException(status_code=403, detail="Not authorized")

        db_user = await self.repo.get_by_id(user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update Logic
        if user_in.name: db_user.name = user_in.name
        if user_in.role: db_user.role = user_in.role
        if user_in.profile_type: db_user.profile_type = user_in.profile_type
        if user_in.unit_id is not None: db_user.unit_id = user_in.unit_id
        if user_in.department: db_user.department = user_in.department
        if user_in.work_hours: db_user.work_hours = user_in.work_hours
        if user_in.status: db_user.status = user_in.status

        if user_in.phone:
            db_user.phone_encrypted = f"ENC({user_in.phone})"

        if user_in.email:
             new_email_hash = hashlib.sha256(user_in.email.lower().encode('utf-8')).hexdigest()
             if new_email_hash != db_user.email_hash:
                 db_user.email_encrypted = f"ENC({user_in.email})"
                 db_user.email_hash = new_email_hash
        
        if user_in.password and user_in.password != "******":
            if str(db_user.id) == str(current_user_id):
                 if not user_in.current_password:
                      raise HTTPException(status_code=400, detail="Senha atual obrigatória.")
                 if not security.verify_password(user_in.current_password, db_user.password_hash):
                      raise HTTPException(status_code=401, detail="Senha atual incorreta.")
            db_user.password_hash = security.get_password_hash(user_in.password)

        await self.db.commit()
        updated_user = await self.repo.get_by_id(user_id, load_unit=True)
        
        # Populate transient fields
        if user_in.email: updated_user.email = user_in.email
        elif updated_user.email_encrypted.startswith("ENC("): updated_user.email = updated_user.email_encrypted[4:-1]
        
        return updated_user

    async def delete_user(self, user_id: str, current_user_id: str, current_user_role: str) -> None:
        if current_user_role != 'ADMIN':
            raise HTTPException(status_code=403, detail="Not authorized")
            
        MASTER_ADMIN_ID = "22222222-2222-2222-2222-222222222222"
        if str(user_id) == MASTER_ADMIN_ID:
            raise HTTPException(status_code=403, detail="Cannot delete Master Admin.")
            
        if str(user_id) == str(current_user_id):
            raise HTTPException(status_code=400, detail="Cannot delete self.")
            
        db_user = await self.repo.get_by_id(user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        await self.repo.delete(db_user)
        await self.db.commit()

    async def get_my_history(self, user_id: str) -> List[AccessLog]:
        return await self.repo.get_access_history(user_id)
