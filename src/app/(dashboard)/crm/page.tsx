'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { KanbanSquare, Plus, RefreshCw, UploadCloud } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { ProspectModal } from '@/components/prospects/ProspectModal';
import { getPipelineData } from '@/services/crm.service';
import { Business, CRMStage } from '@/types/database.types';

export default function CrmPage() {
  const [pipeline, setPipeline] = useState<Record<CRMStage, Business[]>>({
    NUEVO: [],
    AUDITADO: [],
    SELECCIONADO: [],
    CONTACTADO: [],
    RESPONDIÓ: [],
    NEGOCIACIÓN: [],
    GANADO: [],
    PERDIDO: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const loadPipeline = useCallback(async () => {
    try {
      const data = await getPipelineData();
      setPipeline(data);
    } catch (err) {
      console.error('Error loading CRM pipeline:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPipeline();
  };

  const totalInPipeline = Object.values(pipeline).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <div>
      <Topbar
        title="CRM Pipeline Comercial"
        subtitle={`Tablero de control interactivo (${totalInPipeline} negocios en ciclo activo)`}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-4">
        {/* Subheader Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Desplazá negocios entre etapas o registrá llamadas y notas directamente desde cada tarjeta.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/prospects/import"
              className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#131d33] hover:text-white transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5 text-cyan-400" />
              <span>Importar CSV</span>
            </Link>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar negocio</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Board */}
        <KanbanBoard
          pipeline={pipeline}
          isLoading={isLoading}
          onRefresh={loadPipeline}
        />
      </div>

      {/* Modal Nuevo Prospecto */}
      <ProspectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => {
          loadPipeline();
        }}
      />
    </div>
  );
}
