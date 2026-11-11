-- WebPilot AI — Migración: Biblioteca de Referencias por Rubro
-- Tabla industry_references con soporte para análisis comparativo de Vera y diseño de Bruno

CREATE TABLE IF NOT EXISTS industry_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    subindustry TEXT,
    website_url TEXT NOT NULL,
    city TEXT,
    country TEXT DEFAULT 'Argentina',
    description TEXT NOT NULL,
    image_url TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,
    structure JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    design_aspects JSONB DEFAULT '[]'::jsonb,
    selection_reason TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'APROBADA' CHECK (status IN ('PENDIENTE', 'APROBADA', 'DESCARTADA')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_industry_references_industry ON industry_references(industry);
CREATE INDEX IF NOT EXISTS idx_industry_references_status ON industry_references(status);

-- RLS
ALTER TABLE industry_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to industry_references" ON industry_references;
CREATE POLICY "Allow all access to industry_references"
    ON industry_references FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger de updated_at
CREATE OR REPLACE TRIGGER update_industry_references_updated_at
    BEFORE UPDATE ON industry_references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Carga inicial de la primera referencia oficial: Dra. Ana Laura Batalles (Odontología)
INSERT INTO industry_references (
    name,
    industry,
    subindustry,
    website_url,
    city,
    country,
    description,
    image_url,
    strengths,
    structure,
    features,
    design_aspects,
    selection_reason,
    notes,
    status
) VALUES (
    'Consultorio Odontológico Dra. Ana Laura Batalles',
    'Odontología',
    'Consultorio odontológico',
    'https://draanalaurabatalles.com.ar/',
    'Quilmes',
    'Argentina',
    'Sitio web profesional de odontología general y estética, con presentación de la profesional, catálogo organizado de tratamientos, canales de contacto y contenido informativo para pacientes.',
    NULL,
    '["Presentación profesional.", "Información de tratamientos y especialidades.", "Presentación de la profesional.", "Integración con WhatsApp.", "Formulario de contacto.", "Ubicación y datos de contacto.", "Preguntas frecuentes.", "Contenido informativo."]'::jsonb,
    '["Hero principal con llamada a la acción", "Sobre la profesional y trayectoria", "Tratamientos y especialidades organizados", "Instalaciones y tecnología del consultorio", "Preguntas frecuentes (FAQs)", "Ubicación, mapa y vías de contacto", "Pie de página con enlaces institucionales"]'::jsonb,
    '["Botón flotante de WhatsApp directo", "Formulario de contacto y solicitud de turnos", "Mapa interactivo de Google Maps", "Diseño totalmente responsive para celulares", "Acordeón interactivo de preguntas frecuentes", "Certificado de seguridad SSL (HTTPS)"]'::jsonb,
    '["Paleta limpia de tonos médicos (azules y neutros)", "Jerarquía tipográfica clara y legible", "Excelente espaciado visual que transmite tranquilidad", "Fotografía profesional del consultorio"]'::jsonb,
    'Sitio web profesional que ofrece una buena presentación de la profesional, información organizada de tratamientos, canales de contacto y contenido informativo para pacientes.',
    'Referencia benchmark para rubro odontológico y consultorios de salud en Buenos Aires. Modelo de presencia digital sólida sin necesidad de venta.',
    'APROBADA'
)
ON CONFLICT DO NOTHING;
