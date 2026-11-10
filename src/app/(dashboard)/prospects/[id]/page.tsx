'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  SearchCode,
  FileText,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { ActivityModal } from '@/components/crm/ActivityModal';
import { ProspectModal } from '@/components/prospects/ProspectModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  getProspectById,
  deleteProspect,
  ProspectDetail,
} from '@/services/prospects.service';
import { updateBusinessStage } from '@/services/crm.service';
import { CRM_STAGES, ACTIVITY_TYPE_LABELS } from '@/lib/constants/crm';
import { formatDate } from '@/lib/utils';
import { CRMStage } from '@/types/database.types';

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prospect, setProspect] = useState<ProspectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProspect = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getProspectById(id);
      setProspect(data);
    } catch (err) {
      console.error('Error loading prospect detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProspect();
  }, [loadProspect]);

  const handleStageChange = async (newStage: CRMStage) => {
    if (!prospect || prospect.status === newStage) return;
    try {
      await updateBusinessStage(prospect.id, newStage, prospect.status);
      loadProspect();
    } catch (err) {
      console.error('Error changing stage:', err);
    }
  };

  const handleDelete = async () => {
    if (!prospect) return;
    setIsDeleting(true);
    try {
      await deleteProspect(prospect.id);
      router.push('/prospects');
    } catch (err) {
      console.error('Error deleting prospect:', err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Topbar title="Detalle de Prospecto" />
        <div className="p-8 max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-24 bg-slate-800/40 rounded-xl" />
          <div className="h-64 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div>
        <Topbar title="Detalle de Prospecto" />
        <div className="p-12 text-center">
          <p className="text-slate-400 text-sm">Prospecto no encontrado.</p>
          <Link
            href="/prospects"
            className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:underline text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al listado</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStageDef =
    CRM_STAGES.find((s) => s.id === prospect.status) || CRM_STAGES[0];

  return (
    <div>
      <Topbar
        title={prospect.name}
        subtitle={`${prospect.industry || 'Rubro no definido'} • ${prospect.city || 'Ubicación no especificada'}`}
        onRefresh={loadProspect}
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/prospects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al directorio de prospectos</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#152037] hover:text-white transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Editar Prospecto</span>
            </button>

            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        {/* Prospect Hero Card */}
        <div className="rounded-2xl border border-[#1a2336] bg-[#0c1220] p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 shrink-0">
                <Building className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    {prospect.name}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStageDef.badgeClass}`}
                  >
                    {currentStageDef.label}
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {prospect.industry && (
                    <span className="text-cyan-300 font-medium">{prospect.industry}</span>
                  )}
                  {prospect.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>
                        {prospect.city}
                        {prospect.state_province ? `, ${prospect.state_province}` : ''} ({prospect.country})
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>Alta: {formatDate(prospect.created_at)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stage Selector Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#080d18] p-3 rounded-xl border border-[#172238]">
              <span className="text-xs text-slate-400 font-medium">Estado Comercial:</span>
              <select
                value={prospect.status}
                onChange={(e) => handleStageChange(e.target.value as CRMStage)}
                className="rounded-lg border border-[#1e2a42] bg-[#0c1220] px-3 py-1.5 text-xs font-medium text-white focus:border-cyan-500 focus:outline-none"
              >
                {CRM_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Contact & Info Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#172238] pt-4 text-xs">
            {/* Sitio Web */}
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Sitio Web</span>
              <div className="mt-1">
                {prospect.website ? (
                  <a
                    href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-mono truncate max-w-full"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{prospect.website}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500">Sin sitio web registrado</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Email</span>
              <div className="mt-1 flex items-center gap-1.5 text-slate-300">
                <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{prospect.email || 'Sin email'}</span>
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Teléfono / WhatsApp</span>
              <div className="mt-1 flex items-center gap-1.5 text-slate-300">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{prospect.phone || 'Sin teléfono'}</span>
              </div>
            </div>

            {/* Fuente */}
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Fuente de Captura</span>
              <div className="mt-1 flex items-center gap-1.5 text-slate-300 font-medium">
                <Tag className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>{prospect.source || 'Manual'}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {prospect.notes && (
            <div className="mt-4 border-t border-[#172238] pt-4">
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Observaciones</span>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed bg-[#080d18] p-3 rounded-lg border border-[#172238]">
                {prospect.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sección inferior: Actividades y Auditoría */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline de Actividades (2 cols) */}
          <div className="lg:col-span-2 rounded-xl border border-[#1a2336] bg-[#0c1220] p-5">
            <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Historial de Actividad Comercial</h3>
              </div>

              <button
                onClick={() => setIsActivityModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Registrar Actividad</span>
              </button>
            </div>

            {prospect.activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No hay actividades registradas aún para este prospecto.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1a253c]">
                {prospect.activities.map((act) => {
                  const typeMeta = ACTIVITY_TYPE_LABELS[act.type] || {
                    label: act.type,
                    icon: 'FileText',
                  };

                  return (
                    <div key={act.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-[9px] font-bold">
                        •
                      </span>

                      <div className="rounded-lg border border-[#172238] bg-[#080d18] p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                            {typeMeta.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDate(act.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-slate-300 leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna derecha: Auditoría Técnica Web (Preparada para Fase 2) */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5">
              <div className="flex items-center gap-2 border-b border-[#182236] pb-3 mb-3">
                <SearchCode className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Auditoría Técnica</h3>
              </div>

              <div className="rounded-lg border border-purple-900/30 bg-purple-950/15 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Estado de Auditoría</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/40 text-purple-300 border border-purple-700/50">
                    PENDIENTE
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  El motor de auditoría automática con análisis de rendimiento, SEO, accesibilidad e IA se activará en la Fase 2.
                </p>
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="rounded-xl border border-[#1a2336] bg-[#090e1a] p-5 text-xs space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Metadatos de Registro
              </h4>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div>ID: {prospect.id}</div>
                <div>Creado: {formatDate(prospect.created_at)}</div>
                <div>Actualizado: {formatDate(prospect.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        businessId={prospect.id}
        businessName={prospect.name}
        onClose={() => setIsActivityModalOpen(false)}
        onSuccess={loadProspect}
      />

      <ProspectModal
        isOpen={isEditModalOpen}
        prospectToEdit={prospect}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadProspect}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Eliminar Prospecto"
        message={`¿Estás seguro de que deseás eliminar a "${prospect.name}"? Se perderán todas sus actividades y datos registrados.`}
        confirmLabel="Eliminar Definitivamente"
        isProcessing={isDeleting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
