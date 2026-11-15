'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Globe,
  Search,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
  Building2,
  MapPin,
  RefreshCw,
  Info,
  Check,
  X,
  Compass,
  FileCheck,
  Layers,
  Sparkles,
  ShieldAlert,
  Key,
  Server,
  Activity,
} from 'lucide-react';
import { NicoSearch, NicoProspect, EmailProvenance, EmailVerificationStatus } from '@/types/database.types';

export default function NicoAgentPage() {
  // Formulario
  const [industry, setIndustry] = useState('Odontología');
  const [city, setCity] = useState('Quilmes');
  const [maxResults, setMaxResults] = useState(20);

  // Estados de ejecución
  const [isSearching, setIsSearching] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resultados
  const [currentSearch, setCurrentSearch] = useState<NicoSearch | null>(null);
  const [prospects, setProspects] = useState<NicoProspect[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<NicoProspect | null>(null);

  // Historial
  const [history, setHistory] = useState<NicoSearch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Feedback de aprobación
  const [approvalFeedback, setApprovalFeedback] = useState<{
    approved: number;
    duplicates: number;
    enriched: number;
  } | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/nico/search');
      const data = await res.json();
      if (data.success && Array.isArray(data.searches)) {
        setHistory(data.searches);
      }
    } catch (err) {
      console.warn('Error cargando historial de Nico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRunSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!industry.trim() || !city.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    setApprovalFeedback(null);
    setSelectedIds([]);

    try {
      const res = await fetch('/api/nico/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry.trim(),
          city: city.trim(),
          max_results: maxResults,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al ejecutar prospección con Nico');
      }

      setCurrentSearch(data.search);
      setProspects(data.prospects || []);
      // Seleccionar por defecto los nuevos no duplicados
      const newIds = (data.prospects || [])
        .filter((p: NicoProspect) => !p.is_duplicate_crm)
        .map((p: NicoProspect) => p.id);
      setSelectedIds(newIds);

      fetchHistory();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error de conexión con Nico');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectHistorySearch = async (search: NicoSearch) => {
    setCurrentSearch(search);
    setSelectedIds([]);
    setApprovalFeedback(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/nico/prospects?searchId=${search.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.prospects)) {
        setProspects(data.prospects);
        const newIds = data.prospects.filter((p: NicoProspect) => !p.is_duplicate_crm).map((p: NicoProspect) => p.id);
        setSelectedIds(newIds);
      }
    } catch (err) {
      console.warn('Error recuperando prospectos de la búsqueda:', err);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === prospects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(prospects.map((p) => p.id));
    }
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsApproving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/nico/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectIds: selectedIds }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al incorporar prospectos al CRM');
      }

      setApprovalFeedback({
        approved: data.approvedCount || 0,
        duplicates: data.duplicateCount || 0,
        enriched: data.enrichedCount || 0,
      });

      // Actualizar estado local
      setProspects((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, import_status: 'APROBADO' } : p))
      );
      setSelectedIds([]);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al aprobar prospectos');
    } finally {
      setIsApproving(false);
    }
  };

  // Helper para badge de estado de email
  const renderEmailBadge = (prov?: EmailProvenance | null) => {
    if (!prov || !prov.email) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          No encontrado
        </span>
      );
    }

    if (prov.verification_status === 'VERIFICADO_EN_FUENTE_OFICIAL') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
          title={`Publicado en web oficial: ${prov.source_url}`}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          Oficial
        </span>
      );
    }

    if (prov.verification_status === 'ENCONTRADO_EN_FUENTE_SECUNDARIA') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/40 text-blue-300 border border-blue-500/30"
          title={`Encontrado en fuente secundaria: ${prov.source_url}`}
        >
          <Globe className="h-3 w-3 text-blue-400" />
          Secundaria
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
        Pendiente
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* 1. TARJETA DE PRESENTACIÓN DEL AGENTE NICO */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0a1020] to-blue-950/30 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-lg shrink-0 bg-slate-900">
              <Image
                src="/avatars/nico.png"
                alt="Nico • Inteligencia Comercial y Prospección Web"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-300">
                  <Globe className="h-3 w-3 text-indigo-400" />
                  NUEVO AGENTE AUTÓNOMO • INTELIGENCIA WEB
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Nico
                <span className="text-xs font-normal text-slate-400">| El Investigador Web</span>
              </h1>
              <p className="mt-1 text-xs text-indigo-200/90 font-medium italic">
                «Encontré negocios que todavía no estamos mirando».
              </p>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Descubre comercios investigando directorios públicos, colegios profesionales, cámaras y sitios oficiales.
                Recolecta información comercial y audita la procedencia de cada email con trazabilidad estricta.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Modo Operativo</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Fuentes Abiertas sin Costo ($0)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PANEL DE BÚSQUEDA Y PARÁMETROS */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-400" />
              Parámetros de Investigación Web
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Definí rubro, localidad y cantidad de prospectos que Nico investigará en fuentes públicas.
            </p>
          </div>

          {/* Presets Rápidos */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Pruebas rápidas:</span>
            <button
              type="button"
              onClick={() => {
                setIndustry('Odontología');
                setCity('Quilmes');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-700/80 transition-all"
            >
              Odontólogos en Quilmes
            </button>
            <button
              type="button"
              onClick={() => {
                setIndustry('Centros de estética');
                setCity('Berazategui');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-700/80 transition-all"
            >
              Estética en Berazategui
            </button>
            <button
              type="button"
              onClick={() => {
                setIndustry('Estudios contables');
                setCity('Avellaneda');
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-700/80 transition-all"
            >
              Contables en Avellaneda
            </button>
          </div>
        </div>

        <form onSubmit={handleRunSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rubro o Actividad Comercial *
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Ej. Odontología, Centros de estética, Veterinarias..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Localidad o Zona Geográfica *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Quilmes, Berazategui, Avellaneda..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cantidad Máxima
              </label>
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={10}>10 resultados</option>
                <option value={15}>15 resultados</option>
                <option value={20}>20 resultados (Recomendado)</option>
                <option value={25}>25 resultados</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>
                Nico consultará buscadores abiertos, directorios sectoriales y sitios oficiales sin evadir restricciones.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Investigando en Internet...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Iniciar Búsqueda con Nico</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. ALERTA O FEEDBACK */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {approvalFeedback && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              <strong>¡Prospectos incorporados al CRM!</strong> Se crearon {approvalFeedback.approved} nuevos comercios,{' '}
              {approvalFeedback.enriched} existentes fueron enriquecidos y {approvalFeedback.duplicates} duplicados fueron
              omitidos. Las tareas correspondientes para Tito o Vera han sido encoladas automáticamente.
            </span>
          </div>
          <Link
            href="/prospects"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 transition-colors"
          >
            Ver en CRM
          </Link>
        </div>
      )}

      {/* 4. MÉTRICAS DE LA BÚSQUEDA ACTIVA */}
      {currentSearch && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0c1322] border border-slate-800 shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Encontrados</span>
              <span className="text-xl font-bold text-white mt-0.5 block">{currentSearch.total_found}</span>
              <span className="text-[10px] text-slate-500">en {currentSearch.query_city}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 shadow-sm">
              <span className="text-[10px] font-mono text-indigo-300 block uppercase">Nuevos Prospectos</span>
              <span className="text-xl font-bold text-indigo-400 mt-0.5 block">{currentSearch.new_prospects_count}</span>
              <span className="text-[10px] text-indigo-300/60">no existen en CRM</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 shadow-sm">
              <span className="text-[10px] font-mono text-amber-300 block uppercase">Duplicados</span>
              <span className="text-xl font-bold text-amber-400 mt-0.5 block">{currentSearch.duplicate_count}</span>
              <span className="text-[10px] text-amber-300/60">detectados en CRM</span>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 shadow-sm">
              <span className="text-[10px] font-mono text-cyan-300 block uppercase">Sitios Web</span>
              <span className="text-xl font-bold text-cyan-400 mt-0.5 block">{currentSearch.with_website_count}</span>
              <span className="text-[10px] text-cyan-300/60">páginas activas</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 shadow-sm">
              <span className="text-[10px] font-mono text-emerald-300 block uppercase">Email Oficial</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{currentSearch.official_email_count}</span>
              <span className="text-[10px] text-emerald-300/60">verificados en web</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 shadow-sm">
              <span className="text-[10px] font-mono text-blue-300 block uppercase">Email Secundario</span>
              <span className="text-xl font-bold text-blue-400 mt-0.5 block">{currentSearch.secondary_email_count}</span>
              <span className="text-[10px] text-blue-300/60">en directorios</span>
            </div>
          </div>

          {/* TELEMETRÍA Y TRANSPARENCIA DE FUENTES */}
          {currentSearch.source_stats && currentSearch.source_stats.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Telemetría y Estado de Fuentes Consultadas
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentSearch.duration_ms} ms de ejecución total
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentSearch.source_stats.map((src) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      <Compass className="h-3 w-3" />
                      Sin resultados
                    </span>
                  );

                  if (src.status === 'DISPONIBLE') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {src.hits_count > 0 ? `${src.hits_count} extraídos` : 'Disponible'}
                      </span>
                    );
                  } else if (src.status === 'NO_CONFIGURADO') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/50 text-blue-300 border border-blue-500/30">
                        <Key className="h-3 w-3 text-blue-400" />
                        Desacoplado / API Key
                      </span>
                    );
                  } else if (src.status === 'BLOQUEADO_CAPTCHA') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/50 text-amber-300 border border-amber-500/30">
                        <ShieldAlert className="h-3 w-3 text-amber-400" />
                        Anti-Bot (HTTP 403)
                      </span>
                    );
                  } else if (src.status === 'ERROR') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-950/50 text-red-300 border border-red-500/30">
                        <AlertCircle className="h-3 w-3 text-red-400" />
                        Error
                      </span>
                    );
                  }

                  return (
                    <div
                      key={src.source_id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-white text-xs leading-snug">{src.source_name}</div>
                        {badge}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{src.details || 'Consulta finalizada.'}</p>
                      {src.duration_ms > 0 && (
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{src.duration_ms} ms</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TABLA DE RESULTADOS Y PROSPECTOS DESCUBIERTOS */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1322] shadow-md overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prospects.length > 0 && selectedIds.length === prospects.length}
              onChange={handleSelectAll}
              disabled={prospects.length === 0}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Prospectos Descubiertos por Nico
                {prospects.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedIds.length} de {prospects.length} seleccionados
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Revisá los datos comerciales y la procedencia de los emails antes de incorporarlos al CRM.
              </p>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleApproveSelected}
              disabled={isApproving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50"
            >
              {isApproving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Incorporando al CRM...</span>
                </>
              ) : (
                <>
                  <Database className="h-3.5 w-3.5" />
                  <span>Aprobar e Incorporar {selectedIds.length} al CRM</span>
                </>
              )}
            </button>
          )}
        </div>

        {prospects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Globe className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No hay prospectos en pantalla</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Comenzá una nueva investigación ingresando rubro y localidad, o seleccioná una búsqueda anterior del historial.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] bg-slate-950/60">
                  <th className="py-3 px-4 w-10">Sel.</th>
                  <th className="py-3 px-4">Comercio / Profesional</th>
                  <th className="py-3 px-4">Fuente / Origen</th>
                  <th className="py-3 px-4">Web Oficial</th>
                  <th className="py-3 px-4">Email y Procedencia</th>
                  <th className="py-3 px-4">WhatsApp / Tel.</th>
                  <th className="py-3 px-4">Estado CRM</th>
                  <th className="py-3 px-4 text-right">Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {prospects.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isApproved = p.import_status === 'APROBADO';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      } ${p.is_duplicate_crm ? 'opacity-85' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          disabled={isApproved}
                          className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{p.address || `${p.city}, ${p.state_province || 'Buenos Aires'}`}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-indigo-300 bg-slate-900 px-2 py-1 rounded-md border border-slate-800"
                          title={`Ficha de origen: ${p.source_url}`}
                        >
                          <span className="truncate max-w-[130px]">{p.source_name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-500" />
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.website ? (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 text-xs truncate max-w-[180px]"
                          >
                            <span className="truncate">{p.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Sin sitio web</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {p.email ? (
                            <span className="font-mono text-slate-200 text-xs truncate max-w-[170px]" title={p.email}>
                              {p.email}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">No publicado</span>
                          )}
                          {renderEmailBadge(p.email_provenance)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-xs">
                          {p.whatsapp && (
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1"
                              title={`WhatsApp directo: ${p.whatsapp}`}
                            >
                              <MessageCircle className="h-3.5 w-3.5 fill-emerald-500 text-slate-950" />
                              <span>{p.whatsapp}</span>
                            </a>
                          )}
                          {!p.whatsapp && p.phone && (
                            <span className="text-slate-300 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-500" />
                              <span>{p.phone}</span>
                            </span>
                          )}
                          {!p.whatsapp && !p.phone && (
                            <span className="text-slate-500 italic text-[11px]">No informado</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                            <Check className="h-3.5 w-3.5" />
                            Incorporado
                          </span>
                        ) : p.is_duplicate_crm ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                            <Layers className="h-3 w-3" />
                            Ya en CRM (Duplicado)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-400 text-[11px] font-semibold">
                            <Sparkles className="h-3 w-3" />
                            Nuevo Prospecto
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEvidence(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Info className="h-3 w-3 text-indigo-400" />
                          <span>Evidencia</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. MODAL DE AUDITORÍA Y TRAZABILIDAD DE EVIDENCIA */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Trazabilidad de Procedencia • Nico
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedEvidence.name}</h3>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fuente de Origen</span>
                <p className="font-semibold text-white">{selectedEvidence.source_name}</p>
                <a
                  href={selectedEvidence.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline break-all block text-[11px]"
                >
                  {selectedEvidence.source_url}
                </a>
              </div>

              {selectedEvidence.email_provenance && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Auditoría de Email de Contacto
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold">{selectedEvidence.email}</span>
                    {renderEmailBadge(selectedEvidence.email_provenance)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <strong>URL donde se publicó:</strong>{' '}
                    <a
                      href={selectedEvidence.email_provenance.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline break-all"
                    >
                      {selectedEvidence.email_provenance.source_url}
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Fecha de extracción:</strong>{' '}
                    {new Date(selectedEvidence.email_provenance.extraction_date).toLocaleString('es-AR')}
                  </p>
                  {selectedEvidence.email_provenance.context_snippet && (
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Contexto en la página:</span>
                      <blockquote className="text-[11px] italic text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 mt-1">
                        «...{selectedEvidence.email_provenance.context_snippet}...»
                      </blockquote>
                    </div>
                  )}
                </div>
              )}

              {selectedEvidence.social_links && selectedEvidence.social_links.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Redes Sociales Oficiales</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedEvidence.social_links.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-800 text-indigo-300 hover:text-white text-[11px] font-semibold"
                      >
                        {s.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Notas de Investigación</span>
                <p className="text-slate-300 text-xs">{selectedEvidence.evidence_notes}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. HISTORIAL DE BÚSQUEDAS RECIENTES */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1322] p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            Historial de Investigaciones de Nico
          </h3>
          <span className="text-[11px] text-slate-500">{history.length} búsquedas archivadas</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No hay búsquedas en el historial todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {history.slice(0, 6).map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelectHistorySearch(h)}
                className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs truncate max-w-[160px]">{h.query_industry}</span>
                  <span className="text-[10px] text-slate-500">{new Date(h.created_at).toLocaleDateString('es-AR')}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>{h.query_city}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  <span className="text-indigo-400 font-bold">{h.total_found} hallazgos</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{h.official_email_count} emails ofic.</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
