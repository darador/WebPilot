'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  Building,
  CheckCircle2,
  Layers,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { Business } from '@/types/database.types';

interface EligibleItem {
  business: Business;
  hasAudit: boolean;
  hasStrategy: boolean;
  recommendedProduct: string;
  hasExistingDemo: boolean;
  existingDemoStatus?: string;
}

interface CreateDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (demo: any) => void;
}

export function CreateDemoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDemoModalProps) {
  const [candidates, setCandidates] = useState<EligibleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [productType, setProductType] = useState('landing-express');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setSelectedBusiness(null);
      fetch('/api/bruno/opportunities')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setCandidates(json.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching eligible businesses:', err);
          setError('No se pudieron cargar los negocios del CRM.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.business.name.toLowerCase().includes(q) ||
      (c.business.industry && c.business.industry.toLowerCase().includes(q)) ||
      (c.business.city && c.business.city.toLowerCase().includes(q))
    );
  });

  const handleGenerate = async () => {
    if (!selectedBusiness) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/bruno/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          productType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Ocurrió un error al generar la demo');
      }

      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error de conexión.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#1a2336] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#162035] bg-[#080d18] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Crear Propuesta Conceptual (Demo) con Bruno
              </h2>
              <p className="text-[11px] text-slate-400">
                Seleccioná un negocio para que Bruno sintetice una muestra web personalizada.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Selector de Producto */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">
              Tipo de Propuesta / Producto
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProductType('landing-express')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  productType === 'landing-express'
                    ? 'border-orange-500/50 bg-orange-950/20 text-white'
                    : 'border-[#1a2336] bg-[#080d18] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-bold block text-xs">Landing Express</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  1 página • 5 secciones • Directo a WhatsApp
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProductType('landing-profesional')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  productType === 'landing-profesional'
                    ? 'border-orange-500/50 bg-orange-950/20 text-white'
                    : 'border-[#1a2336] bg-[#080d18] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-bold block text-xs">Landing Profesional</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Hasta 7 secciones • Formulario y servicios
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProductType('sitio-institucional')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  productType === 'sitio-institucional'
                    ? 'border-orange-500/50 bg-orange-950/20 text-white'
                    : 'border-[#1a2336] bg-[#080d18] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-bold block text-xs">Sitio Institucional</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Multi-página corporativa
                </span>
              </button>
            </div>
          </div>

          {/* Lista de Negocios Disponibles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">
                Seleccionar Negocio ({filteredCandidates.length})
              </label>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar negocio..."
                  className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl border border-[#1a2336] bg-[#070b14] p-2">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500">Cargando prospectos...</div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No se encontraron negocios para generar demo.
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedBusiness?.id === c.business.id;
                  return (
                    <div
                      key={c.business.id}
                      onClick={() => setSelectedBusiness(c.business)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-500 bg-orange-950/30'
                          : 'border-[#162035] bg-[#0c1220] hover:bg-[#11192b]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{c.business.name}</span>
                          {c.hasExistingDemo && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Demo previa: {c.existingDemoStatus}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{c.business.industry || 'Rubro sin especificar'}</span>
                          {c.business.city && <span>• {c.business.city}</span>}
                          {c.business.website ? (
                            <span className="text-cyan-400">Web actual: {c.business.website}</span>
                          ) : (
                            <span className="text-amber-400">Sin web propia</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Información que se utilizará */}
          {selectedBusiness && (
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 space-y-1.5 text-[11px] text-blue-200">
              <span className="font-bold flex items-center gap-1.5 text-blue-300">
                <Compass className="h-3.5 w-3.5" />
                <span>Fuentes que consultará Bruno:</span>
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Datos comerciales registrados en CRM ({selectedBusiness.name})</li>
                <li>Estrategia y servicios detectados por Lola y recomendados por Vera</li>
                <li>Referencias aprobadas de la Biblioteca de Referencias para <strong>{selectedBusiness.industry || 'el rubro'}</strong></li>
                <li>Criterios de no invención: se usarán marcadores provisionales si faltan datos de contacto</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#162035] bg-[#080d18] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-lg border border-[#1a2336] bg-[#0c1220] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#131d33] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedBusiness || isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-500 transition-all disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isGenerating ? 'Bruno está diseñando la demo...' : 'Generar Propuesta con Bruno'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
