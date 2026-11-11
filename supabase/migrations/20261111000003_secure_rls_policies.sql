-- ==============================================================================
-- WebPilot AI — Migración: Seguridad Básica y Endurecimiento de Políticas RLS
-- Fecha: 11 de Noviembre de 2026
-- Objetivo: Proteger los datos internos de WebPilot AI (acceso exclusivo para Daro y Julieta)
--           permitiendo únicamente la lectura pública de propuestas web conceptuales (/demo/[slug]).
-- ==============================================================================

-- 1. Habilitar Row Level Security (RLS) en todas las tablas del sistema
ALTER TABLE IF EXISTS businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lola_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lola_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS industry_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_demos ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas permisivas anteriores (que otorgaban acceso a 'anon')
DROP POLICY IF EXISTS "Allow all access to businesses" ON businesses;
DROP POLICY IF EXISTS "Authenticated users have full access to businesses" ON businesses;

DROP POLICY IF EXISTS "Allow all access to contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users have full access to contacts" ON contacts;

DROP POLICY IF EXISTS "Allow all access to audits" ON audits;
DROP POLICY IF EXISTS "Authenticated users have full access to audits" ON audits;

DROP POLICY IF EXISTS "Allow all access to audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Authenticated users have full access to audit_issues" ON audit_issues;

DROP POLICY IF EXISTS "Allow all access to opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users have full access to opportunities" ON opportunities;

DROP POLICY IF EXISTS "Allow all access to proposals" ON proposals;
DROP POLICY IF EXISTS "Authenticated users have full access to proposals" ON proposals;

DROP POLICY IF EXISTS "Allow all access to sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users have full access to sales" ON sales;

DROP POLICY IF EXISTS "Allow all access to projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users have full access to projects" ON projects;

DROP POLICY IF EXISTS "Allow all access to activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users have full access to activities" ON activities;

DROP POLICY IF EXISTS "Allow all access to lola_searches" ON lola_searches;
DROP POLICY IF EXISTS "Authenticated users have full access to lola_searches" ON lola_searches;

DROP POLICY IF EXISTS "Allow all access to lola_candidates" ON lola_candidates;
DROP POLICY IF EXISTS "Authenticated users have full access to lola_candidates" ON lola_candidates;

DROP POLICY IF EXISTS "Allow all access to industry_references" ON industry_references;
DROP POLICY IF EXISTS "Authenticated users have full access to industry_references" ON industry_references;

DROP POLICY IF EXISTS "Allow all access to client_demos" ON client_demos;
DROP POLICY IF EXISTS "Authenticated users have full access to client_demos" ON client_demos;
DROP POLICY IF EXISTS "Public read-only access to client_demos" ON client_demos;

-- 3. Configurar Políticas Restrictivas: Acceso Completo SOLO a Usuarios Autenticados (Daro y Julieta)

-- 3.1 Negocios / Prospectos
CREATE POLICY "Authenticated users have full access to businesses"
    ON businesses FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.2 Contactos
CREATE POLICY "Authenticated users have full access to contacts"
    ON contacts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.3 Auditorías Técnicas (Tito)
CREATE POLICY "Authenticated users have full access to audits"
    ON audits FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.4 Problemas de Auditoría
CREATE POLICY "Authenticated users have full access to audit_issues"
    ON audit_issues FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.5 Oportunidades Comerciales (Vera y Cata)
CREATE POLICY "Authenticated users have full access to opportunities"
    ON opportunities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.6 Propuestas
CREATE POLICY "Authenticated users have full access to proposals"
    ON proposals FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.7 Ventas
CREATE POLICY "Authenticated users have full access to sales"
    ON sales FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.8 Proyectos
CREATE POLICY "Authenticated users have full access to projects"
    ON projects FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.9 Actividades y Bitácora
CREATE POLICY "Authenticated users have full access to activities"
    ON activities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.10 Búsquedas de Prospección (Lola)
CREATE POLICY "Authenticated users have full access to lola_searches"
    ON lola_searches FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.11 Candidatos de Prospección (Lola)
CREATE POLICY "Authenticated users have full access to lola_candidates"
    ON lola_candidates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3.12 Biblioteca de Referencias por Rubro
CREATE POLICY "Authenticated users have full access to industry_references"
    ON industry_references FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Tabla de Demos de Clientes (Agente Bruno)
-- Daro y Julieta: Control total (crear, editar, aprobar, eliminar)
CREATE POLICY "Authenticated users have full access to client_demos"
    ON client_demos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Visitantes anónimos / Clientes potenciales: ÚNICAMENTE lectura (SELECT) para ver su propuesta web (/demo/[slug])
-- Prohibido INSERT, UPDATE o DELETE a usuarios no autenticados
CREATE POLICY "Public read-only access to client_demos"
    ON client_demos FOR SELECT
    TO anon
    USING (true);
