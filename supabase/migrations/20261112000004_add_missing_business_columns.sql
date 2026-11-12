-- ==============================================================================
-- WebPilot AI — Migración: Columnas opcionales para Businesses (Google Place ID y Dirección)
-- Fecha: 12 de Noviembre de 2026
-- Objetivo: Permitir persistencia opcional de google_place_id y address en la tabla businesses
-- ==============================================================================

ALTER TABLE businesses 
    ADD COLUMN IF NOT EXISTS google_place_id TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_google_place_id ON businesses (google_place_id);
