import sys
import os
import asyncio
from sqlalchemy import text
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.database import AsyncSessionLocal

async def create_alice_reservation():
    print("Creating Reservation for Alice...")
    async with AsyncSessionLocal() as db:
        try:
            # Get Alice ID
            alice_res = await db.execute(text("SELECT id, condominium_id FROM users WHERE email_hash = encode(digest('alice@maison.com', 'sha256'), 'hex')"))
            alice = alice_res.fetchone()
            
            if not alice:
                print("Alice not found!")
                return

            # Get Area (Churrasqueira)
            area_res = await db.execute(text("SELECT id FROM common_areas WHERE name LIKE '%Churrasqueira%' LIMIT 1"))
            area_id = area_res.scalar()
            
            if not area_id:
                print("Area not found!")
                return

            # Create Reservation for 3 days from now
            target_date = datetime.now() + timedelta(days=3)
            start_time = target_date.replace(hour=12, minute=0, second=0, microsecond=0)
            end_time = target_date.replace(hour=16, minute=0, second=0, microsecond=0)
            
            insert_q = text("""
                INSERT INTO reservations (
                    condominium_id, common_area_id, user_id, start_time, end_time, status, total_price
                ) VALUES (
                    :condo_id, :area_id, :user_id, :start, :end, 'PENDING', 200.00
                ) RETURNING id
            """)
            
            res = await db.execute(insert_q, {
                "condo_id": alice.condominium_id,
                "area_id": area_id,
                "user_id": alice.id,
                "start": start_time,
                "end": end_time
            })
            rid = res.scalar()
            await db.commit()
            print(f"Reservation Created for Alice! ID: {rid}")
            print(f"Date: {start_time}")

        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(create_alice_reservation())
