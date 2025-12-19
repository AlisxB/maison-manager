
import asyncio
import os
import sys

# Adiciona o diretório backend ao path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import text
from app.core.database import engine

async def fix_schema():
    print("--- Iniciando Correção de Schema ---")
    
    try:
        async with engine.begin() as conn:
            print("1. Adicionando coluna 'last_notification_check' na tabela 'users'...")
            # Usando IF NOT EXISTS para evitar erro se rodar 2x
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_notification_check TIMESTAMP WITH TIME ZONE;"))
            print("   [SUCESSO] Coluna adicionada (ou já existia).")
            
    except Exception as e:
        print(f"\n[FALHA] Erro ao alterar schema:\n{e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        asyncio.run(fix_schema())
    except Exception as e:
        print(f"Erro fatal: {e}")
