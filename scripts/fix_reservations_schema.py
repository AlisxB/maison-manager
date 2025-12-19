import asyncio
import os
import sys

sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.app.core import database
from sqlalchemy import text

async def fix_schema():
    print("Correcao de Schema: Adicionando coluna 'reason' em 'reservations'...")
    
    async with database.AsyncSessionLocal() as session:
        try:
            # Check if column exists
            # Generic way handling postgres
            print("Verificando existencia da coluna...")
            await session.execute(text("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reason TEXT;"))
            await session.commit()
            print("Coluna 'reason' adicionada com sucesso.")
            
        except Exception as e:
            print(f"Erro ao alterar tabela: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(fix_schema())
