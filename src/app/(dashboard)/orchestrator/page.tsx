'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Network,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Bot,
  Sparkles,
  SearchCode,
  Target,
  Palette,
  PhoneCall,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Layers,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { CreateTaskModal } from '@/components/orchestrator/CreateTaskModal';
import { TaskDetailModal } from '@/components/orchestrator/TaskDetailModal';
import { ConfigLimitsModal } from '@/components/orchestrator/ConfigLimitsModal';
import { ActivityLogView } from '@/components/orchestrator/ActivityLogView';
import { DemoBadge } from '@/components/common/DemoBadge';
import { DemoNoticeModal } from '@/components/common/DemoNoticeModal';
import { useUserRole } from '@/lib/auth/useUserRole';
import {
  OrchestratorAgentName,
  OrchestratorConfig,
  OrchestratorPriority,
  OrchestratorTask,
  OrchestratorTaskStatus,
  OrchestratorWorkflowId,
} from '@/types/database.types';

function formatNextAction(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/esperando revisión y aprobación de daro o julieta en el visor\.?/gi, 'Requiere Autorización de CEO en el visor.')
    .replace(/espera aprobación humana de daro o julieta\.?/gi, 'Requiere Autorización de CEO.')
    .replace(/revisión y aprobación de daro o julieta/gi, 'Autorización de CEO')
    .replace(/aprobación humana de daro o julieta/gi, 'Autorización de CEO')
    .replace(/daro o julieta/gi, 'CEO')
    .replace(/daro y julieta/gi, 'CEO');
}

