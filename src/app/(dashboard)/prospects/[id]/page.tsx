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
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { ActivityModal } from '@/components/crm/ActivityModal';
import { ProspectModal } from '@/components/prospects/ProspectModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { createClient } from '@/lib/supabase/client';
import {
  getProspectById,
  deleteProspect,
  ProspectDetail,
} from '@/services/prospects.service';
import { updateBusinessStage } from '@/services/crm.service';
import { CRM_STAGES, ACTIVITY_TYPE_LABELS } from '@/lib/constants/crm';
import { formatDate, buildGoogleMapsUrl } from '@/lib/utils';
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
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunTitoAudit = async () => {
    if (!prospect?.id || isAuditing) return;
    setIsAuditing(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch('/api/tito/audit', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ businessIds: [prospect.id] }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar auditoría con Tito.');
      }
      await loadProspect();
    } catch (err: any) {
      alert(`Error en la auditoría: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

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
        <Topbar title="Ficha del Negocio" />
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
        <Topbar title="Ficha del Negocio" />
        <div className="p-12 text-center">
          <p className="text-slate-400 text-sm">Negocio no encontrado.</p>
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

  // Construcción del enlace oficial a Google Maps
  const hasSpecificGoogleProfile = Boolean(prospect.google_place_id);
  const googleMapsUrl = buildGoogleMapsUrl(prospect);

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
            <span>Volver al directorio de negocios</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#152037] hover:text-white transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Editar negocio</span>
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
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500/50 hover:text-white transition-all shadow-sm"
                    title={
                      hasSpecificGoogleProfile
                        ? `Abrir perfil específico de ${prospect.name} en Google Maps`
                        : `Buscar ${prospect.name} en Google Maps por nombre y dirección`
                    }
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                      <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
                    </svg>
                    <span>Ver perfil en Google</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
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
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 border-t border-[#172238] pt-4 text-xs">
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

            {/* Perfil en Google Maps */}
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-semibold">
                {hasSpecificGoogleProfile ? 'Google Maps (Perfil)' : 'Google Maps (Búsqueda)'}
              </span>
              <div className="mt-1">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:underline font-medium truncate max-w-full"
                  title={
                    hasSpecificGoogleProfile
                      ? `Abrir perfil oficial de ${prospect.name} en Google Maps`
                      : `Buscar ${prospect.name} en Google Maps por nombre y dirección`
                  }
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                    <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
                  </svg>
                  <span>Ver perfil en Google</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-75" />
                </a>
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

          {/* Columna derecha: Auditoría Técnica con Tito */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5">
              <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <SearchCode className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Auditoría Técnica — Tito</h3>
                </div>

                {prospect.website && (
                  <button
                    type="button"
                    onClick={handleRunTitoAudit}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    title={prospect.audit ? 'Actualizar auditoría técnica' : 'Ejecutar inspección técnica'}
                  >
                    <RefreshCw className={`h-3 w-3 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>{isAuditing ? 'Auditando...' : prospect.audit ? 'Reauditar' : 'Auditar ahora'}</span>
                  </button>
                )}
              </div>

              {!prospect.website ? (
                <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-xs text-amber-200">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Oportunidad de Desarrollo Web</span>
                  </div>
                  <p className="mt-2 text-[11px] text-amber-300/80 leading-relaxed">
                    Este negocio no tiene un sitio web registrado. No requiere auditoría técnica: representa una oportunidad directa para ofrecerle el desarrollo de su presencia digital desde cero.
                  </p>
                </div>
              ) : !prospect.audit ? (
                <div className="rounded-lg border border-slate-800 bg-[#080d18] p-4 text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Estado</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      PENDIENTE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sitio web disponible ({prospect.website}). Hacé clic en «Auditar ahora» para que Tito inspeccione rendimiento, SEO, seguridad y conversión.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resumen e Índice Técnico */}
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Inspección completada por Tito</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDate(prospect.audit.created_at)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#080d18] p-2 rounded border border-[#1a253c]">
                        <span className="text-slate-400 block text-[10px]">Tiempo Respuesta</span>
                        <span className="font-semibold text-white">
                          {prospect.audit.performance_data?.responseTimeMs || 0} ms
                        </span>
                      </div>
                      <div className="bg-[#080d18] p-2 rounded border border-[#1a253c]">
                        <span className="text-slate-400 block text-[10px]">Peso HTML Base</span>
                        <span className="font-semibold text-white">
                          {prospect.audit.performance_data?.htmlSizeKb || 0} KB
                        </span>
                      </div>
                      <div className="bg-[#080d18] p-2 rounded border border-[#1a253c]">
                        <span className="text-slate-400 block text-[10px]">Protocolo</span>
                        <span
                          className={`font-semibold ${
                            prospect.audit.performance_data?.isHttps ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {prospect.audit.performance_data?.isHttps ? 'HTTPS Seguro' : 'HTTP No Seguro'}
                        </span>
                      </div>
                      <div className="bg-[#080d18] p-2 rounded border border-[#1a253c]">
                        <span className="text-slate-400 block text-[10px]">Canal WhatsApp</span>
                        <span
                          className={`font-semibold ${
                            prospect.audit.ai_insights?.hasWhatsApp ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {prospect.audit.ai_insights?.hasWhatsApp ? 'Detectado' : 'No encontrado'}
                        </span>
                      </div>
                    </div>

                    {/* Nota técnica de Core Web Vitals */}
                    <div className="mt-2.5 p-2 rounded bg-[#080d18]/60 border border-[#1a253c] text-[10px] text-slate-400 leading-normal">
                      ℹ <strong>Core Web Vitals:</strong> Medición en navegador no disponible en inspección estática (requiere simulación de renderizado con navegador o datos de campo de Google).
                    </div>
                  </div>

                  {/* Problemas Detectados con Evidencia */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">
                        Problemas detectados ({prospect.auditIssues?.length || 0})
                      </span>
                    </div>

                    {prospect.auditIssues && prospect.auditIssues.length > 0 ? (
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                        {prospect.auditIssues.map((iss) => {
                          const isHigh = iss.severity === 'CRITICO' || iss.severity === 'ALTO';
                          return (
                            <div
                              key={iss.id}
                              className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                                isHigh
                                  ? 'bg-red-950/20 border-red-900/40 text-red-200'
                                  : 'bg-[#080d18] border-[#1a253c] text-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-white text-xs">{iss.title}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                                    iss.severity === 'CRITICO'
                                      ? 'bg-red-900/50 text-red-300 border border-red-700/60'
                                      : iss.severity === 'ALTO'
                                      ? 'bg-orange-900/50 text-orange-300 border border-orange-700/60'
                                      : iss.severity === 'MEDIO'
                                      ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {iss.severity}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {iss.description}
                              </p>

                              {iss.recommendation && (
                                <div className="text-[10px] text-emerald-300 bg-emerald-950/30 p-1.5 rounded border border-emerald-800/30 flex items-start gap-1">
                                  <span className="font-semibold shrink-0">Recomendación:</span>
                                  <span>{iss.recommendation}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No se detectaron problemas críticos.</p>
                    )}
                  </div>

                  {/* Servicios que WebPilot puede ofrecer */}
                  {prospect.audit.ai_insights?.commercialRecommendations &&
                    prospect.audit.ai_insights.commercialRecommendations.length > 0 && (
                      <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3.5 space-y-2">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-xs">
                          <Wrench className="h-3.5 w-3.5" />
                          <span>Servicios sugeridos para ofrecerle</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px]">
                          {prospect.audit.ai_insights.commercialRecommendations.map(
                            (rec: any, idx: number) => (
                              <li
                                key={idx}
                                className="bg-[#080d18] p-2 rounded border border-[#1a253c] text-slate-200"
                              >
                                <div className="font-semibold text-cyan-300">{rec.serviceName}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{rec.reason}</div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}
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
        title="Eliminar Negocio"
        message={`¿Estás seguro de que deseás eliminar a "${prospect.name}"? Se perderán todas sus actividades y datos registrados.`}
        confirmLabel="Eliminar Definitivamente"
        isProcessing={isDeleting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
