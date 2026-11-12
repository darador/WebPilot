'use client';

import React from 'react';
import {
  X,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Bot,
  Terminal,
} from 'lucide-react';
import { OrchestratorLog } from '@/types/database.types';
import Link from 'next/link';

interface LogDetailModalProps {
  log: OrchestratorLog | null;
  isOpen: boolean;
  onClose: () => void;
  onFilterByCycle?: (cycleId: string) => void;
}

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PATRICIA: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'Patricia • Directora de Operaciones' },
  LOLA: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Lola • Prospección' },
  TITO: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Tito • Auditoría Técnica' },
  VERA: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', label: 'Vera • Estrategia Comercial' },
  BRUNO: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', label: 'Bruno • Demos Comerciales' },
  CATA: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Cata • Contacto y Seguimiento' },
};

export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
  onFilterByCycle,
}) => {
  if (!isOpen || !log) return null;

  const agentConfig = AGENT_COLORS[log.agent] || AGENT_COLORS.PATRICIA;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completado
          </span>
        );
      case 'FALLIDO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Fallido
          </span>
        );
      case 'ESPERANDO_APROBACION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Requiere Autorización de CEO
          </span>
        );
      case 'INICIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="w-3.5 h-3.5" />
            Iniciado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Info className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${agentConfig.bg} ${agentConfig.border} ${agentConfig.text}`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono tracking-wider uppercase ${agentConfig.text}`}>
                  {log.agent}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">{log.action_type}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                {agentConfig.label}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(log.status)}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Fecha y Hora</span>
              <span className="text-white font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(log.created_at)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Ciclo de Patricia</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-cyan-400 font-mono font-medium truncate max-w-[120px]" title={log.cycle_id}>
                  {log.cycle_id}
                </span>
                {onFilterByCycle && (
                  <button
                    onClick={() => {
                      onFilterByCycle(log.cycle_id);
                      onClose();
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                    title="Ver todos los eventos de este ciclo"
                  >
                    filtrar
                  </button>
                )}
              </div>
            </div>

            {log.duration_ms !== undefined && log.duration_ms !== null && (
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Duración</span>
                <span className="text-slate-200 font-mono mt-0.5 block">
                  {log.duration_ms < 1000 ? `${log.duration_ms} ms` : `${(log.duration_ms / 1000).toFixed(2)} seg`}
                </span>
              </div>
            )}

            {log.business_name && (
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Prospecto Relacionado</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    {log.business_name}
                  </span>
                  {log.business_id && (
                    <Link
                      href={`/prospects/${log.business_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Ver ficha CRM</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description / Decision Text */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-400 block">
              Descripción de la Acción o Decisión
            </span>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
              {log.description}
            </div>
          </div>

          {/* Error or Reason if present */}
          {log.error_or_reason && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-red-300 block mb-0.5">Motivo o Causa Registrada:</span>
                <span className="leading-relaxed">{log.error_or_reason}</span>
              </div>
            </div>
          )}

          {/* Result Summary */}
          {log.result_summary && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-400 block">
                Resultado Obtenido
              </span>
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 font-mono text-xs">
                {log.result_summary}
              </div>
            </div>
          )}

          {/* Result Data Payload JSON */}
          {log.result_data && Object.keys(log.result_data).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                Detalle Estructurado (JSON)
              </span>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-normal">
                {JSON.stringify(log.result_data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/50">
          <span className="text-[10px] font-mono text-slate-500">
            ID: {log.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