export default function OrchestratorPage() {
  const [overview, setOverview] = useState<any>(null);
  const [tasks, setTasks] = useState<OrchestratorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [cycleNotice, setCycleNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mando' | 'bitacora'>('mando');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [agentFilter, setAgentFilter] = useState<string>('TODOS');
  const [workflowFilter, setWorkflowFilter] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAgentForCreate, setSelectedAgentForCreate] = useState<OrchestratorAgentName | undefined>(undefined);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<OrchestratorTask | null>(null);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);

  const { isDemo } = useUserRole();
  const [demoNoticeAction, setDemoNoticeAction] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ovRes, tasksRes] = await Promise.all([
        fetch('/api/orchestrator/overview'),
        fetch('/api/orchestrator/tasks?limit=50'),
      ]);

      const ovJson = await ovRes.json();
      const tasksJson = await tasksRes.json();

      if (ovJson.success) setOverview(ovJson.data);
      if (tasksJson.success) setTasks(tasksJson.data || []);
    } catch (err) {
      console.error('Error fetching orchestrator data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunCycle = async () => {
    if (isDemo) {
      setDemoNoticeAction('ejecutar ciclos del orquestador');
      return;
    }

    setIsCycling(true);
    setCycleNotice(null);
    try {
      const res = await fetch('/api/orchestrator/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        const sum = json.data;
        const tasksDone = sum?.tasks_completed ?? sum?.processedTasks ?? 0;
        const tasksNew = sum?.tasks_created ?? sum?.chainsTriggered ?? 0;
        const approvals = sum?.approvals_needed ?? 0;
        setCycleNotice(
          `Ciclo completado: ${tasksDone} tareas completadas, ${tasksNew} nuevas acciones iniciadas${approvals > 0 ? ` (${approvals} requieren Autorización de CEO)` : ''}.`
        );
        fetchData();
        setTimeout(() => setCycleNotice(null), 6000);
      } else {
        setCycleNotice(`Error en el ciclo: ${json.error}`);
      }
    } catch (err: any) {
      setCycleNotice(`Error al ejecutar ciclo: ${err.message}`);
    } finally {
      setIsCycling(false);
    }
  };

  const handleTogglePause = async (currentlyPaused: boolean) => {
    if (isDemo) {
      setDemoNoticeAction('pausar o reanudar a Patricia');
      return;
    }

    try {
      const res = await fetch('/api/orchestrator/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paused: !currentlyPaused }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling orchestrator pause:', err);
    }
  };

  const handleToggleFlow = async (flowId: OrchestratorWorkflowId, currentEnabled: boolean) => {
    if (isDemo) {
      setDemoNoticeAction('activar o desactivar flujos operativos');
      return;
    }

    try {
      const res = await fetch('/api/orchestrator/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toggle_flow: flowId,
          flow_enabled: !currentEnabled,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling flow:', err);
    }
  };

  const handleQuickApprove = async (taskId: string, approve: boolean) => {
    if (isDemo) {
      setDemoNoticeAction('aprobar o rechazar tareas');
      return;
    }

    try {
      const res = await fetch(`/api/orchestrator/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: approve ? 'APPROVE' : 'REJECT',
          notes: approve ? 'Aprobada rápidamente desde el panel' : 'Rechazada desde el panel',
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error in quick approval:', err);
    }
  };

  const isPaused = overview?.config?.is_paused ?? false;
  const metrics = overview?.metrics || {
    pending: 0,
    running: 0,
    waitingApproval: 0,
    completed: 0,
    failed: 0,
    total: 0,
  };
  const pendingApprovals: OrchestratorTask[] = overview?.pendingApprovals || [];
  const agentStatuses = overview?.agentStatuses || [];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'TODOS' && t.status !== statusFilter) return false;
    if (agentFilter !== 'TODOS' && t.agent !== agentFilter) return false;
    if (workflowFilter !== 'TODOS' && t.workflow_id !== workflowFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchType = t.task_type.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchNext = (t.next_action || '').toLowerCase().includes(q);
      const matchErr = (t.error_message || '').toLowerCase().includes(q);
      if (!matchType && !matchId && !matchNext && !matchErr) return false;
    }
    return true;
  });

  const getPriorityBadge = (p: OrchestratorPriority) => {
    switch (p) {
      case 'CRITICA':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">Crítica</span>;
      case 'ALTA':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Alta</span>;
      case 'MEDIA':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">Media</span>;
      case 'BAJA':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-400">Baja</span>;
    }
  };

  const getStatusBadge = (s: OrchestratorTaskStatus) => {
    switch (s) {
      case 'PENDIENTE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">Pendiente</span>;
      case 'EN_EJECUCION':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 animate-pulse border border-blue-500/30">En Ejecución</span>;
      case 'ESPERANDO_APROBACION':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Aprobación</span>;
      case 'COMPLETADA':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Completada</span>;
      case 'FALLIDA':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">Fallida</span>;
      case 'CANCELADA':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 text-slate-500">Cancelada</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <Topbar
        title="Patricia — Directora de Operaciones"
        subtitle="Orquestadora Central con Autonomía Supervisada • Coordinación de Lola, Tito, Vera, Bruno y Cata"
      />

      {isDemo && (
        <div className="px-6 pt-2">
          <DemoBadge variant="full" />
        </div>
      )}

      <div className="px-6 space-y-6">
        {/* Banner Principal de Patricia */}
        <div className="p-5 rounded-2xl border border-[#162035] bg-[#0c1220] shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Network className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Patricia • Directora de Operaciones
                    </h2>
                    {isPaused ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Pause className="h-3 w-3" />
                        Pausada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        Activa y Operativa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Patricia mantiene el equipo activo: detecta tareas, asigna trabajo a Lola, Tito, Vera, Bruno y Cata, y protege las decisiones con supervisión de CEO.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Global Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleRunCycle}
                disabled={isCycling || isPaused}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:shadow-cyan-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCycling ? 'animate-spin' : ''}`} />
                <span>{isCycling ? 'Ejecutando Ciclo...' : 'Ejecutar Ciclo de Patricia'}</span>
              </button>

              <button
                onClick={() => handleTogglePause(isPaused)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  isPaused
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                <span>{isPaused ? 'Reanudar a Patricia' : 'Pausar a Patricia'}</span>
              </button>

              <button
                onClick={() => {
                  if (isDemo) {
                    setDemoNoticeAction('crear o asignar tareas a los agentes');
                    return;
                  }
                  setSelectedAgentForCreate(undefined);
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1e2a42] bg-[#080d18] hover:bg-[#131d33] text-xs font-semibold text-slate-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-cyan-400" />
                <span>Nueva Tarea</span>
              </button>

              <button
                onClick={() => {
                  if (isDemo) {
                    setDemoNoticeAction('modificar límites operativos');
                    return;
                  }
                  setIsLimitsOpen(true);
                }}
                className="p-2 rounded-xl border border-[#1e2a42] bg-[#080d18] hover:bg-[#131d33] text-slate-300 hover:text-white transition-colors"
                title="Configurar límites operativos de Patricia"
              >
                <Sliders className="h-4 w-4" />
              </button>
            </div>
          </div>

          {cycleNotice && (
            <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 animate-in fade-in flex items-center justify-between">
              <span>{cycleNotice}</span>
              <button onClick={() => setCycleNotice(null)} className="text-cyan-400 hover:text-white font-bold ml-2">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs: Centro de Mando vs Bitácora de Operaciones */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('mando')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mando'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Centro de Mando</span>
          </button>

          <button
            onClick={() => setActiveTab('bitacora')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bitacora'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Bitácora de Operaciones</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
              Auditoría
            </span>
          </button>
        </div>

        {activeTab === 'bitacora' ? (
          <ActivityLogView onRefreshTasks={fetchData} />
        ) : (
          <>
            {/* 4 Tarjetas de Métricas Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-[#162035] bg-[#0c1220]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Tareas Pendientes</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{metrics.pending}</span>
              <span className="text-xs text-slate-400">en cola de trabajo</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[#162035] bg-[#0c1220]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">En Ejecución</span>
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-400">{metrics.running}</span>
              <span className="text-xs text-slate-400">procesándose ahora</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            metrics.waitingApproval > 0
              ? 'border-amber-500/50 bg-amber-500/10'
              : 'border-[#162035] bg-[#0c1220]'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Aprobación Humana</span>
              <ShieldCheck className={`h-4 w-4 ${metrics.waitingApproval > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${metrics.waitingApproval > 0 ? 'text-amber-300' : 'text-white'}`}>
                {metrics.waitingApproval}
              </span>
              <span className="text-xs text-slate-400">requieren decisión</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[#162035] bg-[#0c1220]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Completadas / Fallidas</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">{metrics.completed}</span>
              <span className="text-xs text-slate-400">/ {metrics.failed} errores</span>
            </div>
          </div>
        </div>

        {/* Bandeja de Aprobaciones Pendientes (Supervisión Humana Requerida) */}
        {pendingApprovals.length > 0 && (
          <div className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-[#0c1220] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-sm font-bold tracking-tight">
                  Bandeja de Aprobaciones Pendientes ({pendingApprovals.length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-300 font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Requiere Autorización de CEO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingApprovals.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-amber-500/30 bg-[#080d18] flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                        {task.agent} • {task.task_type}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        #{task.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {formatNextAction(task.next_action) || 'Requiere revisión humana de la propuesta conceptual o evaluación.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1a2336]">
                    <button
                      onClick={() => setSelectedTaskForDetail(task)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspeccionar</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickApprove(task.id, false)}
                        className="px-2.5 py-1 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold transition-colors text-[11px]"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleQuickApprove(task.id, true)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors text-[11px]"
                      >
                        Aprobar y Continuar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado en Vivo de los 5 Agentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span>Agentes Conectados a Patricia</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Coordinación operativa en tiempo real
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {agentStatuses.map((ag: any) => {
              const iconsMap: Record<string, any> = {
                LOLA: Sparkles,
                TITO: SearchCode,
                VERA: Target,
                BRUNO: Palette,
                CATA: PhoneCall,
              };
              const Icon = iconsMap[ag.agent] || Bot;

              return (
                <div
                  key={ag.agent}
                  className="p-3.5 rounded-2xl border border-[#162035] bg-[#0c1220] flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-white">{ag.name}</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" title="Disponible" />
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">{ag.role}</p>

                    <div className="p-2 rounded-lg bg-[#080d18] border border-[#162035] text-[10px] text-slate-300">
                      <span className="text-slate-500 block">Última acción:</span>
                      <span className="line-clamp-1 font-medium text-slate-200">
                        {ag.lastTask ? `${ag.lastTask.type} (${ag.lastTask.status})` : 'Sin tareas recientes'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isDemo) {
                        setDemoNoticeAction(`asignar tareas a ${ag.name}`);
                        return;
                      }
                      setSelectedAgentForCreate(ag.agent);
                      setIsCreateOpen(true);
                    }}
                    className="w-full py-1.5 rounded-lg border border-[#1a2336] hover:bg-[#131d33] hover:text-cyan-300 text-[11px] font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Asignar Tarea</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flujos Operativos y Switches */}
        <div className="p-5 rounded-2xl border border-[#162035] bg-[#0c1220] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Flujos de Trabajo Coordinados por Patricia</span>
              </h3>
              <p className="text-xs text-slate-400">
                Activá o desactivá los flujos automáticos según la capacidad del equipo.
              </p>
            </div>
            <button
              onClick={() => setIsLimitsOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Ver Límites Operativos</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              {
                id: 'FLUJO_A' as OrchestratorWorkflowId,
                title: 'Flujo A — Prospección',
                desc: 'Lola busca prospectos en Google Places y los deja disponibles.',
                agent: 'Lola',
              },
              {
                id: 'FLUJO_B' as OrchestratorWorkflowId,
                title: 'Flujo B — Auditoría y Estrategia',
                desc: 'Tito audita webs existentes y Vera define la oportunidad comercial.',
                agent: 'Tito & Vera',
              },
              {
                id: 'FLUJO_C' as OrchestratorWorkflowId,
                title: 'Flujo C — Demos Comerciales',
                desc: 'Bruno genera propuestas conceptuales para revisión humana.',
                agent: 'Bruno',
              },
              {
                id: 'FLUJO_D' as OrchestratorWorkflowId,
                title: 'Flujo D — Seguimiento Cata',
                desc: 'Cata organiza el seguimiento y prepara borradores sin auto-envío.',
                agent: 'Cata',
              },
            ].map((f) => {
              const activeFlows = (overview?.config?.active_flows as Record<string, boolean>) || {};
              const lowerKey = f.id.toLowerCase().replace('_', '');
              const isEnabled = activeFlows[f.id] ?? activeFlows[lowerKey] ?? true;
              return (
                <div
                  key={f.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 text-xs ${
                    isEnabled
                      ? 'border-[#1a2336] bg-[#080d18]'
                      : 'border-slate-800 bg-[#060a12] opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{f.title}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleFlow(f.id, isEnabled)}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          isEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block h-3 w-3 rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold">Agente: {f.agent}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla Central de Tareas con Filtros */}
        <div className="p-5 rounded-2xl border border-[#162035] bg-[#0c1220] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Cola y Registro de Tareas ({filteredTasks.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Historial completo y tareas en ejecución persistidas en Supabase.
              </p>
            </div>

            {/* Búsqueda y Filtros Rápidos */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar tarea..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="EN_EJECUCION">En Ejecución</option>
                <option value="ESPERANDO_APROBACION">Esperando Aprobación</option>
                <option value="COMPLETADA">Completadas</option>
                <option value="FALLIDA">Fallidas</option>
                <option value="CANCELADA">Canceladas</option>
              </select>

              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="TODOS">Todos los Agentes</option>
                <option value="LOLA">Lola</option>
                <option value="TITO">Tito</option>
                <option value="VERA">Vera</option>
                <option value="BRUNO">Bruno</option>
                <option value="CATA">Cata</option>
              </select>

              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="p-1.5 rounded-xl border border-[#1a2336] bg-[#080d18] text-slate-400 hover:text-white transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabla de Tareas */}
          <div className="overflow-x-auto border border-[#162035] rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d18] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#162035]">
                <tr>
                  <th className="py-2.5 px-3">Prioridad</th>
                  <th className="py-2.5 px-3">ID / Tipo</th>
                  <th className="py-2.5 px-3">Agente</th>
                  <th className="py-2.5 px-3">Flujo</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3">Reintentos</th>
                  <th className="py-2.5 px-3">Próximo Paso / Diagnóstico</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162035] font-sans">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No hay tareas registradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#101828]/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getPriorityBadge(t.priority)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white block">{t.task_type}</span>
                        <span className="font-mono text-[10px] text-slate-500">#{t.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-cyan-300">
                        {t.agent}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {t.workflow_id}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                        {t.retry_count} / {t.max_retries}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-slate-300" title={formatNextAction(t.next_action) || ''}>
                        {formatNextAction(t.next_action) || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTaskForDetail(t)}
                          className="px-2.5 py-1 rounded-lg border border-[#1a2336] bg-[#080d18] hover:bg-[#131d33] text-cyan-300 hover:text-cyan-200 text-[11px] font-semibold transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline Cronológico de Actividad Reciente */}
        <div className="p-5 rounded-2xl border border-[#162035] bg-[#0c1220] space-y-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Timeline de Actividad Reciente de los Agentes</span>
          </h3>

          <div className="space-y-2.5">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-[#080d18] border border-[#162035] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t.agent}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{t.task_type}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {formatNextAction(t.next_action) || 'Proceso registrado correctamente en el motor de tareas.'}
                  </p>
                </div>
                <div>{getStatusBadge(t.status)}</div>
              </div>
            ))}
          </div>
        </div>
      </>
      )}
    </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={fetchData}
        preselectedAgent={selectedAgentForCreate}
      />

      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onTaskUpdated={fetchData}
      />

      <ConfigLimitsModal
        config={overview?.config || null}
        isOpen={isLimitsOpen}
        onClose={() => setIsLimitsOpen(false)}
        onConfigUpdated={fetchData}
      />

      <DemoNoticeModal
        isOpen={!!demoNoticeAction}
        onClose={() => setDemoNoticeAction(null)}
        actionName={demoNoticeAction || ''}
      />
    </div>
  );
}
