'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  Bot,
  Terminal,
  ExternalLink,
  ChevronRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { OrchestratorLog, OrchestratorAgentName, OrchestratorEventStatus } from '@/types/database.types';
import { LogDetailModal } from './LogDetailModal';

interface ActivityLogViewProps {
  onRefreshTasks?: () => void;
}

const AGENT_BADGES: Record<string, { bg: string; text: string; border: string; name: string }> = {
  PATRICIA: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', name: 'Patricia' },
  LOLA: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', name: 'Lola' },
  TITO: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', name: 'Tito' },
  VERA: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', name: 'Vera' },
  BRUNO: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', name: 'Bruno' },
  CATA: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', name: 'Cata' },
};

export const ActivityLogView: React.FC<ActivityLogViewProps> = () => {
  const [logs, setLogs] = useState<OrchestratorLog[]>([]);
  const [cycles, setCycles] = useState<{ cycle_id: string; started_at: string; event_count: number; last_status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [selectedCycle, setSelectedCycle] = useState<string>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal de Detalle
  const [selectedLog, setSelectedLog] = useState<OrchestratorLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCycle !== 'ALL') params.set('cycle_id', selectedCycle);
      if (selectedAgent !== 'TODOS') params.set('agent', selectedAgent);
      if (selectedStatus !== 'TODOS') params.set('status', selectedStatus);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (dateFilter) params.set('date_from', `${dateFilter}T00:00:00.000Z`);
      params.set('limit', '100');

      const res = await fetch(`/api/orchestrator/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalCount(data.total || 0);
        if (data.cycles) setCycles(data.cycles);
      }
    } catch (err) {
      console.error('Error fetching orchestrator logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCycle, selectedAgent, selectedStatus, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const resetFilters = () => {
    setSelectedCycle('ALL');
    setSelectedAgent('TODOS');
    setSelectedStatus('TODOS');
    setSearchTerm('');
    setDateFilter('');
  };

  const handleOpenDetail = (log: OrchestratorLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  // Métricas rápidas calculadas
  const metrics = useMemo(() => {
    const total = logs.length;
    const decisions = logs.filter((l) => l.action_type === 'DECISION').length;
    const completed = logs.filter((l) => l.status === 'COMPLETADO').length;
    const approvals = logs.filter((l) => l.status === 'ESPERANDO_APROBACION').length;
    const failed = logs.filter((l) => l.status === 'FALLIDO' || l.action_type === 'OMISION').length;
    return { total, decisions, completed, approvals, failed };
  }, [logs]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 shadow-sm">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Total Eventos</span>
          <span className="text-2xl font-bold text-white mt-1 block">{totalCount}</span>
          <span className="text-[10px] text-slate-500">en la bitácora</span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 shadow-sm">
          <span className="text-[11px] font-mono text-indigo-300 block uppercase">Decisiones Patricia</span>
          <span className="text-2xl font-bold text-indigo-400 mt-1 block">{metrics.decisions}</span>
          <span className="text-[10px] text-indigo-300/60">criterios registrados</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 shadow-sm">
          <span className="text-[11px] font-mono text-emerald-300 block uppercase">Acciones Exitosas</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{metrics.completed}</span>
          <span className="text-[10px] text-emerald-300/60">ejecutadas sin error</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 shadow-sm">
          <span className="text-[11px] font-mono text-amber-300 block uppercase">Requiere CEO</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">{metrics.approvals}</span>
          <span className="text-[10px] text-amber-300/60">aguardando revisión</span>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 shadow-sm">
          <span className="text-[11px] font-mono text-red-300 block uppercase">Fallos u Omisiones</span>
          <span className="text-2xl font-bold text-red-400 mt-1 block">{metrics.failed}</span>
          <span className="text-[10px] text-red-300/60">con causa registrada</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre de comercio o texto de la acción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Actualizar eventos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Actualizar</span>
            </button>

            {(selectedCycle !== 'ALL' || selectedAgent !== 'TODOS' || selectedStatus !== 'TODOS' || searchTerm || dateFilter) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* Ciclo Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Ciclo de Patricia
            </label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Todos los ciclos</option>
              {cycles.map((c) => (
                <option key={c.cycle_id} value={c.cycle_id}>
                  {c.cycle_id} ({c.event_count} eventos)
                </option>
              ))}
            </select>
          </div>

          {/* Agente Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Agente
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Todos los agentes</option>
              <option value="PATRICIA">Patricia (Directora)</option>
              <option value="LOLA">Lola (Prospección)</option>
              <option value="TITO">Tito (Auditoría Técnica)</option>
              <option value="VERA">Vera (Estrategia Comercial)</option>
              <option value="BRUNO">Bruno (Demos)</option>
              <option value="CATA">Cata (Seguimiento)</option>
            </select>
          </div>

          {/* Estado Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="COMPLETADO">Completado</option>
              <option value="ESPERANDO_APROBACION">Requiere Autorización CEO</option>
              <option value="FALLIDO">Fallido</option>
              <option value="INICIADO">Iniciado</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Event Timeline List */}
      <div className="rounded-xl bg-[#090e1a] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Línea de Tiempo Operativa ({logs.length} eventos listados)
            </h3>
          </div>

          {selectedCycle !== 'ALL' && (
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
              Filtrado por ciclo: {selectedCycle}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
            <p className="text-xs">Cargando registros de la bitácora...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No se encontraron eventos en la bitácora</p>
            <p className="text-xs max-w-md mx-auto text-slate-500">
              Al ejecutar un ciclo de Patricia o las tareas de los agentes, cada decisión, omisión y resultado quedará registrado aquí cronológicamente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {logs.map((log) => {
              const agentBadge = AGENT_BADGES[log.agent] || AGENT_BADGES.PATRICIA;

              return (
                <div
                  key={log.id}
                  onClick={() => handleOpenDetail(log)}
                  className="p-4 hover:bg-slate-900/50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
                >
                  {/* Left: Time & Agent */}
                  <div className="flex items-start gap-3 min-w-[200px] shrink-0">
                    <div className="text-right shrink-0">
                      <span className="text-slate-300 font-mono font-medium block">
                        {formatTime(log.created_at)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase border ${agentBadge.bg} ${agentBadge.text} ${agentBadge.border}`}
                      >
                        <Bot className="w-3 h-3" />
                        {agentBadge.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {log.action_type}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Content & Business */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {log.business_name && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-700/60">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          {log.business_name}
                        </span>
                      )}

                      {log.status === 'COMPLETADO' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Completado
                        </span>
                      )}

                      {log.status === 'ESPERANDO_APROBACION' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Requiere Autorización de CEO
                        </span>
                      )}

                      {log.status === 'FALLIDO' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Fallido
                        </span>
                      )}

                      {log.status === 'INICIADO' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded-full">
                          Iniciado
                        </span>
                      )}
                    </div>

                    <p className="text-slate-200 leading-relaxed text-xs">
                      {log.description}
                    </p>

                    {/* Error or Reason */}
                    {log.error_or_reason && (
                      <p className="text-[11px] text-red-400 font-mono bg-red-950/20 border-l-2 border-red-500 pl-2 py-0.5">
                        Motivo: {log.error_or_reason}
                      </p>
                    )}

                    {/* Result Summary */}
                    {log.result_summary && !log.error_or_reason && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        Resultado: {log.result_summary}
                      </p>
                    )}
                  </div>

                  {/* Right: Cycle & Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 gap-2">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 max-w-[120px] truncate" title={log.cycle_id}>
                      {log.cycle_id}
                    </span>

                    <span className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] inline-flex items-center gap-1 mt-1">
                      <span>Ver detalle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <LogDetailModal
        log={selectedLog}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onFilterByCycle={(cId) => setSelectedCycle(cId)}
      />
    </div>
  );
};
