import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:password123@localhost:5432/maison_manager"
)

DROP_POLICY_SQL = "DROP POLICY IF EXISTS documents_admin_policy ON documents;"

CREATE_POLICY_SQL = """
CREATE POLICY documents_admin_policy ON documents
    USING (
        condominium_id = current_condo_id()
        AND current_app_role() IN ('ADMIN', 'SINDICO')
    )
    WITH CHECK (
        condominium_id = current_condo_id()
        AND current_app_role() IN ('ADMIN', 'SINDICO')
    );
"""

async def run_migration():
    print("Connecting to database...")
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        print("Dropping old policy...")
        await conn.execute(text(DROP_POLICY_SQL))
        
        print("Creating new policy...")
        await conn.execute(text(CREATE_POLICY_SQL))
        
        print("Policy updated successfully.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
