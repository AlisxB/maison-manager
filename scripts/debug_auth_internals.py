
import asyncio
import os
import sys

# Adiciona o diretório backend ao path para importar módulos da app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core import security
from app.api.v1.auth import login_access_token
from app.models.all import User
from sqlalchemy import select
from app.core.database import engine
import hashlib

# Mock para simular form data
class MockFormData:
    def __init__(self, username, password):
        self.username = username
        self.password = password

async def debug_auth():
    print("--- Iniciando Debug Autenticação ---")
    
    email = "admin@maison.com"
    password = "admin"
    
    print(f"1. Testando Hashing de Email ({email})...")
    email_hash = hashlib.sha256(email.lower().encode('utf-8')).hexdigest()
    print(f"   Hash gerado: {email_hash}")
    
    print("\n2. Buscando Usuário no Banco (Via SQLAlchemy)...")
    try:
        async with engine.begin() as conn:
            # Nota: Usando query textual para simplificar e isolar do modelo ORM se necessário, 
            # mas vamos tentar usar o modelo se possível.
            # O código original usa: result = await db.execute(select(User)...)
            # Vamos simular query crua primeiro para ver o dado
            
            result = await conn.execute(
                select(User).where(User.email_hash == email_hash)
            )
            user = result.scalars().first()
            
            if not user:
                print("   [ERRO] Usuário não encontrado pelo hash!")
                return
                
            print(f"   Usuário Encontrado: {user.name} (ID: {user.id})")
            print(f"   Password Hash no Banco: {user.password_hash}")
            
            print("\n3. Verificando Senha...")
            is_valid = security.verify_password(password, user.password_hash)
            print(f"   Senha '{password}' é válida? {is_valid}")
            
            if is_valid:
                print("\n4. Testando Geração de Token...")
                access_token = security.create_access_token(
                    subject=user.id,
                    claims={
                        "condo_id": str(user.condominium_id),
                        "role": user.role,
                        "name": user.name
                    }
                )
                print(f"   Token Gerado com Sucesso: {access_token[:20]}...")
            else:
                 print("   [FALHA] Password verify retornou False.")

    except Exception as e:
        print(f"\n[EXCEPTION] Ocorreu um erro durante o teste:\n{e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        asyncio.run(debug_auth())
    except Exception as e:
        print(f"Erro fatal: {e}")
