'use client';

import React, { useState } from 'react';
import { X, Sliders, ShieldAlert, Check } from 'lucide-react';
import { OrchestratorConfig, OrchestratorLimits } from '@/types/database.types';

interface ConfigLimitsModalProps {
  config: OrchestratorConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export function ConfigLimitsModal({
  config,
  isOpen,
  onClose,
  onConfigUpdated,
}: ConfigLimitsModalProps) {
  const initialLimits: OrchestratorLimits = config?.limits || {
    max_lola_searches_per_cycle: 2,
    max_new_candidates_per_cycle: 20,
    max_tito_audits_per_cycle: 10,
    max_bruno_demos_per_cycle: 3,
    max_retries: 2,
  };

  const [limits, setLimits] = useState<OrchestratorLimits>(initialLimits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orchestrator/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limits: {
            max_lola_searches_per_cycle: Number(limits.max_lola_searches_per_cycle),
            max_new_candidates_per_cycle: Number(limits.max_new_candidates_per_cycle),
            max_tito_audits_per_cycle: Number(limits.max_tito_audits_per_cycle),
            max_bruno_demos_per_cycle: Number(limits.max_bruno_demos_per_cycle),
            max_retries: Number(limits.max_retries),
          },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Error al actualizar límites');
      }

      onConfigUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1e2a42] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#162035] bg-[#080d18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Límites Operativos de Patricia
              </h3>
              <p className="text-xs text-slate-400">
                Control de volumen y consumo para autonomía supervisada.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1a2336] text-slate-400 hover:bg-[#131d33] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Estos límites protegen los costos de API y evitan sobrecargar el pipeline comercial
              sin Autorización de CEO.
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Máximo de búsquedas de Lola por ciclo (Google Places)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={limits.max_lola_searches_per_cycle}
                onChange={(e) =>
                  setLimits({ ...limits, max_lola_searches_per_cycle: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Máximo de candidatos nuevos por búsqueda de Lola
              </label>
              <input
                type="number"
                min={5}
                max={40}
                value={limits.max_new_candidates_per_cycle}
                onChange={(e) =>
                  setLimits({ ...limits, max_new_candidates_per_cycle: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Máximo de auditorías de Tito por ciclo
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={limits.max_tito_audits_per_cycle}
                onChange={(e) =>
                  setLimits({ ...limits, max_tito_audits_per_cycle: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Máximo de demos de Bruno por ciclo (Modo Demo)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={limits.max_bruno_demos_per_cycle}
                onChange={(e) =>
                  setLimits({ ...limits, max_bruno_demos_per_cycle: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reintentos automáticos por tarea fallida
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={limits.max_retries}
                onChange={(e) =>
                  setLimits({ ...limits, max_retries: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#162035] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#1a2336] hover:bg-[#131d33] text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Límites'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
