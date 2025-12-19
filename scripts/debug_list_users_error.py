import asyncio
import os
import sys

# Ajusta path para importar app
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from backend.app.models.all import User
from backend.app.core.config import settings

# Override DB URL se necessario
DB_URL = "postgresql+asyncpg://postgres:password123@localhost/maison_manager"

async def debug_list_active_users():
    print(f"Conectando ao DB: {DB_URL}")
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        print("--- Tentando executar query de listagem (ACTIVE) ---")
        try:
            query = select(
                User,
                text("pgp_sym_decrypt(email_encrypted::bytea, 'super_secure_key_for_pgcrypto') as decrypted_email"),
                text("pgp_sym_decrypt(phone_encrypted::bytea, 'super_secure_key_for_pgcrypto') as decrypted_phone")
            ).where(User.status == 'ACTIVE')
            
            result = await db.execute(query)
            rows = result.all()
            print(f"Sucesso! Encontrados {len(rows)} usuários ativos.")
            for row in rows:
                print(f"User: {row[0].name}, Email: {row[1]}, Phone: {row[2]}")
                
        except Exception as e:
            print("\n[ERRO FATAL NA QUERY]")
            print(e)
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_list_active_users())
