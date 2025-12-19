
import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

CONDO_ID = '11111111-1111-1111-1111-111111111111'
ADMIN_ID = '22222222-2222-2222-2222-222222222222'
ALICE_ID = '4b855611-8cbe-4648-a87c-5fa0e7afcf62'

async def test_rls():
    async with engine.begin() as conn:
        print("--- Testing ALICE (Resident) ---")
        # 1. Set Context as Alice
        await conn.execute(text(f"SELECT set_config('app.current_user_id', '{ALICE_ID}', false), set_config('app.current_condo_id', '{CONDO_ID}', false), set_config('app.current_role', 'RESIDENT', false)"))
        
        # 2. Insert Occurrence
        print("Inserting occurrence as Alice...")
        await conn.execute(text(f"""
            INSERT INTO occurrences (condominium_id, user_id, title, description, category, status)
            VALUES ('{CONDO_ID}', '{ALICE_ID}', 'Teste RLS Script', 'Descricao do teste', 'Maintenance', 'OPEN')
        """))
        
        # 3. Read Own
        result = await conn.execute(text("SELECT id, title FROM occurrences"))
        rows = result.all()
        print(f"Alice sees: {rows}")
        
    async with engine.begin() as conn:
        print("\n--- Testing ADMIN ---")
        # 4. Set Context as Admin
        await conn.execute(text(f"SELECT set_config('app.current_user_id', '{ADMIN_ID}', false), set_config('app.current_condo_id', '{CONDO_ID}', false), set_config('app.current_role', 'ADMIN', false)"))
        
        # 5. Read All
        result = await conn.execute(text("SELECT id, title, user_id FROM occurrences"))
        rows = result.all()
        print(f"Admin sees: {rows}")

if __name__ == "__main__":
    asyncio.run(test_rls())
