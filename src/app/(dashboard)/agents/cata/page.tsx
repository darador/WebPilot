'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PhoneCall,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Target,
  DollarSign,
  TrendingUp,
  UserCheck,
  Send,
  Copy,
  Check,
  RefreshCw,
  Plus,
  FileText,
  Building,
  MapPin,
  ChevronRight,
  HelpCircle,
  Flame,
  Award,
  XCircle,
  Share2,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import {
  CataOpportunity,
  CataMetrics,
  CataMessageDraft,
  MessageSituation,
  ContactOutcome,
  OutreachChannel,
  OUTCOME_LABELS,
  CHANNEL_LABELS,
} from '@/services/cata.service';
import { CRMStage } from '@/types/database.types';
import { CRM_STAGES } from '@/lib/constants/crm';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, buildGoogleMapsUrl } from '@/lib/utils';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  const headers = new Headers(options.headers || {});
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export default function CataSalesPage() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'followups' | 'pipeline'>('opportunities');
  const [opportunities, setOpportunities] = useState<CataOpportunity[]>([]);
  const [metrics, setMetrics] = useState<CataMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState('ALL');

  // Listas de filtros disponibles
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);

  // Modales
  const [selectedOppForMessage, setSelectedOppForMessage] = useState<CataOpportunity | null>(null);
  const [messagesData, setMessagesData] = useState<Record<MessageSituation, CataMessageDraft> | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<MessageSituation>('SIN_WEB');
  const [messageChannelTab, setMessageChannelTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [customWhatsAppText, setCustomWhatsAppText] = useState('');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modal Registro Actividad
  const [selectedOppForActivity, setSelectedOppForActivity] = useState<CataOpportunity | null>(null);
  const [activityForm, setActivityForm] = useState<{
    channel: OutreachChannel;
    outcome: ContactOutcome;
    summary: string;
    followUpDate: string;
    nextAction: string;
    newStage: CRMStage;
    autoApplyStage: boolean;
  }>({
    channel: 'WHATSAPP',
    outcome: 'INTERESADO',
    summary: '',
    followUpDate: '',
    nextAction: '',
    newStage: 'RESPONDIÓ',
    autoApplyStage: true,
  });
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // Modal Diagnóstico Vera
  const [selectedOppForVera, setSelectedOppForVera] = useState<CataOpportunity | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Cargar oportunidades
  const loadOpportunities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (cityFilter) params.set('city', cityFilter);
      if (followUpFilter && followUpFilter !== 'ALL') params.set('followUpFilter', followUpFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetchWithAuth(`/api/cata/opportunities?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setOpportunities(json.data || []);
        setMetrics(json.metrics || null);

        // Extraer ciudades únicas
        const cities = Array.from(
          new Set(
            (json.data || [])
              .map((o: CataOpportunity) => o.business.city)
              .filter(Boolean)
          )
        ) as string[];
        setAvailableCities(cities);
      }
    } catch (e) {
      console.error('Error loading Cata opportunities:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, cityFilter, followUpFilter, search]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOpportunities();
  };

  // Abrir Modal Preparar Mensajes
  const handleOpenMessageModal = async (opp: CataOpportunity) => {
    setSelectedOppForMessage(opp);
    setCopiedField(null);

    // Seleccionar situación por defecto según la web
    const initialSituation: MessageSituation = !opp.business.website
      ? 'SIN_WEB'
      : opp.audit?.ai_insights?.tito_audit
      ? 'FALLAS_TITO'
      : 'REDISENO';
    setSelectedSituation(initialSituation);

    try {
      const res = await fetchWithAuth(`/api/cata/messages?businessId=${opp.id}`);
      if (res.ok) {
        const json = await res.json();
        setMessagesData(json.messages);

        const draft = json.messages[initialSituation];
        if (draft) {
          setCustomWhatsAppText(draft.whatsappMessage);
          setCustomEmailSubject(draft.emailSubject);
          setCustomEmailBody(draft.emailBody);
        }
      }
    } catch (e) {
      console.error('Error fetching messages draft:', e);
    }
  };

  // Cambiar situación en modal mensajes
  const handleSituationChange = (sit: MessageSituation) => {
    setSelectedSituation(sit);
    if (messagesData && messagesData[sit]) {
      const draft = messagesData[sit];
      setCustomWhatsAppText(draft.whatsappMessage);
      setCustomEmailSubject(draft.emailSubject);
      setCustomEmailBody(draft.emailBody);
    }
  };

  // Copiar al portapapeles
  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`¡Texto copiado al portapapeles!`, 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Abrir Modal Registrar Actividad
  const handleOpenActivityModal = (opp: CataOpportunity) => {
    setSelectedOppForActivity(opp);
    setActivityForm({
      channel: 'WHATSAPP',
      outcome: 'INTERESADO',
      summary: '',
      followUpDate: '',
      nextAction: '',
      newStage: 'RESPONDIÓ',
      autoApplyStage: true,
    });
  };

  // Cambiar outcome y actualizar estado sugerido
  const handleOutcomeChange = (newOutcome: ContactOutcome) => {
    const suggested = OUTCOME_LABELS[newOutcome]?.stageSuggestion || 'CONTACTADO';
    setActivityForm((prev) => ({
      ...prev,
      outcome: newOutcome,
      newStage: prev.autoApplyStage ? suggested : prev.newStage,
    }));
  };

  // Guardar actividad de Cata
  const handleSaveActivity = async () => {
    if (!selectedOppForActivity || !activityForm.summary.trim() || isSavingActivity) return;
    setIsSavingActivity(true);

    try {
      const res = await fetchWithAuth('/api/cata/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedOppForActivity.id,
          channel: activityForm.channel,
          outcome: activityForm.outcome,
          summary: activityForm.summary.trim(),
          followUpDate: activityForm.followUpDate || null,
          nextAction: activityForm.nextAction ? activityForm.nextAction.trim() : null,
          newStage: activityForm.autoApplyStage ? activityForm.newStage : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('¡Actividad comercial registrada y CRM actualizado con éxito!', 'success');
        setSelectedOppForActivity(null);
        await loadOpportunities();
      } else {
        showToast(data.error || 'Error al guardar actividad comercial.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error de conexión al guardar actividad.', 'error');
    } finally {
      setIsSavingActivity(false);
    }
  };

  return (
    <div>
      <Topbar
        title="Cata — Responsable Comercial"
        subtitle="Cierres, gestión de contactos, mensajes personalizados y seguimiento del pipeline"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner de Presentación de Cata */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-[#0a1122] to-pink-950/30 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-rose-500/40 shrink-0 shadow-lg shadow-rose-950/30 bg-[#0c1220]">
                <Image
                  src="/avatars/cata.png"
                  alt="Cata • Responsable Comercial"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-rose-300">
                    <PhoneCall className="h-3 w-3 text-rose-400" />
                    AGENTE #4 • RESPONSABLE COMERCIAL
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    OPERATIVO
                  </span>
                </div>

                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Cata</span>
                  <span className="text-xs font-normal text-rose-300 font-mono">
                    «Bueno, ¿y a este cuándo le presentamos la propuesta?»
                  </span>
                </h2>

                <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Transformo los diagnósticos de <strong>Vera</strong> y los problemas detectados por <strong>Tito</strong> en oportunidades concretas. 
                  Te ayudo a preparar el mensaje exacto para WhatsApp o correo, registrar qué hablaron y no olvidar ningún seguimiento comercial.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setFollowUpFilter('TODAY');
                  setActiveTab('followups');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:scale-105 transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span>Seguimientos de Hoy ({metrics?.followUpsToday || 0})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notificación Toast */}
        {toastMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between shadow-lg transition-all ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* Métricas Principales de Cata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Pendientes de contacto */}
          <div
            onClick={() => {
              setStatusFilter('AUDITADO');
              setActiveTab('opportunities');
            }}
            className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-3 hover:border-cyan-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
              <span>Pendientes</span>
              <Clock className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white">
              {metrics?.pendingContact || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Listos para contactar</div>
          </div>

          {/* Contactados */}
          <div
            onClick={() => {
              setStatusFilter('CONTACTADO');
              setActiveTab('opportunities');
            }}
            className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-3 hover:border-purple-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
              <span>Contactados</span>
              <Send className="h-3.5 w-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-purple-300">
              {metrics?.contacted || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Propuesta enviada</div>
          </div>

          {/* Respondieron */}
          <div
            onClick={() => {
              setStatusFilter('RESPONDIÓ');
              setActiveTab('opportunities');
            }}
            className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-3 hover:border-pink-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
              <span>Respondieron</span>
              <MessageCircle className="h-3.5 w-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-pink-300">
              {metrics?.responded || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Interés manifestado</div>
          </div>

          {/* En Negociación */}
          <div
            onClick={() => {
              setStatusFilter('NEGOCIACIÓN');
              setActiveTab('opportunities');
            }}
            className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-3 hover:border-amber-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
              <span>Negociación</span>
              <Flame className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-amber-300">
              {metrics?.negotiation || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Presupuesto activo</div>
          </div>

          {/* Seguimientos Activos */}
          <div
            onClick={() => {
              setActiveTab('followups');
              setFollowUpFilter('ALL');
            }}
            className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 hover:border-rose-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-rose-300 text-[10px] uppercase font-semibold">
              <span>Seguimientos</span>
              <Calendar className="h-3.5 w-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white flex items-center gap-1.5">
              <span>{metrics?.followUpsTotal || 0}</span>
              {metrics?.followUpsOverdue ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold" title="Vencidos">
                  {metrics.followUpsOverdue} vencidos
                </span>
              ) : null}
            </div>
            <div className="text-[10px] text-rose-300/70 mt-0.5">
              {metrics?.followUpsToday || 0} para contactar hoy
            </div>
          </div>

          {/* Clientes Ganados */}
          <div
            onClick={() => {
              setStatusFilter('GANADO');
              setActiveTab('opportunities');
            }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 hover:border-emerald-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-emerald-300 text-[10px] uppercase font-semibold">
              <span>Ganados</span>
              <Award className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
              {metrics?.won || 0}
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">Ventas cerradas</div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex items-center gap-2 border-b border-[#1a2336] pb-2">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'opportunities'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#121a2d]'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Bandeja de Oportunidades</span>
            <span className="rounded-full bg-[#18233a] px-2 py-0.5 text-[10px] text-slate-300 font-mono">
              {opportunities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('followups')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'followups'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#121a2d]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Próximos Seguimientos</span>
            {metrics?.followUpsTotal ? (
              <span className="rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 px-2 py-0.5 text-[10px] font-mono">
                {metrics.followUpsTotal}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pipeline'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#121a2d]'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Embudo Comercial & Conversión</span>
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0b101c] p-3 rounded-xl border border-[#1a2336]">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por negocio, ciudad, rubro, servicio..."
              className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Estado CRM */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
            >
              <option value="ALL">Todos los estados CRM</option>
              {CRM_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Filtro Ciudad */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
            >
              <option value="">Todas las ciudades</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filtro Seguimiento */}
            <select
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value)}
              className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-rose-500 focus:outline-none"
            >
              <option value="ALL">Todos los seguimientos</option>
              <option value="TODAY">📅 Contactar Hoy</option>
              <option value="OVERDUE">⚠️ Vencidos</option>
              <option value="UPCOMING">🟢 Próximos</option>
              <option value="NONE">Sin seguimiento programado</option>
            </select>

            {(search || statusFilter !== 'ALL' || cityFilter || followUpFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setCityFilter('');
                  setFollowUpFilter('ALL');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO PESTAÑA 1: BANDEJA DE OPORTUNIDADES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-rose-400" />
                <span>Cata está analizando las oportunidades del CRM...</span>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-12 text-center text-xs text-slate-400 space-y-2">
                <Target className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">No se encontraron oportunidades con los filtros seleccionados.</p>
                <p className="text-[11px] text-slate-500">Probá ajustando la búsqueda o quitando los filtros aplicados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#1a2336] bg-[#0b101c]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080d17] border-b border-[#182338] text-[11px] font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Negocio & Contacto</th>
                      <th className="py-3 px-4">Servicio Recomendado</th>
                      <th className="py-3 px-4">Inversión Sugerida</th>
                      <th className="py-3 px-4">Prioridad & Motivo</th>
                      <th className="py-3 px-4">Estado CRM</th>
                      <th className="py-3 px-4">Próxima Acción / Seguimiento</th>
                      <th className="py-3 px-4 text-right">Acciones Comerciales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141d2f]">
                    {opportunities.map((opp) => {
                      const stageDef = CRM_STAGES.find((s) => s.id === opp.commercialStage) || CRM_STAGES[0];
                      const hasVera = Boolean(opp.veraStrategy);

                      return (
                        <tr
                          key={opp.id}
                          className="hover:bg-[#101726]/80 transition-colors group"
                        >
                          {/* Negocio & Contacto */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white group-hover:text-rose-300 transition-colors">
                              <Link href={`/prospects/${opp.id}`} className="hover:underline">
                                {opp.business.name}
                              </Link>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              {opp.business.city && (
                                <a
                                  href={buildGoogleMapsUrl(opp.business)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors"
                                  title="Ver en Google Maps"
                                >
                                  <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                                  <span>{opp.business.city}</span>
                                </a>
                              )}
                              {opp.business.phone && (
                                <span className="inline-flex items-center gap-1 text-slate-400">
                                  <span>•</span>
                                  <span>{opp.business.phone}</span>
                                </span>
                              )}
                            </div>
                            {opp.business.website ? (
                              <a
                                href={opp.business.website.startsWith('http') ? opp.business.website : `https://${opp.business.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-cyan-400 hover:underline inline-flex items-center gap-1 mt-0.5 truncate max-w-[170px]"
                              >
                                <span>{opp.business.website.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                                ⚠ Sin sitio web oficial
                              </span>
                            )}
                          </td>

                          {/* Servicio Recomendado */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-[12px]">
                              {opp.recommendedService}
                            </div>
                            {opp.veraStrategy?.suggestedPricing?.bundleName && (
                              <div className="text-[10px] text-purple-300 mt-0.5">
                                Paquete: {opp.veraStrategy.suggestedPricing.bundleName}
                              </div>
                            )}
                            {opp.demo && (
                              <div className="mt-1">
                                {opp.demo.status === 'APROBADA' ? (
                                  <a
                                    href={`/demo/${opp.demo.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30 hover:bg-orange-500/25 transition-colors"
                                    title="Demo conceptual aprobada por Bruno"
                                  >
                                    <Sparkles className="h-2.5 w-2.5 text-orange-400" />
                                    <span>Demo Aprobada</span>
                                    <ExternalLink className="h-2 w-2" />
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                    Demo en revisión
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Inversión Sugerida */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-emerald-400 text-sm">
                              {formatCurrency(opp.suggestedPriceARS)}
                              <span className="text-[10px] font-sans font-normal text-slate-400 ml-1">desarrollo</span>
                            </div>
                            {opp.monthlyMaintenanceARS ? (
                              <div className="text-[11px] text-cyan-300 font-mono mt-0.5 font-medium">
                                + {formatCurrency(opp.monthlyMaintenanceARS)}/mes
                              </div>
                            ) : null}
                            {opp.firstYearTotalARS ? (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5" title="Desarrollo + 12 meses de abono de mantenimiento">
                                1.er año: <span className="text-slate-300 font-semibold">{formatCurrency(opp.firstYearTotalARS)}</span>
                              </div>
                            ) : null}
                          </td>

                          {/* Prioridad & Motivo */}
                          <td className="py-3.5 px-4 max-w-[240px]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                  opp.priority === 'ALTA'
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                    : opp.priority === 'MEDIA'
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {opp.priority} PRIORIDAD
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                              {opp.opportunityReason}
                            </p>
                          </td>

                          {/* Estado CRM */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${stageDef.badgeClass}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stageDef.color }} />
                              <span>{stageDef.label}</span>
                            </span>
                          </td>

                          {/* Próxima Acción / Seguimiento */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            {opp.followUp ? (
                              <div
                                className={`p-2 rounded-lg border text-[11px] space-y-0.5 ${
                                  opp.followUp.isOverdue
                                    ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
                                    : opp.followUp.isToday
                                    ? 'bg-amber-950/30 border-amber-900/50 text-amber-200'
                                    : 'bg-[#080d18] border-[#182338] text-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between font-mono text-[10px]">
                                  <span>{formatDate(opp.followUp.date)}</span>
                                  {opp.followUp.isOverdue ? (
                                    <span className="text-rose-400 font-bold">Vencido</span>
                                  ) : opp.followUp.isToday ? (
                                    <span className="text-amber-400 font-bold">Hoy</span>
                                  ) : null}
                                </div>
                                <div className="font-medium truncate text-white">
                                  {opp.followUp.nextAction}
                                </div>
                              </div>
                            ) : opp.cataSales?.lastOutcome ? (
                              <div className="text-[11px] text-slate-400">
                                <span className="block text-[10px] text-slate-500 uppercase font-mono">Último resultado</span>
                                <span className="font-medium text-slate-300">
                                  {OUTCOME_LABELS[opp.cataSales.lastOutcome]?.label || opp.cataSales.lastOutcome}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Sin contacto aún</span>
                            )}
                          </td>

                          {/* Acciones Comerciales */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Preparar Mensaje */}
                              <button
                                onClick={() => handleOpenMessageModal(opp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
                                title="Preparar mensaje personalizado para WhatsApp o Email"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>Mensaje</span>
                              </button>

                              {/* Registrar Actividad */}
                              <button
                                onClick={() => handleOpenActivityModal(opp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141e33] hover:bg-[#1a2845] text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
                                title="Registrar contacto, resultado o próximo seguimiento"
                              >
                                <PhoneCall className="h-3.5 w-3.5" />
                                <span>Registrar</span>
                              </button>

                              {/* Ver Diagnóstico Vera */}
                              {hasVera && (
                                <button
                                  onClick={() => setSelectedOppForVera(opp)}
                                  className="p-1.5 rounded-lg bg-[#0e1626] hover:bg-[#152037] text-purple-400 border border-purple-500/30 text-xs transition-colors"
                                  title="Ver diagnóstico completo de Vera"
                                >
                                  <Target className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Ver Ficha CRM */}
                              <Link
                                href={`/prospects/${opp.id}`}
                                className="p-1.5 rounded-lg bg-[#0e1626] hover:bg-[#152037] text-slate-400 hover:text-white border border-[#1b253b] text-xs transition-colors"
                                title="Abrir ficha en el CRM"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: PRÓXIMOS SEGUIMIENTOS */}
        {activeTab === 'followups' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Columna Vencidos */}
              <div className="rounded-xl border border-rose-900/40 bg-[#0c1220] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-900/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                      Vencidos ({opportunities.filter((o) => o.followUp?.isOverdue).length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-rose-400/80 font-mono">Acción Urgente</span>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {opportunities
                    .filter((o) => o.followUp?.isOverdue)
                    .map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/prospects/${opp.id}`}
                            className="font-bold text-white hover:text-rose-300 transition-colors"
                          >
                            {opp.business.name}
                          </Link>
                          <span className="text-[10px] font-mono text-rose-400 font-bold shrink-0">
                            {formatDate(opp.followUp?.date)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 bg-[#080d18] p-2 rounded border border-rose-900/30">
                          <strong>Próximo paso:</strong> {opp.followUp?.nextAction}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleOpenMessageModal(opp)}
                            className="flex-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition-colors inline-flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>Contactar</span>
                          </button>
                          <button
                            onClick={() => handleOpenActivityModal(opp)}
                            className="px-2.5 py-1 rounded bg-[#162137] hover:bg-[#1d2b48] text-slate-200 text-[11px] font-medium"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>
                    ))}

                  {opportunities.filter((o) => o.followUp?.isOverdue).length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      🎉 ¡Al día! No tenés seguimientos vencidos.
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Para Hoy */}
              <div className="rounded-xl border border-amber-900/40 bg-[#0c1220] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-900/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Para Hoy ({opportunities.filter((o) => o.followUp?.isToday).length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">Plan del Día</span>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {opportunities
                    .filter((o) => o.followUp?.isToday)
                    .map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3 rounded-lg border border-amber-900/40 bg-amber-950/20 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/prospects/${opp.id}`}
                            className="font-bold text-white hover:text-amber-300 transition-colors"
                          >
                            {opp.business.name}
                          </Link>
                          <span className="text-[10px] font-mono text-amber-300 font-bold shrink-0">
                            HOY
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 bg-[#080d18] p-2 rounded border border-amber-900/30">
                          <strong>Próximo paso:</strong> {opp.followUp?.nextAction}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleOpenMessageModal(opp)}
                            className="flex-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors inline-flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>Contactar</span>
                          </button>
                          <button
                            onClick={() => handleOpenActivityModal(opp)}
                            className="px-2.5 py-1 rounded bg-[#162137] hover:bg-[#1d2b48] text-slate-200 text-[11px] font-medium"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>
                    ))}

                  {opportunities.filter((o) => o.followUp?.isToday).length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No tenés seguimientos programados para el día de hoy.
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Próximos */}
              <div className="rounded-xl border border-emerald-900/40 bg-[#0c1220] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Próximos ({opportunities.filter((o) => (o.followUp?.daysDiff || 0) > 0).length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-mono">En Agenda</span>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {opportunities
                    .filter((o) => (o.followUp?.daysDiff || 0) > 0)
                    .map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3 rounded-lg border border-[#1a2336] bg-[#080d18] space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/prospects/${opp.id}`}
                            className="font-bold text-white hover:text-emerald-300 transition-colors"
                          >
                            {opp.business.name}
                          </Link>
                          <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                            En {opp.followUp?.daysDiff} días ({formatDate(opp.followUp?.date)})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 bg-[#0b101c] p-2 rounded border border-[#162035]">
                          <strong>Próximo paso:</strong> {opp.followUp?.nextAction}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleOpenMessageModal(opp)}
                            className="flex-1 px-2.5 py-1 rounded bg-[#162137] hover:bg-[#1d2b48] text-slate-200 text-[11px] font-medium"
                          >
                            Ver mensaje
                          </button>
                          <button
                            onClick={() => handleOpenActivityModal(opp)}
                            className="px-2.5 py-1 rounded bg-[#101726] hover:bg-[#18233a] text-slate-400 text-[11px]"
                          >
                            Reprogramar
                          </button>
                        </div>
                      </div>
                    ))}

                  {opportunities.filter((o) => (o.followUp?.daysDiff || 0) > 0).length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No hay seguimientos futuros en agenda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: EMBUDO & CONVERSIÓN */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" />
                <span>Embudo de Conversión Comercial WebPilot</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Visualización de las 8 etapas oficiales del CRM gestionadas por Cata. 
                Cada interacción que registres actualiza automáticamente las probabilidades de cierre.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
                {CRM_STAGES.map((stg) => {
                  const count = opportunities.filter((o) => o.commercialStage === stg.id).length;
                  return (
                    <div
                      key={stg.id}
                      className="rounded-lg border border-[#1a2336] bg-[#070b14] p-3 text-center space-y-1"
                    >
                      <span className="text-[10px] font-mono text-slate-400 uppercase block truncate">
                        {stg.label}
                      </span>
                      <div className="text-lg font-bold font-mono text-white">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: PREPARAR MENSAJES DE CATA */}
      {selectedOppForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-rose-500/40 bg-[#0c1220] p-6 shadow-2xl space-y-4">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#182338] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Preparar Mensaje Comercial — {selectedOppForMessage.business.name}
                  </h3>
                  <p className="text-[10px] text-rose-300">
                    Adaptado por Cata con diagnósticos reales de Tito y Vera
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOppForMessage(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Aviso de Control Humano */}
            <div className="p-3 rounded-xl bg-[#080d18] border border-[#1b273e] text-[11px] text-slate-300 space-y-1">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                🛡 Control Humano en el Envío:
              </span>
              <p className="text-slate-400 leading-relaxed">
                WebPilot prepara los argumentos y el texto óptimo, pero <strong>no envía mensajes de forma autónoma</strong>. 
                Revisá el contenido, personalizalo si lo deseás y copialo o abrilo directamente en WhatsApp Web o en tu cliente de correo.
              </p>
            </div>

            {/* Selector de Situación Comercial */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Seleccioná el enfoque o situación del contacto:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'SIN_WEB', label: 'Sin sitio web (Desde cero)' },
                  { id: 'FALLAS_TITO', label: 'Problemas técnicos de Tito' },
                  { id: 'REDISENO', label: 'Propuesta de rediseño' },
                  { id: 'EXPLORATORIO', label: 'Consulta inicial breve' },
                  { id: 'SEGUIMIENTO', label: 'Seguimiento de propuesta' },
                ].map((sit) => (
                  <button
                    key={sit.id}
                    type="button"
                    onClick={() => handleSituationChange(sit.id as MessageSituation)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedSituation === sit.id
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-200 font-semibold shadow-sm'
                        : 'bg-[#080d18] border-[#182338] text-slate-400 hover:text-white hover:bg-[#121a2d]'
                    }`}
                  >
                    <div className="text-[11px]">{sit.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pestañas de Canal: WhatsApp vs Email */}
            <div className="flex items-center gap-2 border-b border-[#182338] pt-2">
              <button
                type="button"
                onClick={() => setMessageChannelTab('whatsapp')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
                  messageChannelTab === 'whatsapp'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setMessageChannelTab('email')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
                  messageChannelTab === 'email'
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Correo Electrónico</span>
              </button>
            </div>

            {/* Contenido Canal: WhatsApp */}
            {messageChannelTab === 'whatsapp' && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">
                      Mensaje de WhatsApp (Editable)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopyText(customWhatsAppText, 'whatsapp')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200"
                    >
                      {copiedField === 'whatsapp' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === 'whatsapp' ? '¡Copiado!' : 'Copiar Mensaje'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={customWhatsAppText}
                    onChange={(e) => setCustomWhatsAppText(e.target.value)}
                    className="w-full rounded-xl border border-[#1b263c] bg-[#070b14] p-3 text-white text-xs font-sans leading-relaxed focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    Destino:{' '}
                    <strong className="text-white">
                      {selectedOppForMessage.business.phone || 'Sin teléfono guardado'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${(selectedOppForMessage.business.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        customWhatsAppText
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Abrir en WhatsApp Web</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido Canal: Email */}
            {messageChannelTab === 'email' && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">Asunto del Correo</label>
                    <button
                      type="button"
                      onClick={() => handleCopyText(customEmailSubject, 'subject')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200"
                    >
                      {copiedField === 'subject' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Copiar Asunto</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customEmailSubject}
                    onChange={(e) => setCustomEmailSubject(e.target.value)}
                    className="w-full rounded-lg border border-[#1b263c] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">Cuerpo del Correo (Editable)</label>
                    <button
                      type="button"
                      onClick={() => handleCopyText(customEmailBody, 'body')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-rose-200"
                    >
                      {copiedField === 'body' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Copiar Cuerpo</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={customEmailBody}
                    onChange={(e) => setCustomEmailBody(e.target.value)}
                    className="w-full rounded-xl border border-[#1b263c] bg-[#070b14] p-3 text-white text-xs font-sans leading-relaxed focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    Destino:{' '}
                    <strong className="text-white">
                      {selectedOppForMessage.business.email || 'Sin email registrado'}
                    </strong>
                  </div>

                  <a
                    href={`mailto:${selectedOppForMessage.business.email || ''}?subject=${encodeURIComponent(
                      customEmailSubject
                    )}&body=${encodeURIComponent(customEmailBody)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Abrir en Cliente de Correo</span>
                  </a>
                </div>
              </div>
            )}

            {/* Footer con paso siguiente */}
            <div className="flex items-center justify-between pt-3 border-t border-[#182338]">
              <button
                type="button"
                onClick={() => setSelectedOppForMessage(null)}
                className="px-4 py-2 rounded-lg bg-[#141d2f] text-slate-300 hover:text-white text-xs font-medium"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  const opp = selectedOppForMessage;
                  setSelectedOppForMessage(null);
                  handleOpenActivityModal(opp);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold hover:scale-[1.02] transition-transform"
              >
                <span>¿Ya lo contactaste? Registrar Actividad</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR ACTIVIDAD COMERCIAL */}
      {selectedOppForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-cyan-500/40 bg-[#0c1220] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#182338] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Registrar Actividad Comercial — {selectedOppForActivity.business.name}
                  </h3>
                  <p className="text-[10px] text-cyan-300">
                    Quedará asentada en el CRM y en el historial de actividades
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOppForActivity(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Canal y Resultado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Canal Utilizado</label>
                  <select
                    value={activityForm.channel}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, channel: e.target.value as OutreachChannel })
                    }
                    className="w-full rounded-lg border border-[#1b263c] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="LLAMADA">Llamada telefónica</option>
                    <option value="EMAIL">Correo electrónico</option>
                    <option value="REUNION">Reunión presencial / Virtual</option>
                    <option value="REDES">Instagram / Redes sociales</option>
                    <option value="OTRO">Otro canal</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Resultado del Contacto</label>
                  <select
                    value={activityForm.outcome}
                    onChange={(e) => handleOutcomeChange(e.target.value as ContactOutcome)}
                    className="w-full rounded-lg border border-[#1b263c] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="SIN_RESPUESTA">Sin respuesta (Pendiente)</option>
                    <option value="INTERESADO">Interesado</option>
                    <option value="SOLICITA_INFO">Solicita más información</option>
                    <option value="SOLICITA_PRESUPUESTO">Solicita presupuesto formal</option>
                    <option value="NEGOCIACION">En negociación activa</option>
                    <option value="NO_INTERESADO">No interesado en este momento</option>
                    <option value="GANADO">🏆 Cliente ganado (Cierre)</option>
                    <option value="PERDIDO">❌ Cliente perdido / Descartado</option>
                  </select>
                </div>
              </div>

              {/* Sugerencia de Estado en CRM */}
              <div className="p-3 rounded-lg bg-[#070b14] border border-[#1b263c] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    Actualización automática del estado en CRM
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Cambiará de <strong>{selectedOppForActivity.commercialStage}</strong> a{' '}
                    <strong className="text-cyan-300">{activityForm.newStage}</strong>
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={activityForm.autoApplyStage}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, autoApplyStage: e.target.checked })
                    }
                    className="rounded border-[#1b263c] bg-[#070b14] text-cyan-500"
                  />
                  <span>Aplicar cambio</span>
                </label>
              </div>

              {/* Resumen o notas de la conversación */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Resumen o Notas de la Conversación <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={activityForm.summary}
                  onChange={(e) => setActivityForm({ ...activityForm, summary: e.target.value })}
                  placeholder="Ej: Se le envió mensaje por WhatsApp con propuesta de sitio web inicial. Respondió la secretaria indicando que el Dr. lo revisará el jueves..."
                  className="w-full rounded-xl border border-[#1b263c] bg-[#070b14] p-3 text-white text-xs leading-relaxed focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Próximo seguimiento */}
              <div className="border-t border-[#182338] pt-3 space-y-2">
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Programar Próximo Seguimiento (Opcional)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Fecha del Seguimiento</label>
                    <input
                      type="date"
                      value={activityForm.followUpDate}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, followUpDate: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#1b263c] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Próxima Acción Sugerida</label>
                    <input
                      type="text"
                      value={activityForm.nextAction}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, nextAction: e.target.value })
                      }
                      placeholder="Ej: Enviar demo interactiva / Llamar al Dr."
                      className="w-full rounded-lg border border-[#1b263c] bg-[#070b14] px-3 py-2 text-white text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accesos rápidos de fecha */}
                <div className="flex items-center gap-2 pt-1 text-[10px]">
                  <span className="text-slate-500">Atajos:</span>
                  {[
                    { label: 'En 3 días', days: 3 },
                    { label: 'En 1 semana', days: 7 },
                    { label: 'En 15 días', days: 15 },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => {
                        const target = new Date();
                        target.setDate(target.getDate() + preset.days);
                        setActivityForm((prev) => ({
                          ...prev,
                          followUpDate: target.toISOString().split('T')[0],
                        }));
                      }}
                      className="px-2 py-0.5 rounded bg-[#131c2e] hover:bg-[#1a2740] text-slate-300 border border-[#1d2943]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#182338]">
              <button
                type="button"
                onClick={() => setSelectedOppForActivity(null)}
                className="px-4 py-2 rounded-lg bg-[#141d2f] text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveActivity}
                disabled={isSavingActivity || !activityForm.summary.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition-all"
              >
                {isSavingActivity ? 'Guardando en CRM...' : 'Guardar Actividad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIAGNÓSTICO VERA */}
      {selectedOppForVera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-[#0c1220] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#182338] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Diagnóstico Comercial de Vera — {selectedOppForVera.business.name}
                  </h3>
                  <p className="text-[10px] text-purple-300">
                    Servicios recomendados, precios y argumentos comerciales
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOppForVera(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {selectedOppForVera.veraStrategy ? (
              <div className="space-y-4 text-xs">
                {/* Resumen */}
                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                      Paquete Sugerido: {selectedOppForVera.veraStrategy.suggestedPricing?.bundleName}
                    </span>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-emerald-400">
                        {formatCurrency(selectedOppForVera.suggestedPriceARS)}
                        <span className="text-[10px] font-sans font-normal text-slate-400 ml-1">desarrollo</span>
                      </div>
                      {selectedOppForVera.monthlyMaintenanceARS ? (
                        <div className="text-xs font-mono text-cyan-300 font-semibold">
                          + {formatCurrency(selectedOppForVera.monthlyMaintenanceARS)}/mes (mantenimiento)
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedOppForVera.veraStrategy.summary}
                  </p>
                  {selectedOppForVera.firstYearTotalARS ? (
                    <div className="text-[10px] text-slate-400 bg-[#080d18] p-2 rounded border border-purple-900/40 font-mono">
                      💰 <strong>Inversión total estimada del primer año:</strong>{' '}
                      <span className="text-white font-bold">{formatCurrency(selectedOppForVera.firstYearTotalARS)}</span>{' '}
                      (Desarrollo inicial + 12 meses de abono de mantenimiento integral).
                    </div>
                  ) : null}
                </div>

                {/* Servicios recomendados */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white block">
                    Servicios incluidos en la propuesta:
                  </span>
                  <div className="space-y-1.5">
                    {selectedOppForVera.veraStrategy.recommendedServices?.map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#080d18] border border-[#182338] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <strong className="text-cyan-300 block">{srv.serviceName}</strong>
                          <span className="text-[10px] text-slate-400">{srv.reason}</span>
                        </div>
                        <span className="font-mono font-bold text-white shrink-0">
                          {formatCurrency(srv.suggestedPriceARS)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Argumentos de venta */}
                {selectedOppForVera.veraStrategy.commercialArguments && (
                  <div className="p-3.5 rounded-xl bg-[#080d18] border border-[#182338] space-y-2">
                    <span className="text-xs font-semibold text-purple-300 block">
                      Argumentos comerciales clave:
                    </span>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div>
                        <strong className="text-white">Dolor del negocio:</strong>{' '}
                        {selectedOppForVera.veraStrategy.commercialArguments.painPoint}
                      </div>
                      <div>
                        <strong className="text-white">Costo de no actuar:</strong>{' '}
                        {selectedOppForVera.veraStrategy.commercialArguments.costOfInaction}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Este negocio aún no tiene estrategia formulada por Vera.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOppForVera(null)}
                className="px-4 py-2 rounded-lg bg-[#141d2f] text-white hover:bg-[#1b273f] text-xs font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
