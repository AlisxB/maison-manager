-- Secure Maison Manager Database Initialization
-- Includes: RLS, Pgcrypto, Audit triggers, and Schemas

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tables

-- Condominiums
CREATE TABLE IF NOT EXISTS condominiums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj_encrypted TEXT NOT NULL,
    cnpj_hash VARCHAR(64) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    contact_email_encrypted TEXT,
    contact_email_hash VARCHAR(64),
    gate_phone_encrypted TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;

-- Units
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    block VARCHAR(50), 
    number VARCHAR(20) NOT NULL,
    type VARCHAR(50) DEFAULT 'Apartment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(condominium_id, block, number)
);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    unit_id UUID REFERENCES units(id),
    name VARCHAR(255) NOT NULL,

    email_encrypted TEXT NOT NULL,
    email_hash VARCHAR(64) NOT NULL,
    phone_encrypted TEXT,
    phone_hash VARCHAR(64),
    cpf_encrypted TEXT,
    cpf_hash VARCHAR(64),
    
    password_hash VARCHAR(255) NOT NULL,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'RESIDENT', 'PORTER', 'FINANCIAL')),
    profile_type VARCHAR(20) CHECK (profile_type IN ('OWNER', 'TENANT', 'STAFF')), 
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('ACTIVE', 'PENDING', 'INACTIVE')),
    
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(condominium_id, email_hash)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    plate VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Pets
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id), 
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Common Areas
CREATE TABLE IF NOT EXISTS common_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    name VARCHAR(100) NOT NULL,
    capacity INT,
    price_per_hour DECIMAL(10, 2) DEFAULT 0,
    min_booking_hours INT DEFAULT 1,
    max_booking_hours INT DEFAULT 4,
    monthly_limit_per_unit INT DEFAULT 2,
    opening_hours JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE common_areas ENABLE ROW LEVEL SECURITY;

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    common_area_id UUID NOT NULL REFERENCES common_areas(id),
    user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')),
    total_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    actor_id UUID,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Readings: Water (Individual)
