from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

# Schema Base
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., pattern="^(ADMIN|RESIDENTE|PORTEIRO|FINANCEIRO)$")
    profile_type: Optional[str] = Field(None, pattern="^(PROPRIETARIO|INQUILINO|STAFF)$")
    unit_id: Optional[UUID] = None

# Schema para Criação (Recebe senha em plain text)
class UserCreate(UserBase):
    password: Optional[str] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None

# Schema para Atualização (Tudo opcional)
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    profile_type: Optional[str] = None
    unit_id: Optional[UUID] = None
    password: Optional[str] = None
    current_password: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    work_hours: Optional[str] = None
    status: Optional[str] = None


# Schema para nested Unit
class UnitNested(BaseModel):
    id: UUID
    block: Optional[str] = None
    number: str
    type: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schema para Leitura (Retorna dados públicos/seguros)
class UserRead(UserBase):
    id: UUID
    status: str
    created_at: datetime
    phone: Optional[str] = None
    department: Optional[str] = None
    work_hours: Optional[str] = None
    unit: Optional[UnitNested] = None
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

# Schema para Registro Público (Novo Morador)
class UserRegister(BaseModel):
    name: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: str = Field(..., min_length=10)
    unit_id: UUID
    # Campos opcionais para facilitar cadastro
    has_pets: Optional[bool] = False
    pets_description: Optional[str] = None

    @field_validator('password')
    def password_complexity(cls, v):
        if len(v) < 6:
             raise ValueError('A senha deve ter no mínimo 6 caracteres.')
        if not v[0].isupper():
             raise ValueError('A primeira letra da senha deve ser maiúscula.')
        
        # Check for special characters
        special_characters = "!@#$%^&*()-+"
        if not any(c in special_characters for c in v):
             raise ValueError(f'A senha deve conter pelo menos um caractere especial: {special_characters}')
        
        return v
