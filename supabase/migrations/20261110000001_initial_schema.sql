-- WebPilot AI — Fase 1: Migración Inicial de Base de Datos
-- Esquema relacional, Enums, Índices, Triggers y Políticas RLS

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE crm_stage AS ENUM (
        'NUEVO',
        'AUDITADO',
        'SELECCIONADO',
        'CONTACTADO',
        'RESPONDIÓ',
        'NEGOCIACIÓN',
        'GANADO',
        'PERDIDO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'CAMBIO_ESTADO',
        'LLAMADA',
        'EMAIL',
        'REUNION',
        'NOTA',
        'IMPORTACION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_status AS ENUM (
        'PENDIENTE',
        'EN_PROCESO',
        'COMPLETADO',
        'FALLIDO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_severity AS ENUM (
        'CRITICO',
        'ALTO',
        'MEDIO',
        'BAJO',
        'INFO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proposal_status AS ENUM (
        'BORRADOR',
        'ENVIADO',
        'ACEPTADO',
        'RECHAZADO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'PLANIFICACION',
        'EN_DESARROLLO',
        'REVISION',
        'ENTREGADO',
        'CANCELADO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLAS PRINCIPALES

-- 3.1 Negocios (Businesses / Prospectos)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'Argentina',
    website TEXT,
    phone TEXT,
    email TEXT,
    source TEXT DEFAULT 'Manual',
    status crm_stage DEFAULT 'NUEVO' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.2 Contactos de Negocio (Contacts)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    role TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.3 Auditorías Web (Audits)
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    performance_data JSONB DEFAULT '{}'::jsonb,
    seo_data JSONB DEFAULT '{}'::jsonb,
    ai_insights JSONB DEFAULT '{}'::jsonb,
    status audit_status DEFAULT 'PENDIENTE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.4 Problemas detectados en auditorías (Audit Issues)
CREATE TABLE IF NOT EXISTS audit_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity issue_severity DEFAULT 'MEDIO' NOT NULL,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.5 Oportunidades Comerciales (Opportunities)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    estimated_value NUMERIC(12,2) DEFAULT 0 NOT NULL,
    stage crm_stage DEFAULT 'SELECCIONADO' NOT NULL,
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.6 Propuestas Enviadas (Proposals)
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status proposal_status DEFAULT 'BORRADOR' NOT NULL,
    document_url TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.7 Ventas Cerradas (Sales)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    final_amount NUMERIC(12,2) NOT NULL,
    payment_terms TEXT,
    closed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.8 Proyectos de Desarrollo (Projects)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status project_status DEFAULT 'PLANIFICACION' NOT NULL,
    start_date DATE,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.9 Registro de Actividades y Auditoría Comercial (Activities)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type activity_type NOT NULL,
    description TEXT NOT NULL,
    from_stage crm_stage,
    to_stage crm_stage,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_business_id ON contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_audits_business_id ON audits(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_issues_audit_id ON audit_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_issues_business_id ON audit_issues(business_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_business_id ON opportunities(business_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_proposals_business_id ON proposals(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_business_id ON projects(business_id);
CREATE INDEX IF NOT EXISTS idx_activities_business_id ON activities(business_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- 5. TRIGGERS Y FUNCIONES

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de actualización
DROP TRIGGER IF EXISTS trigger_businesses_updated_at ON businesses;
CREATE TRIGGER trigger_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_audits_updated_at ON audits;
CREATE TRIGGER trigger_audits_updated_at
    BEFORE UPDATE ON audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_opportunities_updated_at ON opportunities;
CREATE TRIGGER trigger_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_proposals_updated_at ON proposals;
CREATE TRIGGER trigger_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función y Trigger para auditar automáticamente los cambios de estado en CRM
CREATE OR REPLACE FUNCTION log_business_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO activities (
            business_id,
            user_id,
            type,
            description,
            from_stage,
            to_stage,
            created_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            'CAMBIO_ESTADO',
            'Estado comercial actualizado de ' || OLD.status || ' a ' || NEW.status,
            OLD.status,
            NEW.status,
            now()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_business_stage_change ON businesses;
CREATE TRIGGER trigger_business_stage_change
    AFTER UPDATE OF status ON businesses
    FOR EACH ROW EXECUTE FUNCTION log_business_stage_change();

-- 6. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso interno (uso exclusivo de la agencia)
DROP POLICY IF EXISTS "Authenticated users have full access to businesses" ON businesses;
DROP POLICY IF EXISTS "Allow all access to businesses" ON businesses;
CREATE POLICY "Allow all access to businesses"
    ON businesses FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all access to contacts" ON contacts;
CREATE POLICY "Allow all access to contacts"
    ON contacts FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to audits" ON audits;
DROP POLICY IF EXISTS "Allow all access to audits" ON audits;
CREATE POLICY "Allow all access to audits"
    ON audits FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Allow all access to audit_issues" ON audit_issues;
CREATE POLICY "Allow all access to audit_issues"
    ON audit_issues FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to opportunities" ON opportunities;
DROP POLICY IF EXISTS "Allow all access to opportunities" ON opportunities;
CREATE POLICY "Allow all access to opportunities"
    ON opportunities FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to proposals" ON proposals;
DROP POLICY IF EXISTS "Allow all access to proposals" ON proposals;
CREATE POLICY "Allow all access to proposals"
    ON proposals FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to sales" ON sales;
DROP POLICY IF EXISTS "Allow all access to sales" ON sales;
CREATE POLICY "Allow all access to sales"
    ON sales FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to projects" ON projects;
DROP POLICY IF EXISTS "Allow all access to projects" ON projects;
CREATE POLICY "Allow all access to projects"
    ON projects FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users have full access to activities" ON activities;
DROP POLICY IF EXISTS "Allow all access to activities" ON activities;
CREATE POLICY "Allow all access to activities"
    ON activities FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
