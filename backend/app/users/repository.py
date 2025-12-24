from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import joinedload
from app.users.models import User, AccessLog

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str, load_unit: bool = False) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        if load_unit:
            query = query.options(joinedload(User.unit))
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[User]:
        query = select(
            User,
            text("CASE WHEN email_encrypted IS NOT NULL AND email_encrypted NOT LIKE 'ENC(%' THEN pgp_sym_decrypt(email_encrypted::bytea, current_setting('app.current_user_key')) ELSE NULL END as decrypted_email"),
            text("CASE WHEN phone_encrypted IS NOT NULL AND phone_encrypted NOT LIKE 'ENC(%' THEN pgp_sym_decrypt(phone_encrypted::bytea, current_setting('app.current_user_key')) ELSE NULL END as decrypted_phone")
        ).options(joinedload(User.unit))

        if status:
            query = query.where(User.status == status)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        
        users_data = []
        for row in result.all():
            user_obj = row[0]
            # Manual decryption map if DB succeeded
            # Set transient attributes
            user_obj.email = row[1] if row[1] else None
            user_obj.phone = row[2] if row[2] else None
            
            # Simple fallback (remove in strict prod)
            if not user_obj.email and user_obj.email_encrypted and user_obj.email_encrypted.startswith("ENC("):
                 user_obj.email = user_obj.email_encrypted[4:-1]
            if not user_obj.phone and user_obj.phone_encrypted and user_obj.phone_encrypted.startswith("ENC("):
                 user_obj.phone = user_obj.phone_encrypted[4:-1]
                 
            users_data.append(user_obj)
            
        return users_data

    async def create(self, user: User) -> User:
        self.db.add(user)
        # Note: No commit here, Service handles Transaction
        return user

    async def delete(self, user: User) -> None:
        await self.db.delete(user)
    
    async def get_access_history(self, user_id: str, limit: int = 5) -> List[AccessLog]:
        query = select(AccessLog).where(AccessLog.user_id == user_id).order_by(AccessLog.created_at.desc()).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
