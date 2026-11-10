'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  Briefcase,
  Quote,
  ShieldCheck,
  Search,
  Zap,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { TEAM_MEMBERS, AgentMember } from '@/lib/constants/team';
import { createClient } from '@/lib/supabase/client';
import { LolaSearch } from '@/types/database.types';
import { formatDate } from '@/lib/utils';

export default function TeamPage() {
  const [lastLolaSearch, setLastLolaSearch] = useState<LolaSearch | null>(null);
  const [totalLolaProspects, setTotalLolaProspects] = useState<number>(0);

  useEffect(() => {
    async function loadLolaActivity() {
      try {
        const supabase = createClient();
        const { data: searches } = await supabase
          .from('lola_searches')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (searches && searches.length > 0) {
          setLastLolaSearch(searches[0] as LolaSearch);
        }

        const { count } = await supabase
          .from('lola_candidates')
          .select('*', { count: 'exact', head: true })
          .eq('import_status', 'APROBADO');

        if (count !== null) {
          setTotalLolaProspects(count);
        }
      } catch (err) {
        console.warn('Could not load Lola real activity yet:', err);
      }
    }

    loadLolaActivity();
  }, []);

  return (
    <div>
      <Topbar
        title="Nuestro Equipo de Asistentes Digitales"
        subtitle="Agentes de Inteligencia Artificial especializados para cada fase operativa de la agencia"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Header for Daro and Julieta */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#0a1122] to-blue-950/30 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-cyan-300">
                  <Bot className="h-3 w-3 text-cyan-400" />
                  CENTRO DE OPERACIONES • DARO & JULIETA
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
                Los 6 Asistentes Digitales de WebPilot AI
              </h2>
              <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                Cada miembro de nuestro equipo autónomo cumple una función clave en la agencia: desde encontrar negocios
                locales y auditarlos hasta crear sus propuestas y supervisar entregas de máxima calidad.
              </p>
            </div>

            <Link
              href="/agents/lola"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>Probar a Lola en Vivo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 6 Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEAM_MEMBERS.map((agent) => {
            const isLola = agent.id === 'lola';
            const isOperative = agent.status === 'operativo';

            return (
              <div
                key={agent.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#0c1220] p-5 transition-all duration-200 hover:shadow-xl ${
                  isOperative
                    ? 'border-cyan-500/40 hover:border-cyan-500/70 shadow-lg shadow-cyan-950/20'
                    : 'border-[#1a2336] hover:border-slate-700'
                }`}
              >
                {/* Header with Avatar and Status */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-[#090e1a] border-2 shadow-md"
                        style={{ borderColor: agent.color }}
                      >
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{agent.name}</h3>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                            style={{
                              borderColor: `${agent.color}50`,
                              backgroundColor: `${agent.color}15`,
                              color: agent.color,
                            }}
                          >
                            {agent.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{agent.codename}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                        isOperative
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isOperative ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      {isOperative ? 'Operativa' : 'Próximamente'}
                    </span>
                  </div>

                  {/* Character Quote */}
                  <div className="mt-3.5 rounded-lg bg-[#080d18] border border-[#172238] p-2.5 text-xs text-slate-300 italic flex items-start gap-2">
                    <Quote className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">"{agent.quote}"</span>
                  </div>

                  {/* Personality & Responsibility */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Personalidad
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{agent.personality}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Responsabilidad
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        {agent.responsibility}
                      </p>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-3 border-t border-[#172238] pt-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Tareas Principales
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {agent.assignedTasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Live Activity Section for Lola */}
                  {isLola && (
                    <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs">
                      <div className="flex items-center justify-between font-semibold text-cyan-300 text-[11px] mb-1">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-cyan-400" />
                          Actividad en Tiempo Real
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400">
                          {totalLolaProspects} aprobados
                        </span>
                      </div>
                      {lastLolaSearch ? (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          Última búsqueda: <strong className="text-white">{lastLolaSearch.industry}</strong> en{' '}
                          <strong className="text-white">{lastLolaSearch.city}</strong> ({formatDate(lastLolaSearch.created_at)}).
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          Lista para su primera búsqueda comercial.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-[#172238]">
                  {isOperative ? (
                    <Link
                      href="/agents/lola"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
                    >
                      <span>Abrir panel de Lola</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1 py-1 font-mono text-[11px]">
                      <span>Fase de activación</span>
                      <span>En desarrollo</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
