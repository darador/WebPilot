-- WebPilot AI — Corrección de Políticas RLS para uso interno
-- Habilita acceso completo tanto a usuarios 'authenticated' como a 'anon' para evitar bloqueos en operaciones locales

-- 1. Negocios (Businesses)
DROP POLICY IF EXISTS "Authenticated users have full access to businesses" ON businesses;
DROP POLICY IF EXISTS "Allow all access to businesses" ON businesses;
CREATE POLICY "Allow all access to businesses"
    ON businesses FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Contactos (Contacts)
DROP POLICY IF EXISTS "Authenticated users have full access to contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all access to contacts" ON contacts;
CREATE POLICY "Allow all access to contacts"
    ON contacts FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Auditorías (Audits)
DROP POLICY IF EXISTS "Authenticated users have full access to audits" ON audits;
DROP POLICY IF EXISTS "Allow all access to audits" ON audits;
CREATE POLICY "Allow all access to audits"
    ON audits FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Problemas de Auditoría (Audit Issues)
DROP POLICY IF EXISTS "Authenticated users have full access to audit_issues" ON audit_issues;
DROP POLICY IF EXISTS "Allow all access to audit_issues" ON audit_issues;
CREATE POLICY "Allow all access to audit_issues"
    ON audit_issues FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Oportunidades (Opportunities)
DROP POLICY IF EXISTS "Authenticated users have full access to opportunities" ON opportunities;
DROP POLICY IF EXISTS "Allow all access to opportunities" ON opportunities;
CREATE POLICY "Allow all access to opportunities"
    ON opportunities FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Propuestas (Proposals)
DROP POLICY IF EXISTS "Authenticated users have full access to proposals" ON proposals;
DROP POLICY IF EXISTS "Allow all access to proposals" ON proposals;
CREATE POLICY "Allow all access to proposals"
    ON proposals FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Ventas (Sales)
DROP POLICY IF EXISTS "Authenticated users have full access to sales" ON sales;
DROP POLICY IF EXISTS "Allow all access to sales" ON sales;
CREATE POLICY "Allow all access to sales"
    ON sales FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Proyectos (Projects)
DROP POLICY IF EXISTS "Authenticated users have full access to projects" ON projects;
DROP POLICY IF EXISTS "Allow all access to projects" ON projects;
CREATE POLICY "Allow all access to projects"
    ON projects FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 9. Actividades (Activities)
DROP POLICY IF EXISTS "Authenticated users have full access to activities" ON activities;
DROP POLICY IF EXISTS "Allow all access to activities" ON activities;
CREATE POLICY "Allow all access to activities"
    ON activities FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
