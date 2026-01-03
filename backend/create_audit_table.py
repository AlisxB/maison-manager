import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.database import engine, Base
from app.models.audit import AuditLog
from app.users.models import User
from app.units.models import Condominium
from sqlalchemy import text

async def create_tables():
    print("Creating Audit Logs table...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(create_tables())
