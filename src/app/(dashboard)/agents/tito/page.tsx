'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Wrench,
  SearchCode,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Building2,
  MapPin,
  ShieldAlert,
  Sparkles,
  Phone,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { Business, Audit, AuditIssue } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface BusinessWithAudit extends Business {
  latestAudit?: Audit | null;
}

export default function TitoAgentPage() {
  const [activeTab, setActiveTab] = useState<'withWeb' | 'withoutWeb'>('withWeb');
  const [withWebList, setWithWebList] = useState<BusinessWithAudit[]>([]);
  const [withoutWebList, setWithoutWebList] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selección
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string>('');
  const [auditFeedback, setAuditFeedback] = useState<{
    auditedCount: number;
    results: any[];
  } | null>(null);

  // Modal de Detalle de Auditoría
  const [inspectingBusiness, setInspectingBusiness] = useState<BusinessWithAudit | null>(null);
  const [inspectingAudit, setInspectingAudit] = useState<Audit | null>(null);
  const [inspectingIssues, setInspectingIssues] = useState<AuditIssue[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
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
      const res = await fetchWithAuth('/api/tito/businesses');
      if (res.ok) {
        const data = await res.json();
        setWithWebList(data.withWebsite || []);
        setWithoutWebList(data.withoutWebsite || []);
      }
    } catch (e) {
      console.error('Error fetching businesses for Tito:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === withWebList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(withWebList.map((b) => b.id));
    }
  };

  // Atajo para la Primera Prueba: Seleccionar los 3 consultorios odontológicos de Quilmes con web
  const handleSelectFirstThreeDentists = () => {
    const dentists = withWebList
      .filter((b) => b.industry?.toLowerCase().includes('odont') || b.name.toLowerCase().includes('odont'))
      .slice(0, 3);
    const ids = dentists.length > 0 ? dentists.map((d) => d.id) : withWebList.slice(0, 3).map((b) => b.id);
    setSelectedIds(ids);
  };

  const handleRunAudit = async () => {
    if (selectedIds.length === 0 || isAuditing) return;

    setIsAuditing(true);
    setAuditFeedback(null);
    setAuditStep(`Tito está inspeccionando ${selectedIds.length} sitios web...`);

    try {
      const res = await fetchWithAuth('/api/tito/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar auditoría con Tito.');
      }

      setAuditFeedback({
        auditedCount: data.auditedCount,
        results: data.results || [],
      });

      setSelectedIds([]);
      await fetchBusinesses();
    } catch (err: any) {
      alert(`Error en la auditoría de Tito: ${err.message}`);
    } finally {
      setIsAuditing(false);
      setAuditStep('');
    }
  };

  const handleOpenAuditDetail = async (biz: BusinessWithAudit) => {
    setInspectingBusiness(biz);
    setIsLoadingDetail(true);

    try {
      const res = await fetchWithAuth(`/api/tito/audit/${biz.id}`);
      if (res.ok) {
        const data = await res.json();
        setInspectingAudit(data.audit);
        setInspectingIssues(data.issues || []);
      }
    } catch (e) {
      console.error('Error fetching audit detail:', e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Tito Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0a141d] to-[#0a1122] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-emerald-500/20 border-2 border-emerald-500/50 shadow-lg shrink-0">
              <Image
                src="/avatars/tito.png"
                alt="Tito"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Inspector Técnico
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Operativo
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Tito — Auditoría y Diagnóstico Técnico
              </h1>
              <p className="text-xs text-slate-300 mt-1 italic">
                «Esta página necesita pasar por el taller.»
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSelectFirstThreeDentists}
              disabled={isAuditing || withWebList.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Seleccionar 3 Odontólogos (Primera Prueba)
            </button>

            <button
              type="button"
              onClick={handleRunAudit}
              disabled={selectedIds.length === 0 || isAuditing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditando...</span>
                </>
              ) : (
                <>
                  <SearchCode className="w-4 h-4" />
                  <span>Auditar con Tito ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {auditStep && (
          <div className="mt-4 pt-3 border-t border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{auditStep}</span>
          </div>
        )}
      </div>

      {/* Feedback de Auditoría */}
      {auditFeedback && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">
                ¡Auditoría técnica finalizada con éxito!
              </p>
              <p className="text-emerald-300 text-[11px]">
                Tito inspeccionó <strong>{auditFeedback.auditedCount}</strong> sitios web. Los informes, problemas detectados y recomendaciones quedaron guardados en sus respectivas fichas del CRM.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuditFeedback(null)}
            className="text-emerald-400 hover:text-white text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Pestañas de Segmentación: Con Web vs Sin Web */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('withWeb')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'withWeb'
              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          )}
        >
          <Globe className="w-4 h-4" />
          <span>Negocios con sitio web ({withWebList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('withoutWeb')}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'withoutWeb'
              ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Oportunidades de Desarrollo Web desde Cero ({withoutWebList.length})</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: Negocios CON Sitio Web para Auditar
      ===================================================================== */}
      {activeTab === 'withWeb' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                Negocios con presencia web en el CRM ({withWebList.length})
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                {selectedIds.length} seleccionados
              </span>
            </div>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors cursor-pointer"
            >
              {selectedIds.length === withWebList.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === withWebList.length && withWebList.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Negocio y Rubro</th>
                  <th className="p-4">Sitio Web Registrado</th>
                  <th className="p-4 text-center">Estado Auditoría</th>
                  <th className="p-4 text-center">Diagnóstico Rápido</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {withWebList.map((biz) => {
                  const isSelected = selectedIds.includes(biz.id);
                  const isAudited = !!biz.latestAudit;

                  return (
                    <tr
                      key={biz.id}
                      className={cn(
                        'hover:bg-slate-800/30 transition-colors',
                        isSelected ? 'bg-emerald-950/20' : ''
                      )}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(biz.id)}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/prospects/${biz.id}`}
                          className="font-semibold text-white hover:text-emerald-400 transition-colors"
                        >
                          {biz.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{biz.industry || 'Rubro no definido'}</span>
                          <span>•</span>
                          <span>{biz.city}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <a
                          href={biz.website?.startsWith('http') ? biz.website : `https://${biz.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px] max-w-[220px] truncate"
                        >
                          <span className="truncate">{biz.website}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      <td className="p-4 text-center">
                        {isAudited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            AUDITADO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            <Clock className="w-3 h-3 text-slate-500" />
                            PENDIENTE
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {isAudited && biz.latestAudit ? (
                          <div className="text-[11px] space-y-0.5 font-mono text-slate-300">
                            <div>
                              Resp:{' '}
                              <strong className="text-white">
                                {biz.latestAudit.performance_data?.responseTimeMs}ms
                              </strong>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {biz.latestAudit.performance_data?.isHttps ? (
                                <span className="text-emerald-400">HTTPS</span>
                              ) : (
                                <span className="text-red-400">Sin SSL</span>
                              )}
                              {' • '}
                              {biz.latestAudit.ai_insights?.hasWhatsApp ? (
                                <span className="text-emerald-400">WhatsApp</span>
                              ) : (
                                <span className="text-amber-400">Sin WA</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Sin inspección</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isAudited ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAuditDetail(biz)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                            >
                              Ver informe
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                setSelectedIds([biz.id]);
                                setIsAuditing(true);
                                try {
                                  await fetchWithAuth('/api/tito/audit', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ businessIds: [biz.id] }),
                                  });
                                  await fetchBusinesses();
                                } finally {
                                  setIsAuditing(false);
                                  setSelectedIds([]);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors cursor-pointer"
                            >
                              Auditar
                            </button>
                          )}

                          <Link
                            href={`/prospects/${biz.id}`}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Ver ficha en CRM"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: Oportunidades de Desarrollo Web Desde Cero (Sin Sitio Web)
      ===================================================================== */}
      {activeTab === 'withoutWeb' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">
                Oportunidades de Venta Directa: Desarrollo Web Desde Cero
              </p>
              <p className="mt-1 text-amber-300/80 leading-relaxed text-[11px]">
                Estos <strong>{withoutWebList.length} negocios</strong> no tienen página web informada. No requieren auditoría técnica. Representan la oportunidad comercial más clara para WebPilot: ofrecerles su primer sitio web profesional, moderno y adaptado para celulares con botón de WhatsApp.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Negocio</th>
                    <th className="p-4">Rubro y Ubicación</th>
                    <th className="p-4">Contacto Telefónico</th>
                    <th className="p-4">Estado en CRM</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {withoutWebList.map((biz) => (
                    <tr key={biz.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        <Link href={`/prospects/${biz.id}`} className="hover:text-amber-400 transition-colors">
                          {biz.name}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{biz.industry || 'No especificado'}</div>
                        <div className="text-[11px] text-slate-500">{biz.city}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {biz.phone ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {biz.phone}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Sin teléfono informado</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300">
                          {biz.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/prospects/${biz.id}`}
                          className="px-3 py-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <span>Ficha CRM</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL DETALLE DE AUDITORÍA DE TITO
      ===================================================================== */}
      {inspectingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <SearchCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectingBusiness.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {inspectingBusiness.website}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingBusiness(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {isLoadingDetail ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                  <p>Cargando informe de auditoría...</p>
                </div>
              ) : !inspectingAudit ? (
                <div className="text-center py-8 text-slate-400">
                  No se encontró informe registrado para este negocio.
                </div>
              ) : (
                <>
                  {/* Grid de Métricas Principales */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Tiempo Respuesta</span>
                      <span className="text-base font-bold text-white mt-0.5 font-mono">
                        {inspectingAudit.performance_data?.responseTimeMs} ms
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Peso HTML</span>
                      <span className="text-base font-bold text-white mt-0.5 font-mono">
                        {inspectingAudit.performance_data?.htmlSizeKb} KB
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Cifrado SSL</span>
                      <span
                        className={cn(
                          'text-base font-bold mt-0.5 font-mono block',
                          inspectingAudit.performance_data?.isHttps
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        )}
                      >
                        {inspectingAudit.performance_data?.isHttps ? 'HTTPS Seguro' : 'No Seguro (HTTP)'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Canal WhatsApp</span>
                      <span
                        className={cn(
                          'text-base font-bold mt-0.5 font-mono block',
                          inspectingAudit.ai_insights?.hasWhatsApp
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        )}
                      >
                        {inspectingAudit.ai_insights?.hasWhatsApp ? 'Detectado' : 'No Encontrado'}
                      </span>
                    </div>
                  </div>

                  {/* Core Web Vitals Notice */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    ℹ <strong>Aclaración técnica sobre Core Web Vitals:</strong> La medición de renderizado completo en navegador (LCP, FID/INP, CLS) no está disponible en este análisis estático de servidor. Requiere simulación con navegador Chromium o recopilación de datos de campo de Google.
                  </div>

                  {/* Problemas Detectados con Evidencia Concreta */}
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Problemas Detectados con Evidencia ({inspectingIssues.length})
                    </h4>

                    {inspectingIssues.length === 0 ? (
                      <p className="text-slate-500 italic">No se detectaron problemas críticos.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {inspectingIssues.map((iss) => (
                          <div
                            key={iss.id}
                            className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-semibold text-white">{iss.title}</span>
                                <span className="text-[10px] text-slate-400 ml-2 font-mono">
                                  ({iss.category})
                                </span>
                              </div>
                              <span
                                className={cn(
                                  'text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0',
                                  iss.severity === 'CRITICO'
                                    ? 'bg-red-950 text-red-300 border border-red-800'
                                    : iss.severity === 'ALTO'
                                    ? 'bg-orange-950 text-orange-300 border border-orange-800'
                                    : iss.severity === 'MEDIO'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-slate-800 text-slate-300'
                                )}
                              >
                                {iss.severity}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed bg-[#0c1220] p-2 rounded border border-[#172238]">
                              {iss.description}
                            </p>

                            {iss.recommendation && (
                              <p className="text-[10px] text-emerald-300">
                                <strong>Recomendación:</strong> {iss.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Servicios que WebPilot Puede Ofrecer */}
                  {inspectingAudit.ai_insights?.commercialRecommendations &&
                    inspectingAudit.ai_insights.commercialRecommendations.length > 0 && (
                      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                          <Wrench className="w-4 h-4" />
                          <span>Oportunidades de Venta para WebPilot (Basadas en problemas reales)</span>
                        </div>

                        <div className="space-y-2">
                          {inspectingAudit.ai_insights.commercialRecommendations.map(
                            (rec: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-slate-950 p-2.5 rounded-lg border border-slate-800"
                              >
                                <div className="font-bold text-white text-xs">{rec.serviceName}</div>
                                <p className="text-[11px] text-slate-300 mt-0.5">{rec.reason}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                  Evidencia: {rec.evidencia}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <Link
                href={`/prospects/${inspectingBusiness.id}`}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Ver ficha completa en CRM</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <button
                type="button"
                onClick={() => setInspectingBusiness(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors cursor-pointer"
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
