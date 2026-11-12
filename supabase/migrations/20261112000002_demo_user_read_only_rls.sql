-- ==============================================================================
-- WebPilot AI — Migración: Seguridad de Usuario Demo de Solo Lectura (RLS)
-- Fecha: 12 de Noviembre de 2026
-- Objetivo: Garantizar que el usuario demo (demo@darador.com / rol DEMO) tenga acceso
--           estrictamente de LECTURA (SELECT) en todas las tablas, impidiendo
--           cualquier inserción, modificación o eliminación directa desde la base de datos.
--           Daro y Julieta conservan todos sus permisos administrativos (READ + WRITE).
-- ==============================================================================

-- 1. Función para verificar si el usuario conectado es administrador (Daro / Julieta)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    auth.jwt() IS NOT NULL
    AND COALESCE(auth.jwt() ->> 'email', '') != 'demo@darador.com'
    AND COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') NOT IN ('DEMO', 'READ_ONLY', 'READONLY')
    AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') NOT IN ('DEMO', 'READ_ONLY', 'READONLY')
  );
$$;

-- 2. Asegurar que si el usuario demo@darador.com existe, tenga el rol DEMO en su metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"DEMO"')
WHERE email = 'demo@darador.com';

-- ==============================================================================
-- 3. Actualización de Políticas RLS por Tabla
-- ==============================================================================

-- 3.1 Negocios (businesses)
DROP POLICY IF EXISTS "Authenticated users have full access to businesses" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can read businesses" ON businesses;
DROP POLICY IF EXISTS "Admin users can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Admin users can update businesses" ON businesses;
DROP POLICY IF EXISTS "Admin users can delete businesses" ON businesses;

CREATE POLICY "Authenticated users can read businesses"
    ON businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert businesses"
    ON businesses FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update businesses"
    ON businesses FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete businesses"
    ON businesses FOR DELETE TO authenticated USING (is_admin_user());

-- 3.2 Contactos (contacts)
DROP POLICY IF EXISTS "Authenticated users have full access to contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can read contacts" ON contacts;
DROP POLICY IF EXISTS "Admin users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Admin users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Admin users can delete contacts" ON contacts;

CREATE POLICY "Authenticated users can read contacts"
    ON contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert contacts"
    ON contacts FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update contacts"
    ON contacts FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete contacts"
    ON contacts FOR DELETE TO authenticated USING (is_admin_user());

-- 3.3 Auditorías Técnicas (audits)
DROP POLICY IF EXISTS "Authenticated users have full access to audits" ON audits;
DROP POLICY IF EXISTS "Authenticated users can read audits" ON audits;
DROP POLICY IF EXISTS "Admin users can insert audits" ON audits;
DROP POLICY IF EXISTS "Admin users can update audits" ON audits;
DROP POLICY IF EXISTS "Admin users can delete audits" ON audits;

CREATE POLICY "Authenticated users can read audits"
    ON audits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert audits"
    ON audits FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update audits"
    ON audits FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete audits"
    ON audits FOR DELETE TO authenticated USING (is_admin_user());

-- 3.4 Problemas de Auditoría (audit_issues)
DROP POLICY IF EXISTS "Authenticated users have full access to audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Authenticated users can read audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Admin users can insert audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Admin users can update audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Admin users can delete audit_issues" ON audit_issues;

CREATE POLICY "Authenticated users can read audit_issues"
    ON audit_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert audit_issues"
    ON audit_issues FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update audit_issues"
    ON audit_issues FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete audit_issues"
    ON audit_issues FOR DELETE TO authenticated USING (is_admin_user());

-- 3.5 Oportunidades Comerciales (opportunities)
DROP POLICY IF EXISTS "Authenticated users have full access to opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can read opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admin users can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admin users can update opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admin users can delete opportunities" ON opportunities;

CREATE POLICY "Authenticated users can read opportunities"
    ON opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert opportunities"
    ON opportunities FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update opportunities"
    ON opportunities FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete opportunities"
    ON opportunities FOR DELETE TO authenticated USING (is_admin_user());

-- 3.6 Propuestas (proposals)
DROP POLICY IF EXISTS "Authenticated users have full access to proposals" ON proposals;
DROP POLICY IF EXISTS "Authenticated users can read proposals" ON proposals;
DROP POLICY IF EXISTS "Admin users can insert proposals" ON proposals;
DROP POLICY IF EXISTS "Admin users can update proposals" ON proposals;
DROP POLICY IF EXISTS "Admin users can delete proposals" ON proposals;

CREATE POLICY "Authenticated users can read proposals"
    ON proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert proposals"
    ON proposals FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update proposals"
    ON proposals FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete proposals"
    ON proposals FOR DELETE TO authenticated USING (is_admin_user());

-- 3.7 Ventas (sales)
DROP POLICY IF EXISTS "Authenticated users have full access to sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can read sales" ON sales;
DROP POLICY IF EXISTS "Admin users can insert sales" ON sales;
DROP POLICY IF EXISTS "Admin users can update sales" ON sales;
DROP POLICY IF EXISTS "Admin users can delete sales" ON sales;

CREATE POLICY "Authenticated users can read sales"
    ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert sales"
    ON sales FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update sales"
    ON sales FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete sales"
    ON sales FOR DELETE TO authenticated USING (is_admin_user());

-- 3.8 Proyectos (projects)
DROP POLICY IF EXISTS "Authenticated users have full access to projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can read projects" ON projects;
DROP POLICY IF EXISTS "Admin users can insert projects" ON projects;
DROP POLICY IF EXISTS "Admin users can update projects" ON projects;
DROP POLICY IF EXISTS "Admin users can delete projects" ON projects;