CREATE TABLE IF NOT EXISTS readings_water (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    reading_date DATE NOT NULL,
    image_url TEXT,
    value_m3 DECIMAL(10, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE readings_water ENABLE ROW LEVEL SECURITY;

-- Readings: Gas (Collective)
CREATE TABLE IF NOT EXISTS readings_gas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    supplier VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    cylinder_1_kg DECIMAL(10, 2) NOT NULL,
    cylinder_2_kg DECIMAL(10, 2) NOT NULL,
    cylinder_3_kg DECIMAL(10, 2) NOT NULL,
    cylinder_4_kg DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE readings_gas ENABLE ROW LEVEL SECURITY;

-- Readings: Electricity (Collective)
CREATE TABLE IF NOT EXISTS readings_electricity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id),
    due_date DATE NOT NULL,
    consumption_kwh DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE readings_electricity ENABLE ROW LEVEL SECURITY;

-- 3. Functions & Policies (Zero Trust Logic)

-- Helpers to get session variables
CREATE OR REPLACE FUNCTION current_condo_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_condo_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_role() RETURNS VARCHAR AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_role', true), '')::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Condominiums: Users can only see their own condo info
CREATE POLICY condo_isolation_policy ON condominiums
    USING (id = current_condo_id());

-- Units: Isolation by Tenant
CREATE POLICY tenant_isolation_policy_units ON units
    USING (condominium_id = current_condo_id());

-- Common Areas: Isolation by Tenant
CREATE POLICY tenant_isolation_policy_common_areas ON common_areas
    USING (condominium_id = current_condo_id());

-- Vehicles: Isolation by Tenant
CREATE POLICY tenant_isolation_policy_vehicles ON vehicles
    USING (condominium_id = current_condo_id());

-- Pets: Isolation by Tenant
CREATE POLICY tenant_isolation_policy_pets ON pets
    USING (condominium_id = current_condo_id());

-- Users: Complex Visibility
-- Admin/Porter see all in condo. Users see themselves.
CREATE POLICY users_visibility_policy ON users
    USING (
        condominium_id = current_condo_id() 
        AND (
            current_app_role() IN ('ADMIN', 'PORTER') OR 
            id = current_user_id()
        )
    );

-- Reservations: RBAC
-- Admin sees all. Users see own.
CREATE POLICY reservations_policy ON reservations
    USING (
        condominium_id = current_condo_id() 
        AND (
            current_app_role() = 'ADMIN' OR
            user_id = current_user_id()
        )
    );

-- Audit Logs: Admin Only
CREATE POLICY audit_policy ON audit_logs
    USING (
        condominium_id = current_condo_id()
        AND current_app_role() = 'ADMIN'
    );

-- Readings Policies
-- Water: Admin sees all. Resident sees own unit's.
CREATE POLICY readings_water_policy ON readings_water
    USING (
        condominium_id = current_condo_id()
        AND (
            current_app_role() IN ('ADMIN', 'PORTER') OR 
            unit_id IN (SELECT unit_id FROM users WHERE id = current_user_id())
        )
    );

-- Gas: Admin/Financial sees all. Residents view-only.
CREATE POLICY readings_gas_policy ON readings_gas
    USING (condominium_id = current_condo_id())
    WITH CHECK (condominium_id = current_condo_id() AND current_app_role() IN ('ADMIN', 'FINANCIAL'));

-- Electricity: Admin/Financial sees all. Residents view-only.
CREATE POLICY readings_electricity_policy ON readings_electricity
    USING (condominium_id = current_condo_id())
    WITH CHECK (condominium_id = current_condo_id() AND current_app_role() IN ('ADMIN', 'FINANCIAL'));


-- 4. Triggers (Audit)

CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
DECLARE
    curr_condo UUID;
    curr_user UUID;
BEGIN
    curr_condo := current_condo_id();
    curr_user := current_user_id();

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (condominium_id, actor_id, action, table_name, record_id, new_data)
        VALUES (curr_condo, curr_user, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (condominium_id, actor_id, action, table_name, record_id, old_data, new_data)
        VALUES (curr_condo, curr_user, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (condominium_id, actor_id, action, table_name, record_id, old_data)
        VALUES (curr_condo, curr_user, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Triggers
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_reservations_trigger AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_readings_water_trigger AFTER INSERT OR UPDATE OR DELETE ON readings_water
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_readings_gas_trigger AFTER INSERT OR UPDATE OR DELETE ON readings_gas
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_readings_electricity_trigger AFTER INSERT OR UPDATE OR DELETE ON readings_electricity
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- 5. Seed Initial Data (Optional - to allow first login)

-- Set Context for Audit Triggers (System Setup)
-- Precisamos "enganar" o trigger ou definir um contexto válido para que o insert na audit_logs funcione.
-- Como estamos criando os dados iniciais, definimos o contexto para bater com os IDs que vamos inserir.
SELECT set_config('app.current_condo_id', '11111111-1111-1111-1111-111111111111', false);
-- Para o user_id, como ele ainda não existe no insert, podemos usar um UUID nulo ou o próprio ID que vamos criar.
-- Vamos usar o ID do Super Admin para "auto-criação".
SELECT set_config('app.current_user_id', '22222222-2222-2222-2222-222222222222', false);
SELECT set_config('app.current_role', 'ADMIN', false);

-- Insert a Condominium
INSERT INTO condominiums (id, name, cnpj_encrypted, cnpj_hash, address) 
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'Maison Heights', 
    pgp_sym_encrypt('12.345.678/0001-99', 'super_secure_key_for_pgcrypto'), 
    encode(digest('12.345.678/0001-99', 'sha256'), 'hex'), 
    'Rua das Palmeiras, 1500'
);

-- Insert an Admin User
-- Password: 'admin' (bcrypt hash: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW)
INSERT INTO users (
    id, condominium_id, name, 
    email_encrypted, email_hash, 
    password_hash, 
    role, status
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Super Admin',
    pgp_sym_encrypt('admin@maison.com', 'super_secure_key_for_pgcrypto'),
    encode(digest('admin@maison.com', 'sha256'), 'hex'),
    '$2b$12$/Zx8NmnkAUYoy46tlLzK2ec8lzZ2ifMbuFiiRzXEUjngnfUgotfW2',
    'ADMIN',
    'ACTIVE'
);

-- Insert Units
INSERT INTO units (id, condominium_id, block, number, type)
VALUES 
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'A', '101', 'Apartment'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'A', '102', 'Apartment'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'B', '201', 'Apartment'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'B', '202', 'Apartment');

-- Insert Common Areas
INSERT INTO common_areas (id, condominium_id, name, capacity, price_per_hour, min_booking_hours, max_booking_hours, is_active)
VALUES 
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Salão de Festas', 80, 150.00, 4, 8, TRUE),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Churrasqueira Gourmet', 20, 50.00, 2, 6, TRUE),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Quadra de Tênis', 4, 0.00, 1, 2, TRUE),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Espaço Gourmet', 15, 80.00, 3, 5, TRUE);
