'use client';

import Link from 'next/link';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { CsvWizard } from '@/components/csv-importer/CsvWizard';

export default function ImportProspectsPage() {
  return (
    <div>
      <Topbar
        title="Asistente de Importación CSV"
        subtitle="Carga masiva, validación de integridad y prevención de duplicados"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/prospects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al directorio de negocios</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-[#1a2336] bg-[#0c1220] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Importación Segura de Negocios</h2>
              <p className="text-xs text-slate-400">
                Los registros se validan previamente contra la base de datos para no generar duplicados por email o dominio web.
              </p>
            </div>
          </div>

          <CsvWizard />
        </div>
      </div>
    </div>
  );
}
