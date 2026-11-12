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
  UserCheck,
  RefreshCw,
  Building2,
  MapPin,
  Check,
  XCircle,
  Edit3,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { LolaSearch, LolaCandidate } from '@/types/database.types';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/lib/auth/useUserRole';
import { DemoNoticeModal } from '@/components/common/DemoNoticeModal';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData?.session;

  console.log('[Lola Auth Client] ========================================');
  console.log('[Lola Auth Client] Diagnóstico de petición a:', url);
  console.log('[Lola Auth Client] 1. ¿Existe sesión activa en navegador?:', !!session);
  console.log('[Lola Auth Client] 2. Usuario logueado:', session?.user?.email || '(ninguno)');
  console.log('[Lola Auth Client] 3. ¿Tiene access_token?:', !!session?.access_token);
  if (sessionError) {
    console.error('[Lola Auth Client] Error al consultar getSession():', sessionError.message);
  }

  const headers = new Headers(options.headers || {});
  const hasToken = !!session?.access_token;
  if (hasToken) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  console.log('[Lola Auth Client] 4. ¿Encabezado Authorization adjuntado?:', hasToken);
  console.log('[Lola Auth Client] ========================================');

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export default function LolaAgentPage() {
  // Formulario de Búsqueda (Etapa 1: Descubrimiento)
  const [industry, setIndustry] = useState('Talleres mecánicos');
  const [city, setCity] = useState('Quilmes');
  const [stateProvince, setStateProvince] = useState('Buenos Aires');
  const [country, setCountry] = useState('Argentina');
  const [maxResults, setMaxResults] = useState(20);

  // Estados de ejecución
  const { isDemo } = useUserRole();
  const [showDemoNotice, setShowDemoNotice] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversación y resultados actuales
  const [conversation, setConversation] = useState<{
    userPrompt?: string;
    lolaReplies: string[];
  } | null>(null);

  const [currentSearch, setCurrentSearch] = useState<LolaSearch | null>(null);
  const [candidates, setCandidates] = useState<LolaCandidate[]>([]);
  // IMPORTANTE: Todos comienzan sin seleccionar
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal para edición manual de datos faltantes (Etapa 3)
  const [editingCandidate, setEditingCandidate] = useState<LolaCandidate | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Feedback de aprobación
  const [approvalFeedback, setApprovalFeedback] = useState<{
    approved: number;
    duplicates: number;
  } | null>(null);

  // Historial de búsquedas
  const [history, setHistory] = useState<LolaSearch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSearchId, setLoadingSearchId] = useState<string | null>(null);

  useEffect(() => {
    const checkInitialSession = async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('[Lola Page Mount] Estado de autenticación al cargar pantalla:');
      console.log('[Lola Page Mount] - ¿Existe sesión?:', !!session);
      console.log('[Lola Page Mount] - Email:', session?.user?.email || '(ninguno / no autenticado)');
      if (error) console.error('[Lola Page Mount] - Error al chequear sesión:', error.message);
    };
    checkInitialSession();
    fetchHistory(true);
  }, []);

  const handleSelectSearch = async (searchId: string) => {
    if (loadingSearchId) return;
    setLoadingSearchId(searchId);
    setErrorMessage(null);
    setApprovalFeedback(null);
    setSelectedIds([]);

    try {
      const res = await fetchWithAuth(`/api/lola/search/${searchId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al recuperar candidatos de la búsqueda.');
      }

      const search: LolaSearch = data.search;
      const cands: LolaCandidate[] = data.candidates || [];

      setCurrentSearch(search);
      setCandidates(cands);
      setSelectedIds([]);

      // Sincronizar formulario
      setIndustry(search.industry);
      setCity(search.city);
      if (search.state_province) setStateProvince(search.state_province);
      if (search.country) setCountry(search.country);
      if (search.max_results) setMaxResults(search.max_results);

      const investigated = cands.filter(
        (c) => c.verified_status !== 'PENDIENTE' && c.verified_status !== 'DESCUBIERTO'
      ).length;
      const approved = cands.filter((c) => c.import_status === 'APROBADO').length;

      setConversation({
        userPrompt: `Lola, mostrame la búsqueda de ${search.industry} en ${search.city}`,
        lolaReplies: [
          `Recuperé los ${cands.length} negocios de la búsqueda guardada del ${new Date(
            search.created_at
          ).toLocaleDateString('es-AR')}.`,
          investigated > 0
            ? `Hay ${investigated} comercios investigados con datos y diagnósticos. ${
                approved > 0
                  ? `${approved} ya fueron incorporados al CRM.`
                  : 'Podés seleccionar cuáles incorporar al CRM o completar datos faltantes.'
              }`
            : 'Todos los comercios están listos. Seleccioná cuáles querés que investigue a fondo.',
        ],
      });
    } catch (err: any) {
      console.error('Error al recuperar búsqueda:', err);
      setErrorMessage(err.message || 'No se pudo cargar la búsqueda seleccionada.');
    } finally {
      setLoadingSearchId(null);
    }
  };

  const fetchHistory = async (autoLoadLatest = false) => {
    setLoadingHistory(true);
    try {
      const res = await fetchWithAuth('/api/lola/history?limit=6');
      if (res.ok) {
        const json = await res.json();
        const searches: LolaSearch[] = json.searches || [];
        setHistory(searches);
        if (autoLoadLatest && searches.length > 0) {
          handleSelectSearch(searches[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ==========================================================================
  // ETAPA 1 — DESCUBRIR (Text Search Basic / Essentials)
  // ==========================================================================
  const handleStartDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setShowDemoNotice(true);
      return;
    }
    if (!industry.trim() || !city.trim()) {
      setErrorMessage('Por favor ingresá un rubro y una localidad.');
      return;
    }

    setErrorMessage(null);
    setIsSearching(true);
    setApprovalFeedback(null);
    setSelectedIds([]); // Todos inician deseleccionados

    const userPrompt = `Lola, buscame ${industry} en ${city}`;
    setConversation({
      userPrompt,
      lolaReplies: [
        `¡De una! Voy a consultar Google Places para descubrir ${industry} en ${city} sin solicitar datos de contacto aún...`,
      ],
    });

    setSearchStep('Etapa 1: Descubriendo comercios en Google Places API (New)...');

    try {
      const res = await fetchWithAuth('/api/lola/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          city,
          state_province: stateProvince,
          country,
          max_results: maxResults,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al ejecutar descubrimiento con Google Places API.');
      }

      const cands = data.candidates || [];
      setCurrentSearch(data.search);
      setCandidates(cands);
      // Pre-seleccionar todos los candidatos válidos (no duplicados) para agilizar las acciones
      const validIds = cands
        .filter(
          (c: any) =>
            c.verified_status !== 'DUPLICADO' &&
            c.import_status !== 'APROBADO' &&
            c.import_status !== 'DESCARTADO'
        )
        .map((c: any) => c.id);
      setSelectedIds(validIds);

      const total = data.search.total_found;

      setConversation({
        userPrompt,
        lolaReplies:
          total === 0
            ? [
                `No encontré comercios para ${industry} en ${city}. Probá con un rubro más amplio o revisá que la localidad esté bien escrita.`,
              ]
            : [
                `Encontré ${total} negocios. Pre-seleccioné los válidos para que puedas investigarlos e incorporarlos al CRM, o procesarlos directamente con Patricia.`,
              ],
      });

      fetchHistory();
    } catch (err: any) {
      const isMissingApiKey =
        err?.message?.includes('GOOGLE_MAPS_API_KEY') ||
        err?.message?.includes('clave de API') ||
        err?.message?.includes('API key');

      setErrorMessage(err.message || 'Ocurrió un error inesperado al consultar Google Places.');
      setConversation((prev) => ({
        userPrompt: prev?.userPrompt || userPrompt,
        lolaReplies: isMissingApiKey
          ? [
              'Para buscar comercios reales necesito que esté configurada la variable GOOGLE_MAPS_API_KEY en el servidor.',
              'Si estás en Vercel, agregala en Project Settings ➔ Environment Variables. Si estás en local, agregala en .env.local.',
            ]
          : [
              `Ocurrió un problema: ${err.message || 'error de conexión'}.`,
            ],
      }));
    } finally {
      setIsSearching(false);
      setSearchStep('');
    }
  };

  // ==========================================================================
  // ETAPA 2 — SELECCIÓN HUMANA (Manejo de checkboxes y contadores)
  // ==========================================================================
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    // Solo seleccionar aquellos que no estén ya en el CRM o descartados
    const selectable = candidates.filter(
      (c) => c.verified_status !== 'DUPLICADO' && c.import_status !== 'APROBADO' && c.import_status !== 'DESCARTADO'
    );
    if (selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable.map((c) => c.id));
    }
  };

  // ==========================================================================
  // ETAPA 3 — INVESTIGACIÓN EN PROFUNDIDAD (Place Details + Web Audit)
  // Solo se ejecuta para los candidatos seleccionados por Daro y Julieta
  // ==========================================================================
  const handleInvestigateSelected = async () => {
    if (selectedIds.length === 0) return;
    if (isDemo) {
      setShowDemoNotice(true);
      return;
    }

    setIsInvestigating(true);
    setSearchStep(`Etapa 3: Investigando ${selectedIds.length} comercios seleccionados...`);

    try {
      const res = await fetchWithAuth('/api/lola/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al investigar candidatos seleccionados.');
      }

      // Actualizar candidatos locales con la información investigada
      const updatedMap = new Map<string, LolaCandidate>();
      data.investigatedCandidates.forEach((c: LolaCandidate) => updatedMap.set(c.id, c));

      setCandidates((prev) =>
        prev.map((c) => (updatedMap.has(c.id) ? updatedMap.get(c.id)! : c))
      );

      const count = data.investigatedCandidates.length;
      setConversation((prev) => ({
        userPrompt: prev?.userPrompt,
        lolaReplies: [
          `Investigué los ${count} negocios seleccionados. Consulté sus datos de contacto en Google Places y audité sus sitios web oficiales.`,
          `Fijate abajo el diagnóstico preliminar de cada uno. Podés completar datos faltantes antes de incorporarlos al CRM.`,
        ],
      }));

      fetchHistory();
    } catch (err: any) {
      alert(`Error en la investigación: ${err.message}`);
    } finally {
      setIsInvestigating(false);
      setSearchStep('');
    }
  };

  // ==========================================================================
  // EDICIÓN MANUAL DE INFORMACIÓN FALTANTE
  // ==========================================================================
  const openEditModal = (c: LolaCandidate) => {
    setEditingCandidate(c);
    setEditForm({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      website: c.website || '',
      notes: c.notes || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    if (isDemo) {
      setShowDemoNotice(true);
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetchWithAuth(`/api/lola/candidate/${editingCandidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar cambios.');

      setCandidates((prev) =>
        prev.map((c) => (c.id === editingCandidate.id ? data.candidate : c))
      );

      setEditingCandidate(null);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ==========================================================================
  // ETAPA 4 — APROBACIÓN Y DESCARTE AL CRM
  // ==========================================================================
  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) return;
    if (isDemo) {
      setShowDemoNotice(true);
      return;
    }

    setIsApproving(true);
    setApprovalFeedback(null);

    try {
      const res = await fetchWithAuth('/api/lola/approve', {
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

      setCandidates((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id) ? { ...c, import_status: 'APROBADO' } : c
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

  const handleDiscardSelected = async () => {
    if (selectedIds.length === 0) return;
    if (isDemo) {
      setShowDemoNotice(true);
      return;
    }
    if (!confirm(`¿Descartar los ${selectedIds.length} candidatos seleccionados?`)) return;

    setIsDiscarding(true);
    try {
      const res = await fetchWithAuth('/api/lola/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selectedIds }),
      });

      if (!res.ok) throw new Error('Error al descartar candidatos.');

      setCandidates((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id) ? { ...c, import_status: 'DESCARTADO' } : c
        )
      );

      setSelectedIds([]);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsDiscarding(false);
    }
  };

  // Sugerencias rápidas de rubros
  const quickIndustries = [
    'Talleres mecánicos',
    'Inmobiliarias',
    'Veterinarias',
    'Estudios contables',
    'Odontología',
    'Gimnasios',
  ];

  // Filtros de estado de candidatos
  const countDiscovered = candidates.filter((c) => c.import_status === 'DESCUBIERTO').length;
  const countInvestigated = candidates.filter((c) => c.import_status === 'INVESTIGADO').length;
  const countApproved = candidates.filter((c) => c.import_status === 'APROBADO').length;

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
                Flujo Controlado en 4 Etapas
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Google Places API (New)
              </span>
            </div>

            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              Descubrimiento comercial por etapas optimizado en costos. Lola busca hasta 20 negocios
              con <strong>Field Mask básico</strong>, permitiendo selección humana previa a la
              investigación profunda y aprobación en el CRM.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="italic text-cyan-300 font-medium bg-cyan-950/40 px-3 py-1 rounded-md border border-cyan-800/40">
                &ldquo;¡Encontré otro que nos puede necesitar!&rdquo;
              </span>
              <span>• Etapa 1: Descubrir</span>
              <span>• Etapa 2: Selección</span>
              <span>• Etapa 3: Investigar</span>
              <span>• Etapa 4: Aprobar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Formulario + Área Conversacional */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario: Etapa 1 Descubrir */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 shadow-md backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-white font-semibold">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Etapa 1 — Descubrir Comercios</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Costo Mínimo
              </span>
            </div>

            <form onSubmit={handleStartDiscovery} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rubro / Tipo de negocio <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Talleres mecánicos, Inmobiliarias..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickIndustries.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setIndustry(ind)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer"
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
                    Cantidad a descubrir
                  </label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value={5}>5 negocios (prueba rápida)</option>
                    <option value={10}>10 negocios</option>
                    <option value={15}>15 negocios</option>
                    <option value={20}>20 negocios (máximo)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080d18] border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-cyan-400 font-semibold block mb-0.5">Control de costos:</span>
                Esta etapa utiliza únicamente los campos <code>places.id</code>, <code>places.displayName</code> y <code>places.formattedAddress</code>. No solicita teléfono ni sitio web hasta que vos elijas cuáles investigar.
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Aviso de configuración:</span>
                    <span className="leading-relaxed block">{errorMessage}</span>
                  </div>
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
                    <span>Descubriendo comercios...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Descubrir candidatos con Lola</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Historial Reciente */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <span>Búsquedas recientes de Lola</span>
              <button
                type="button"
                onClick={() => fetchHistory(false)}
                className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                title="Actualizar historial"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hay búsquedas registradas aún.</p>
            ) : (
              <div className="space-y-2.5">
                {history.map((h) => {
                  const isCurrent = currentSearch?.id === h.id;
                  const isLoadingThis = loadingSearchId === h.id;

                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleSelectSearch(h.id)}
                      disabled={isLoadingThis || isSearching || isInvestigating}
                      className={cn(
                        'w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50',
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm text-cyan-200 ring-1 ring-cyan-500/20'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700 text-slate-300'
                      )}
                      title={`Hacé clic para cargar los candidatos de ${h.industry} en ${h.city}`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-medium truncate',
                              isCurrent ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            )}
                          >
                            {h.industry} en {h.city}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium shrink-0">
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{h.total_found} descubiertos</span>
                          <span>•</span>
                          <span>{h.investigated_count} investigados</span>
                          <span>•</span>
                          <span>{h.approved_count} en CRM</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isLoadingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-400">
                            {new Date(h.created_at).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel Conversacional de Lola + Métricas en Vivo */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-md min-h-[300px]">
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
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    Completá el rubro y localidad para que Lola descubra hasta 20 comercios reales.
                    Luego podrás seleccionar con precisión cuáles querés que investigue a fondo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
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
                          className="rounded-2xl rounded-tl-none bg-slate-950 border border-cyan-500/30 px-4 py-2.5 text-xs text-slate-200 max-w-[95%] shadow-sm leading-relaxed"
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

            {/* Métricas del proceso */}
            {candidates.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Descubiertos</div>
                  <div className="text-xl font-bold text-white mt-0.5">{candidates.length}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-blue-400">Investigados</div>
                  <div className="text-xl font-bold text-blue-400 mt-0.5">{countInvestigated}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-amber-400">Por investigar</div>
                  <div className="text-xl font-bold text-amber-400 mt-0.5">{countDiscovered}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <div className="text-[11px] text-emerald-400">En CRM</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">{countApproved}</div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback de Aprobación */}
          {approvalFeedback && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    ¡Negocios incorporados al directorio con éxito!
                  </p>
                  <p className="text-emerald-300 text-[11px]">
                    Se sumaron <strong>{approvalFeedback.approved}</strong> negocios aprobados al CRM.{' '}
                    {approvalFeedback.duplicates > 0 &&
                      `(${approvalFeedback.duplicates} duplicados omitidos automáticamente).`}
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

      {/* =====================================================================
          TABLA DE CANDIDATOS (Etapas 2, 3 y 4)
      ====================================================================== */}
      {candidates.length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  Candidatos de Lola ({candidates.length})
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  {selectedIds.length} seleccionados
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Seleccioná los comercios que quieras investigar. Solo se consumirán datos adicionales
                de Google Places para los que vos elijas.
              </p>
            </div>

            {/* Botones de Acción por Etapa */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors cursor-pointer"
              >
                {selectedIds.length === candidates.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </button>

              {/* Botón ETAPA 3: Investigar seleccionados */}
              <button
                type="button"
                onClick={handleInvestigateSelected}
                disabled={selectedIds.length === 0 || isInvestigating}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {isInvestigating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Investigando {selectedIds.length}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Investigar seleccionados ({selectedIds.length})</span>
                  </>
                )}
              </button>

              {/* Botón ETAPA 4: Incorporar al CRM */}
              <button
                type="button"
                onClick={handleApproveSelected}
                disabled={selectedIds.length === 0 || isApproving}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {isApproving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Incorporando...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Aprobar e incorporar ({selectedIds.length})</span>
                  </>
                )}
              </button>

              {/* Botón Descartar */}
              <button
                type="button"
                onClick={handleDiscardSelected}
                disabled={selectedIds.length === 0 || isDiscarding}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-300 hover:border-red-800 text-xs text-slate-400 font-medium transition-colors border border-slate-700/60 cursor-pointer disabled:opacity-40"
                title="Descartar candidatos seleccionados"
              >
                <XCircle className="w-3.5 h-3.5" />
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
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Negocio (Google Place ID)</th>
                  <th className="p-4">Dirección y Contacto</th>
                  <th className="p-4">Presencia Web & WhatsApp</th>
                  <th className="p-4">Diagnóstico / Observaciones</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {candidates.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const isApproved = c.import_status === 'APROBADO';
                  const isDiscarded = c.import_status === 'DESCARTADO';
                  const isInvestigated = c.import_status === 'INVESTIGADO';
                  const isDiscovered = c.import_status === 'DESCUBIERTO';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      } ${isDiscarded ? 'opacity-40 bg-slate-950/40' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          disabled={isApproved || isDiscarded}
                          checked={isSelected || isApproved}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 disabled:opacity-40 cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{c.name}</div>
                        <div className="text-[11px] text-cyan-400 mt-0.5">{c.industry}</div>
                        {c.place_id && (
                          <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-slate-600">Place ID:</span>
                            <span className="truncate max-w-[150px]" title={c.place_id}>
                              {c.place_id}
                            </span>
                          </div>
                        )}
                        {c.manually_edited && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                            Editado manualmente
                          </span>
                        )}
                        {c.verified_status === 'DUPLICADO' && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 ml-1">
                            Ya en CRM
                          </span>
                        )}
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="max-w-[220px] truncate" title={c.address || `${c.city}, ${c.state_province}`}>
                            {c.address || `${c.city}, ${c.state_province}`}
                          </span>
                        </div>
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            {isDiscovered ? 'Pendiente de investigar' : 'Sin teléfono informado'}
                          </div>
                        )}
                        {c.email && (
                          <div className="text-[11px] text-cyan-300 truncate max-w-[200px]" title={c.email}>
                            ✉ {c.email}
                          </div>
                        )}
                      </td>

                      <td className="p-4 space-y-1.5">
                        {isDiscovered ? (
                          <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-500" /> Web no consultada
                          </span>
                        ) : c.verified_status === 'SIN_SITIO_WEB' || !c.website ? (
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
                          {c.notes || 'Descubierto en Google Places.'}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> En CRM
                          </span>
                        ) : isDiscarded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-950/40 text-red-400 border border-red-800/40">
                            <XCircle className="w-3 h-3" /> Descartado
                          </span>
                        ) : isInvestigated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            <Sparkles className="w-3 h-3" /> Investigado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            <Layers className="w-3 h-3 text-cyan-400" /> Descubierto
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Completar o editar datos manualmente"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE EDICIÓN MANUAL DE DATOS (Etapa 3)
      ====================================================================== */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  Completar información manualmente
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Podés cargar teléfono, email o notas antes de incorporarlo al CRM.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre del Negocio</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+54 11 ..."
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    placeholder="contacto@..."
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sitio Web</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notas y Observaciones</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Informativo Modo Demostración */}
      <DemoNoticeModal
        isOpen={showDemoNotice}
        onClose={() => setShowDemoNotice(false)}
        actionName="ejecutar prospecciones o importar candidatos con Lola"
      />
    </div>
  );
}
