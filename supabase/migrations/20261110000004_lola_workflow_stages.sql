-- WebPilot AI — Fase 2A: Ajuste de flujo en 4 etapas para Lola y optimización de costos
-- Agrega columnas de soporte en lola_searches y lola_candidates

ALTER TABLE lola_searches 
    ADD COLUMN IF NOT EXISTS api_calls_count INTEGER DEFAULT 1;

ALTER TABLE lola_candidates 
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS manually_edited BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS investigated_at TIMESTAMPTZ;

-- Actualizar estados válidos de import_status:
-- 'DESCUBIERTO' -> Hallado en Etapa 1
-- 'INVESTIGADO' -> Datos de contacto y web analizados en Etapa 3
-- 'APROBADO'    -> Incorporado a businesses en Etapa 4
-- 'DESCARTADO'  -> Omitido por el usuario
