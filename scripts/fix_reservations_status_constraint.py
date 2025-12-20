import asyncio
import os
import sys

sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.app.core import database
from sqlalchemy import text

async def fix_status_constraint():
    print("Correcao de Constraint: Atualizando check de status em 'reservations'...")
    
    async with database.AsyncSessionLocal() as session:
        try:
            # 1. Drop existing constraint
            # Note: The name is usually 'reservations_status_check' but let's be safe
            print("Removendo constraint antiga...")
            await session.execute(text("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;"))
            
            # 2. Add new constraint
            print("Adicionando nova constraint com 'BLOCKED'...")
            await session.execute(text("""
                ALTER TABLE reservations 
                ADD CONSTRAINT reservations_status_check 
                CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'BLOCKED'));
            """))
            
            await session.commit()
            print("Constraint atualizada com sucesso.")
            
        except Exception as e:
            print(f"Erro ao alterar constraint: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(fix_status_constraint())
