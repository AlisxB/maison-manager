import asyncio
import os
import sys

# Ajusta path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# DB URL
DB_URL = "postgresql+asyncpg://postgres:password123@localhost/maison_manager"

async def fix_rls_functions():
    print("Conectando ao DB para corrigir Funções RLS...")
    engine = create_async_engine(DB_URL)
    
    async with engine.begin() as conn:
        print("Aplicando Safe Cast em current_condo_id()...")
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION current_condo_id() RETURNS UUID AS $$
            BEGIN
                BEGIN
                    RETURN NULLIF(current_setting('app.current_condo_id', true), '')::UUID;
                EXCEPTION WHEN OTHERS THEN
                    RETURN NULL;
                END;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        """))
        
        print("Aplicando Safe Cast em current_user_id()...")
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
            BEGIN
                BEGIN
                    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
                EXCEPTION WHEN OTHERS THEN
                    RETURN NULL;
                END;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        """))
        
        print("Sucesso! Funções atualizadas.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_rls_functions())
