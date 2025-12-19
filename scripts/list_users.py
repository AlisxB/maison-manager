
import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def list_users():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id, name, role, email_encrypted FROM users"))
        users = result.all()
        print("Users Found:")
        for u in users:
            print(f"ID: {u.id} | Name: {u.name} | Role: {u.role}")

if __name__ == "__main__":
    asyncio.run(list_users())
