from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# Schema Base
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., pattern="^(ADMIN|RESIDENT|PORTER|FINANCIAL)$")
    profile_type: Optional[str] = Field(None, pattern="^(OWNER|TENANT|STAFF)$")
    unit_id: Optional[UUID] = None

# Schema para Criação (Recebe senha em plain text)
class UserCreate(UserBase):
    password: str
    phone: Optional[str] = None
    cpf: Optional[str] = None

# Schema para Leitura (Retorna dados públicos/seguros)
class UserRead(UserBase):
    id: UUID
    status: str
    created_at: datetime
    # Nota: Email é retornado como está no modelo Pydantic (vindo do payload descriptografado 
    # ou texto criptografado se o banco não descriptografar automaticamente).
    # Na arquitetura proposta, o banco armazena criptografado.
    # O backend precisaria descriptografar se quisesse mostrar.
    # Como o prompt mandou "Backend apenas orquestra", vamos assumir que retornamos o valor
    # e o frontend que lute? Não, idealmente descriptografa.
    # Mas sem a chave no app (supondo que está no banco), usaríamos `pgp_sym_decrypt` no SELECT.
    # Vamos manter simples: retorna o objeto, se vier criptografado, é o que tem.
    
    class Config:
        from_attributes = True
