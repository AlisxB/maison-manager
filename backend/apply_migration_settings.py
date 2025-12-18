import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

# Use direct connection string or construct it
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/maison_manager")

async def apply_migration():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        print("Applying migration for Common Areas...")
        
        # Add columns if they don't exist
        # We use IF NOT EXISTS logic implicitly by separate alter statements or catching errors, 
        # but standardized ALTER TABLE ADD COLUMN IF NOT EXISTS is cleanest
        
        commands = [
            "ALTER TABLE common_areas ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 10;",
            "ALTER TABLE common_areas ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10, 2) DEFAULT 0;",
            "ALTER TABLE common_areas ADD COLUMN IF NOT EXISTS min_booking_hours INTEGER DEFAULT 1;",
            "ALTER TABLE common_areas ADD COLUMN IF NOT EXISTS max_booking_hours INTEGER DEFAULT 4;",
            "ALTER TABLE common_areas ADD COLUMN IF NOT EXISTS monthly_limit_per_unit INTEGER DEFAULT 2;",
            "ALTER TABLE common_areas ADD COLUMN IF NOT EXISTS opening_hours JSONB;",
        ]
        
        for cmd in commands:
            await conn.execute(text(cmd))
            
        print("Migration applied successfully.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_migration())
