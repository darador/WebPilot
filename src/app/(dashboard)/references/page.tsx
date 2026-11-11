'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ReferenceDetailModal } from '@/components/references/ReferenceDetailModal';
import { ReferenceFormModal } from '@/components/references/ReferenceFormModal';
import { BrunoInspirationView } from '@/components/references/BrunoInspirationView';
import { IndustryReference, ReferenceStatus } from '@/types/database.types';
import { STANDARD_INDUSTRIES } from '@/services/references.service';

function ReferencesContent() {
  const [references, setReferences] = useState<IndustryReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'bruno'>('catalog');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [onlyApproved, setOnlyApproved] = useState(false);

  // Modals
  const [selectedRefForDetail, setSelectedRefForDetail] = useState<IndustryReference | null>(null);
  const [selectedRefForEdit, setSelectedRefForEdit] = useState<IndustryReference | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refToDelete, setRefToDelete] = useState<IndustryReference | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedIndustry !== 'TODOS') params.set('industry', selectedIndustry);
      if (onlyApproved) {
        params.set('status', 'APROBADA');
      } else if (selectedStatus !== 'TODOS') {
        params.set('status', selectedStatus);
      }
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/references?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReferences(json.data);
      }
    } catch (err) {
      console.error('Error fetching references:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedIndustry, selectedStatus, onlyApproved, search]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReferences();
  };

  const handleOpenCreate = () => {
    setSelectedRefForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ref: IndustryReference) => {
    setSelectedRefForEdit(ref);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!refToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/references/${refToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setRefToDelete(null);
        fetchReferences();
      }
    } catch (err) {
      console.error('Error deleting reference:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalCount = references.length;
  const approvedCount = references.filter((r) => r.status === 'APROBADA').length;
  const distinctIndustries = Array.from(new Set(references.map((r) => r.industry))).length;

  const getStatusBadge = (status: ReferenceStatus) => {
    switch (status) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="h-3 w-3" />
            Aprobada
          </span>
        );
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-700/50">
            <HelpCircle className="h-3 w-3" />
            Pendiente
          </span>
        );
      case 'DESCARTADA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-700/50">
            <XCircle className="h-3 w-3" />
            Descartada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Topbar
        title="Biblioteca de Referencias"
        subtitle="Páginas web destacadas por rubro para benchmarking comercial de Vera e inspiración de diseño de Bruno"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Cabecera con Métricas y Botón Agregar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Colección de Referencias Web</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {totalCount} sitios
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Buenas prácticas y arquitecturas web para benchmarking objetivo e inspiración original.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.01]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar referencia</span>
            </button>
          </div>
        </div>

        {/* Mini KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Registradas
              </span>
              <span className="text-xl font-bold text-white mt-0.5 block">{totalCount}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Aprobadas Activas
              </span>
              <span className="text-xl font-bold text-white mt-0.5 block">{approvedCount}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-[#0c1220] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                Rubros Representados
              </span>
              <span className="text-xl font-bold text-white mt-0.5 block">{distinctIndustries}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex items-center gap-2 border-b border-[#1a2336] pb-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#141e33] text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#0c1220]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Catálogo de Referencias ({totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('bruno')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bruno'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white hover:bg-[#0c1220]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Inspiración para Desarrollo (Bruno)</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'bruno' ? (
          <BrunoInspirationView
            references={references}
            onSelectReference={(ref) => setSelectedRefForDetail(ref)}
          />
        ) : (
          <div className="space-y-4">
            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0b101c] p-3 rounded-xl border border-[#1a2336]">
              {/* Buscador */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, rubro, localidad o descripción..."
                  className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Filtros Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Rubro */}
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="TODOS">Todos los rubros</option>
                  {STANDARD_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>

                {/* Estado */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    if (e.target.value !== 'APROBADA') setOnlyApproved(false);
                  }}
                  className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="APROBADA">Aprobadas</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="DESCARTADA">Descartadas</option>
                </select>

                {/* Toggle Solo Aprobadas */}
                <button
                  type="button"
                  onClick={() => setOnlyApproved(!onlyApproved)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    onlyApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#070b14] text-slate-400 border-[#1c273e] hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Solo Aprobadas</span>
                </button>

                {(search || selectedIndustry !== 'TODOS' || selectedStatus !== 'TODOS' || onlyApproved) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedIndustry('TODOS');
                      setSelectedStatus('TODOS');
                      setOnlyApproved(false);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-red-900/40 bg-red-950/20 px-2 py-1.5 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
                    title="Limpiar filtros"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid de Tarjetas de Referencias */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-xl border border-[#1a2336] bg-[#0c1220] animate-pulse p-5"
                  />
                ))}
              </div>
            ) : references.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-[#1a2336] bg-[#0c1220] space-y-3">
                <Compass className="h-8 w-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-semibold text-white">
                  No se encontraron referencias con los filtros aplicados
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Probá ajustando el término de búsqueda o limpiando los filtros para ver todos los sitios registrados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex flex-col justify-between rounded-xl border border-[#1a2336] bg-[#0c1220] p-5 hover:border-cyan-500/40 hover:bg-[#0e1628] transition-all group shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-700/40">
                            {ref.industry}
                          </span>
                          {ref.subindustry && (
                            <span className="text-[10px] text-slate-400">
                              • {ref.subindustry}
                            </span>
                          )}
                        </div>
                        {getStatusBadge(ref.status)}
                      </div>

                      {/* Nombre y URL */}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {ref.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {ref.city && (
                            <span className="flex items-center gap-0.5 text-[11px]">
                              <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                              {ref.city}
                            </span>
                          )}
                          <a
                            href={ref.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline line-clamp-1"
                          >
                            <span>{ref.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        </div>
                      </div>

                      {/* Descripción breve */}
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {ref.description}
                      </p>

                      {/* Motivo de selección */}
                      <div className="p-2.5 rounded-lg bg-[#080d18] border border-[#162035] space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                          Motivo de Selección
                        </span>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-normal">
                          {ref.selection_reason}
                        </p>
                      </div>

                      {/* Puntos Fuertes Destacados (Chips) */}
                      {ref.strengths && ref.strengths.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Puntos Fuertes ({ref.strengths.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {ref.strengths.slice(0, 3).map((st, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                {st}
                              </span>
                            ))}
                            {ref.strengths.length > 3 && (
                              <span className="text-[10px] text-slate-500 px-1 py-0.5">
                                +{ref.strengths.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-[#162035] flex items-center justify-between">
                      <button
                        onClick={() => setSelectedRefForDetail(ref)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver detalle completo</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(ref)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131d33] transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setRefToDelete(ref)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Detalle */}
      <ReferenceDetailModal
        reference={selectedRefForDetail}
        isOpen={Boolean(selectedRefForDetail)}
        onClose={() => setSelectedRefForDetail(null)}
        onEdit={(ref) => {
          setSelectedRefForDetail(null);
          handleOpenEdit(ref);
        }}
      />

      {/* Modal Formulario (Alta / Edición) */}
      <ReferenceFormModal
        referenceToEdit={selectedRefForEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchReferences}
      />

      {/* Confirmación Eliminación */}
      <ConfirmDialog
        isOpen={Boolean(refToDelete)}
        title="Eliminar Referencia"
        message={`¿Estás seguro de que deseás eliminar "${refToDelete?.name}" de la biblioteca? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Definitivamente"
        isProcessing={isDeleting}
        onCancel={() => setRefToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function ReferencesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Cargando biblioteca de referencias...</div>}>
      <ReferencesContent />
    </Suspense>
  );
}
