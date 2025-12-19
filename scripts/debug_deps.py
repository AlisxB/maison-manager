import asyncio
import os
import sys
import uuid

# Ajusta path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import text
from backend.app.core import database
from backend.app.schemas.token import TokenData

async def debug_db_context():
    print("Iniciando teste de deps.get_db context setting...")
    
    # SIMULANDO VALOR VALIDO PARA TESTAR RLS
    uid = str(uuid.uuid4())
    cid = str(uuid.uuid4())
    role = "ADMIN"
    current_user = TokenData(user_id=uid, condo_id=cid, role=role)
    
    print(f"User: {uid}, Condo: {current_user.condo_id}, Role: {role}")

    try:
        async with database.AsyncSessionLocal() as session:
            print("Sessão aberta. Tentando set_config...")
            
            # Copiado do deps.py
            await session.execute(
                 text("SELECT set_config('app.current_user_id', :uid, false), set_config('app.current_condo_id', :cid, false), set_config('app.current_role', :role, false)"),
                 {"uid": current_user.user_id, "cid": current_user.condo_id, "role": current_user.role}
            )
            print("set_config SUCESSO!")
            
            # Testando uma query simples RLS
            result = await session.execute(text("SELECT current_setting('app.current_user_id')"))
            val = result.scalar()
            print(f"Verificação: app.current_user_id = {val}")

            print("Tentando SELECT na tabela USERS para ativar RLS...")
            await session.execute(text("SELECT id FROM users LIMIT 1"))
            print("Query RLS SUCESSO!")
            
    except Exception as e:
        print("\n[FALHA FATAL EM DEPS]")
        print(e)

if __name__ == "__main__":
    asyncio.run(debug_db_context())
