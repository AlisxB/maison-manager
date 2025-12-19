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

async def create_announcements_table():
    print("Conectando ao DB para criar tabela announcements...")
    engine = create_async_engine(DB_URL)
    
    async with engine.begin() as conn:
        print("Criando tabela announcements...")
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
        
        print("Habilitando RLS para announcements...")
        await conn.execute(text("ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;"))
        
        print("Criando Policies para announcements...")
        # Admin: Full Access
        await conn.execute(text("""
            CREATE POLICY announcements_admin_policy ON announcements
            USING (
                condominium_id = current_condo_id()
                AND current_app_role() = 'ADMIN'
            )
            WITH CHECK (
                condominium_id = current_condo_id()
                AND current_app_role() = 'ADMIN'
            );
        """))
        
        # Residents/Others: View Only
        await conn.execute(text("""
            CREATE POLICY announcements_select_policy ON announcements FOR SELECT
            USING (condominium_id = current_condo_id());
        """))
        
        print("Sucesso! Tabela criada.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_announcements_table())
