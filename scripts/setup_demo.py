import sys
import os
import asyncio
from sqlalchemy import text
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash

import sys
import os
import asyncio
from sqlalchemy import text
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash

async def setup_demo():
    print("Starting Comprehensive Demo Setup (Bootstrap)...")
    async with AsyncSessionLocal() as db:
        try:
            # 0. Set Context for RLS bypass (Creating Admin require no context or Admin context)
            # Actually, to insert creating Condo/Admin we might need to be "in system".
            # Triggers might block if no context. Let's try inserting raw data first.
            
            # 1. Create Condominium if not exists
            check_condo = await db.execute(text("SELECT id FROM condominiums WHERE name = :name LIMIT 1"), {"name": "Maison Heights"})
            condo_id = check_condo.scalar()
            
            if not condo_id:
                print("Creating Condominium...")
                insert_condo = text("""
                    INSERT INTO condominiums (name, cnpj_encrypted, cnpj_hash, address) 
                    VALUES (:name, pgp_sym_encrypt(:cnpj, 'super_secure_key_for_pgcrypto'), encode(digest(:cnpj, 'sha256'), 'hex'), :address)
                    RETURNING id
                """)
                res = await db.execute(insert_condo, {
                    "name": "Maison Heights", 
                    "cnpj": "12.345.678/0001-99", 
                    "address": "Rua das Palmeiras, 1500"
                })
                condo_id = res.scalar()
                print(f"Condo Created: {condo_id}")
            else:
                print(f"Condo Exists: {condo_id}")

            # 2. Create Admin User
            check_admin = await db.execute(text("SELECT id FROM users WHERE email_hash = encode(digest(:email, 'sha256'), 'hex')"), {"email": "admin@maison.com"})
            admin_id = check_admin.scalar()
            
            if not admin_id:
                print("Creating Super Admin...")
                insert_admin = text("""
                    INSERT INTO users (condominium_id, name, email_encrypted, email_hash, password_hash, role, status)
                    VALUES (:condo_id, :name, pgp_sym_encrypt(:email, 'super_secure_key_for_pgcrypto'), encode(digest(:email, 'sha256'), 'hex'), :pwd, 'ADMIN', 'ACTIVE')
                    RETURNING id
                """)
                pwd = get_password_hash("admin")
                res = await db.execute(insert_admin, {
                    "condo_id": condo_id,
                    "name": "Super Admin",
                    "email": "admin@maison.com",
                    "pwd": pwd
                })
                admin_id = res.scalar()
                print(f"Admin Created: {admin_id}")
            else:
                print(f"Admin Exists: {admin_id}")

            # 3. Create Unit 101
            check_unit = await db.execute(text("SELECT id FROM units WHERE number = '101' AND condominium_id = :condo_id"), {"condo_id": condo_id})
            unit_id = check_unit.scalar()
            
            if not unit_id:
                print("Creating Unit 101...")
                insert_unit = text("INSERT INTO units (condominium_id, block, number, type) VALUES (:condo_id, 'A', '101', 'Apartment') RETURNING id")
                res = await db.execute(insert_unit, {"condo_id": condo_id})
                unit_id = res.scalar()
                print(f"Unit 101 Created: {unit_id}")

            # 4. Create Resident Alice
            check_alice = await db.execute(text("SELECT id FROM users WHERE email_hash = encode(digest(:email, 'sha256'), 'hex')"), {"email": "alice@maison.com"})
            alice_id = check_alice.scalar()
            
            if not alice_id:
                print("Creating Resident Alice...")
                insert_user = text("""
                    INSERT INTO users (
                        condominium_id, unit_id, name, email_encrypted, email_hash, password_hash, role, status
                    ) VALUES (
                        :condo_id, :unit_id, 'Alice Resident', 
                        pgp_sym_encrypt(:email, 'super_secure_key_for_pgcrypto'),
                        encode(digest(:email, 'sha256'), 'hex'),
                        :pwd, 'RESIDENT', 'ACTIVE'
                    ) RETURNING id
                """)
                pwd = get_password_hash("resident123")
                res = await db.execute(insert_user, {
                    "condo_id": condo_id,
                    "unit_id": unit_id,
                    "email": "alice@maison.com",
                    "pwd": pwd
                })
                alice_id = res.scalar()
                print(f"Alice Created: {alice_id}")
            else:
                print(f"Alice Exists: {alice_id}")

            # 5. Create Common Areas
            check_area = await db.execute(text("SELECT id FROM common_areas WHERE name = 'Salão de Festas' AND condominium_id = :condo_id"), {"condo_id": condo_id})
            area_id = check_area.scalar()
            
            if not area_id:
                print("Creating Common Areas...")
                # Insert Salão de Festas
                insert_area = text("""
                    INSERT INTO common_areas (condominium_id, name, capacity, price_per_hour, is_active)
                    VALUES (:condo_id, 'Salão de Festas', 80, 150.00, TRUE) RETURNING id
                """)
                res = await db.execute(insert_area, {"condo_id": condo_id})
                area_id = res.scalar()
                
                # Insert Churrasqueira
                await db.execute(text("""
                    INSERT INTO common_areas (condominium_id, name, capacity, price_per_hour, is_active)
                    VALUES (:condo_id, 'Churrasqueira', 20, 50.00, TRUE)
                """), {"condo_id": condo_id})
                print("Common Areas Created.")

            # 6. Create Violation for Alice (if not exists)
            vio_check = await db.execute(text("SELECT id FROM violations WHERE resident_id = :uid LIMIT 1"), {"uid": alice_id})
            if not vio_check.scalar():
                print("Creating Violation...")
                vio_q = text("""
                    INSERT INTO violations (
                        condominium_id, resident_id, type, status, description, amount, occurred_at
                    ) VALUES (
                        :condo_id, :resident_id, 'FINE', 'OPEN', 'Barulho excessivo após 22h', 500.00, NOW() - INTERVAL '2 days'
                    )
                """)
                await db.execute(vio_q, {"condo_id": condo_id, "resident_id": alice_id})
                print("Violation created.")

            # 7. Create Busy Reservation (Tomorrow)
            if area_id and admin_id:
                tomorrow = datetime.now() + timedelta(days=1)
                start_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
                end_time = tomorrow.replace(hour=18, minute=0, second=0, microsecond=0)
                
                # Check exist
                res_check = await db.execute(text("SELECT id FROM reservations WHERE common_area_id = :aid AND start_time = :start"), {
                    "aid": area_id, "start": start_time
                })
                
                if not res_check.scalar():
                    print("Creating Busy Reservation...")
                    res_q = text("""
                        INSERT INTO reservations (
                            condominium_id, common_area_id, user_id, start_time, end_time, status, total_price
                        ) VALUES (
                            :condo_id, :area_id, :user_id, :start, :end, 'CONFIRMED', 150.00
                        )
                    """)
                    await db.execute(res_q, {
                        "condo_id": condo_id, 
                        "area_id": area_id, 
                        "user_id": admin_id,
                        "start": start_time,
                        "end": end_time
                    })
                    print(f"Created Busy Reservation for {tomorrow.date()}")
            
            await db.commit()
            print("Setup Complete!")

        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(setup_demo())
