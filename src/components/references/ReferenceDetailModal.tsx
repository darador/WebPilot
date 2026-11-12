'use client';

import {
  X,
  ExternalLink,
  CheckCircle2,
  Layers,
  Sparkles,
  Palette,
  MapPin,
  Edit3,
  ShieldCheck,
  HelpCircle,
  Smartphone,
  User,
  Compass,
  Award,
  MessageCircle,
} from 'lucide-react';
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

          {/* Guía de Calidad y Criterios de Benchmark para Bruno (10 Puntos) */}
          {reference.quality_guidelines && (
            <div className="rounded-xl border border-sky-800/50 bg-gradient-to-b from-[#09152a] to-[#070e1c] p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Guía de Calidad y Criterios de Benchmark para Bruno
                    </h3>
                    <p className="text-[11px] text-sky-300/80">
                      10 criterios observables extraídos de esta web para orientar el diseño de demos del rubro
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Estándar WebPilot
                </span>
              </div>

              {/* 1. Estructura y Orden de Secciones */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">1</span>
                  Estructura completa de la web y orden de sus secciones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reference.quality_guidelines.section_order?.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#080d18] border border-sky-900/30">
                      <span className="font-semibold text-slate-200 block text-[11px]">{idx + 1}. {item.section}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{item.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2 & 3: Estilo Visual y Fotografía */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">2</span>
                    Estilo Visual y Paleta
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {reference.quality_guidelines.visual_style?.palette_description}
                  </p>
                  <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                    <div><strong>Tipografía:</strong> {reference.quality_guidelines.visual_style?.typography_family}</div>
                    <div><strong>Ritmo:</strong> {reference.quality_guidelines.visual_style?.spacing_rhythm}</div>
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">3</span>
                    Uso de Fotografías y Composición
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {reference.quality_guidelines.photography_composition?.style}
                  </p>
                  <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                    <div><strong>Encuadre:</strong> {reference.quality_guidelines.photography_composition?.framing}</div>
                    <div><strong>Atmósfera:</strong> {reference.quality_guidelines.photography_composition?.atmosphere}</div>
                  </div>
                </div>
              </div>

              {/* 4 & 5: Jerarquía de Títulos y Botones CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">4</span>
                    Jerarquía de Títulos y Textos
                  </h4>
                  <div className="text-[11px] text-slate-300 space-y-1.5">
                    <div><span className="text-sky-400 font-semibold">Fórmula Hero:</span> {reference.quality_guidelines.typography_hierarchy?.hero_headline_formula}</div>
                    <div><span className="text-sky-400 font-semibold">Eyebrows:</span> {reference.quality_guidelines.typography_hierarchy?.section_eyebrow_formula}</div>
                    <div><span className="text-sky-400 font-semibold">Cuerpo:</span> {reference.quality_guidelines.typography_hierarchy?.body_readability}</div>
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">5</span>
                    Diseño de Botones y CTAs
                  </h4>
                  <div className="text-[11px] text-slate-300 space-y-1.5">
                    <div><span className="text-emerald-400 font-semibold">Canal:</span> {reference.quality_guidelines.cta_design?.primary_channel}</div>
                    <div><span className="text-emerald-400 font-semibold">Estilo:</span> {reference.quality_guidelines.cta_design?.button_styling}</div>
                    <div><span className="text-emerald-400 font-semibold">Microcopy:</span> {reference.quality_guidelines.cta_design?.microcopy}</div>
                    <div><span className="text-emerald-400 font-semibold">Ubicación:</span> {reference.quality_guidelines.cta_design?.frequency_and_placement}</div>
                  </div>
                </div>
              </div>

              {/* 6 & 7: Tratamientos y Presentación Profesional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">6</span>
                    Presentación de Tratamientos
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    <strong>Diseño:</strong> {reference.quality_guidelines.treatments_presentation?.layout}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>Enfoque:</strong> {reference.quality_guidelines.treatments_presentation?.patient_orientation}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {reference.quality_guidelines.treatments_presentation?.card_elements?.map((el, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {el}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">7</span>
                    Presentación de la Profesional
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    <strong>Foco:</strong> {reference.quality_guidelines.professional_presentation?.focus}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>Tono:</strong> {reference.quality_guidelines.professional_presentation?.tone}
                  </p>
                  <div className="space-y-1 pt-1">
                    {reference.quality_guidelines.professional_presentation?.reassurance_pillars?.map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 8, 9 & 10: Confianza, Mobile y Diferenciadores */}
              <div className="space-y-3 pt-2 border-t border-sky-900/30">
                {/* 8: Confianza */}
                <div>
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">8</span>
                    Elementos de Confianza y Profesionalismo (Sin datos inventados)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {reference.quality_guidelines.trust_elements?.map((el, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#080d18] border border-slate-800 text-[11px] text-slate-300">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{el}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 9: Responsive */}
                <div className="p-3.5 rounded-xl bg-[#080d18] border border-sky-900/30 space-y-1">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">9</span>
                    Experiencia de Navegación en Escritorio y Celular
                  </h4>
                  <p className="text-[11px] text-slate-300"><strong>Escritorio:</strong> {reference.quality_guidelines.responsive_experience?.desktop}</p>
                  <p className="text-[11px] text-slate-300"><strong>Celular:</strong> {reference.quality_guidelines.responsive_experience?.mobile}</p>
                  <p className="text-[11px] text-emerald-300"><strong>Zona del pulgar:</strong> {reference.quality_guidelines.responsive_experience?.thumb_zone_cta}</p>
                </div>

                {/* 10: Diferenciación */}
                <div>
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-mono">10</span>
                    Características que se destacan frente a una plantilla genérica
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {reference.quality_guidelines.differentiating_factors?.map((fact, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#080d18] border border-slate-800 text-[11px] text-slate-200">
                        <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
