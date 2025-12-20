import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Use localhost since we run from host accessing docker port mapping
DATABASE_URL = "postgresql+asyncpg://postgres:password123@localhost:5432/maison_manager"

async def migrate():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Adding sidebar_title column...")
        try:
            await conn.execute(text("ALTER TABLE condominiums ADD COLUMN sidebar_title VARCHAR(255);"))
            print("Stored sidebar_title column.")
        except Exception as e:
            # Check if error is 'duplicate column'
            if "already exists" in str(e):
                print("Column sidebar_title already exists.")
            else:
                print(f"Error adding sidebar_title: {e}")

        print("Adding login_title column...")
        try:
            await conn.execute(text("ALTER TABLE condominiums ADD COLUMN login_title VARCHAR(255);"))
            print("Stored login_title column.")
        except Exception as e:
            if "already exists" in str(e):
                print("Column login_title already exists.")
            else:
                print(f"Error adding login_title: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(migrate())
    except Exception as e:
        print(f"Migration failed: {e}")
