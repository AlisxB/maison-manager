import sys
import os
import asyncio
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import AsyncSessionLocal

async def create_occupation_table():
    async with AsyncSessionLocal() as db:
        try:
            print("Creating occupation_history table...")
            
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS occupation_history (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                condominium_id UUID NOT NULL REFERENCES condominiums(id),
                user_id UUID NOT NULL REFERENCES users(id),
                unit_id UUID REFERENCES units(id),
                profile_type VARCHAR(50) NOT NULL,
                start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                end_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            ALTER TABLE occupation_history ENABLE ROW LEVEL SECURITY;
            
            -- RLS Policies
            -- Admin has full access
            DROP POLICY IF EXISTS occupation_admin_policy ON occupation_history;
            CREATE POLICY occupation_admin_policy ON occupation_history
                USING (
                    condominium_id = NULLIF(current_setting('app.current_condo_id', true), '')::UUID
                    AND NULLIF(current_setting('app.current_role', true), '')::VARCHAR = 'ADMIN'
                )
                WITH CHECK (
                    condominium_id = NULLIF(current_setting('app.current_condo_id', true), '')::UUID
                    AND NULLIF(current_setting('app.current_role', true), '')::VARCHAR = 'ADMIN'
                );

            -- Users can see their own history
            DROP POLICY IF EXISTS occupation_user_policy ON occupation_history;
            CREATE POLICY occupation_user_policy ON occupation_history FOR SELECT
                USING (
                    condominium_id = NULLIF(current_setting('app.current_condo_id', true), '')::UUID
                    AND user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
                );

            -- Audit Trigger
            DROP TRIGGER IF EXISTS audit_occupation_trigger ON occupation_history;
            CREATE TRIGGER audit_occupation_trigger AFTER INSERT OR UPDATE OR DELETE ON occupation_history
                FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
            """
            
            await db.execute(text(create_table_sql))
            await db.commit()
            print("Table occupation_history created successfully.")
            
        except Exception as e:
            print(f"Error creating table: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(create_occupation_table())
