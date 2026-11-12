'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { ClientDemo, DemoStatus } from '@/types/database.types';
import { useUserRole } from '@/lib/auth/useUserRole';
import { DemoNoticeModal } from '@/components/common/DemoNoticeModal';
import { DemoBadge } from '@/components/common/DemoBadge';

interface DemoPreviewModalProps {
  demo: ClientDemo | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export function DemoPreviewModal({
  demo,
  isOpen,
  onClose,
  onStatusUpdated,
}: DemoPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const { isDemo } = useUserRole();
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  if (!isOpen || !demo) return null;

  const previewUrl = `/demo/${demo.slug}`;
  const absolutePreviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${previewUrl}`
    : previewUrl;

  const handleUpdateStatus = async (newStatus: DemoStatus, notes?: string) => {
    if (isDemo) {
      setShowDemoNotice(true);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/bruno/demos/${demo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          feedbackNotes: notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onStatusUpdated();
        setShowRejectInput(false);
      }
    } catch (err) {
      console.error('Error updating demo status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(absolutePreviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: DemoStatus) => {
    switch (status) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="h-3 w-3" />
            Aprobada por el equipo
          </span>
        );
      case 'PENDIENTE_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-700/50">
            Pendiente de revisión humana
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-700/50">
            <XCircle className="h-3 w-3" />
            Requiere ajustes
          </span>
        );
      case 'ENVIADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-700/50">
            <Send className="h-3 w-3" />
            Enviada al prospecto por Cata
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            En preparación
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[95vh] flex flex-col rounded-2xl border border-[#1a2336] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#162035] bg-[#080d18] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {demo.title}
                </h3>
                {getStatusBadge(demo.status)}
                <DemoBadge />
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Propuesta conceptual • Creada por Bruno
              </span>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-[#050810] p-1 rounded-xl border border-[#162035]">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === 'desktop'
                  ? 'bg-[#18233c] text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista de Computadora"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === 'tablet'
                  ? 'bg-[#18233c] text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista de Tablet"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                deviceMode === 'mobile'
                  ? 'bg-[#18233c] text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Móvil (Celulares)"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2a42] bg-[#0c1220] hover:bg-[#131d33] text-xs font-medium text-slate-200 transition-colors"
              title="Copiar URL para Cata"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
              title="Abrir en pestaña nueva"
            >
              <span>Abrir en Pestaña</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#1a2336] text-slate-400 hover:bg-[#131d33] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport Frame Container */}
        <div className="flex-1 bg-[#050810] overflow-y-auto flex items-center justify-center p-2 sm:p-4">
          <div
            className={`transition-all duration-300 h-full bg-white overflow-hidden shadow-2xl ${
              deviceMode === 'desktop'
                ? 'w-full rounded-xl border border-slate-700'
                : deviceMode === 'tablet'
                ? 'w-[768px] rounded-2xl border-8 border-slate-800'
                : 'w-[390px] rounded-[36px] border-8 border-slate-800 ring-1 ring-slate-700'
            }`}
          >
            <iframe
              src={previewUrl}
              title={`Vista previa demo ${demo.title}`}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>

        {/* Bottom Review & Approval Bar */}
        <div className="p-3.5 sm:p-4 border-t border-[#162035] bg-[#080d18] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              {demo.status === 'APROBADA'
                ? 'Esta propuesta está aprobada y lista para ser entregada a Cata.'
                : 'Revisá que los servicios y datos de contacto sean coherentes antes de aprobar.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {demo.status !== 'APROBADA' && (
              <>
                {showRejectInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Motivo o corrección necesaria..."
                      value={rejectFeedback}
                      onChange={(e) => setRejectFeedback(e.target.value)}
                      className="rounded-lg border border-red-900 bg-[#070b14] px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateStatus('RECHAZADA', rejectFeedback)}
                      disabled={isUpdating}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Confirmar Rechazo
                    </button>
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-900/30 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Rechazar / Ajustar</span>
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus('APROBADA')}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Aprobar Demo para Cata</span>
                </button>
              </>
            )}

            {demo.status === 'APROBADA' && (
              <Link
                href={`/agents/cata?search=${encodeURIComponent(demo.business?.name || '')}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/20"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Entregar Oportunidad a Cata</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <DemoNoticeModal
        isOpen={showDemoNotice}
        onClose={() => setShowDemoNotice(false)}
        actionName="aprobar o rechazar propuestas comerciales"
      />
    </div>
  );
}
