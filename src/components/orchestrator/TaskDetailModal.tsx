'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Bot,
  FileCode2,
  ArrowRight,
} from 'lucide-react';
import { OrchestratorTask, OrchestratorTaskStatus } from '@/types/database.types';

interface TaskDetailModalProps {
  task: OrchestratorTask | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'payload' | 'result' | 'logs'>('result');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleAction = async (action: 'EXECUTE' | 'RETRY' | 'CANCEL' | 'APPROVE' | 'REJECT') => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch(`/api/orchestrator/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: approvalNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || `Error al procesar acción ${action}`);
      }

      onTaskUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al procesar');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: OrchestratorTaskStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="h-3 w-3" />
            Pendiente en cola
          </span>
        );
      case 'EN_EJECUCION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse">
            <Play className="h-3 w-3" />
            En ejecución
          </span>
        );
      case 'ESPERANDO_APROBACION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <ShieldCheck className="h-3 w-3 text-amber-400" />
            Requiere Aprobación Humana
          </span>
        );
      case 'COMPLETADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="h-3 w-3" />
            Completada con éxito
          </span>
        );
      case 'FALLIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="h-3 w-3" />
            Fallida
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Ban className="h-3 w-3" />
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1e2a42] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#162035] bg-[#080d18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Tarea #{task.id.slice(0, 8)} • {task.agent}
                </h3>
                {getStatusBadge(task.status)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Tipo: <strong className="text-slate-300">{task.task_type}</strong> • Flujo:{' '}
                <strong className="text-slate-300">{task.workflow_id}</strong> • Prioridad:{' '}
                <strong className="text-slate-300">{task.priority}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1a2336] text-slate-400 hover:bg-[#131d33] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Próximo Paso / Diagnóstico del Orquestador */}
          {task.next_action && (
            <div className="p-3.5 rounded-xl bg-[#080d18] border border-cyan-500/30 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold block">
                Diagnóstico de Patricia y Próximo Paso
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{task.next_action}</p>
            </div>
          )}

          {/* Bloque de Aprobación Humana si está en ESPERANDO_APROBACION */}
          {task.status === 'ESPERANDO_APROBACION' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Esta tarea Requiere Autorización de CEO</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                El agente completó su preparación (ej. Demo de Bruno o Estrategia de Vera), pero
                la política de autonomía supervisada prohíbe avanzar sin aprobación explícita.
              </p>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Notas de aprobación o motivo de rechazo (opcional):
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Ej. Demo aprobada, lista para Cata..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0c1220] border border-amber-500/30 text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('APPROVE')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Aprobar y Continuar Flujo</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('REJECT')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Rechazar / Solicitar Ajustes</span>
                </button>
              </div>
            </div>
          )}

          {/* Metadatos Generales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-[#162035]">
              <span className="text-[10px] text-slate-400 block uppercase">Reintentos</span>
              <span className="font-semibold text-white">
                {task.retry_count} / {task.max_retries}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-[#162035]">
              <span className="text-[10px] text-slate-400 block uppercase">Creación</span>
              <span className="font-semibold text-white">
                {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-[#162035]">
              <span className="text-[10px] text-slate-400 block uppercase">Inicio</span>
              <span className="font-semibold text-white">
                {task.started_at
                  ? new Date(task.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-[#162035]">
              <span className="text-[10px] text-slate-400 block uppercase">Fin</span>
              <span className="font-semibold text-white">
                {task.completed_at
                  ? new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </span>
            </div>
          </div>

          {/* Tabs de inspección de datos */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 border-b border-[#162035] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('result')}
                className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                  activeTab === 'result'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Resultado ({task.result ? 'Disponible' : 'Sin datos'})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payload')}
                className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                  activeTab === 'payload'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Parámetros de Entrada (Payload)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 font-semibold transition-colors border-b-2 ${
                  activeTab === 'logs'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Logs y Errores ({task.error_message ? 'Con Error' : 'Normal'})
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#050810] border border-[#162035] font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56">
              {activeTab === 'result' && (
                <pre>{JSON.stringify(task.result || { status: 'Aún no ejecutada o sin retorno' }, null, 2)}</pre>
              )}
              {activeTab === 'payload' && (
                <pre>{JSON.stringify(task.payload || {}, null, 2)}</pre>
              )}
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  {task.error_message ? (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                      <strong>ERROR REGISTRADO:</strong> {task.error_message}
                    </div>
                  ) : (
                    <div className="text-emerald-400">
                      ✓ No se registraron errores en la ejecución.
                    </div>
                  )}
                  {task.next_action && (
                    <div className="text-slate-300">
                      <strong className="text-slate-400">Próxima acción / Diagnóstico:</strong> {task.next_action}
                    </div>
                  )}
                  {task.approval_notes && (
                    <div className="text-amber-300">
                      <strong className="text-amber-400">Notas de Supervisión Humana:</strong> {task.approval_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#162035] bg-[#080d18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {task.status === 'PENDIENTE' && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAction('EXECUTE')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Ejecutar Ahora</span>
              </button>
            )}

            {task.status === 'FALLIDA' && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAction('RETRY')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reintentar Tarea</span>
              </button>
            )}

            {['PENDIENTE', 'ESPERANDO_APROBACION'].includes(task.status) && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAction('CANCEL')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs font-medium transition-all disabled:opacity-50"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Cancelar Tarea</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#1a2336] hover:bg-[#131d33] text-xs font-semibold text-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
