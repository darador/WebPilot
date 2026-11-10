'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Database,
  Building,
  ShieldAlert,
} from 'lucide-react';
import {
  parseAndValidateCsv,
  importValidRows,
  generateSampleCsv,
} from '@/services/csv-importer.service';
import { ParsedCsvResult, CsvRowData } from '@/schemas/csv-import';

export function CsvWizard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedCsvResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview & Validation, 3: Success

  // Import execution
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'valid' | 'duplicates' | 'invalid'>('valid');

  // Descarga de CSV de ejemplo
  const handleDownloadSample = () => {
    const csvContent = generateSampleCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'webpilot_negocios_ejemplo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manejo de archivo seleccionado
  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setParseError('El archivo debe tener formato .csv');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseError(null);

    try {
      const result = await parseAndValidateCsv(selectedFile);
      setParseResult(result);
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Error parsing CSV:', err);
      setParseError(err.message || 'Error al procesar el archivo CSV');
    } finally {
      setIsParsing(false);
    }
  };

  // Confirmación explícita e importación a Supabase
  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    setIsImporting(true);
    try {
      const { insertedCount } = await importValidRows(parseResult.validRows);
      setImportedCount(insertedCount);
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Error importing to Supabase:', err);
      setParseError(err.message || 'Error al guardar los registros en Supabase');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setParseError(null);
    setImportedCount(null);
    setCurrentStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-[#1a2336] pb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                currentStep >= 1
                  ? 'bg-cyan-500 text-black font-mono'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </span>
            <span
              className={`text-xs font-medium ${
                currentStep >= 1 ? 'text-white' : 'text-slate-500'
              }`}
            >
              Selección de Archivo
            </span>
          </div>

          <span className="text-slate-600">→</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                currentStep >= 2
                  ? 'bg-cyan-500 text-black font-mono'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-medium ${
                currentStep >= 2 ? 'text-white' : 'text-slate-500'
              }`}
            >
              Validación y Previsualización
            </span>
          </div>

          <span className="text-slate-600">→</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 3
                  ? 'bg-emerald-500 text-black font-mono'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </span>
            <span
              className={`text-xs font-medium ${
                currentStep === 3 ? 'text-white' : 'text-slate-500'
              }`}
            >
              Confirmación e Inserción
            </span>
          </div>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a42] bg-[#0c1220] px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-[#131d33] transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Descargar Plantilla CSV</span>
        </button>
      </div>

      {parseError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-xs text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{parseError}</span>
        </div>
      )}

      {/* STEP 1: Upload */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1f2b44] bg-[#090e1a] p-12 text-center hover:border-cyan-500/50 hover:bg-[#0c1424] cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-950">
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-white">
              {isParsing ? 'Analizando estructura del archivo...' : 'Arrastrá tu archivo CSV aquí o hacé clic para explorar'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-md">
              Detecta automáticamente columnas como Nombre, Rubro, Localidad, Sitio Web, Teléfono, Email y Observaciones.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#141e33] border border-[#202e4d] px-3.5 py-1.5 text-xs text-slate-300 group-hover:text-cyan-300">
              <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
              <span>Soporta archivos .CSV con codificación UTF-8</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Preview, Duplicate Check & Validation */}
      {currentStep === 2 && parseResult && (
        <div className="space-y-5">
          {/* Summary Badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-3.5">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total en Archivo</span>
              <div className="mt-1 text-xl font-bold font-mono text-white">
                {parseResult.totalRows}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 uppercase font-semibold">Listos para Importar</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-300">
                {parseResult.validRows.length}
              </div>
            </div>

            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-400 uppercase font-semibold">Duplicados Omitidos</span>
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-amber-300">
                {parseResult.duplicateRows.length}
              </div>
            </div>

            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-red-400 uppercase font-semibold">Filas con Error</span>
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div className="mt-1 text-xl font-bold font-mono text-red-300">
                {parseResult.invalidRows.length}
              </div>
            </div>
          </div>

          {/* Navigation Tabs between Valid, Duplicates, and Invalids */}
          <div className="flex border-b border-[#1a2336]">
            <button
              onClick={() => setActiveTab('valid')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'valid'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Registros Válidos ({parseResult.validRows.length})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'duplicates'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Duplicados Detectados ({parseResult.duplicateRows.length})
            </button>
            <button
              onClick={() => setActiveTab('invalid')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'invalid'
                  ? 'border-red-400 text-red-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Errores de Estructura ({parseResult.invalidRows.length})
            </button>
          </div>

          {/* Table Content */}
          <div className="max-h-96 overflow-y-auto rounded-xl border border-[#1a2336] bg-[#0c1220]">
            {activeTab === 'valid' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080d18] text-[10px] uppercase font-semibold text-slate-400 sticky top-0 border-b border-[#1a2336]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Rubro</th>
                    <th className="py-2.5 px-3">Localidad</th>
                    <th className="py-2.5 px-3">Sitio Web</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162035]">
                  {parseResult.validRows.slice(0, 100).map((r, i) => (
                    <tr key={i} className="hover:bg-[#11192b]">
                      <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">{i + 1}</td>
                      <td className="py-2 px-3 font-medium text-white">{r.name}</td>
                      <td className="py-2 px-3 text-slate-300">{r.industry || '-'}</td>
                      <td className="py-2 px-3 text-slate-300">{r.city || '-'}</td>
                      <td className="py-2 px-3 text-cyan-400 font-mono text-[11px] truncate max-w-[150px]">
                        {r.website || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                        {r.email || '-'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'duplicates' && (
              <div className="p-4 space-y-2">
                {parseResult.duplicateRows.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No se encontraron duplicados por email ni por dominio web.
                  </p>
                ) : (
                  parseResult.duplicateRows.map((dup, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-amber-900/40 bg-amber-950/20 px-3.5 py-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">Fila {dup.row}: {dup.data.name}</span>
                        <p className="text-[11px] text-amber-300 mt-0.5">{dup.duplicateReason}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/50 text-amber-200">
                        Omitido
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'invalid' && (
              <div className="p-4 space-y-2">
                {parseResult.invalidRows.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Todas las filas tienen los campos obligatorios válidos.
                  </p>
                ) : (
                  parseResult.invalidRows.map((inv, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-red-900/40 bg-red-950/20 px-3.5 py-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">Fila {inv.row}</span>
                        <p className="text-[11px] text-red-300 mt-0.5">{inv.errors.join(', ')}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/50 text-red-200">
                        Inválido
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-[#1a2336] pt-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a42] bg-[#101726] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#162238] hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Subir otro archivo</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Se importarán únicamente los{' '}
                <strong className="text-emerald-400 font-mono">
                  {parseResult.validRows.length}
                </strong>{' '}
                registros válidos
              </span>

              <button
                onClick={handleConfirmImport}
                disabled={isImporting || parseResult.validRows.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
              >
                <Database className="h-3.5 w-3.5" />
                <span>
                  {isImporting ? 'Guardando en Supabase...' : 'Confirmar Importación'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Success Screen */}
      {currentStep === 3 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/40 bg-emerald-950/15 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-950/50">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-base font-bold text-white">
            ¡Importación completada con éxito!
          </h3>
          <p className="mt-1 text-xs text-slate-300 max-w-md">
            Se insertaron <strong className="text-emerald-400 font-mono">{importedCount}</strong> negocios
            en Supabase y se registró la trazabilidad de la actividad comercial.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg border border-[#1e2a42] bg-[#0c1220] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#131d33] transition-colors"
            >
              Importar más registros
            </button>
            <button
              onClick={() => router.push('/prospects')}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <span>Ver listado de negocios</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
