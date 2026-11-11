-- WebPilot AI — Migración: Módulo de Demos del Agente Bruno (100% Idempotente)
-- Tabla client_demos para almacenar propuestas web conceptuales antes de la venta

-- 1. Tipo enumerado para los estados de la demo
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

-- 2. Tabla client_demos
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

-- 3. Índices para búsqueda y relaciones
CREATE INDEX IF NOT EXISTS idx_client_demos_business_id ON client_demos(business_id);
CREATE INDEX IF NOT EXISTS idx_client_demos_status ON client_demos(status);
CREATE INDEX IF NOT EXISTS idx_client_demos_slug ON client_demos(slug);

-- 4. Habilitar RLS de forma segura
ALTER TABLE client_demos ENABLE ROW LEVEL SECURITY;

-- 5. Crear política RLS verificando que no exista previamente (evita error 42710)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_demos' 
        AND policyname = 'Allow all access to client_demos'
    ) THEN
        CREATE POLICY "Allow all access to client_demos"
            ON client_demos FOR ALL
            TO anon, authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 6. Trigger para updated_at automático
DROP TRIGGER IF EXISTS update_client_demos_updated_at ON client_demos;
CREATE TRIGGER update_client_demos_updated_at
    BEFORE UPDATE ON client_demos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
