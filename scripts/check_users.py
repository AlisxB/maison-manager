import sys
import os
import asyncio
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import AsyncSessionLocal

async def check_users():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text('SELECT email_hash, role, status FROM users'))
        users = res.fetchall()
        print(f'Users found: {len(users)}')
        for u in users:
            print(f'User: {u.role} - {u.status}')

if __name__ == "__main__":
    asyncio.run(check_users())
