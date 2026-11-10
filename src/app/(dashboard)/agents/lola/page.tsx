'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Globe,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Smartphone,
  MessageSquare,
  FileText,
  UserCheck,
  RefreshCw,
  Building2,
  MapPin,
  Check,
} from 'lucide-react';
import { LolaSearch, LolaCandidate } from '@/types/database.types';

export default function LolaAgentPage() {
  // Formulario
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('Quilmes');
  const [stateProvince, setStateProvince] = useState('Buenos Aires');
  const [country, setCountry] = useState('Argentina');
  const [maxResults, setMaxResults] = useState(10);
  const [webFilter, setWebFilter] = useState<'ALL' | 'WITH_WEB' | 'WITHOUT_WEB'>('ALL');

  // Estados de ejecución
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversación y resultados actuales
  const [conversation, setConversation] = useState<{
    userPrompt?: string;
    lolaReplies: string[];
  } | null>(null);

  const [currentSearch, setCurrentSearch] = useState<LolaSearch | null>(null);
  const [candidates, setCandidates] = useState<LolaCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<{
    approved: number;
    duplicates: number;
  } | null>(null);

  // Historial de búsquedas
  const [history, setHistory] = useState<LolaSearch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cargar historial inicial
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/lola/history?limit=6');
      if (res.ok) {
        const json = await res.json();
        setHistory(json.searches || []);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Lanzar prospección con Lola
  const handleStartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim() || !city.trim()) {
      setErrorMessage('Por favor ingresá un rubro y una localidad.');
      return;
    }

    setErrorMessage(null);
    setIsSearching(true);
    setApprovalFeedback(null);
    setSelectedIds([]);

    const userPrompt = `Lola, buscame ${industry} en ${city}`;
    setConversation({
      userPrompt,
      lolaReplies: [
        `¡De una! Voy a rastrear ${industry} en ${city} y revisar qué presencia digital tienen actualmente...`,
      ],
    });

    setSearchStep('Consultando motor de prospección comercial...');

    try {
      const res = await fetch('/api/lola/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          city,
          state_province: stateProvince,
          country,
          max_results: maxResults,
          web_filter: webFilter,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar la búsqueda.');
      }

      setCurrentSearch(data.search);
      setCandidates(data.candidates || []);
      setSelectedIds(data.candidates ? data.candidates.map((c: LolaCandidate) => c.id) : []);

      // Respuestas conversacionales de Lola en español argentino
      const total = data.search.total_found;
      const withWeb = data.search.with_website;
      const withoutWeb = data.search.without_website;

      setConversation({
        userPrompt,
        lolaReplies: [
          `¡Encontré ${total} negocios de ${industry} en ${city}!`,
          `Analicé cada uno: ${withWeb} tienen sitio web y ${withoutWeb} no registran página propia.`,
          `Fijate abajo en la tabla de candidatos. Te dejé marcados todos con sus notas técnicas preliminares. Con un clic los sumamos a tus Negocios.`,
        ],
      });

      // Refrescar historial
      fetchHistory();
    } catch (err: any) {
      const isMissingApiKey =
        err?.message?.includes('GOOGLE_MAPS_API_KEY') ||
        err?.message?.includes('clave de API') ||
        err?.message?.includes('API key');

      setErrorMessage(err.message || 'Ocurrió un error inesperado');
      setConversation((prev) => ({
        userPrompt: prev?.userPrompt || userPrompt,
        lolaReplies: isMissingApiKey
          ? [
              'Para buscar comercios reales necesito que esté configurada la variable GOOGLE_MAPS_API_KEY en el servidor (.env.local).',
              'Una vez configurada tu clave de Google Places API (New), podré rastrear negocios reales al instante sin problemas.',
            ]
          : [
              `Ocurrió un error al consultar Google Places API: ${err.message || 'error de conexión'}. Verificá tu clave y conexión.`,
            ],
      }));
    } finally {
      setIsSearching(false);
      setSearchStep('');
    }
  };

  // Toggle de selección
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  // Incorporar seleccionados al directorio
  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsApproving(true);
    setApprovalFeedback(null);

    try {
      const res = await fetch('/api/lola/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selectedIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al incorporar candidatos.');
      }

      setApprovalFeedback({
        approved: data.approvedCount,
        duplicates: data.duplicateCount,
      });

      // Actualizar estado local de los candidatos aprobados
      setCandidates((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id)
            ? { ...c, import_status: 'APROBADO' }
            : c
        )
      );

      setSelectedIds([]);
      fetchHistory();
    } catch (err: any) {
      alert(`Error al incorporar: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  // Sugerencias rápidas de rubros
  const quickIndustries = [
    'Inmobiliarias',
    'Talleres mecánicos',
    'Veterinarias',
    'Estudios contables',
    'Odontología',
    'Gimnasios',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header del Agente Lola */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1627] to-[#121e36] border border-cyan-500/20 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20">
            <Image
              src="/avatars/lola.png"
              alt="Lola — Agente de Prospección"
              width={112}
              height={112}
              className="w-full h-full object-cover"
              priority
            />
            <span className="absolute bottom-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Lola — Buscadora de negocios
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Agente Oficial WebPilot
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operativa en línea
              </span>
            </div>

            <p className="text-slate-300 text-sm md:text-base max-w-3xl">
              Especialista en encontrar negocios locales, rastrear información comercial, auditar
              presencia web y preparar oportunidades para la agencia.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="italic text-cyan-300 font-medium bg-cyan-950/40 px-3 py-1 rounded-md border border-cyan-800/40">
                &ldquo;¡Encontré otro que nos puede necesitar!&rdquo;
              </span>
              <span>• Departamento: Prospección Comercial</span>
              <span>• Enfoque: Detección de necesidades digitales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Formulario + Área Conversacional */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Solicitud a Lola */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800 text-white font-semibold">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Pedirle una nueva búsqueda</span>
            </div>

            <form onSubmit={handleStartSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rubro / Tipo de negocio <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Inmobiliarias, Talleres, Odontología..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {/* Sugerencias rápidas */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickIndustries.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setIndustry(ind)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Localidad / Ciudad <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Quilmes"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    País
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Máximo a buscar
                  </label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value={5}>5 negocios</option>
                    <option value={10}>10 negocios</option>
                    <option value={15}>15 negocios</option>
                    <option value={20}>20 negocios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Filtro de presencia web
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWebFilter('ALL')}
                    className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      webFilter === 'ALL'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebFilter('WITH_WEB')}
                    className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      webFilter === 'WITH_WEB'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Con web
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebFilter('WITHOUT_WEB')}
                    className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all ${
                      webFilter === 'WITHOUT_WEB'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sin web
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Lola está investigando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pedirle a Lola</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Historial Reciente de Búsquedas */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <span>Búsquedas recientes de Lola</span>
              <button
                onClick={fetchHistory}
                className="text-slate-500 hover:text-cyan-400 transition-colors"
                title="Actualizar historial"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hay búsquedas registradas aún.</p>
            ) : (
              <div className="space-y-2.5">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-200">
                        {h.industry} en {h.city}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{h.total_found} hallados</span>
                        <span>•</span>
                        <span>{h.approved_count} en Negocios</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(h.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Conversacional de Lola + Métricas en Vivo */}
        <div className="lg:col-span-7 space-y-6">
          {/* Conversación con Lola */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-md min-h-[280px]">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Diálogo con Lola</span>
                </div>
                {searchStep && (
                  <span className="text-xs text-cyan-400 animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    {searchStep}
                  </span>
                )}
              </div>

              {!conversation ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-white text-base font-medium">Lola está lista</h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">
                    Indicá un rubro y una localidad en el formulario para que Lola busque
                    oportunidades, investigue sus sitios web y califique su presencia digital.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mensaje del usuario */}
                  {conversation.userPrompt && (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="rounded-2xl rounded-tr-none bg-blue-600/30 border border-blue-500/40 px-4 py-2.5 text-xs text-blue-100 max-w-[80%]">
                        <span className="font-semibold block text-[10px] text-blue-300 mb-0.5">
                          Vos (WebPilot):
                        </span>
                        {conversation.userPrompt}
                      </div>
                    </div>
                  )}

                  {/* Respuestas de Lola */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-cyan-500/20 border border-cyan-400/50 shrink-0">
                      <Image
                        src="/avatars/lola.png"
                        alt="Lola"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      {conversation.lolaReplies.map((reply, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl rounded-tl-none bg-slate-950 border border-cyan-500/30 px-4 py-2.5 text-xs text-slate-200 max-w-[90%] shadow-sm"
                        >
                          <span className="font-semibold block text-[10px] text-cyan-400 mb-0.5">
                            Lola:
                          </span>
                          {reply}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas del resultado actual */}
            {currentSearch && (
              <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Total hallados</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {currentSearch.total_found}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-cyan-400">Con sitio web</div>
                  <div className="text-xl font-bold text-cyan-400 mt-0.5">
                    {currentSearch.with_website}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-amber-400">Sin sitio web</div>
                  <div className="text-xl font-bold text-amber-400 mt-0.5">
                    {currentSearch.without_website}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-emerald-400">En Negocios</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {currentSearch.approved_count}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback de incorporación */}
          {approvalFeedback && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    ¡Negocios incorporados con éxito al directorio!
                  </p>
                  <p className="text-emerald-300 text-[11px]">
                    Se agregaron <strong>{approvalFeedback.approved}</strong> nuevos negocios.{' '}
                    {approvalFeedback.duplicates > 0 &&
                      `(${approvalFeedback.duplicates} ya existían por dominio o email y fueron omitidos automáticamente).`}
                  </p>
                </div>
              </div>
              <Link
                href="/prospects"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium text-xs border border-emerald-500/30 transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Ver Negocios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Candidatos Encontrados */}
      {candidates.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                Candidatos encontrados por Lola ({candidates.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Revisá el análisis preliminar de Lola y seleccioná los negocios que quieras
                incorporar a tu CRM de WebPilot.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors cursor-pointer"
              >
                {selectedIds.length === candidates.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </button>

              <button
                type="button"
                onClick={handleApproveSelected}
                disabled={selectedIds.length === 0 || isApproving}
                className="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {isApproving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Incorporando...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Incorporar seleccionados ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === candidates.length && candidates.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="p-4">Negocio</th>
                  <th className="p-4">Ubicación y Contacto</th>
                  <th className="p-4">Presencia Web</th>
                  <th className="p-4">Diagnóstico Preliminar de Lola</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {candidates.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const isApproved = c.import_status === 'APROBADO';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          disabled={isApproved}
                          checked={isSelected || isApproved}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 disabled:opacity-40"
                        />
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{c.name}</div>
                        <div className="text-[11px] text-cyan-400 mt-0.5">{c.industry}</div>
                        {c.place_id && (
                          <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-slate-600">ID:</span>
                            <span className="truncate max-w-[140px]" title={c.place_id}>
                              {c.place_id}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>
                            {c.city}, {c.state_province}
                          </span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 space-y-1.5">
                        {c.verified_status === 'SIN_SITIO_WEB' || !c.website ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/40 text-[11px] font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" /> Sin sitio web informado
                          </span>
                        ) : c.verified_status === 'ACCESIBLE' ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 text-[10px] font-semibold">
                                <CheckCircle2 className="w-3 h-3 shrink-0" /> Sitio web accesible
                              </span>
                            </div>
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-medium text-[11px]"
                            >
                              <Globe className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {c.website.replace(/^https?:\/\//, '')}
                              </span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {c.has_whatsapp && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                                </span>
                              )}
                              {c.is_mobile_friendly ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                  <Smartphone className="w-2.5 h-2.5" /> Responsive
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  <Smartphone className="w-2.5 h-2.5" /> No responsive
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-[10px] font-medium">
                                <AlertCircle className="w-3 h-3 shrink-0 text-slate-500" /> No se pudo verificar
                              </span>
                            </div>
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:underline text-[11px]"
                            >
                              <Globe className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {c.website.replace(/^https?:\/\//, '')}
                              </span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          {c.notes || 'Sin observaciones'}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> En Negocios
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
