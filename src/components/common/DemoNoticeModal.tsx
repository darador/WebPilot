'use client';

import React from 'react';
import { X, Eye, ShieldAlert, Lock } from 'lucide-react';

interface DemoNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export function DemoNoticeModal({
  isOpen,
  onClose,
  actionName = 'esta acción operativa',
}: DemoNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#162035] bg-[#080d18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                Modo Demostración
              </h3>
              <p className="text-[11px] text-amber-300/80">Acceso de Solo Lectura</p>
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
        <div className="p-5 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              No podés realizar <strong>{actionName}</strong> porque estás navegando con la cuenta de demostración.
            </span>
          </div>

          <p>
            Esta cuenta permite consultar libremente todos los módulos de WebPilot AI (Dashboard, Agentes, Demos, CRM, Métricas y Referencias), pero restringe cualquier creación, edición, auditoría o envío de mensajes para proteger los datos de la agencia.
          </p>

          <p className="text-[11px] text-slate-400">
            Para realizar acciones operativas reales, iniciá sesión con las credenciales de Daro o Julieta.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#162035] bg-[#080d18] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
