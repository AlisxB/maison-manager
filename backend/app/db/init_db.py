from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.all import User, Condominium, Unit
import logging

logger = logging.getLogger(__name__)

async def init_db(db: AsyncSession) -> None:
    try:
        # Check if already seeded
        result = await db.execute(select(User))
        user = result.scalars().first()
        if user:
            logger.info("Database already seeded.")
            return

        logger.info("Seeding database (Automatic Admin Creation)...")
        
        # 1. Set Context (Still useful for audit if triggers are active)
        # We can try to set config, or just rely on fallback.
        try:
           await db.execute(text("SELECT set_config('app.current_condo_id', '11111111-1111-1111-1111-111111111111', false)"))
           await db.execute(text("SELECT set_config('app.current_user_id', '22222222-2222-2222-2222-222222222222', false)"))
           await db.execute(text("SELECT set_config('app.current_role', 'ADMIN', false)"))
        except Exception as e:
           logger.warning(f"Could not set audit context: {e}")

        # 2. Insert Condominium
        await db.execute(text("""
            INSERT INTO condominiums (id, name, cnpj_encrypted, cnpj_hash, address) 
            VALUES (
                '11111111-1111-1111-1111-111111111111', 
                'Maison Heights', 
                pgp_sym_encrypt('12.345.678/0001-99', 'super_secure_key_for_pgcrypto'), 
                encode(digest('12.345.678/0001-99', 'sha256'), 'hex'), 
                'Rua das Palmeiras, 1500'
            ) ON CONFLICT DO NOTHING;
        """))

        # 3. Insert Admin User
        # Using raw SQL to ensure pgcrypto functions work exactly as expected
        await db.execute(text("""
            INSERT INTO users (
                id, condominium_id, name, 
                email_encrypted, email_hash, 
                password_hash, 
                role, status,
                department, work_hours
            ) VALUES (
                '22222222-2222-2222-2222-222222222222',
                '11111111-1111-1111-1111-111111111111',
                'Super Admin',
                pgp_sym_encrypt('admin@maison.com', 'super_secure_key_for_pgcrypto'),
                encode(digest('admin@maison.com', 'sha256'), 'hex'),
                '$2b$12$/Zx8NmnkAUYoy46tlLzK2ec8lzZ2ifMbuFiiRzXEUjngnfUgotfW2',
                'ADMIN',
                'ATIVO',
                'Gestão', '08:00 - 18:00'
            ) ON CONFLICT DO NOTHING;
        """))
        
        # 4. Insert Units
        await db.execute(text("""
            INSERT INTO units (id, condominium_id, block, number, type)
            VALUES 
            (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'A', '101', 'Apartment'),
            (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'A', '102', 'Apartment'),
            (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'B', '201', 'Apartment'),
            (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'B', '202', 'Apartment')
            ON CONFLICT DO NOTHING;
        """))

        await db.commit()
        logger.info("Seeding complete.")

    except Exception as e:
        logger.error(f"Seed Error: {e}")
        # Don't raise, just log. App should still run.
