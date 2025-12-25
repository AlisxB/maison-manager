import asyncio
import sys
import os
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal

DDL = """
-- 13. Documents (Módulo de Documentos)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) -- Audit
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS
-- Remove policies if exist to avoid errors on re-run
DROP POLICY IF EXISTS documents_admin_policy ON documents;
DROP POLICY IF EXISTS documents_resident_policy ON documents;
DROP TRIGGER IF EXISTS audit_documents_trigger ON documents;

-- Admin: CRUD
CREATE POLICY documents_admin_policy ON documents
    USING (
        condominium_id = current_condo_id()
        AND current_app_role() = 'ADMIN'
    )
    WITH CHECK (
        condominium_id = current_condo_id()
        AND current_app_role() = 'ADMIN'
    );

-- Residents: Read Only & Active Only
CREATE POLICY documents_resident_policy ON documents FOR SELECT
    USING (
        condominium_id = current_condo_id()
        AND is_active = TRUE
    );

-- Audit
CREATE TRIGGER audit_documents_trigger AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
"""

async def create_table():
    async with AsyncSessionLocal() as db:
        print("Executing DDL for Documents...")
        await db.execute(text(DDL))
        await db.commit()
        print("Done.")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(create_table())
