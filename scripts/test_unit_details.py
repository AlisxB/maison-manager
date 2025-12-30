import sys
import os
import asyncio
from typing import List
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import AsyncSessionLocal
from app.units.service import UnitService
# Ensure models are loaded
from app.users.models import User, OccupationHistory
from app.units.models import Unit
from app.vehicles.models import Vehicle
from app.pets.models import Pet

async def test_unit_details():
    async with AsyncSessionLocal() as db:
        service = UnitService(db)
        
        # 1. Fetch a Unit ID that we know exists (e.g. 101)
        res = await db.execute(text("SELECT id FROM units WHERE number='101' LIMIT 1"))
        unit_id = res.scalar()
        
        if not unit_id:
            print("Unit 101 not found. Skipping.")
            return

        print(f"Testing details for Unit ID: {unit_id}")
        
        # 2. Call Service directly
        try:
            details = await service.get_details(unit_id, 'ADMIN')
            print("--- Unit Details ---")
            print(f"Block: {details['block']}, Number: {details['number']}")
            print(f"Current Residents: {len(details['current_residents'])}")
            for r in details['current_residents']:
                 print(f" - {r['name']} ({r['profile_type']})")
                 
            print(f"History Entries: {len(details['occupation_history'])}")
            for h in details['occupation_history']:
                print(f" - {h['user_name']} ({h['profile_type']}) Start: {h['start_date']}")
                
            print("SUCCESS: Retrieved Unit Details")
        except Exception as e:
            print(f"FAILED: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(test_unit_details())
