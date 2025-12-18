from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: str
    condo_id: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
