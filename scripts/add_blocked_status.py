
import asyncio
import os
import sys
from dotenv import load_dotenv

# Explicitly load backend/.env
env_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
load_dotenv(env_path)

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def migrate():
    print("Attempting to connect to database...")
    try:
        async with engine.begin() as conn:
            print("Connected. Dropping existing check constraint on 'status'...")
            try:
               await conn.execute(text("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;"))
            except Exception as e:
               print(f"Warning dropping constraint: {e}")

            print("Adding new check constraint including 'BLOCKED'...")
            await conn.execute(text("""
                ALTER TABLE reservations 
                ADD CONSTRAINT reservations_status_check 
                CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'BLOCKED'));
            """))
            
            print("Migration successful.")
    except Exception as e:
         print(f"Migration Failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
