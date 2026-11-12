-- ==============================================================================
-- WebPilot AI — Migración: Bitácora de Operaciones y Auditoría de Patricia
-- Fecha: 12 de Noviembre de 2026
-- Objetivo: Registrar cronológicamente todas las decisiones, coordinaciones,
--           ejecuciones y resultados de Patricia y los agentes autónomos.
-- ==============================================================================

-- 1. Tabla de Bitácora / Auditoría de Operaciones
CREATE TABLE IF NOT EXISTS orchestrator_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  agent VARCHAR(50) NOT NULL, -- 'PATRICIA' | 'LOLA' | 'TITO' | 'VERA' | 'BRUNO' | 'CATA'
  action_type VARCHAR(100) NOT NULL, -- 'DECISION' | 'CICLO_INICIO' | 'CICLO_FIN' | 'TAREA_INICIADA' | 'TAREA_COMPLETADA' | 'TAREA_FALLIDA' | 'APROBACION_REQUERIDA' | 'OMISION' | etc.
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  business_name VARCHAR(255),
  task_id UUID REFERENCES orchestrator_tasks(id) ON DELETE SET NULL,
  cycle_id VARCHAR(100) NOT NULL, -- Identificador único del ciclo de Patricia
  description TEXT NOT NULL, -- Explicación clara y real de la acción o decisión
  result_summary TEXT, -- Resumen del resultado obtenido
  result_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Metadatos y resultado estructurado
  status VARCHAR(50) NOT NULL DEFAULT 'COMPLETADO', -- 'INICIADO' | 'COMPLETADO' | 'FALLIDO' | 'PENDIENTE' | 'ESPERANDO_APROBACION'
  error_or_reason TEXT, -- Causa de espera, fallo u omisión
  duration_ms INT, -- Duración de la acción en milisegundos
  created_by VARCHAR(100) NOT NULL DEFAULT 'PATRICIA'
);

-- Índices de alto rendimiento para filtros ágiles
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_created_at ON orchestrator_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_cycle_id ON orchestrator_logs(cycle_id);
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_agent ON orchestrator_logs(agent);
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_status ON orchestrator_logs(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_action_type ON orchestrator_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_business_id ON orchestrator_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_orchestrator_logs_business_name ON orchestrator_logs(business_name);

-- 2. Políticas de Seguridad RLS
ALTER TABLE orchestrator_logs ENABLE ROW LEVEL SECURITY;

-- Lectura: Todos los usuarios autenticados (Daro, Julieta y Demo)
DROP POLICY IF EXISTS "Authenticated users can read orchestrator_logs" ON orchestrator_logs;
CREATE POLICY "Authenticated users can read orchestrator_logs"
  ON orchestrator_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserción: Solo usuarios administradores (o funciones del backend/servidor)
DROP POLICY IF EXISTS "Admin users can insert orchestrator_logs" ON orchestrator_logs;
CREATE POLICY "Admin users can insert orchestrator_logs"
  ON orchestrator_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permite si no es el usuario demo
    auth.jwt() IS NULL 
    OR (
      COALESCE(auth.jwt() ->> 'email', '') != 'demo@darador.com'
      AND COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') NOT IN ('DEMO', 'READ_ONLY', 'READONLY')
      AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') NOT IN ('DEMO', 'READ_ONLY', 'READONLY')
    )
  );

-- Opcional: Modificación y borrado solo admins
DROP POLICY IF EXISTS "Admin users can delete orchestrator_logs" ON orchestrator_logs;
CREATE POLICY "Admin users can delete orchestrator_logs"
  ON orchestrator_logs
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() IS NULL 
    OR (
      COALESCE(auth.jwt() ->> 'email', '') != 'demo@darador.com'
      AND COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') NOT IN ('DEMO', 'READ_ONLY', 'READONLY')
    )
  );
