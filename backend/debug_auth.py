import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.security import get_password_hash, verify_password
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/maison_manager")

async def debug_auth():
    print(f"Connecting to {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Checking condominiums table...")
        result = await conn.execute(text("SELECT id FROM condominiums"))
        condos = result.fetchall()
        
        condo_id = '11111111-1111-1111-1111-111111111111'
        
        if not condos:
            print("NO CONDOS FOUND. Inserting default condo...")
            await conn.execute(text(f"""
                INSERT INTO condominiums (id, name, cnpj_encrypted, cnpj_hash, address) 
                VALUES (
                    '{condo_id}', 
                    'Maison Heights', 
                    pgp_sym_encrypt('12.345.678/0001-99', 'super_secure_key_for_pgcrypto'), 
                    encode(digest('12.345.678/0001-99', 'sha256'), 'hex'), 
                    'Rua das Palmeiras, 1500'
                );
            """))
            print("Condo inserted.")
        else:
            print(f"Found {len(condos)} condos.")

        print("Checking users table...")
        result = await conn.execute(text("SELECT id, name, email_hash, password_hash, role FROM users"))
        users = result.fetchall()
        
        if not users:
            print("NO USERS FOUND. Inserting Admin User...")
            # Hash for 'admin'
            pw_hash = get_password_hash('admin')
            
            await conn.execute(text(f"""
                INSERT INTO users (
                    id, condominium_id, name, 
                    email_encrypted, email_hash, 
                    password_hash, 
                    role, status
                ) VALUES (
                    '22222222-2222-2222-2222-222222222222',
                    '{condo_id}',
                    'Super Admin',
                    pgp_sym_encrypt('admin@maison.com', 'super_secure_key_for_pgcrypto'),
                    encode(digest('admin@maison.com', 'sha256'), 'hex'),
                    '{pw_hash}',
                    'ADMIN',
                    'ACTIVE'
                );
            """))
            print(f"Admin User inserted with password 'admin' (Hash: {pw_hash})")
        else:
            print(f"Found {len(users)} users.")
            for u in users:
                if u.role == 'ADMIN':
                    is_valid = verify_password('admin', u.password_hash)
                    if not is_valid:
                        new_hash = get_password_hash('admin')
                        await conn.execute(text(f"UPDATE users SET password_hash = '{new_hash}' WHERE id = '{u.id}'"))
                        print("Updated Admin password to 'admin'")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_auth())
