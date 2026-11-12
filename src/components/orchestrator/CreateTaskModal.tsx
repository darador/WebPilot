'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Bot,
  AlertCircle,
  Play,
  Layers,
  Sparkles,
  SearchCode,
  Target,
  Palette,
  PhoneCall,
} from 'lucide-react';
import {
  OrchestratorAgentName,
  OrchestratorPriority,
  OrchestratorTaskType,
  OrchestratorWorkflowId,
} from '@/types/database.types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  preselectedAgent?: OrchestratorAgentName;
}

const AGENTS: { id: OrchestratorAgentName; name: string; icon: any; role: string }[] = [
  { id: 'LOLA', name: 'Lola', icon: Sparkles, role: 'Prospección Google Places' },
  { id: 'TITO', name: 'Tito', icon: SearchCode, role: 'Auditoría Técnica de Web' },
  { id: 'VERA', name: 'Vera', icon: Target, role: 'Estrategia Comercial' },
  { id: 'BRUNO', name: 'Bruno', icon: Palette, role: 'Demos y Desarrollo Web' },
  { id: 'CATA', name: 'Cata', icon: PhoneCall, role: 'Seguimiento de Ventas' },
];

const TASK_TYPES_BY_AGENT: Record<OrchestratorAgentName, { type: OrchestratorTaskType; label: string }[]> = {
  PATRICIA: [{ type: 'APPROVAL_REVIEW', label: 'Revisión y Coordinación Operativa' }],
  LOLA: [{ type: 'LOLA_DISCOVERY', label: 'Búsqueda de Prospectos (Google Places)' }],
  TITO: [{ type: 'TITO_AUDIT', label: 'Auditoría Técnica de Sitio Web' }],
  VERA: [{ type: 'VERA_STRATEGY', label: 'Evaluación y Estrategia Comercial' }],
  BRUNO: [{ type: 'BRUNO_DEMO', label: 'Generación de Demo Comercial (Modo Demo)' }],
  CATA: [{ type: 'CATA_FOLLOWUP', label: 'Preparación de Mensajes y Seguimiento' }],
};

export function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  preselectedAgent,
}: CreateTaskModalProps) {
  const [agent, setAgent] = useState<OrchestratorAgentName>(preselectedAgent || 'LOLA');
  const [taskType, setTaskType] = useState<OrchestratorTaskType>(
    TASK_TYPES_BY_AGENT[preselectedAgent || 'LOLA'][0].type
  );
  const [priority, setPriority] = useState<OrchestratorPriority>('MEDIA');
  const [workflowId, setWorkflowId] = useState<OrchestratorWorkflowId>('MANUAL');
  const [businessId, setBusinessId] = useState('');
  const [autoExecute, setAutoExecute] = useState(false);

  // Lola payload
  const [city, setCity] = useState('Quilmes');
  const [industry, setIndustry] = useState('Odontología');
  const [maxResults, setMaxResults] = useState(10);

  // Bruno payload
  const [productType, setProductType] = useState('LANDING');
  const [customTitle, setCustomTitle] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAgentChange = (newAgent: OrchestratorAgentName) => {
    setAgent(newAgent);
    setTaskType(TASK_TYPES_BY_AGENT[newAgent][0].type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, any> = {};

      if (agent === 'LOLA') {
        payload.city = city.trim();
        payload.industry = industry.trim();
        payload.maxResults = Number(maxResults);
      } else if (agent === 'BRUNO') {
        payload.productType = productType;
        if (customTitle.trim()) payload.customTitle = customTitle.trim();
      }

      if (['TITO', 'VERA', 'BRUNO'].includes(agent) && !businessId.trim()) {
        throw new Error(`Para el agente ${agent} es obligatorio indicar el ID del Negocio.`);
      }

      const res = await fetch('/api/orchestrator/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          task_type: taskType,
          priority,
          workflow_id: workflowId,
          business_id: businessId.trim() || undefined,
          payload,
          auto_execute: autoExecute,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'No se pudo crear la tarea');
      }

      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#1e2a42] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#162035] bg-[#080d18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Asignar Tarea Operativa
              </h3>
              <p className="text-xs text-slate-400">
                Patricia delegará la ejecución al agente correspondiente.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Agente Responsable */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Agente Responsable
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AGENTS.map((item) => {
                const Icon = item.icon;
                const isSelected = agent === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAgentChange(item.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-sm'
                        : 'border-[#1a2336] bg-[#080d18] text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold leading-tight">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipo de Tarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Tarea
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as OrchestratorTaskType)}
              className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {TASK_TYPES_BY_AGENT[agent].map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad y Flujo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as OrchestratorPriority)}
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Flujo Operativo
              </label>
              <select
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value as OrchestratorWorkflowId)}
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="MANUAL">Asignación Manual</option>
                <option value="FLUJO_A">Flujo A (Prospección Lola)</option>
                <option value="FLUJO_B">Flujo B (Auditoría Tito & Vera)</option>
                <option value="FLUJO_C">Flujo C (Demo Bruno)</option>
                <option value="FLUJO_D">Flujo D (Seguimiento Cata)</option>
              </select>
            </div>
          </div>

          {/* Negocio relacionado (cuando corresponda) */}
          {agent !== 'LOLA' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ID del Negocio (UUID de Supabase) *
              </label>
              <input
                type="text"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                placeholder="Ej. a0b1c2d3-4567-89ef..."
                required
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1a2336] text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Campos específicos de Lola */}
          {agent === 'LOLA' && (
            <div className="p-3 rounded-xl bg-[#080d18] border border-[#1a2336] space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold block">
                Parámetros de Búsqueda Lola
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1220] border border-[#1a2336] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rubro</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1220] border border-[#1a2336] text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Máximo de candidatos (límite conservador: 20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1220] border border-[#1a2336] text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Campos específicos de Bruno */}
          {agent === 'BRUNO' && (
            <div className="p-3 rounded-xl bg-[#080d18] border border-[#1a2336] space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold block">
                Configuración de Demo Bruno
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tipo de Propuesta</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1220] border border-[#1a2336] text-xs text-white"
                  >
                    <option value="LANDING">Landing Page Comercial</option>
                    <option value="WEB_COMPLETA">Sitio Web Multi-Sección</option>
                    <option value="REDISENO">Rediseño Integral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Título Personalizado (Opcional)</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ej. Propuesta para Dra..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1220] border border-[#1a2336] text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Switch de ejecución inmediata */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="autoExecute"
              checked={autoExecute}
              onChange={(e) => setAutoExecute(e.target.checked)}
              className="h-4 w-4 rounded border-[#1a2336] bg-[#080d18] text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="autoExecute" className="text-xs text-slate-300 cursor-pointer">
              Ejecutar inmediatamente al crear la tarea (sin esperar al próximo ciclo)
            </label>
          </div>

          {/* Actions */}
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
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Tarea'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
