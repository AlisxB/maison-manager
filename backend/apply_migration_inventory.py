import asyncio
import os
from dotenv import load_dotenv

# Load env from backend/.env explicitly
env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(env_path)
if not os.getenv("POSTGRES_PASSWORD"):
     # Try current dir
     load_dotenv("backend/.env")

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def apply_migration():
    print("Applying Inventory Migration...")
    
    # Force use of settings for connection string
    database_url = settings.get_database_url()
    engine = create_async_engine(database_url, echo=True)

    async with engine.begin() as conn:
        # Create inventory_items table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS inventory_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                condominium_id UUID NOT NULL REFERENCES condominiums(id),
                name VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                unit VARCHAR(20) NOT NULL,
                min_quantity INTEGER DEFAULT 5,
                location VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        """))
        
        # Enable RLS
        await conn.execute(text("ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;"))
        
        # Create Policy
        await conn.execute(text("DROP POLICY IF EXISTS inventory_policy ON inventory_items;"))
        await conn.execute(text("""
            CREATE POLICY inventory_policy ON inventory_items
                USING (condominium_id = current_setting('app.current_condo_id', true)::uuid)
                WITH CHECK (condominium_id = current_setting('app.current_condo_id', true)::uuid);
        """))

        # Create Audit Trigger (reuse existing function)
        await conn.execute(text("DROP TRIGGER IF EXISTS audit_inventory_trigger ON inventory_items;"))
        await conn.execute(text("""
            CREATE TRIGGER audit_inventory_trigger
            AFTER INSERT OR UPDATE OR DELETE ON inventory_items
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
        """))

    print("Migration applied successfully!")

if __name__ == "__main__":
    asyncio.run(apply_migration())
