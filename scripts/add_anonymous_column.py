
import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def migrate():
    async with engine.begin() as conn:
        print("Adding is_anonymous column to occurrences table...")
        try:
            await conn.execute(text("ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE"))
            print("Column added successfully.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
