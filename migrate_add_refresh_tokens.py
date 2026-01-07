import asyncio
import logging
from app.core.database import engine, Base
from app.users.models import RefreshToken
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_refresh_tokens_table():
    logger.info("Starting migration: Create 'refresh_tokens' table...")
    
    async with engine.begin() as conn:
        # Check if table exists
        result = await conn.execute(text("SELECT to_regclass('public.refresh_tokens')"))
        table_exists = result.scalar() is not None
        
        if table_exists:
            logger.info("Table 'refresh_tokens' already exists. Skipping creation.")
        else:
            logger.info("Creating table 'refresh_tokens'...")
            # Create the table using SQLAlchemy's metadata
            # We filter specifically for the RefreshToken table to avoid recreating others
            await conn.run_sync(RefreshToken.__table__.create)
            logger.info("Table 'refresh_tokens' created successfully.")
            
            # Create Index explicitly if needed, but SQLAlchemy create usually handles indexes defined in model
            logger.info("Verifying indexes...")
            
            # Add RLS Policy manually as SQLAlchemy doesn't handle RLS DDL natively in create_all
            logger.info("Applying RLS Policy...")
            try:
                await conn.execute(text("ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;"))
                await conn.execute(text("""
                    CREATE POLICY refresh_tokens_policy ON refresh_tokens
                    USING (user_id = current_user_id());
                """))
                logger.info("RLS Policy applied.")
            except Exception as e:
                logger.warning(f"Could not apply RLS policy (might already exist or permission error): {e}")

    logger.info("Migration complete.")

if __name__ == "__main__":
    # Ensure we are in the correct directory (backend context)
    import sys
    import os
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    
    asyncio.run(create_refresh_tokens_table())
