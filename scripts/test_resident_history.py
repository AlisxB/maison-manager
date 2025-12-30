import sys
import os
import asyncio
from datetime import datetime
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import AsyncSessionLocal
from app.users.service import UserService
from app.users.schemas import UserCreate, UserUpdate
# Import models to ensure registration
from app.units.models import Unit
from app.vehicles.models import Vehicle
from app.pets.models import Pet

# Mock Objects for Context
class MockContext:
    pass

async def test_history():
    async with AsyncSessionLocal() as db:
        service = UserService(db)
        
        # 1. Setup Context
        condo_id_rows = await db.execute(text("SELECT id FROM condominiums LIMIT 1"))
        condo_id = condo_id_rows.scalar()
        
        unit_rows = await db.execute(text("SELECT id FROM units WHERE number='101' LIMIT 1"))
        unit_id = unit_rows.scalar()
        
        # 2. Create User (Tenant)
        print("Creating User as Tenant...")
        user_in = UserCreate(
            name="Test History User",
            email="history_test@maison.com",
            password="Password123!",
            role="RESIDENTE",
            profile_type="INQUILINO",
            unit_id=unit_id,
            phone="11999999999"
        )
        
        try:
            # Delete if exists
            await db.execute(text("DELETE FROM occupation_history WHERE user_id IN (SELECT id FROM users WHERE email_hash = encode(digest(:email, 'sha256'), 'hex'))"), {"email": user_in.email})
            await db.execute(text("DELETE FROM users WHERE email_hash = encode(digest(:email, 'sha256'), 'hex')"), {"email": user_in.email})
            await db.commit()
            
            created_user = await service.create_user(user_in, 'ADMIN', condo_id)
            print(f"User created: {created_user.id}")
            
            # Verify History 1
            h1 = await db.execute(text("SELECT * FROM occupation_history WHERE user_id = :uid"), {"uid": created_user.id})
            logs = h1.fetchall()
            print(f"History Logs count: {len(logs)}")
            assert len(logs) == 1
            assert logs[0].profile_type == "INQUILINO"
            assert logs[0].end_date is None
            
            # 3. Update to Owner
            print("Updating User to Owner...")
            update_in = UserUpdate(profile_type="PROPRIETARIO", unit_id=unit_id) # Same unit, new type
            
            # Mock current user as admin
            updated_user = await service.update_user(str(created_user.id), update_in, "22222222-2222-2222-2222-222222222222", "ADMIN")
            
            # Verify History 2
            h2 = await db.execute(text("SELECT * FROM occupation_history WHERE user_id = :uid ORDER BY created_at"), {"uid": created_user.id})
            logs2 = h2.fetchall()
            print(f"History Logs count: {len(logs2)}")
            
            assert len(logs2) == 2
            
            # Check first log closed
            assert logs2[0].profile_type == "INQUILINO"
            assert logs2[0].end_date is not None
            
            # Check second log active
            assert logs2[1].profile_type == "PROPRIETARIO"
            assert logs2[1].end_date is None
            
            print("SUCCESS: History tracking verified!")
            
            # Cleanup
            await service.delete_user(str(created_user.id), "22222222-2222-2222-2222-222222222222", "ADMIN")
            await db.commit()
            
        except Exception as e:
            print(f"FAILED: {e}")
            await db.rollback()
            raise e

if __name__ == "__main__":
    asyncio.run(test_history())
