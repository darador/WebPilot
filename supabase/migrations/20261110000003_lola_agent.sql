-- WebPilot AI — Fase 2A: Agente Lola (Historial de Búsquedas y Candidatos de Prospección)

-- 1. Tabla de Sesiones/Búsquedas ejecutadas por Lola
CREATE TABLE IF NOT EXISTS lola_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    industry TEXT NOT NULL,
    city TEXT NOT NULL,
    state_province TEXT,
    country TEXT DEFAULT 'Argentina',
    max_results INTEGER DEFAULT 10,
    web_filter TEXT DEFAULT 'ALL',
    status TEXT DEFAULT 'COMPLETADO',
    total_found INTEGER DEFAULT 0,
    with_website INTEGER DEFAULT 0,
    without_website INTEGER DEFAULT 0,
    investigated_count INTEGER DEFAULT 0,
    approved_count INTEGER DEFAULT 0,
    source_used TEXT DEFAULT 'Google Places API (New)',
    duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Tabla de Candidatos encontrados por Lola (previo a aprobación humana)
CREATE TABLE IF NOT EXISTS lola_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES lola_searches(id) ON DELETE CASCADE,
    place_id TEXT,
    name TEXT NOT NULL,
    industry TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'Argentina',
    website TEXT,
    phone TEXT,
    email TEXT,
    source TEXT DEFAULT 'Google Places API (New)',
    url_origin TEXT,
    has_website BOOLEAN DEFAULT false,
    has_whatsapp BOOLEAN DEFAULT false,
    has_forms BOOLEAN DEFAULT false,
    is_mobile_friendly BOOLEAN DEFAULT false,
    site_title TEXT,
    site_description TEXT,
    services_detected TEXT[] DEFAULT ARRAY[]::text[],
    notes TEXT,
    verified_status TEXT DEFAULT 'INVESTIGADO',
    import_status TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADO, DESCARTADO
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_lola_searches_created_at ON lola_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lola_candidates_search_id ON lola_candidates(search_id);
CREATE INDEX IF NOT EXISTS idx_lola_candidates_import_status ON lola_candidates(import_status);
CREATE INDEX IF NOT EXISTS idx_lola_candidates_place_id ON lola_candidates(place_id);

-- 4. Políticas RLS
ALTER TABLE lola_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lola_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to lola_searches" ON lola_searches;
CREATE POLICY "Allow all access to lola_searches"
    ON lola_searches FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to lola_candidates" ON lola_candidates;
CREATE POLICY "Allow all access to lola_candidates"
    ON lola_candidates FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
