'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, UploadCloud, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { ProspectsTable } from '@/components/prospects/ProspectsTable';
import { ProspectModal } from '@/components/prospects/ProspectModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  getProspects,
  deleteProspect,
  getDistinctFilters,
} from '@/services/prospects.service';
import { Business } from '@/types/database.types';

function ProspectsContent() {
  const searchParams = useSearchParams();

  // Prospects state
  const [prospects, setProspects] = useState<Business[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prospectToEdit, setProspectToEdit] = useState<Business | null>(null);

  // Confirm delete dialog
  const [prospectToDelete, setProspectToDelete] = useState<Business | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open modal if URL query param ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      setProspectToEdit(null);
    }
  }, [searchParams]);

  // Load distinct filters
  useEffect(() => {
    getDistinctFilters().then(({ industries, cities }) => {
      setAvailableIndustries(industries);
      setAvailableCities(cities);
    });
  }, []);

  const loadProspects = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProspects({
        search,
        industry,
        city,
        status,
        page: currentPage,
        pageSize: 15,
      });

      setProspects(result.data);
      setTotalCount(result.count);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error loading prospects:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, industry, city, status, currentPage]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProspects();
  };

  const handleCreateNew = () => {
    setProspectToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prospect: Business) => {
    setProspectToEdit(prospect);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (prospect: Business) => {
    setProspectToDelete(prospect);
  };

  const handleConfirmDelete = async () => {
    if (!prospectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProspect(prospectToDelete.id);
      setProspectToDelete(null);
      loadProspects();
    } catch (err) {
      console.error('Error deleting prospect:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Topbar
        title="Directorio de Prospectos"
        subtitle="Gestión comercial de negocios, datos de contacto y estado comercial"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <span>Prospectos Registrados</span>
            </h2>
            <p className="text-xs text-slate-400">
              Administrá los prospectos capturados antes de iniciar auditorías y propuestas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/prospects/import"
              className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-[#131d33] hover:text-white transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5 text-cyan-400" />
              <span>Importar CSV</span>
            </Link>

            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.01]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo Prospecto</span>
            </button>
          </div>
        </div>

        {/* Main Table */}
        <ProspectsTable
          prospects={prospects}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          search={search}
          industry={industry}
          city={city}
          status={status}
          availableIndustries={availableIndustries}
          availableCities={availableCities}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onIndustryChange={(val) => {
            setIndustry(val);
            setCurrentPage(1);
          }}
          onCityChange={(val) => {
            setCity(val);
            setCurrentPage(1);
          }}
          onStatusChange={(val) => {
            setStatus(val);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          onEdit={handleEdit}
          onDelete={handleDeletePrompt}
          onRefresh={loadProspects}
        />
      </div>

      {/* Modal Alta / Edición */}
      <ProspectModal
        isOpen={isModalOpen}
        prospectToEdit={prospectToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadProspects();
        }}
      />

      {/* Dialog Confirmación Eliminación */}
      <ConfirmDialog
        isOpen={Boolean(prospectToDelete)}
        title="Eliminar Prospecto"
        message={`¿Estás seguro de que deseás eliminar a "${prospectToDelete?.name}"? Se eliminarán también sus contactos, actividades registradas y registros asociados. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Definitivamente"
        isProcessing={isDeleting}
        onCancel={() => setProspectToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default function ProspectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Cargando prospectos...</div>}>
      <ProspectsContent />
    </Suspense>
  );
}
