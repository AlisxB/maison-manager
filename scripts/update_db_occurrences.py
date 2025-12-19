
import asyncio
import os
import sys

# Add backend to path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def update_db():
    print("Connecting to DB...")
    async with engine.begin() as conn:
        print("Creating occurrences table...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS occurrences (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                condominium_id UUID NOT NULL REFERENCES condominiums(id),
                user_id UUID NOT NULL REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(50) NOT NULL CHECK (category IN ('Maintenance', 'Noise', 'Security', 'Other')),
                status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
                admin_response TEXT,
                photo_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))

        print("Enabling RLS...")
        await conn.execute(text("ALTER TABLE occurrences ENABLE ROW LEVEL SECURITY;"))

        print("Creating policies...")
        await conn.execute(text("DROP POLICY IF EXISTS occurrences_select_policy ON occurrences;"))
        await conn.execute(text("""
            CREATE POLICY occurrences_select_policy ON occurrences FOR SELECT
                USING (
                    condominium_id = current_condo_id()
                    AND (
                        current_app_role() = 'ADMIN' OR
                        user_id = current_user_id()
                    )
                );
        """))

        await conn.execute(text("DROP POLICY IF EXISTS occurrences_insert_policy ON occurrences;"))
        await conn.execute(text("""
            CREATE POLICY occurrences_insert_policy ON occurrences FOR INSERT
                WITH CHECK (
                    condominium_id = current_condo_id()
                    AND user_id = current_user_id()
                );
        """))

        await conn.execute(text("DROP POLICY IF EXISTS occurrences_update_policy ON occurrences;"))
        await conn.execute(text("""
            CREATE POLICY occurrences_update_policy ON occurrences FOR UPDATE
                USING (
                    condominium_id = current_condo_id()
                    AND (
                        current_app_role() = 'ADMIN' OR
                        (user_id = current_user_id() AND status = 'OPEN')
                    )
                )
                WITH CHECK (
                    condominium_id = current_condo_id()
                    AND (
                        current_app_role() = 'ADMIN' OR
                        (user_id = current_user_id() AND status = 'OPEN')
                    )
                );
        """))

        print("Creating trigger...")
        await conn.execute(text("DROP TRIGGER IF EXISTS audit_occurrences_trigger ON occurrences;"))
        await conn.execute(text("""
            CREATE TRIGGER audit_occurrences_trigger AFTER INSERT OR UPDATE OR DELETE ON occurrences
                FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
        """))

        print("Done.")

if __name__ == "__main__":
    asyncio.run(update_db())
