
import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.core.database import engine
from sqlalchemy import text

async def migrate():
    async with engine.begin() as conn:
        print("Creating announcements table...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS announcements (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                condominium_id UUID NOT NULL REFERENCES condominiums(id),
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                target_audience VARCHAR(100) DEFAULT 'Todos os moradores',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        
        print("Enabling RLS for announcements...")
        await conn.execute(text("ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;"))
        
        print("Creating Policies...")
        # Policy: Everyone in condo can Select
        await conn.execute(text("DROP POLICY IF EXISTS announcements_select_policy ON announcements;"))
        await conn.execute(text("""
            CREATE POLICY announcements_select_policy ON announcements FOR SELECT
            USING (condominium_id = current_condo_id());
        """))
        
        # Policy: Only Admin can Insert/Delete
        await conn.execute(text("DROP POLICY IF EXISTS announcements_modify_policy ON announcements;"))
        await conn.execute(text("""
            CREATE POLICY announcements_modify_policy ON announcements FOR ALL
            USING (condominium_id = current_condo_id() AND current_app_role() = 'ADMIN')
            WITH CHECK (condominium_id = current_condo_id() AND current_app_role() = 'ADMIN');
        """))
        
        print("Done.")

if __name__ == "__main__":
    asyncio.run(migrate())
