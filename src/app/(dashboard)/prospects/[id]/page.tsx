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
  Target,
  Send,
  MessageCircle,
  DollarSign,
  Copy,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  PhoneCall,
  RotateCw,
  CreditCard,
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
import { formatDate, buildGoogleMapsUrl, formatCurrency } from '@/lib/utils';
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
  const [isAnalyzingVera, setIsAnalyzingVera] = useState(false);
  const [isVeraModalOpen, setIsVeraModalOpen] = useState(false);
  const [copiedVera, setCopiedVera] = useState(false);
  const [isReputationModalOpen, setIsReputationModalOpen] = useState(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    author: '',
    rating: 5,
    date: '',
    text: '',
    businessResponse: '',
  });
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState<{
    status: 'ACTIVO' | 'PAUSADO' | 'CANCELADO';
    monthlyFeeARS: number;
    monthlyFeeUSD: number;
    startDate: string;
    commitmentMonths: number;
    commitmentEndDate: string;
    notes: string;
  }>({
    status: 'ACTIVO',
    monthlyFeeARS: 19000,
    monthlyFeeUSD: 19,
    startDate: new Date().toISOString().split('T')[0],
    commitmentMonths: 12,
    commitmentEndDate: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    })(),
    notes: 'Hosting web, SSL, copias de seguridad y mantenimiento técnico mensual.',
  });

  const handleOpenMaintenanceModal = () => {
    const existing = (prospect?.audit?.ai_insights as any)?.maintenance_subscription;
    const veraMonthlyARS = prospect?.audit?.ai_insights?.vera_strategy?.suggestedPricing?.monthlyMaintenanceARS || 19000;
    const veraMonthlyUSD = prospect?.audit?.ai_insights?.vera_strategy?.suggestedPricing?.monthlyMaintenanceUSD || 19;

    if (existing) {
      setMaintenanceForm({
        status: existing.status || 'ACTIVO',
        monthlyFeeARS: existing.monthlyFeeARS || veraMonthlyARS,
        monthlyFeeUSD: existing.monthlyFeeUSD || veraMonthlyUSD,
        startDate: existing.startDate || new Date().toISOString().split('T')[0],
        commitmentMonths: existing.commitmentMonths || 12,
        commitmentEndDate: existing.commitmentEndDate || (() => {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          return d.toISOString().split('T')[0];
        })(),
        notes: existing.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setMaintenanceForm({
        status: 'ACTIVO',
        monthlyFeeARS: veraMonthlyARS,
        monthlyFeeUSD: veraMonthlyUSD,
        startDate: today,
        commitmentMonths: 12,
        commitmentEndDate: nextYear.toISOString().split('T')[0],
        notes: 'Hosting web, SSL, copias de seguridad y mantenimiento técnico mensual.',
      });
    }
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenanceSubscription = async () => {
    if (!prospect?.id || isSavingMaintenance) return;
    setIsSavingMaintenance(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/crm/maintenance', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          businessId: prospect.id,
          subscription: {
            ...maintenanceForm,
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar suscripción de mantenimiento.');
      }

      await loadProspect();
      setIsMaintenanceModalOpen(false);
    } catch (err: any) {
      alert(`Error al registrar mantenimiento: ${err.message}`);
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  const handleRunVeraAnalysis = async () => {
    if (!prospect?.id || isAnalyzingVera) return;
    setIsAnalyzingVera(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch('/api/vera/analyze', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ businessIds: [prospect.id] }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al formular estrategia con Vera.');
      }
      await loadProspect();
      setIsVeraModalOpen(true);
    } catch (err: any) {
      alert(`Error con Vera: ${err.message}`);
    } finally {
      setIsAnalyzingVera(false);
    }
  };

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

  const handleSaveReview = async () => {
    if (!prospect?.id || !newReviewForm.text.trim() || isSavingReview) return;
    setIsSavingReview(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const currentReviews = (prospect.audit?.ai_insights as any)?.reputation?.reviews || [];
      const newReview = {
        id: `rev_${Date.now()}`,
        author: newReviewForm.author.trim() || 'Paciente anónimo',
        rating: newReviewForm.rating,
        date: newReviewForm.date.trim() || 'Reciente',
        text: newReviewForm.text.trim(),
        businessResponse: newReviewForm.businessResponse.trim() || null,
        source: 'MANUAL',
        createdAt: new Date().toISOString(),
      };

      const updatedReviews = [newReview, ...currentReviews];
      const res = await fetch('/api/vera/reputation', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          businessId: prospect.id,
          reviews: updatedReviews,
        }),
      });

      if (res.ok) {
        setNewReviewForm({ author: '', rating: 5, date: '', text: '', businessResponse: '' });
        setIsAddReviewModalOpen(false);
        await loadProspect();
      } else {
        const data = await res.json();
        alert(`Error al guardar reseña: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleSeedTrialReviews = async () => {
    if (!prospect?.id || isSavingReview) return;
    setIsSavingReview(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const sampleReviews = [
        {
          id: `rev_sample_1_${Date.now()}`,
          author: 'Mariana Gomez',
          rating: 4,
          date: 'Hace 3 semanas',
          text: 'La atención de los profesionales es impecable, muy dedicados y súper higiénico el consultorio. Lo único malo es que cuesta un montón comunicarse por teléfono o WhatsApp para que te den turno, tardan horas en responder.',
          source: 'MANUAL',
          createdAt: new Date().toISOString(),
        },
        {
          id: `rev_sample_2_${Date.now()}`,
          author: 'Esteban Rossi',
          rating: 3,
          date: 'Hace 1 mes',
          text: 'Excelente odontólogo, me salvó una muela. Pero la puntualidad es para mejorar: estuve 40 minutos esperando en la sala teniendo turno reservado con anticipación.',
          source: 'MANUAL',
          createdAt: new Date().toISOString(),
        },
        {
          id: `rev_sample_3_${Date.now()}`,
          author: 'Carla Benitez',
          rating: 5,
          date: 'Hace 2 meses',
          text: 'Muy buena experiencia, instalaciones modernas y claras explicaciones del presupuesto antes de iniciar el tratamiento de ortodoncia.',
          businessResponse: '¡Muchas gracias Carla por confiar en nuestro equipo!',
          source: 'MANUAL',
          createdAt: new Date().toISOString(),
        },
      ];

      const res = await fetch('/api/vera/reputation', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          businessId: prospect.id,
          reviews: sampleReviews,
        }),
      });

      if (res.ok) {
        setIsAddReviewModalOpen(false);
        await loadProspect();
      } else {
        const data = await res.json();
        alert(`Error al cargar reseñas: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Error al cargar reseñas de prueba: ${e.message}`);
    } finally {
      setIsSavingReview(false);
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

            {/* Tarjeta de Vera — Estratega Comercial */}
            <div className="rounded-xl border border-purple-500/30 bg-[#0c1220] p-5 shadow-lg shadow-purple-950/10">
              <div className="flex items-center justify-between border-b border-[#182238] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Estrategia Comercial — Vera</h3>
                    <p className="text-[10px] text-purple-300">Propuesta, precios y argumentos de venta</p>
                  </div>
                </div>

                {prospect.audit?.ai_insights?.vera_strategy ? (
                  <button
                    onClick={handleRunVeraAnalysis}
                    disabled={isAnalyzingVera}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
                    title="Actualizar estrategia comercial con Vera"
                  >
                    <RefreshCw className={`h-3 w-3 ${isAnalyzingVera ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRunVeraAnalysis}
                    disabled={isAnalyzingVera}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{isAnalyzingVera ? 'Analizando...' : 'Estrategia Vera'}</span>
                  </button>
                )}
              </div>

              {prospect.audit?.ai_insights?.vera_strategy ? (
                <div className="space-y-3.5 text-xs">
                  {/* Paquete e inversión o Diagnóstico de Presencia */}
                  {prospect.audit.ai_insights.vera_strategy.commercialOutcome === 'BUENA_PRESENCIA' ? (
                    <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                          Buena Presencia Digital
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800/40">
                          No ofrecer servicios
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        Presencia digital sólida y funcional
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {prospect.audit.ai_insights.vera_strategy.summary}
                      </div>
                    </div>
                  ) : prospect.audit.ai_insights.vera_strategy.commercialOutcome === 'INFORMACION_INSUFICIENTE' ? (
                    <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-950/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                          Información Insuficiente
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/40">
                          Revisión humana
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {prospect.audit.ai_insights.vera_strategy.summary}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-950/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                          {prospect.audit.ai_insights.vera_strategy.commercialOutcome === 'PROPUESTA_OPCIONAL'
                            ? 'Propuesta Opcional y Específica'
                            : 'Propuesta Sugerida'}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 mr-1">Desarrollo:</span>
                          <span className="text-base font-bold font-mono text-emerald-400">
                            {formatCurrency(prospect.audit.ai_insights.vera_strategy.suggestedPricing?.bundleFinalARS || 0)}
                          </span>
                        </div>
                      </div>
                      {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.monthlyMaintenanceARS ? (
                        <div className="flex items-center justify-between pt-1 border-t border-purple-500/20 text-[11px] font-mono">
                          <span className="text-slate-400">Mantenimiento mensual:</span>
                          <span className="font-semibold text-cyan-300">
                            +{formatCurrency(prospect.audit.ai_insights.vera_strategy.suggestedPricing.monthlyMaintenanceARS)}/mes
                          </span>
                        </div>
                      ) : null}
                      {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.firstYearTotalARS ? (
                        <div className="flex items-center justify-between text-[11px] font-mono text-amber-300/90">
                          <span>Total estimado 1° año:</span>
                          <span className="font-semibold">
                            {formatCurrency(prospect.audit.ai_insights.vera_strategy.suggestedPricing.firstYearTotalARS)}
                          </span>
                        </div>
                      ) : null}
                      <div className="text-xs font-semibold text-white pt-1">
                        {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.bundleName}
                      </div>
                      <div className="text-[11px] text-slate-300 line-clamp-2">
                        {prospect.audit.ai_insights.vera_strategy.summary}
                      </div>
                    </div>
                  )}

                  {/* Oportunidades Clave */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Oportunidad Principal Detectada:
                    </span>
                    <div className="p-2.5 rounded-lg bg-[#080d18] border border-[#172238] text-[11px] text-slate-200">
                      <strong className="text-purple-300 block mb-0.5">
                        {prospect.audit.ai_insights.vera_strategy.opportunities?.[0]?.title}
                      </strong>
                      <span className="text-slate-400">
                        {prospect.audit.ai_insights.vera_strategy.opportunities?.[0]?.factProven}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsVeraModalOpen(true)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#152037] hover:bg-[#1e2e4f] border border-purple-500/30 px-3 py-2 text-xs font-medium text-white transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-purple-400" />
                      <span>Ver Estrategia</span>
                    </button>

                    <Link
                      href={`/agents/cata?search=${encodeURIComponent(prospect.name)}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                      title="Gestionar propuesta y seguimiento con Cata"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Gestionar con Cata</span>
                    </Link>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        prospect.audit.ai_insights.vera_strategy.outreachPitch?.whatsappMessage || ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                      title="Abrir chat en WhatsApp con el mensaje inicial de Vera"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-800 bg-[#080d18] p-4 text-xs text-slate-300 space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Vera aún no generó la estrategia comercial para este negocio. Hacé clic en «Estrategia Vera» para calcular qué venderle, justificar el valor y preparar el mensaje de WhatsApp.
                  </p>
                  <button
                    onClick={handleRunVeraAnalysis}
                    disabled={isAnalyzingVera}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50"
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>{isAnalyzingVera ? 'Analizando con Vera...' : 'Generar Estrategia Comercial'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tarjeta de Inteligencia de Reputación */}
            {(() => {
              const rep = (prospect.audit?.ai_insights as any)?.reputation;
              const repAnalysis = rep?.analysis;
              const reviewsCount = rep?.reviews?.length || 0;

              return (
                <div className="rounded-xl border border-amber-500/30 bg-[#0c1220] p-5 shadow-lg shadow-amber-950/10">
                  <div className="flex items-center justify-between border-b border-[#182238] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Star className="h-4 w-4 fill-amber-400/20" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Inteligencia de Reputación</h3>
                        <p className="text-[10px] text-amber-300">Voz del paciente y análisis de reseñas</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAddReviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Cargar Reseñas</span>
                    </button>
                  </div>

                  {repAnalysis && reviewsCount > 0 ? (
                    <div className="space-y-3.5 text-xs">
                      {/* Rating y muestra */}
                      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-400 font-bold text-lg font-mono">
                            <span>{repAnalysis.averageRating?.toFixed(1) || '0.0'}</span>
                            <Star className="h-4 w-4 ml-1 fill-amber-400" />
                          </div>
                          <span className="text-[11px] text-slate-400">
                            ({reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080d18] border border-amber-500/20 text-amber-300">
                          {repAnalysis.sampleReliabilityNotice?.includes('limitada') ? 'Muestra acotada' : 'Muestra confiable'}
                        </span>
                      </div>

                      {/* Fortalezas principales */}
                      {repAnalysis.strengths && repAnalysis.strengths.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                            <ThumbsUp className="h-3 w-3" />
                            Fortalezas destacadas por pacientes:
                          </span>
                          <div className="p-2.5 rounded-lg bg-[#080d18] border border-emerald-900/30 text-[11px] text-slate-200">
                            <strong className="text-emerald-300 block mb-0.5">
                              {repAnalysis.strengths[0].title}
                            </strong>
                            <span className="text-slate-400 italic">
                              «{repAnalysis.strengths[0].quotes?.[0] || repAnalysis.strengths[0].evidence}»
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Problemas / Fricciones recurrentes */}
                      {repAnalysis.issues && repAnalysis.issues.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-rose-400 flex items-center gap-1 mb-1">
                            <ThumbsDown className="h-3 w-3" />
                            Puntos críticos detectados:
                          </span>
                          <div className="p-2.5 rounded-lg bg-[#080d18] border border-rose-900/30 text-[11px] text-slate-200">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <strong className="text-rose-300">
                                {repAnalysis.issues[0].title}
                              </strong>
                              <span className="text-[9px] font-mono text-rose-400 border border-rose-900/40 px-1 rounded">
                                {repAnalysis.issues[0].occurrences} menciones
                              </span>
                            </div>
                            <span className="text-slate-400 italic">
                              «{repAnalysis.issues[0].quotes?.[0] || repAnalysis.issues[0].evidence}»
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Oportunidad Comercial WebPilot */}
                      {repAnalysis.opportunities && repAnalysis.opportunities.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-cyan-400 flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3" />
                            Oportunidad WebPilot detectada:
                          </span>
                          <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-200">
                            <strong>{repAnalysis.opportunities[0].recommendedService}</strong>
                            <p className="text-[10px] text-slate-300 mt-1">
                              {repAnalysis.opportunities[0].rationale}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Botón ver detalle completo */}
                      <div className="pt-2">
                        <button
                          onClick={() => setIsReputationModalOpen(true)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#152037] hover:bg-[#1e2e4f] border border-amber-500/30 px-3 py-2 text-xs font-medium text-amber-200 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5 text-amber-400" />
                          <span>Ver Informe de Reputación y Reseñas</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-800 bg-[#080d18] p-4 text-xs text-slate-300 space-y-3">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Aún no se cargaron opiniones de clientes para este negocio. Podés cargar reseñas manualmente para que Vera identifique oportunidades a partir de lo que reclaman o agradecen los pacientes.
                      </p>
                      <button
                        onClick={() => setIsAddReviewModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Cargar Primeras Reseñas</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Tarjeta de Abono de Mantenimiento Recurrente */}
            {(() => {
              const sub = (prospect.audit?.ai_insights as any)?.maintenance_subscription;
              const hasActiveSub = sub && (sub.status === 'ACTIVO' || sub.status === 'PAUSADO' || sub.status === 'CANCELADO');

              return (
                <div className="rounded-xl border border-cyan-500/30 bg-[#0c1220] p-5 shadow-lg shadow-cyan-950/10">
                  <div className="flex items-center justify-between border-b border-[#182238] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <RotateCw className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Abono de Mantenimiento</h3>
                        <p className="text-[10px] text-cyan-300">Ingreso recurrente y soporte mensual</p>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenMaintenanceModal}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>{hasActiveSub ? 'Gestionar' : 'Activar'}</span>
                    </button>
                  </div>

                  {hasActiveSub ? (
                    <div className="space-y-3 text-xs">
                      {/* Estado y Cuota Mensual */}
                      <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                            Estado del Abono
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              sub.status === 'ACTIVO'
                                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                                : sub.status === 'PAUSADO'
                                ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                                : 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                            Cuota Mensual
                          </span>
                          <span className="text-base font-bold font-mono text-cyan-300">
                            {formatCurrency(sub.monthlyFeeARS || 0)}/mes
                          </span>
                          {sub.monthlyFeeUSD ? (
                            <span className="text-[10px] text-slate-500 block font-mono">
                              (US$ {sub.monthlyFeeUSD}/mes)
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Plazo y Compromiso */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#080d18] p-2.5 rounded-lg border border-[#172238]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Fecha de inicio:</span>
                          <span className="text-white font-medium">{sub.startDate || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Compromiso 12 meses:</span>
                          <span className="text-amber-300 font-medium">{sub.commitmentEndDate || '12 meses'}</span>
                        </div>
                      </div>

                      {sub.notes && (
                        <div className="text-[11px] text-slate-400 bg-[#080d18] p-2 rounded-lg border border-[#172238]">
                          <strong className="text-slate-300 block mb-0.5">Alcance acordado:</strong>
                          {sub.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-800 bg-[#080d18] p-4 text-xs text-slate-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Estado</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-700 bg-slate-800 text-slate-400">
                          SIN ABONO ACTIVO
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Este cliente aún no tiene un abono de mantenimiento recurrente activo. Podés darlo de alta cuando contrate el desarrollo ($19.000, $24.000 o $29.000 mensuales) con compromiso inicial de 12 meses.
                      </p>
                      <button
                        onClick={handleOpenMaintenanceModal}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Activar Abono de Mantenimiento</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

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

      {/* Modal Estrategia Comercial de Vera */}
      {isVeraModalOpen && prospect.audit?.ai_insights?.vera_strategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-[#0a0f1d] p-6 shadow-2xl text-slate-200 space-y-6">
            <div className="flex items-start justify-between border-b border-[#172238] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Estrategia Comercial — {prospect.name}
                  </h3>
                  <p className="text-xs text-purple-300">
                    Formulada por Vera AI • {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.bundleName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVeraModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Inversión y paquete */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#0c1424] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold block">Propuesta Sugerida</span>
                <span className="text-sm font-bold text-white">
                  {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.bundleName}
                </span>
                {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.commitmentMonths ? (
                  <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                    • Compromiso inicial sugerido: {prospect.audit.ai_insights.vera_strategy.suggestedPricing.commitmentMonths} meses
                  </span>
                ) : null}
              </div>
              <div className="text-left sm:text-right">
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="text-xs text-slate-400">Desarrollo:</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {formatCurrency(prospect.audit.ai_insights.vera_strategy.suggestedPricing?.bundleFinalARS || 0)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    (US$ {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.bundleFinalUSD})
                  </span>
                </div>
                {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.monthlyMaintenanceARS ? (
                  <div className="text-xs font-semibold text-cyan-300 font-mono mt-0.5">
                    + {formatCurrency(prospect.audit.ai_insights.vera_strategy.suggestedPricing.monthlyMaintenanceARS)}/mes mantenimiento
                    {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.monthlyMaintenanceUSD ? (
                      <span className="text-[10px] text-slate-400 ml-1">
                        (US$ {prospect.audit.ai_insights.vera_strategy.suggestedPricing.monthlyMaintenanceUSD}/mes)
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {prospect.audit.ai_insights.vera_strategy.suggestedPricing?.firstYearTotalARS ? (
                  <div className="text-[11px] text-amber-300/90 font-mono mt-0.5">
                    Total 1° año (Desarrollo + 12m): {formatCurrency(prospect.audit.ai_insights.vera_strategy.suggestedPricing.firstYearTotalARS)}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Oportunidades y Hechos Comprobados */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Oportunidades y Hechos Comprobados</h4>
              {prospect.audit.ai_insights.vera_strategy.opportunities?.map((opp: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#0c1220] rounded-xl border border-[#172238] text-xs space-y-1">
                  <div className="font-bold text-white">{opp.title}</div>
                  <div className="text-slate-300"><strong>Hecho:</strong> {opp.factProven}</div>
                  <div className="text-purple-300"><strong>Impacto:</strong> {opp.commercialImpact}</div>
                </div>
              ))}
            </div>

            {/* Mensaje de WhatsApp listo */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#081816] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Mensaje de WhatsApp para el primer contacto</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        prospect.audit?.ai_insights?.vera_strategy?.outreachPitch?.whatsappMessage || ''
                      );
                      setCopiedVera(true);
                      setTimeout(() => setCopiedVera(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded hover:bg-emerald-900/60 transition-colors"
                  >
                    {copiedVera ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedVera ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      prospect.audit.ai_insights.vera_strategy.outreachPitch?.whatsappMessage || ''
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-600 px-2.5 py-1 rounded hover:bg-emerald-500 transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    <span>Abrir en WhatsApp</span>
                  </a>
                </div>
              </div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans bg-[#05100e] p-3 rounded-lg border border-emerald-900/40 leading-relaxed">
                {prospect.audit.ai_insights.vera_strategy.outreachPitch?.whatsappMessage}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsVeraModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#152037] text-white hover:bg-[#1e2e4f] text-xs font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carga Manual de Reseñas */}
      {isAddReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-[#0c1220] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a2336] pb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Cargar Reseña de Cliente — {prospect.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAddReviewModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Acceso rápido para probar con 3 reseñas representativas */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-amber-300 block">
                  ¿Querés probar rápido este negocio?
                </span>
                <span className="text-[11px] text-slate-300">
                  Cargá automáticamente 3 reseñas realistas de pacientes para evaluar la reputación.
                </span>
              </div>
              <button
                onClick={handleSeedTrialReviews}
                disabled={isSavingReview}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {isSavingReview ? 'Cargando...' : 'Cargar 3 Reseñas de Prueba'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Autor / Paciente</label>
                  <input
                    type="text"
                    value={newReviewForm.author}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                    placeholder="Ej: Marcelo Fernández"
                    className="w-full rounded-lg border border-[#1a2336] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Calificación (Estrellas)</label>
                  <select
                    value={newReviewForm.rating}
                    onChange={(e) =>
                      setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-[#1a2336] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Estrellas)</option>
                    <option value={3}>⭐⭐⭐ (3 Estrellas)</option>
                    <option value={2}>⭐⭐ (2 Estrellas)</option>
                    <option value={1}>⭐ (1 Estrella)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fecha o Antigüedad</label>
                <input
                  type="text"
                  value={newReviewForm.date}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, date: e.target.value })}
                  placeholder="Ej: Hace 2 semanas / Octubre 2026"
                  className="w-full rounded-lg border border-[#1a2336] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Comentario de la Reseña <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newReviewForm.text}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, text: e.target.value })}
                  placeholder="Pegá aquí la reseña del cliente o paciente tal como figura en Google Maps..."
                  className="w-full rounded-lg border border-[#1a2336] bg-[#070b14] p-3 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Respuesta del Negocio (Opcional)</label>
                <textarea
                  rows={2}
                  value={newReviewForm.businessResponse}
                  onChange={(e) =>
                    setNewReviewForm({ ...newReviewForm, businessResponse: e.target.value })
                  }
                  placeholder="Si el negocio respondió a esta reseña, pegá su respuesta aquí..."
                  className="w-full rounded-lg border border-[#1a2336] bg-[#070b14] p-3 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a2336]">
              <button
                onClick={() => setIsAddReviewModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#152037] text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReview}
                disabled={isSavingReview || !newReviewForm.text.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSavingReview ? 'Guardando...' : 'Guardar Reseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informe Completo de Reputación */}
      {isReputationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/30 bg-[#0c1220] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a2336] pb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Informe de Inteligencia de Reputación — {prospect.name}
                </h3>
              </div>
              <button
                onClick={() => setIsReputationModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const rep = (prospect.audit?.ai_insights as any)?.reputation;
              const repAnalysis = rep?.analysis;
              const reviewsList = rep?.reviews || [];

              if (!repAnalysis) {
                return (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No se encontró análisis de reputación para este prospecto.
                  </div>
                );
              }

              return (
                <div className="space-y-4 text-xs">
                  {/* Resumen */}
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono text-amber-400">
                          {repAnalysis.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(repAnalysis.averageRating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          ({repAnalysis.totalReviews} opiniones analizadas)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#080d18] border border-amber-500/30 text-amber-300">
                        Fuente: CARGA MANUAL
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {repAnalysis.summary}
                    </p>
                    <div className="text-[10px] text-amber-300/80 bg-[#080d18] p-2 rounded border border-amber-900/30">
                      ℹ <strong>Aviso metodológico:</strong> {repAnalysis.sampleReliabilityNotice}
                    </div>
                  </div>

                  {/* Fortalezas */}
                  {repAnalysis.strengths && repAnalysis.strengths.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>Fortalezas reconocidas por los clientes</span>
                      </span>
                      <div className="space-y-2">
                        {repAnalysis.strengths.map((str: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[#080d18] border border-emerald-900/40 space-y-1"
                          >
                            <div className="font-semibold text-emerald-300 text-xs">{str.title}</div>
                            <p className="text-[11px] text-slate-300">{str.evidence}</p>
                            {str.quotes && str.quotes.length > 0 && (
                              <div className="mt-1 pl-2 border-l-2 border-emerald-500/40 text-[10px] text-slate-400 italic">
                                «{str.quotes[0]}»
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fricciones y reclamos */}
                  {repAnalysis.issues && repAnalysis.issues.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span>Fricciones y oportunidades de mejora detectadas</span>
                      </span>
                      <div className="space-y-2">
                        {repAnalysis.issues.map((iss: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[#080d18] border border-rose-900/40 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-rose-300 text-xs">{iss.title}</span>
                              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                                {iss.severity} · {iss.occurrences} mención(es)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300">{iss.evidence}</p>
                            {iss.quotes && iss.quotes.length > 0 && (
                              <div className="mt-1 pl-2 border-l-2 border-rose-500/40 text-[10px] text-slate-400 italic">
                                «{iss.quotes[0]}»
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Oportunidades WebPilot */}
                  {repAnalysis.opportunities && repAnalysis.opportunities.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Oportunidades de servicios WebPilot justificadas por reputación</span>
                      </span>
                      <div className="space-y-2">
                        {repAnalysis.opportunities.map((opp: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 space-y-1.5 text-xs"
                          >
                            <div className="font-semibold text-cyan-300">{opp.recommendedService}</div>
                            <p className="text-[11px] text-slate-200">{opp.rationale}</p>
                            <div className="p-2 rounded bg-[#080d18] border border-[#172238] text-[10px] text-slate-300">
                              <strong className="text-purple-300 block mb-0.5">
                                Argumento comercial sugerido para Vera:
                              </strong>
                              «{opp.salesPitchSnippet}»
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reseñas individuales */}
                  <div className="space-y-2 border-t border-[#1a2336] pt-3">
                    <span className="text-xs font-semibold text-white block">
                      Reseñas registradas ({reviewsList.length})
                    </span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {reviewsList.map((rev: any) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-lg bg-[#080d18] border border-[#172238] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{rev.author}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-mono">
                                {'★'.repeat(rev.rating)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {rev.date}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{rev.text}</p>
                          {rev.businessResponse && (
                            <div className="mt-1 pl-2 border-l-2 border-cyan-500/40 text-[10px] text-cyan-200/90 bg-[#0c1424] p-1.5 rounded">
                              <strong>Respuesta del negocio:</strong> {rev.businessResponse}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsReputationModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#152037] text-white hover:bg-[#1e2e4f] text-xs font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Abono de Mantenimiento */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-[#0a0f1d] p-6 shadow-2xl text-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-[#172238] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <RotateCw className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Abono de Mantenimiento — {prospect.name}
                  </h3>
                  <p className="text-[11px] text-cyan-300">
                    Ingresos mensuales recurrentes y soporte continuo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Estado */}
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Estado de la Suscripción:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVO', 'PAUSADO', 'CANCELADO'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMaintenanceForm((prev) => ({ ...prev, status: st }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        maintenanceForm.status === st
                          ? st === 'ACTIVO'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                            : st === 'PAUSADO'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
                            : 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                          : 'bg-[#080d18] border-[#1a2336] text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Importes mensual ARS y USD */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Cuota mensual (ARS $):
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.monthlyFeeARS}
                    onChange={(e) =>
                      setMaintenanceForm((prev) => ({
                        ...prev,
                        monthlyFeeARS: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
                    placeholder="19000"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Express: $19k • Pro: $24k • Inst: $29k
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Cuota mensual (USD $):
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.monthlyFeeUSD}
                    onChange={(e) =>
                      setMaintenanceForm((prev) => ({
                        ...prev,
                        monthlyFeeUSD: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                    placeholder="19"
                  />
                </div>
              </div>

              {/* Fechas de inicio y compromiso inicial */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Fecha de Inicio:
                  </label>
                  <input
                    type="date"
                    value={maintenanceForm.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setMaintenanceForm((prev) => {
                        try {
                          const d = new Date(newStart);
                          d.setMonth(d.getMonth() + (prev.commitmentMonths || 12));
                          return {
                            ...prev,
                            startDate: newStart,
                            commitmentEndDate: d.toISOString().split('T')[0],
                          };
                        } catch {
                          return { ...prev, startDate: newStart };
                        }
                      });
                    }}
                    className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Fin de Compromiso (12m):
                  </label>
                  <input
                    type="date"
                    value={maintenanceForm.commitmentEndDate}
                    onChange={(e) =>
                      setMaintenanceForm((prev) => ({
                        ...prev,
                        commitmentEndDate: e.target.value,
                      }))
                    }
                    className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Notas y alcance */}
              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Alcance y Observaciones:
                </label>
                <textarea
                  rows={2}
                  value={maintenanceForm.notes}
                  onChange={(e) =>
                    setMaintenanceForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Hosting web, SSL, actualizaciones periódicas..."
                />
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-[11px] text-cyan-200/90 leading-relaxed">
                💡 <strong>Compromiso inicial:</strong> el modelo de negocio contempla 12 meses de compromiso inicial. Pasado el primer año, la renovación es mensual automática.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#172238]">
              <button
                type="button"
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#121c2e] text-slate-300 text-xs hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingMaintenance}
                onClick={handleSaveMaintenanceSubscription}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
              >
                {isSavingMaintenance ? 'Guardando...' : 'Guardar Abono'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
