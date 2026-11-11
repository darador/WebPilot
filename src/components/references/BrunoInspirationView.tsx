'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ExternalLink,
  Layers,
  Palette,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Code,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { IndustryReference } from '@/types/database.types';
import { STANDARD_INDUSTRIES } from '@/services/references.service';

interface BrunoInspirationViewProps {
  references: IndustryReference[];
  onSelectReference: (ref: IndustryReference) => void;
}

export function BrunoInspirationView({
  references,
  onSelectReference,
}: BrunoInspirationViewProps) {
  const approvedRefs = references.filter((r) => r.status === 'APROBADA');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Odontología');

  // Filter approved by selected industry
  const currentRefs = approvedRefs.filter(
    (r) =>
      r.industry.toLowerCase().includes(selectedIndustry.toLowerCase()) ||
      selectedIndustry.toLowerCase().includes(r.industry.toLowerCase())
  );

  const activeRef = currentRefs[0] || approvedRefs[0] || null;

  return (
    <div className="space-y-6">
      {/* Banner de Bruno */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-r from-[#0c162d] via-[#0f1d3a] to-[#0a1120] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-lg shadow-blue-500/20 shrink-0 bg-blue-950/40">
              <Image
                src="/avatars/bruno.png"
                alt="Bruno - Arquitecto de Experiencia y Diseño"
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Agente Bruno • Arquitecto de Experiencia y Diseño
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Modo Inspiración
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Banco de Estructuras, Secciones y Buenas Prácticas
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Utilizamos estas referencias destacadas para identificar qué estructuras y funcionalidades convierten mejor en cada rubro. Diseñamos páginas 100% originales adaptadas a la identidad de cada cliente.
              </p>
            </div>
          </div>

          {/* Regla de Oro de Bruno */}
          <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3.5 max-w-sm shrink-0">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Regla Fundamental de Desarrollo</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-tight">
              Inspirarse no es copiar. <strong>Nunca copiar</strong> textos, fotos, código ni diseños completos. Cada sitio producido por Bruno debe ser una obra original.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Rubros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {STANDARD_INDUSTRIES.map((ind) => {
          const count = approvedRefs.filter((r) =>
            r.industry.toLowerCase().includes(ind.toLowerCase())
          ).length;
          const isSelected = selectedIndustry === ind;

          return (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400'
                  : 'bg-[#0c1220] text-slate-400 hover:text-white border border-[#1a2336] hover:bg-[#121a2e]'
              }`}
            >
              <span>{ind}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido Principal de Inspiración */}
      {activeRef ? (
        <div className="space-y-6">
          {/* Tarjeta del Sitio Referente */}
          <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-700/50">
                  Referencia Modelo Aprobada
                </span>
                <span className="text-xs text-slate-400">
                  Rubro: {activeRef.industry} {activeRef.subindustry ? `• ${activeRef.subindustry}` : ''}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {activeRef.name}
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                {activeRef.selection_reason}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectReference(activeRef)}
                className="px-3 py-1.5 rounded-lg border border-[#1e2a42] bg-[#080d18] text-xs font-medium text-slate-300 hover:bg-[#131d33] hover:text-white transition-colors"
              >
                Ver Ficha Completa
              </button>
              <a
                href={activeRef.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm"
              >
                <span>Inspeccionar Sitio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Cuadrantes de Arquitectura de Desarrollo para Bruno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Estructura de Navegación y Secciones Recomendadas */}
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Layers className="h-4 w-4" />
                <span>1. Estructura de Secciones Recomendada ({activeRef.industry})</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Orden lógico que guía al visitante desde la propuesta de valor inicial hasta la solicitud de turno o contacto:
              </p>
              <div className="space-y-2">
                {activeRef.structure.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#080d18] border border-[#162035]"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-medium text-white block">{sec}</span>
                      <span className="text-[10px] text-slate-400">
                        {idx === 0
                          ? 'Impacto visual inicial, propuesta clara y llamada a la acción sin scroll.'
                          : idx === activeRef.structure.length - 1
                          ? 'Cierre de página con accesos directos, datos fiscales y horarios.'
                          : 'Bloque estructurado con foco en beneficios y resolución de dudas.'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Funcionalidades Interactivas Clave */}
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>2. Funcionalidades Interactivas Clave</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Elementos que facilitan la conversión y mejoran la experiencia del usuario en teléfonos:
              </p>
              <div className="space-y-2">
                {activeRef.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#080d18] border border-[#162035]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-white block">{feat}</span>
                      <span className="text-[10px] text-slate-400">
                        Componente interactivo fundamental para reducir fricción en celulares.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Criterios Visuales y de Diseño */}
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Palette className="h-4 w-4" />
                <span>3. Criterios Visuales y de Marca</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pautas estéticas que transmiten autoridad y tranquilidad en este rubro:
              </p>
              <div className="space-y-2">
                {activeRef.design_aspects.map((aspect, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#080d18] border border-[#162035]"
                  >
                    <Lightbulb className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200">{aspect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Buenas Prácticas del Rubro */}
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>4. Buenas Prácticas Identificadas</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Lecciones comerciales aprendidas para implementar en las propuestas de Bruno:
              </p>
              <div className="space-y-2">
                {activeRef.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#080d18] border border-[#162035]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span className="text-xs text-slate-200">{str}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl border border-[#1a2336] bg-[#0c1220] space-y-3">
          <Compass className="h-8 w-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">
            Sin referencias aprobadas para {selectedIndustry}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Actualmente este rubro está habilitado como categoría pero aún no cuenta con sitios reales cargados. Podés agregar la primera referencia desde el botón superior.
          </p>
        </div>
      )}
    </div>
  );
}
