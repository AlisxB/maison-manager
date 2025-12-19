import asyncio
import os
import sys
import hashlib

# Ajusta path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import select
from sqlalchemy.orm import joinedload
from backend.app.core import database, security
from backend.app.models.all import User

async def debug_login():
    print("Iniciando debug de login isolado...")
    email = "admin@maison.com"
    password = "admin"
    
    email_hash = hashlib.sha256(email.lower().encode('utf-8')).hexdigest()
    print(f"Buscando user com hash: {email_hash}")
    
    try:
        async with database.AsyncSessionLocal() as session:
            print("Sessão aberta.")
            stmt = select(User).options(joinedload(User.unit)).where(User.email_hash == email_hash)
            result = await session.execute(stmt)
            user = result.scalars().first()
            
            if not user:
                print("Usuário não encontrado!")
                return
                
            print(f"Usuário encontrado: {user.name} ({user.id})")
            print(f"Role: {user.role}")
            print(f"Password Hash DB: {user.password_hash}")
            
            is_valid = security.verify_password(password, user.password_hash)
            print(f"Senha válida? {is_valid}")
            
            if is_valid:
                print("Gerando token...")
                from datetime import timedelta
                from backend.app.core import config
                
                access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                token = security.create_access_token(
                    subject=user.id,
                    claims={
                        "condo_id": str(user.condominium_id),
                        "role": user.role,
                        "name": user.name
                    },
                    expires_delta=access_token_expires,
                )
                print(f"Token gerado com sucesso: {token[:20]}...")
            
    except Exception as e:
        print(f"\n[ERRO DEBUG LOGIN]")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_login())
