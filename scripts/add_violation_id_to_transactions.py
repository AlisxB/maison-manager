import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:password123@localhost:5432/maison_manager"
)

# SQL Commands
ADD_COLUMN_SQL = """
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS violation_id UUID REFERENCES violations(id) ON DELETE SET NULL;
"""

async def run_migration():
    print("Connecting to database...")
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        print("Adding violation_id column to transactions...")
        await conn.execute(text(ADD_COLUMN_SQL))
        print("Column added successfully.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
