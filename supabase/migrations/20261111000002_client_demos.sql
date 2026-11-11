-- WebPilot AI — Migración: Módulo de Demos del Agente Bruno
-- Tabla client_demos para almacenar propuestas web conceptuales antes de la venta

DO $$ BEGIN
    CREATE TYPE demo_status AS ENUM (
        'EN_PREPARACION',
        'PENDIENTE_REVISION',
        'APROBADA',
        'RECHAZADA',
        'ENVIADA'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS client_demos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status demo_status DEFAULT 'PENDIENTE_REVISION' NOT NULL,
    product_type TEXT DEFAULT 'landing-express' NOT NULL,
    reference_id UUID REFERENCES industry_references(id) ON DELETE SET NULL,
    reference_name TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para búsqueda y relaciones
CREATE INDEX IF NOT EXISTS idx_client_demos_business_id ON client_demos(business_id);
CREATE INDEX IF NOT EXISTS idx_client_demos_status ON client_demos(status);
CREATE INDEX IF NOT EXISTS idx_client_demos_slug ON client_demos(slug);

-- RLS
ALTER TABLE client_demos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to client_demos" ON client_demos;
CREATE POLICY "Allow all access to client_demos"
    ON client_demos FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger de updated_at
CREATE OR REPLACE TRIGGER update_client_demos_updated_at
    BEFORE UPDATE ON client_demos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
