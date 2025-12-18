import asyncio
import asyncpg
from app.core.config import settings

SQL_COMMANDS = [
    """
    CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        condominium_id UUID NOT NULL REFERENCES condominiums(id),
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50),
        date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
        observation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """,
    "ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;",
    """
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'transactions' 
            AND policyname = 'transactions_policy'
        ) THEN
            CREATE POLICY transactions_policy ON transactions
                USING (condominium_id = current_condo_id())
                WITH CHECK (condominium_id = current_condo_id() AND current_app_role() IN ('ADMIN', 'FINANCIAL'));
        END IF;
    END
    $$;
    """,
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_transactions_trigger') THEN
            CREATE TRIGGER audit_transactions_trigger AFTER INSERT OR UPDATE OR DELETE ON transactions
                FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
        END IF;
    END
    $$;
    """
]

async def apply_migration():
    db_url = settings.get_database_url()
    print(f"Connecting to {db_url}...")
    # Parse URI for asyncpg (postgresql+asyncpg://user:pass@host:port/dbname)
    # asyncpg expects separate params or dsn.
    # We can use the string but need to strip 'postgresql+asyncpg://' to 'postgresql://' for some drivers, 
    # but asyncpg connect takes a DSN.
    dsn = str(db_url).replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(dsn)
        print("Connected.")
        
        for sql in SQL_COMMANDS:
            print(f"Executing: {sql[:50]}...")
            await conn.execute(sql)
            print("Done.")
            
        await conn.close()
        print("Migration applied successfully!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(apply_migration())
