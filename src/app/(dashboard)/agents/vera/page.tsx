'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Target,
  Sparkles,
  SearchCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  Send,
  MessageCircle,
  Mail,
  ExternalLink,
  RefreshCw,
  Sliders,
  Save,
  RotateCcw,
  Building,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Phone,
  MapPin,
  X,
  FileText,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { createClient } from '@/lib/supabase/client';
import {
  VeraBusinessSummary,
  VeraCommercialStrategy,
  VeraOpportunity,
  VeraRecommendedService,
} from '@/services/vera.service';
import { DEFAULT_SERVICES_CATALOG, ServiceItem } from '@/lib/constants/services';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function VeraAgentPage() {
  const [businesses, setBusinesses] = useState<VeraBusinessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'catalog'>('opportunities');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'analyzed' | 'with_web' | 'without_web' | 'tito_done'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal de detalle de estrategia
  const [selectedStrategy, setSelectedStrategy] = useState<VeraCommercialStrategy | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isLoadingStrategyDetail, setIsLoadingStrategyDetail] = useState(false);

  // Copiado al portapapeles
  const [copiedType, setCopiedType] = useState<'whatsapp' | 'email_subject' | 'email_body' | null>(null);

  // Catálogo editable de servicios
  const [servicesCatalog, setServicesCatalog] = useState<ServiceItem[]>(DEFAULT_SERVICES_CATALOG);
  const [catalogSavedMessage, setCatalogSavedMessage] = useState(false);

  useEffect(() => {
    // Cargar catálogo de localStorage si existe
    try {
      const saved = localStorage.getItem('webpilot_services_catalog');
      if (saved) {
        setServicesCatalog(JSON.parse(saved));
      }
    } catch {
      // Usar defaults
    }
    fetchBusinesses();
  }, []);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers = new Headers(options.headers || {});
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/vera/businesses');
      if (res.ok) {
        const json = await res.json();
        setBusinesses(json.data || []);
      }
    } catch (e) {
      console.error('Error fetching businesses for Vera:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar catálogo personalizado
  const handleSaveCatalog = () => {
    try {
      localStorage.setItem('webpilot_services_catalog', JSON.stringify(servicesCatalog));
      setCatalogSavedMessage(true);
      setTimeout(() => setCatalogSavedMessage(false), 3000);
    } catch (e) {
      console.error('Error guardando catálogo:', e);
    }
  };

  // Restablecer catálogo por defecto
  const handleResetCatalog = () => {
    setServicesCatalog(DEFAULT_SERVICES_CATALOG);
    localStorage.removeItem('webpilot_services_catalog');
    setCatalogSavedMessage(true);
    setTimeout(() => setCatalogSavedMessage(false), 3000);
  };

  const handleUpdateServicePrice = (id: string, ars: number, usd: number) => {
    setServicesCatalog((prev) =>
      prev.map((s) => (s.id === id ? { ...s, suggestedPriceARS: ars, suggestedPriceUSD: usd } : s))
    );
  };

  // Filtros de tabla
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((item) => {
      if (filterType === 'pending') return !item.veraStrategy.hasStrategy;
      if (filterType === 'analyzed') return item.veraStrategy.hasStrategy;
      if (filterType === 'with_web') return item.hasWebsite;
      if (filterType === 'without_web') return !item.hasWebsite;
      if (filterType === 'tito_done') return item.titoAudit.status === 'COMPLETADO';
      return true;
    });
  }, [businesses, filterType]);

  // Selección
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBusinesses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBusinesses.map((b) => b.business.id));
    }
  };

  // Atajo primera prueba: Seleccionar los 19 negocios
  const handleSelectAll19 = () => {
    setSelectedIds(businesses.map((b) => b.business.id));
  };

  // Atajo primera prueba: Seleccionar los 3 consultorios auditados por Tito
  const handleSelectTitoAudited = () => {
    const titoIds = businesses
      .filter((b) => b.titoAudit.status === 'COMPLETADO')
      .map((b) => b.business.id);
    setSelectedIds(titoIds);
  };

  // Ejecutar análisis comercial con Vera
  const handleRunAnalysis = async () => {
    if (selectedIds.length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    setFeedbackMessage(null);
    setAnalyzingStatus(`Vera está construyendo la estrategia para ${selectedIds.length} negocios...`);

    try {
      const res = await fetchWithAuth('/api/vera/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessIds: selectedIds,
          customCatalog: servicesCatalog,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedbackMessage({
          type: 'success',
          text: `¡Estrategia comercial generada exitosamente para ${data.analyzedCount} negocio(s)!`,
        });
        setSelectedIds([]);
        await fetchBusinesses();
      } else {
        setFeedbackMessage({
          type: 'error',
          text: data.error || 'Ocurrió un error al ejecutar el análisis con Vera.',
        });
      }
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: e?.message || 'Error de conexión al ejecutar análisis con Vera.',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStatus(null);
    }
  };

  // Abrir detalle de estrategia de un negocio
  const handleOpenStrategy = async (businessId: string) => {
    setIsLoadingStrategyDetail(true);
    setIsStrategyModalOpen(true);
    setSelectedStrategy(null);

    try {
      const res = await fetchWithAuth(`/api/vera/strategy/${businessId}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedStrategy(json.strategy);
      } else {
        // Si no la tiene guardada, la ejecutamos en el momento
        const singleRun = await fetchWithAuth('/api/vera/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessIds: [businessId],
            customCatalog: servicesCatalog,
          }),
        });
        if (singleRun.ok) {
          const runJson = await singleRun.json();
          setSelectedStrategy(runJson.strategies?.[0] || null);
          fetchBusinesses();
        }
      }
    } catch (e) {
      console.error('Error cargando estrategia:', e);
    } finally {
      setIsLoadingStrategyDetail(false);
    }
  };

  const copyToClipboard = (text: string, type: 'whatsapp' | 'email_subject' | 'email_body') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Contadores para métricas
  const totalCount = businesses.length;
  const analyzedCount = businesses.filter((b) => b.veraStrategy.hasStrategy).length;
  const pendingCount = totalCount - analyzedCount;
  const titoDoneCount = businesses.filter((b) => b.titoAudit.status === 'COMPLETADO').length;

  return (
    <div>
      <Topbar
        title="Vera — Estratega Comercial"
        subtitle="Conversión de datos y auditorías en propuestas comerciales, presupuestos y argumentos de venta"
        onRefresh={fetchBusinesses}
        isRefreshing={isLoading}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Hero Card de Vera */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0c1220] p-6 shadow-xl shadow-purple-950/10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-[#090e1a] border-2 border-purple-500 shadow-lg shadow-purple-500/20">
                <Image
                  src="/avatars/vera.png"
                  alt="Vera"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white">Vera</h1>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold border border-purple-500/50 bg-purple-500/15 text-purple-300">
                    Estratega Comercial
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Operativa
                  </span>
                </div>

                <p className="mt-1 text-sm text-purple-200/90 italic font-serif">
                  «El problema no es la web, es lo que está dejando de vender.»
                </p>

                <p className="mt-2 text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Vera analiza la situación comercial de cada negocio, identifica necesidades reales de desarrollo o rediseño, cotiza servicios según nuestro catálogo y redacta el mensaje de contacto inicial para WhatsApp y correo.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080d18] p-3.5 rounded-xl border border-[#172238] shrink-0 text-center">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Negocios</span>
                <span className="text-lg font-bold text-white font-mono">{totalCount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Con Estrategia</span>
                <span className="text-lg font-bold text-emerald-300 font-mono">{analyzedCount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-cyan-400 block">Auditoría Tito</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">{titoDoneCount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-amber-400 block">Pendientes</span>
                <span className="text-lg font-bold text-amber-300 font-mono">{pendingCount}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 pt-4 border-t border-[#172238] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'opportunities'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2a42]'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Oportunidades Comerciales ({totalCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2a42]'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Catálogo de Servicios WebPilot ({servicesCatalog.length})</span>
              </button>
            </div>

            {activeTab === 'opportunities' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll19}
                  className="text-xs text-purple-300 hover:text-purple-200 underline font-medium px-2 py-1"
                >
                  Seleccionar los 19 negocios
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={handleSelectTitoAudited}
                  className="text-xs text-cyan-300 hover:text-cyan-200 underline font-medium px-2 py-1"
                >
                  Seleccionar auditados por Tito ({titoDoneCount})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/30 border-red-500/40 text-red-300'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-white ml-3 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* PESTAÑA 1: OPORTUNIDADES COMERCIALES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            {/* Action Bar & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0c1220] p-4 rounded-xl border border-[#172238]">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#11192b] text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({totalCount})
                </button>
                <button
                  onClick={() => setFilterType('pending')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#11192b] text-slate-400 hover:text-white'
                  }`}
                >
                  Pendientes ({pendingCount})
                </button>
                <button
                  onClick={() => setFilterType('analyzed')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'analyzed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#11192b] text-slate-400 hover:text-white'
                  }`}
                >
                  Con Estrategia ({analyzedCount})
                </button>
                <button
                  onClick={() => setFilterType('with_web')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'with_web'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-[#11192b] text-slate-400 hover:text-white'
                  }`}
                >
                  Con Web ({businesses.filter((b) => b.hasWebsite).length})
                </button>
                <button
                  onClick={() => setFilterType('without_web')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'without_web'
                      ? 'bg-purple-700 text-white'
                      : 'bg-[#11192b] text-slate-400 hover:text-white'
                  }`}
                >
                  Sin Web ({businesses.filter((b) => !b.hasWebsite).length})
                </button>
                <button
                  onClick={() => setFilterType('tito_done')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterType === 'tito_done'
                      ? 'bg-teal-600 text-white'
                      : 'bg-[#11192b] text-slate-400 hover:text-white'
                  }`}
                >
                  Auditados Tito ({titoDoneCount})
                </button>
              </div>

              {/* Run Analysis Action Button */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {selectedIds.length} seleccionado(s)
                </span>

                <button
                  onClick={handleRunAnalysis}
                  disabled={selectedIds.length === 0 || isAnalyzing}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg transition-all ${
                    selectedIds.length === 0 || isAnalyzing
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20 hover:scale-[1.01]'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>{analyzingStatus || 'Analizando con Vera...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ejecutar Análisis Comercial ({selectedIds.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Table */}
            <div className="rounded-xl border border-[#172238] bg-[#0c1220] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080d18] text-slate-400 font-semibold border-b border-[#172238]">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredBusinesses.length > 0 &&
                            selectedIds.length === filteredBusinesses.length
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-[#1e2a42] bg-[#090e1a] text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th className="py-3 px-4">Negocio / Rubro</th>
                      <th className="py-3 px-4">Localidad</th>
                      <th className="py-3 px-4">Presencia Digital</th>
                      <th className="py-3 px-4">Auditoría Tito</th>
                      <th className="py-3 px-4">Diagnóstico Vera</th>
                      <th className="py-3 px-4">Inversión Sugerida</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172238]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-purple-400" />
                          <span>Cargando prospectos para Vera...</span>
                        </td>
                      </tr>
                    ) : filteredBusinesses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No se encontraron negocios para el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      filteredBusinesses.map((item) => {
                        const isSelected = selectedIds.includes(item.business.id);
                        const hasVera = item.veraStrategy.hasStrategy;

                        return (
                          <tr
                            key={item.business.id}
                            className={`hover:bg-[#11192b]/60 transition-colors ${
                              isSelected ? 'bg-purple-950/20' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(item.business.id)}
                                className="rounded border-[#1e2a42] bg-[#090e1a] text-purple-600 focus:ring-purple-500"
                              />
                            </td>

                            {/* Negocio */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">
                                <Link
                                  href={`/prospects/${item.business.id}`}
                                  className="hover:text-purple-300 hover:underline"
                                >
                                  {item.business.name}
                                </Link>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.business.industry || 'Rubro sin especificar'}
                              </div>
                            </td>

                            {/* Localidad */}
                            <td className="py-3 px-4 text-slate-300">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                <span>{item.business.city || '-'}</span>
                              </div>
                              {item.business.state_province && (
                                <span className="text-[10px] text-slate-500 block pl-4">
                                  {item.business.state_province}
                                </span>
                              )}
                            </td>

                            {/* Presencia Digital */}
                            <td className="py-3 px-4">
                              {item.hasWebsite ? (
                                <div className="space-y-0.5">
                                  <a
                                    href={
                                      item.business.website!.startsWith('http')
                                        ? item.business.website!
                                        : `https://${item.business.website!}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                                  >
                                    <Globe className="h-3 w-3 shrink-0" />
                                    <span className="truncate max-w-[120px]">
                                      {item.business.website!.replace(/^https?:\/\//, '')}
                                    </span>
                                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                  </a>
                                  <span className="block text-[10px] text-slate-400">
                                    Con sitio web
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded-md font-medium">
                                  <span>Sin web (Desarrollo)</span>
                                </span>
                              )}
                            </td>

                            {/* Auditoría Tito */}
                            <td className="py-3 px-4">
                              {item.titoAudit.status === 'COMPLETADO' ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px]">
                                    {item.titoAudit.score}/100
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {item.titoAudit.issuesCount} problemas
                                  </span>
                                </div>
                              ) : item.titoAudit.status === 'NO_APLICA' ? (
                                <span className="text-slate-500 text-[11px]">No aplica (sin web)</span>
                              ) : (
                                <span className="text-amber-400 text-[11px] bg-amber-950/30 border border-amber-800/30 px-2 py-0.5 rounded">
                                  Pendiente Tito
                                </span>
                              )}
                            </td>

                            {/* Diagnóstico Vera */}
                            <td className="py-3 px-4 max-w-xs">
                              {hasVera ? (
                                <div>
                                  <span className="text-white font-medium block truncate" title={item.veraStrategy.primaryNeed || ''}>
                                    {item.veraStrategy.primaryNeed}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span
                                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${
                                        item.veraStrategy.urgency === 'ALTA'
                                          ? 'border-red-500/40 bg-red-950/30 text-red-300'
                                          : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                                      }`}
                                    >
                                      {item.veraStrategy.urgency} urgencia
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {item.veraStrategy.servicesCount} servicio(s)
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic text-[11px]">
                                  Pendiente de estrategia comercial
                                </span>
                              )}
                            </td>

                            {/* Inversión Sugerida */}
                            <td className="py-3 px-4">
                              {hasVera && item.veraStrategy.suggestedBundleARS ? (
                                <div className="font-mono font-bold text-emerald-400">
                                  {formatCurrency(item.veraStrategy.suggestedBundleARS)}
                                </div>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>

                            {/* Acción */}
                            <td className="py-3 px-4 text-right">
                              {hasVera ? (
                                <button
                                  onClick={() => handleOpenStrategy(item.business.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 hover:text-white text-xs font-medium transition-colors"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>Ver Estrategia</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenStrategy(item.business.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#121c2e] text-slate-300 hover:border-purple-500 hover:text-purple-300 text-xs font-medium transition-colors"
                                >
                                  <Target className="h-3 w-3" />
                                  <span>Analizar</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CATÁLOGO DE SERVICIOS */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c1220] p-4 rounded-xl border border-[#172238]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-400" />
                  <span>Catálogo de Servicios y Precios de WebPilot</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Precios base y plazos orientativos utilizados por Vera para formular propuestas y cotizaciones automáticas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCatalog}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-[#121c2e] text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restablecer Originales</span>
                </button>

                <button
                  onClick={handleSaveCatalog}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Guardar Precios</span>
                </button>
              </div>
            </div>

            {catalogSavedMessage && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Precios guardados. Vera utilizará estos valores en todos los análisis comerciales futuros.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicesCatalog.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border border-purple-500/30 bg-purple-500/10 text-purple-300">
                        {service.category}
                      </span>
                      {service.isMonthly && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                          Recurrente Mensual
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5">{service.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{service.description}</p>

                    <div className="text-[11px] text-slate-300 bg-[#080d18] p-2.5 rounded-lg border border-[#172238] mb-4">
                      <strong className="text-slate-400 block mb-0.5">Condiciones:</strong>
                      {service.conditions}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#172238] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Precio ARS ($):</label>
                        <input
                          type="number"
                          value={service.suggestedPriceARS}
                          onChange={(e) =>
                            handleUpdateServicePrice(
                              service.id,
                              parseInt(e.target.value, 10) || 0,
                              service.suggestedPriceUSD
                            )
                          }
                          className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Precio USD ($):</label>
                        <input
                          type="number"
                          value={service.suggestedPriceUSD}
                          onChange={(e) =>
                            handleUpdateServicePrice(
                              service.id,
                              service.suggestedPriceARS,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full bg-[#080d18] border border-[#1e2a42] rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-400 font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Plazo de entrega:</span>
                      <span className="text-slate-300 font-medium">{service.deliveryDays}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLADO DE ESTRATEGIA COMERCIAL DE VERA */}
      {isStrategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-[#0a0f1d] p-6 shadow-2xl text-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#172238] pb-4 mb-6 sticky top-0 bg-[#0a0f1d] z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Estrategia Comercial de Vera</span>
                    <span className="text-xs font-mono text-purple-400 font-normal">
                      • {selectedStrategy?.businessName || 'Cargando...'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Diagnóstico, justificación de venta, propuesta económica y mensaje de contacto
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsStrategyModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#152037] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingStrategyDetail ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-400" />
                <p className="text-sm text-slate-300 font-medium">Vera está analizando este negocio...</p>
                <p className="text-xs text-slate-500">Evaluando presencia digital, problemas de Tito y presupuesto sugerido.</p>
              </div>
            ) : selectedStrategy ? (
              <div className="space-y-6">
                {/* 1. Resumen Ejecutivo y Presencia Digital */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                      Situación Digital Actual
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Analizado: {formatDate(selectedStrategy.analyzedAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    {selectedStrategy.summary}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3">
                    <div className="bg-[#080d18] p-2.5 rounded-lg border border-[#172238]">
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Sitio Web</span>
                      <span className="font-medium text-slate-200">
                        {selectedStrategy.digitalPresence.hasWebsite ? 'Activo' : 'Sin sitio web'}
                      </span>
                    </div>
                    <div className="bg-[#080d18] p-2.5 rounded-lg border border-[#172238]">
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">WhatsApp</span>
                      <span className="font-medium text-slate-200">
                        {selectedStrategy.digitalPresence.hasWhatsApp ? 'Detectado' : 'No detectado'}
                      </span>
                    </div>
                    <div className="bg-[#080d18] p-2.5 rounded-lg border border-[#172238]">
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Auditoría Tito</span>
                      <span className="font-medium text-slate-200">
                        {selectedStrategy.digitalPresence.titoAuditCompleted
                          ? `${selectedStrategy.digitalPresence.titoScore}/100 Score`
                          : 'Pendiente'}
                      </span>
                    </div>
                    <div className="bg-[#080d18] p-2.5 rounded-lg border border-[#172238]">
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Nivel General</span>
                      <span className="font-medium text-purple-300">
                        {selectedStrategy.digitalPresence.tier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Oportunidades Comerciales Detectadas (con Evidencia Real) */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span>Oportunidades Comerciales Detectadas ({selectedStrategy.opportunities.length})</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedStrategy.opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-3.5 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{opp.title}</span>
                          </h5>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase shrink-0 ${
                              opp.severity === 'CRITICO'
                                ? 'border-red-500/40 bg-red-950/30 text-red-300'
                                : opp.severity === 'ALTO'
                                ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                                : 'border-blue-500/40 bg-blue-950/30 text-blue-300'
                            }`}
                          >
                            {opp.severity}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300">
                          <strong className="text-slate-400">Hecho comprobado:</strong> {opp.factProven}
                        </p>
                        <p className="text-[11px] text-purple-300/90 bg-purple-950/20 p-2 rounded border border-purple-900/30">
                          <strong className="text-purple-200">Impacto comercial:</strong> {opp.commercialImpact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Servicios WebPilot Recomendados y Presupuesto */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span>Servicios Recomendados y Propuesta Económica</span>
                  </h4>

                  <div className="rounded-xl border border-emerald-500/30 bg-[#0c1424] p-4 space-y-3">
                    <div className="space-y-2">
                      {selectedStrategy.recommendedServices.map((svc, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#080d18] border border-[#172238] text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{svc.serviceName}</span>
                              {svc.isMonthly && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  Mensual
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{svc.justification}</p>
                          </div>

                          <div className="font-mono text-emerald-400 font-bold shrink-0 text-right">
                            {formatCurrency(svc.suggestedPriceARS)}
                            <span className="text-[10px] text-slate-500 block">
                              (US$ {svc.suggestedPriceUSD})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Caja de Paquete / Bundle Bonificado */}
                    <div className="pt-3 border-t border-[#1a2942] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {selectedStrategy.suggestedPricing.bundleName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {selectedStrategy.suggestedPricing.bundleDiscountPercentage > 0
                            ? `Incluye ${selectedStrategy.suggestedPricing.bundleDiscountPercentage}% de bonificación por paquete integral`
                            : 'Cotización según catálogo oficial'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 line-through mr-2 font-mono">
                          {formatCurrency(selectedStrategy.suggestedPricing.individualServicesTotalARS)}
                        </span>
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          {formatCurrency(selectedStrategy.suggestedPricing.bundleFinalARS)}
                        </span>
                        <span className="text-xs text-cyan-400 block font-mono">
                          US$ {selectedStrategy.suggestedPricing.bundleFinalUSD}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Argumentos Comerciales de Venta */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-cyan-400" />
                    <span>Argumentos de Venta para el Contacto</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0c1220] rounded-xl border border-[#172238]">
                      <strong className="text-amber-400 block mb-1">1. El Problema Real (Pain Point):</strong>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedStrategy.commercialArguments.painPoint}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0c1220] rounded-xl border border-[#172238]">
                      <strong className="text-red-400 block mb-1">2. El Costo de la Inacción:</strong>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedStrategy.commercialArguments.costOfInaction}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0c1220] rounded-xl border border-[#172238]">
                      <strong className="text-cyan-400 block mb-1">3. La Solución de WebPilot:</strong>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedStrategy.commercialArguments.ourSolution}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0c1220] rounded-xl border border-[#172238]">
                      <strong className="text-emerald-400 block mb-1">4. Por Qué Resolverlo Ahora:</strong>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedStrategy.commercialArguments.whyNow}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Mensajes Iniciales de Contacto (WhatsApp y Email) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                    <span>Mensajes de Contacto Inicial Personalizados</span>
                  </h4>

                  {/* WhatsApp */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#081816] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Mensaje para WhatsApp (Tono argentino profesional y cercano)</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(selectedStrategy.outreachPitch.whatsappMessage, 'whatsapp')}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded hover:bg-emerald-900/60 transition-colors"
                        >
                          {copiedType === 'whatsapp' ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar WhatsApp</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(selectedStrategy.outreachPitch.whatsappMessage)}`}
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
                      {selectedStrategy.outreachPitch.whatsappMessage}
                    </pre>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-[#0a1424] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Correo Electrónico Comercial</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(selectedStrategy.outreachPitch.emailSubject, 'email_subject')}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 bg-blue-950/60 border border-blue-700/50 px-2.5 py-1 rounded hover:bg-blue-900/60 transition-colors"
                        >
                          {copiedType === 'email_subject' ? (
                            <>
                              <Check className="h-3 w-3 text-blue-400" />
                              <span>¡Asunto copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar Asunto</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyToClipboard(selectedStrategy.outreachPitch.emailBody, 'email_body')}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-blue-600 px-2.5 py-1 rounded hover:bg-blue-500 transition-colors"
                        >
                          {copiedType === 'email_body' ? (
                            <>
                              <Check className="h-3 w-3 text-blue-400" />
                              <span>¡Cuerpo copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar Cuerpo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#050b14] p-3 rounded-lg border border-blue-900/40 space-y-2">
                      <div className="text-xs text-blue-200">
                        <strong className="text-slate-400">Asunto:</strong> {selectedStrategy.outreachPitch.emailSubject}
                      </div>
                      <hr className="border-blue-950" />
                      <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                        {selectedStrategy.outreachPitch.emailBody}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Alertas de datos faltantes */}
                {selectedStrategy.missingDataAlerts.length > 0 && (
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Información complementaria a completar antes de contactar:</span>
                    </span>
                    <ul className="list-disc pl-5 space-y-0.5 text-slate-300 text-[11px]">
                      {selectedStrategy.missingDataAlerts.map((alert, i) => (
                        <li key={i}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-[#172238] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>Estrategia generada por Vera AI • Requiere confirmación humana antes de enviar</span>
              </span>

              <button
                onClick={() => setIsStrategyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#152037] text-white hover:bg-[#1e2e4f] transition-colors"
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
