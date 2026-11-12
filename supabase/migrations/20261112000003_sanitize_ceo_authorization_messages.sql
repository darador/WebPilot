-- ==============================================================================
-- WebPilot AI — Migración: Sanitización de mensajes para Autorización de CEO
-- Fecha: 12 de Noviembre de 2026
-- ==============================================================================

-- Actualizar registros existentes en orchestrator_tasks
UPDATE orchestrator_tasks
SET next_action = REPLACE(
  REPLACE(
    REPLACE(next_action, 'Esperando revisión y aprobación de Daro o Julieta en el visor.', 'Requiere Autorización de CEO en el visor.'),
    'Espera aprobación humana de Daro o Julieta.', 'Requiere Autorización de CEO.'
  ),
  'Daro o Julieta', 'CEO'
)
WHERE next_action ILIKE '%daro%' OR next_action ILIKE '%julieta%';
