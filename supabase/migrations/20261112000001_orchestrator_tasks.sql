-- ==============================================================================
-- WebPilot AI — Migración: Motor de Tareas del Orquestador
-- Fecha: 12 de Noviembre de 2026
-- Objetivo: Crear la infraestructura persistente para el Orquestador Central
--           (coordinación de Lola, Tito, Vera, Bruno y Cata con autonomía supervisada)
-- ==============================================================================

-- 1. Tabla de Tareas del Orquestador
CREATE TABLE IF NOT EXISTS orchestrator_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent VARCHAR(50) NOT NULL, -- 'LOLA' | 'TITO' | 'VERA' | 'BRUNO' | 'CATA'
  task_type VARCHAR(100) NOT NULL, -- 'LOLA_DISCOVERY' | 'TITO_AUDIT' | 'VERA_STRATEGY' | 'BRUNO_DEMO' | 'CATA_FOLLOWUP' | 'APPROVAL_REVIEW'
  workflow_id VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- 'FLUJO_A' | 'FLUJO_B' | 'FLUJO_C' | 'FLUJO_D' | 'MANUAL'
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  business_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE' | 'EN_EJECUCION' | 'ESPERANDO_APROBACION' | 'COMPLETADA' | 'FALLIDA' | 'CANCELADA'
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIA', -- 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 2,
  next_action TEXT,
  requires_human_approval BOOLEAN NOT NULL DEFAULT false,
  approval_status VARCHAR(50), -- 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | NULL
  approval_notes TEXT,
  dedup_key VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by VARCHAR(50) NOT NULL DEFAULT 'ORCHESTRATOR'
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_status ON orchestrator_tasks(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_agent ON orchestrator_tasks(agent);
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_workflow ON orchestrator_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_created_at ON orchestrator_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_business_id ON orchestrator_tasks(business_id);

-- Índice único condicional para garantizar idempotencia y evitar tareas duplicadas concurrentes
CREATE UNIQUE INDEX IF NOT EXISTS idx_orchestrator_tasks_active_dedup
  ON orchestrator_tasks (dedup_key)
  WHERE status IN ('PENDIENTE', 'EN_EJECUCION', 'ESPERANDO_APROBACION') AND dedup_key IS NOT NULL;

-- 2. Tabla de Configuración y Estado del Orquestador
CREATE TABLE IF NOT EXISTS orchestrator_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  is_paused BOOLEAN NOT NULL DEFAULT false,
  active_flows JSONB NOT NULL DEFAULT '{"flujoA": true, "flujoB": true, "flujoC": true, "flujoD": true}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{"max_lola_searches_per_cycle": 2, "max_new_candidates_per_cycle": 20, "max_tito_audits_per_cycle": 10, "max_bruno_demos_per_cycle": 3, "max_retries": 2}'::jsonb,
  last_run_at TIMESTAMPTZ,
  last_run_summary JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Semilla de configuración inicial por defecto
INSERT INTO orchestrator_config (id, is_paused, active_flows, limits, updated_at)
VALUES (
  'default',
  false,
  '{"flujoA": true, "flujoB": true, "flujoC": true, "flujoD": true}'::jsonb,
  '{"max_lola_searches_per_cycle": 2, "max_new_candidates_per_cycle": 20, "max_tito_audits_per_cycle": 10, "max_bruno_demos_per_cycle": 3, "max_retries": 2}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Seguridad RLS
ALTER TABLE orchestrator_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_config ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (Daro y Julieta)
DROP POLICY IF EXISTS "Allow authenticated users full access to orchestrator_tasks" ON orchestrator_tasks;
CREATE POLICY "Allow authenticated users full access to orchestrator_tasks"
  ON orchestrator_tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users full access to orchestrator_config" ON orchestrator_config;
CREATE POLICY "Allow authenticated users full access to orchestrator_config"
  ON orchestrator_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