CREATE POLICY "Authenticated users can read projects"
    ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert projects"
    ON projects FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update projects"
    ON projects FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete projects"
    ON projects FOR DELETE TO authenticated USING (is_admin_user());

-- 3.9 Actividades CRM (activities)
DROP POLICY IF EXISTS "Authenticated users have full access to activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can read activities" ON activities;
DROP POLICY IF EXISTS "Admin users can insert activities" ON activities;
DROP POLICY IF EXISTS "Admin users can update activities" ON activities;
DROP POLICY IF EXISTS "Admin users can delete activities" ON activities;

CREATE POLICY "Authenticated users can read activities"
    ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert activities"
    ON activities FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update activities"
    ON activities FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete activities"
    ON activities FOR DELETE TO authenticated USING (is_admin_user());

-- 3.10 Búsquedas de Lola (lola_searches)
DROP POLICY IF EXISTS "Authenticated users have full access to lola_searches" ON lola_searches;
DROP POLICY IF EXISTS "Authenticated users can read lola_searches" ON lola_searches;
DROP POLICY IF EXISTS "Admin users can insert lola_searches" ON lola_searches;
DROP POLICY IF EXISTS "Admin users can update lola_searches" ON lola_searches;
DROP POLICY IF EXISTS "Admin users can delete lola_searches" ON lola_searches;

CREATE POLICY "Authenticated users can read lola_searches"
    ON lola_searches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert lola_searches"
    ON lola_searches FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update lola_searches"
    ON lola_searches FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete lola_searches"
    ON lola_searches FOR DELETE TO authenticated USING (is_admin_user());

-- 3.11 Candidatos de Lola (lola_candidates)
DROP POLICY IF EXISTS "Authenticated users have full access to lola_candidates" ON lola_candidates;
DROP POLICY IF EXISTS "Authenticated users can read lola_candidates" ON lola_candidates;
DROP POLICY IF EXISTS "Admin users can insert lola_candidates" ON lola_candidates;
DROP POLICY IF EXISTS "Admin users can update lola_candidates" ON lola_candidates;
DROP POLICY IF EXISTS "Admin users can delete lola_candidates" ON lola_candidates;

CREATE POLICY "Authenticated users can read lola_candidates"
    ON lola_candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert lola_candidates"
    ON lola_candidates FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update lola_candidates"
    ON lola_candidates FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete lola_candidates"
    ON lola_candidates FOR DELETE TO authenticated USING (is_admin_user());

-- 3.12 Biblioteca de Referencias (industry_references)
DROP POLICY IF EXISTS "Authenticated users have full access to industry_references" ON industry_references;
DROP POLICY IF EXISTS "Authenticated users can read industry_references" ON industry_references;
DROP POLICY IF EXISTS "Admin users can insert industry_references" ON industry_references;
DROP POLICY IF EXISTS "Admin users can update industry_references" ON industry_references;
DROP POLICY IF EXISTS "Admin users can delete industry_references" ON industry_references;

CREATE POLICY "Authenticated users can read industry_references"
    ON industry_references FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert industry_references"
    ON industry_references FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update industry_references"
    ON industry_references FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete industry_references"
    ON industry_references FOR DELETE TO authenticated USING (is_admin_user());

-- 3.13 Demos Comerciales (client_demos)
DROP POLICY IF EXISTS "Authenticated users have full access to client_demos" ON client_demos;
DROP POLICY IF EXISTS "Authenticated users can read client_demos" ON client_demos;
DROP POLICY IF EXISTS "Admin users can insert client_demos" ON client_demos;
DROP POLICY IF EXISTS "Admin users can update client_demos" ON client_demos;
DROP POLICY IF EXISTS "Admin users can delete client_demos" ON client_demos;

CREATE POLICY "Authenticated users can read client_demos"
    ON client_demos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert client_demos"
    ON client_demos FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update client_demos"
    ON client_demos FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete client_demos"
    ON client_demos FOR DELETE TO authenticated USING (is_admin_user());

-- 3.14 Tareas de Patricia (orchestrator_tasks)
DROP POLICY IF EXISTS "Allow authenticated read/write on orchestrator_tasks" ON orchestrator_tasks;
DROP POLICY IF EXISTS "Authenticated users can read orchestrator_tasks" ON orchestrator_tasks;
DROP POLICY IF EXISTS "Admin users can insert orchestrator_tasks" ON orchestrator_tasks;
DROP POLICY IF EXISTS "Admin users can update orchestrator_tasks" ON orchestrator_tasks;
DROP POLICY IF EXISTS "Admin users can delete orchestrator_tasks" ON orchestrator_tasks;

CREATE POLICY "Authenticated users can read orchestrator_tasks"
    ON orchestrator_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can insert orchestrator_tasks"
    ON orchestrator_tasks FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can update orchestrator_tasks"
    ON orchestrator_tasks FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin users can delete orchestrator_tasks"
    ON orchestrator_tasks FOR DELETE TO authenticated USING (is_admin_user());

-- 3.15 Configuración del Orquestador (orchestrator_config)
DROP POLICY IF EXISTS "Allow authenticated read/write on orchestrator_config" ON orchestrator_config;
DROP POLICY IF EXISTS "Authenticated users can read orchestrator_config" ON orchestrator_config;
DROP POLICY IF EXISTS "Admin users can update orchestrator_config" ON orchestrator_config;

CREATE POLICY "Authenticated users can read orchestrator_config"
    ON orchestrator_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users can update orchestrator_config"
    ON orchestrator_config FOR UPDATE TO authenticated USING (is_admin_user()) WITH CHECK (is_admin_user());
