import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Use localhost since we run from host accessing docker port mapping
DATABASE_URL = "postgresql+asyncpg://postgres:password123@localhost:5432/maison_manager"

async def migrate():
    engine = create_async_engine(DATABASE_URL)
    
    # Run each one in a separate transaction block just to be safe and simple
    # Or use IF NOT EXISTS
    
    async with engine.begin() as conn:
        print("Migrating occurrences table...")
        
        # 1. is_anonymous
        print("Adding is_anonymous column...")
        try:
            await conn.execute(text("ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;"))
            print("Verified is_anonymous column.")
        except Exception as e:
            print(f"Error adding is_anonymous: {e}")
        
        # 2. admin_response
        print("Adding admin_response column...")
        try:
            await conn.execute(text("ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS admin_response TEXT;"))
            print("Verified admin_response column.")
        except Exception as e:
            print(f"Error adding admin_response: {e}")

        # 3. photo_url
        print("Adding photo_url column...")
        try:
            await conn.execute(text("ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS photo_url TEXT;"))
            print("Verified photo_url column.")
        except Exception as e:
            print(f"Error adding photo_url: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(migrate())
    except Exception as e:
        print(f"Migration failed: {e}")
