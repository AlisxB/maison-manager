import sys
import os
import asyncio
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.database import AsyncSessionLocal

async def create_violation():
    async with AsyncSessionLocal() as db:
        try:
            # 1. Get Resident ID (Alice)
            user_query = text("SELECT id, condominium_id FROM users WHERE email_hash = encode(digest('alice@maison.com', 'sha256'), 'hex')")
            result = await db.execute(user_query)
            user = result.fetchone()
            
            if not user:
                print("Resident Alice not found. Please run create_resident.py first.")
                return
            
            user_id = user.id
            condo_id = user.condominium_id

            # 2. Create Violation
            insert_query = text("""
                INSERT INTO violations (
                    condominium_id, resident_id, type, status, description, amount, occurred_at
                ) VALUES (
                    :condo_id, :resident_id, 'FINE', 'OPEN', 'Barulho excessivo após 22h', 500.00, NOW()
                ) RETURNING id
            """)
            
            result = await db.execute(insert_query, {
                "condo_id": condo_id,
                "resident_id": user_id
            })
            await db.commit()
            print(f"Violation created with ID: {result.scalar()}")

        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(create_violation())
