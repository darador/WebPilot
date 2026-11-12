'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Palette,
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ExternalLink,
  Eye,
  Trash2,
  Copy,
  Check,
  Send,
  PhoneCall,
  Laptop,
  Layers,
  ShieldCheck,
  RotateCcw,
  Compass,
  ArrowRight,
  Code2,
  FolderGit2,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CreateDemoModal } from '@/components/bruno/CreateDemoModal';
import { DemoPreviewModal } from '@/components/bruno/DemoPreviewModal';
import { ClientDemo, DemoStatus } from '@/types/database.types';
import { TEAM_MEMBERS } from '@/lib/constants/team';
import { formatDate } from '@/lib/utils';
import { useUserRole } from '@/lib/auth/useUserRole';
import { DemoBadge } from '@/components/common/DemoBadge';
import { DemoNoticeModal } from '@/components/common/DemoNoticeModal';

function BrunoContent() {
  const brunoInfo = TEAM_MEMBERS.find((m) => m.id === 'bruno') || TEAM_MEMBERS[3];
  const { isDemo } = useUserRole();
  const [demoNoticeAction, setDemoNoticeAction] = useState<string | null>(null);

  const [demos, setDemos] = useState<ClientDemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tabs: 'demos' (Modo Demo) | 'production' (Modo Producción)
  const [activeTab, setActiveTab] = useState<'demos' | 'production'>('demos');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDemoForPreview, setSelectedDemoForPreview] = useState<ClientDemo | null>(null);
  const [demoToDelete, setDemoToDelete] = useState<ClientDemo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDemos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'TODOS') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/bruno/demos?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDemos(json.data);
      }
    } catch (err) {
      console.error('Error fetching demos:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDemos();
  };

  const handleDeleteConfirm = async () => {
    if (!demoToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bruno/demos/${demoToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setDemoToDelete(null);
        fetchDemos();
      }
    } catch (err) {
      console.error('Error deleting demo:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (demo: ClientDemo) => {
    const url = `${window.location.origin}/demo/${demo.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(demo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPIs
  const totalDemos = demos.length;
  const pendingDemos = demos.filter((d) => d.status === 'PENDIENTE_REVISION').length;
  const approvedDemos = demos.filter((d) => d.status === 'APROBADA').length;
  const sentDemos = demos.filter((d) => d.status === 'ENVIADA').length;

  const getStatusBadge = (status: DemoStatus) => {
    switch (status) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="h-3 w-3" />
            Aprobada para Cata
          </span>
        );
      case 'PENDIENTE_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-700/50">
            <HelpCircle className="h-3 w-3" />
            Pendiente de revisión
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-700/50">
            <XCircle className="h-3 w-3" />
            Requiere ajustes
          </span>
        );
      case 'ENVIADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-700/50">
            <Send className="h-3 w-3" />
            Enviada por Cata
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
            En preparación
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Topbar
        title="Bruno — Arquitecto de Experiencia y Diseño"
        subtitle="Generación de propuestas web personalizadas (Modo Demo) y desarrollo para clientes contratados"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner Principal del Agente Bruno */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-[#17120a] via-[#1f170c] to-[#0c1220] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 shrink-0 bg-orange-950/40">
                <Image
                  src={brunoInfo.avatar}
                  alt={brunoInfo.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Agente #{brunoInfo.id.toUpperCase()} • {brunoInfo.role}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-700/50">
                    Operativo
                  </span>
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Bruno • Producción de Propuestas Web y Demos
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Transformo oportunidades comerciales en muestras web funcionales y adaptables. Sin inventar datos, integrando canales verificados y consultando las mejores referencias del rubro.
                </p>
                <div className="text-[11px] font-mono text-orange-300/90 pt-0.5">
                  &ldquo;{brunoInfo.quote}&rdquo;
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  if (isDemo) {
                    setDemoNoticeAction('generar propuestas comerciales o demos');
                    return;
                  }
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-500 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Crear Nueva Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPIs de Rendimiento de Bruno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Demos Creadas
              </span>
              <span className="text-2xl font-black text-white mt-0.5 block">{totalDemos}</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300">
              <Laptop className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-xl border border-amber-900/40 bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Pendientes de Revisión
              </span>
              <span className="text-2xl font-black text-white mt-0.5 block">{pendingDemos}</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Aprobadas para Cata
              </span>
              <span className="text-2xl font-black text-white mt-0.5 block">{approvedDemos}</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                Enviadas al Prospecto
              </span>
              <span className="text-2xl font-black text-white mt-0.5 block">{sentDemos}</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Send className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tabs de Modo Operativo */}
        <div className="flex items-center gap-2 border-b border-[#1a2336] pb-2">
          <button
            onClick={() => setActiveTab('demos')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'demos'
                ? 'bg-[#181d2e] text-orange-300 border border-orange-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#0c1220]'
            }`}
          >
            <Laptop className="h-3.5 w-3.5 text-orange-400" />
            <span>Modo Demo • Comercial ({totalDemos})</span>
          </button>

          <button
            onClick={() => setActiveTab('production')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'production'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white hover:bg-[#0c1220]'
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5 text-blue-400" />
            <span>Modo Producción (Clientes Contratados)</span>
          </button>
        </div>

        {/* Contenido según Tab */}
        {activeTab === 'production' ? (
          /* MODO PRODUCCIÓN */
          <div className="rounded-2xl border border-[#1a2336] bg-[#0c1220] p-8 space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Arquitectura de Producción Web
              </span>
              <h2 className="text-lg font-bold text-white">
                Desarrollo Completo para Clientes Ganados
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                El Modo Producción se activa únicamente cuando un prospecto es marcado como <strong>GANADO</strong> en el CRM. Bruno construye el sitio web definitivo respetando estrictamente el alcance comercial contratado:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#1a2336] bg-[#080d18] space-y-2">
                <span className="text-xs font-bold text-cyan-400 block">Landing Express</span>
                <span className="text-sm font-bold text-white block">$69.000 + $19.000/mes</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  1 sola página, hasta 5 secciones, WhatsApp directo, Google Maps, responsive, 1 ronda de cambios. Entrega en 3 a 5 días hábiles.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#1a2336] bg-[#080d18] space-y-2">
                <span className="text-xs font-bold text-blue-400 block">Landing Profesional</span>
                <span className="text-sm font-bold text-white block">$109.000 + $24.000/mes</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hasta 7 secciones, diseño visual elaborado, formulario estructurado, presentación de tratamientos, 2 rondas de cambios. Entrega 5 a 7 días.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#1a2336] bg-[#080d18] space-y-2">
                <span className="text-xs font-bold text-purple-400 block">Sitio Institucional</span>
                <span className="text-sm font-bold text-white block">$159.000 + $29.000/mes</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Multi-página corporativa, hasta 5 páginas internas, catálogo completo, arquitectura SEO on-page y soporte prioritario. Entrega 7 a 10 días.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-800/40 bg-amber-950/20 text-xs text-amber-200 space-y-1">
              <strong className="block text-amber-300 font-semibold">Política de Publicación Definitiva:</strong>
              <p className="text-[11px] text-amber-200/90">
                WebPilot AI no realiza publicación automática a dominios de clientes sin previa validación humana y confirmación de los contenidos: Requiere Autorización de CEO.
              </p>
            </div>
          </div>
        ) : (
          /* MODO DEMO */
          <div className="space-y-4">
            {/* Barra de Filtros */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0b101c] p-3 rounded-xl border border-[#1a2336]">
              {/* Buscador */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por negocio o propuesta..."
                  className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Filtro Estado */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-orange-500 focus:outline-none"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="PENDIENTE_REVISION">Pendientes de revisión</option>
                  <option value="APROBADA">Aprobadas</option>
                  <option value="RECHAZADA">Rechazadas</option>
                  <option value="ENVIADA">Enviadas</option>
                </select>

                {(search || statusFilter !== 'TODOS') && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('TODOS');
                    }}
                    className="flex items-center gap-1 rounded-lg border border-red-900/40 bg-red-950/20 px-2 py-1.5 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Listado de Demos */}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl border border-[#1a2336] bg-[#0c1220] animate-pulse" />
                ))}
              </div>
            ) : demos.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-[#1a2336] bg-[#0c1220] space-y-3">
                <Laptop className="h-8 w-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-semibold text-white">
                  No hay propuestas demo generadas con los filtros actuales
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Seleccioná un negocio desde el botón &ldquo;Crear Nueva Demo&rdquo; para que Bruno prepare la primera muestra web conceptual.
                </p>
                <button
                  onClick={() => {
                    if (isDemo) {
                      setDemoNoticeAction('generar propuestas comerciales o demos');
                      return;
                    }
                    setIsCreateOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Crear primera demo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {demos.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 sm:p-5 rounded-xl border border-[#1a2336] bg-[#0c1220] hover:border-orange-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-orange-300 transition-colors">
                          {d.business?.name || d.title}
                        </span>
                        {getStatusBadge(d.status)}
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {d.product_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {d.business?.industry && (
                          <span>Rubro: {d.business.industry}</span>
                        )}
                        {d.business?.city && <span>• {d.business.city}</span>}
                        <span>• Creada: {formatDate(d.created_at)}</span>
                      </div>

                      {d.reference_name && (
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-300">
                          <Compass className="h-3 w-3 shrink-0" />
                          <span>Inspirada en: {d.reference_name}</span>
                        </div>
                      )}

                      {d.feedback_notes && (
                        <div className="text-[11px] text-red-300 bg-red-950/20 p-2 rounded border border-red-900/30">
                          Nota de revisión: {d.feedback_notes}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedDemoForPreview(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 text-xs font-semibold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Vista Previa</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2a42] bg-[#080d18] hover:bg-[#131d33] text-xs font-medium text-slate-300 transition-colors"
                        title="Copiar URL para Cata"
                      >
                        {copiedId === d.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar Link</span>
                          </>
                        )}
                      </button>

                      {d.status === 'APROBADA' && (
                        <Link
                          href={`/agents/cata?search=${encodeURIComponent(d.business?.name || '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm"
                          title="Gestionar propuesta y contacto con Cata"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Entregar a Cata</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          if (isDemo) {
                            setDemoNoticeAction('eliminar propuestas comerciales');
                            return;
                          }
                          setDemoToDelete(d);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                        title="Eliminar demo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear Demo */}
      <CreateDemoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newDemo) => {
          fetchDemos();
          setSelectedDemoForPreview(newDemo);
        }}
      />

      {/* Modal Vista Previa */}
      <DemoPreviewModal
        demo={selectedDemoForPreview}
        isOpen={Boolean(selectedDemoForPreview)}
        onClose={() => setSelectedDemoForPreview(null)}
        onStatusUpdated={() => {
          fetchDemos();
        }}
      />

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        isOpen={Boolean(demoToDelete)}
        title="Eliminar Propuesta Demo"
        message={`¿Estás seguro de que deseás eliminar la demo conceptual de "${demoToDelete?.business?.name || demoToDelete?.title}"?`}
        confirmLabel="Eliminar Definitivamente"
        isProcessing={isDeleting}
        onCancel={() => setDemoToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      <DemoNoticeModal
        isOpen={Boolean(demoNoticeAction)}
        onClose={() => setDemoNoticeAction(null)}
        actionName={demoNoticeAction || ''}
      />
    </div>
  );
}

export default function BrunoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Cargando agente Bruno...</div>}>
      <BrunoContent />
    </Suspense>
  );
}
