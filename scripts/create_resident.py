import sys
import os
import asyncio
from sqlalchemy import text

# Add backend directory to sys.path
# scripts/ is in ".../maison-manager/scripts"
# We need to add ".../maison-manager/backend" to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.security import get_password_hash
from app.core.database import AsyncSessionLocal

async def create_resident():
    async with AsyncSessionLocal() as db:
        try:
            # 1. Get Condo ID
            condo_query = text("SELECT id FROM condominiums LIMIT 1")
            result = await db.execute(condo_query)
            condo_id = result.scalar()
            
            if not condo_id:
                print("No condominium found.")
                return

            # 2. Get Unit ID (101)
            unit_query = text("SELECT id FROM units WHERE number = '101' LIMIT 1")
            result = await db.execute(unit_query)
            unit_id = result.scalar()
            
            if not unit_id:
                print("Unit 101 not found.")
                return

            # 3. Create Resident User
            user_email = "alice@maison.com"
            password = "resident123"
            hashed_pw = get_password_hash(password)
            
            # Check if exists
            check_query = text("SELECT id FROM users WHERE email_hash = encode(digest(:email, 'sha256'), 'hex')")
            result = await db.execute(check_query, {"email": user_email})
            existing = result.fetchone()
            
            if existing:
                print(f"User {user_email} already exists.")
                return

            insert_query = text("""
                INSERT INTO users (
                    condominium_id, unit_id, name, 
                    email_encrypted, email_hash, 
                    password_hash, role, status
                ) VALUES (
                    :condo_id, :unit_id, 'Alice Freeman',
                    pgp_sym_encrypt(:email, 'super_secure_key_for_pgcrypto'),
                    encode(digest(:email, 'sha256'), 'hex'),
                    :hashed_pw, 'RESIDENT', 'ACTIVE'
                ) RETURNING id
            """)
            
            result = await db.execute(insert_query, {
                "condo_id": condo_id,
                "unit_id": unit_id,
                "email": user_email,
                "hashed_pw": hashed_pw
            })
            await db.commit()
            print(f"Resident Alice created with ID: {result.scalar()}")

        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(create_resident())
