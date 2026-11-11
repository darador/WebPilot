'use client';

import { X, ExternalLink, CheckCircle2, Layers, Sparkles, Palette, MapPin, Edit3, ShieldCheck, HelpCircle } from 'lucide-react';
import { IndustryReference } from '@/types/database.types';

interface ReferenceDetailModalProps {
  reference: IndustryReference | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (reference: IndustryReference) => void;
}

export function ReferenceDetailModal({
  reference,
  isOpen,
  onClose,
  onEdit,
}: ReferenceDetailModalProps) {
  if (!isOpen || !reference) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="h-3 w-3" />
            Aprobada
          </span>
        );
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-700/50">
            <HelpCircle className="h-3 w-3" />
            Pendiente
          </span>
        );
      case 'DESCARTADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-700/50">
            Descartada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[#1a2336] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#162035] bg-[#080d18] flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-700/40">
                {reference.industry}
              </span>
              {reference.subindustry && (
                <span className="text-xs text-slate-400">
                  • {reference.subindustry}
                </span>
              )}
              {getStatusBadge(reference.status)}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {reference.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {(reference.city || reference.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {reference.city ? `${reference.city}, ` : ''}{reference.country}
                </span>
              )}
              <a
                href={reference.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
              >
                <span>{reference.website_url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(reference);
                }}
                className="p-2 rounded-lg border border-[#1a2336] text-slate-300 hover:bg-[#131d33] hover:text-white transition-colors"
                title="Editar referencia"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-[#1a2336] text-slate-400 hover:bg-[#131d33] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Descripción general */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Descripción General
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed bg-[#080d18] p-3.5 rounded-xl border border-[#162035]">
              {reference.description}
            </p>
          </div>

          {/* Motivo de Selección */}
          <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/15 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-xs">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Motivo por el que fue seleccionado como referencia</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {reference.selection_reason}
            </p>
          </div>

          {/* Puntos Fuertes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Puntos Fuertes Identificados</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reference.strengths.map((strength, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-[#080d18] border border-[#162035]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span className="text-slate-200 text-xs">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estructura de Páginas y Secciones */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-400" />
              <span>Estructura de Páginas y Secciones</span>
            </h3>
            <div className="space-y-1.5">
              {reference.structure.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#080d18] border border-[#162035]"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-200 text-xs">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Funcionalidades y Diseño en 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Funcionalidades */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Funcionalidades Destacadas</span>
              </h3>
              <div className="space-y-1.5">
                {reference.features.map((feat, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#080d18] border border-[#162035] text-xs text-slate-200"
                  >
                    • {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Criterios de Diseño */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-cyan-400" />
                <span>Aspectos de Diseño Relevantes</span>
              </h3>
              <div className="space-y-1.5">
                {reference.design_aspects.map((aspect, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#080d18] border border-[#162035] text-xs text-slate-200"
                  >
                    • {aspect}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Observaciones Internas */}
          {reference.notes && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-400">Observaciones Internas:</span>
              <p className="text-slate-300">{reference.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#162035] bg-[#080d18] flex items-center justify-between">
          <a
            href={reference.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            <span>Abrir sitio original en Google / Navegador</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={onClose}
            className="rounded-lg border border-[#1a2336] bg-[#0c1220] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#131d33] hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
