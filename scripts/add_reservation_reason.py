
import asyncio
import os
import sys
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
load_dotenv(env_path)
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def migrate():
    try:
        async with engine.begin() as conn:
            print("Adding 'reason' column to reservations...")
            await conn.execute(text("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reason TEXT;"))
            print("Migration successful.")
    except Exception as e:
         print(f"Migration Failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
