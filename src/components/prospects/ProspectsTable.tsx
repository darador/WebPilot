'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Building,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Business, CRMStage } from '@/types/database.types';
import { CRM_STAGES } from '@/lib/constants/crm';
import { formatDate } from '@/lib/utils';
import { updateBusinessStage } from '@/services/crm.service';

interface ProspectsTableProps {
  prospects: Business[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  industry: string;
  city: string;
  status: string;
  availableIndustries: string[];
  availableCities: string[];
  onSearchChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (prospect: Business) => void;
  onDelete: (prospect: Business) => void;
  onRefresh: () => void;
}

export function ProspectsTable({
  prospects,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  search,
  industry,
  city,
  status,
  availableIndustries,
  availableCities,
  onSearchChange,
  onIndustryChange,
  onCityChange,
  onStatusChange,
  onPageChange,
  onEdit,
  onDelete,
  onRefresh,
}: ProspectsTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getStageBadge = (stage: CRMStage) => {
    const def = CRM_STAGES.find((s) => s.id === stage) || CRM_STAGES[0];
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${def.badgeClass}`}
      >
        {def.label}
      </span>
    );
  };

  const handleQuickStageChange = async (prospect: Business, newStage: CRMStage) => {
    try {
      await updateBusinessStage(prospect.id, newStage, prospect.status);
      setActiveMenuId(null);
      onRefresh();
    } catch (err) {
      console.error('Error changing stage:', err);
    }
  };

  const hasActiveFilters = Boolean(search || industry || city || status);

  const handleResetFilters = () => {
    onSearchChange('');
    onIndustryChange('');
    onCityChange('');
    onStatusChange('');
  };

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[#0b101c] p-3 rounded-xl border border-[#1a2336]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por negocio, email, web o teléfono..."
            className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rubro */}
          <select
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Todos los rubros</option>
            {availableIndustries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          {/* Localidad */}
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Todas las ciudades</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Estado Comercial */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-[#1c273e] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            {CRM_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-lg border border-red-900/40 bg-red-950/20 px-2 py-1.5 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
              title="Limpiar filtros"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[#1a2336] bg-[#0c1220]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1a2336] bg-[#080d18] text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 px-4">Negocio / Rubro</th>
              <th className="py-3 px-4">Ubicación</th>
              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4">Sitio Web</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Fecha Alta</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#162035]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-3 px-4">
                    <div className="h-5 bg-slate-800/40 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : prospects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No se encontraron negocios con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#11192b]/70 transition-colors group"
                >
                  {/* Negocio */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      <Link href={`/prospects/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.industry || 'Rubro sin especificar'}
                    </div>
                  </td>

                  {/* Ubicación */}
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{p.city || '-'}</span>
                    </div>
                    {p.state_province && (
                      <span className="text-[10px] text-slate-500 block pl-4.5">
                        {p.state_province}
                      </span>
                    )}
                  </td>

                  {/* Contacto */}
                  <td className="py-3 px-4 text-slate-300">
                    {p.email ? (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Mail className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{p.email}</span>
                      </div>
                    ) : null}
                    {p.phone ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                    ) : null}
                    {!p.email && !p.phone && <span className="text-slate-600">-</span>}
                  </td>

                  {/* Sitio Web */}
                  <td className="py-3 px-4">
                    {p.website ? (
                      <a
                        href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline text-[11px]"
                      >
                        <span className="truncate max-w-[140px]">
                          {p.website.replace(/^https?:\/\//, '')}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-600 text-[11px]">Sin web</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-4">{getStageBadge(p.status)}</td>

                  {/* Fecha */}
                  <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                    {formatDate(p.created_at)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-right relative">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-[#19243d]"
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => onEdit(p)}
                        className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-[#19243d]"
                        title="Editar negocio"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#19243d]"
                        title="Eliminar negocio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Dropdown de cambio rápido de estado */}
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === p.id ? null : p.id)
                        }
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#19243d]"
                        title="Cambiar estado comercial"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {activeMenuId === p.id && (
                      <div className="absolute right-4 top-10 z-20 w-44 rounded-lg border border-[#1e2a42] bg-[#0d1424] p-1.5 shadow-xl text-left">
                        <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Mover a Etapa:
                        </div>
                        {CRM_STAGES.map((s) => (
                          <button
                            key={s.id}
                            disabled={p.status === s.id}
                            onClick={() => handleQuickStageChange(p, s.id)}
                            className={`flex w-full items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors ${
                              p.status === s.id
                                ? 'text-cyan-400 font-bold bg-cyan-950/40'
                                : 'text-slate-300 hover:bg-[#16223b] hover:text-white'
                            }`}
                          >
                            <span>{s.label}</span>
                            {p.status === s.id && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-400">
        <div>
          Mostrando <span className="font-semibold text-white">{prospects.length}</span> de{' '}
          <span className="font-semibold text-white">{totalCount}</span> negocios
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="flex items-center gap-1 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-2.5 py-1 text-slate-300 hover:bg-[#162035] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Anterior</span>
          </button>
          <span className="font-mono text-[11px] px-2">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="flex items-center gap-1 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-2.5 py-1 text-slate-300 hover:bg-[#162035] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
