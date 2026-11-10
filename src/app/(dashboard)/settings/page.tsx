'use client';

import { useState } from 'react';
import { Settings, Database, ShieldCheck, Key, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'No configurada';
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
  );

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase/migrations/20261110000001_initial_schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Topbar
        title="Configuración de Plataforma"
        subtitle="Estado de servicios internos, base de datos y variables de entorno"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Supabase Status Card */}
        <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#172238] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Conexión Supabase PostgreSQL</h2>
                <p className="text-xs text-slate-400">Gestión de datos transaccionales y autenticación SSR</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
                isConfigured
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isConfigured ? 'Conectado a Producción' : 'Credenciales Pendientes en .env'}
            </span>
          </div>

          <div className="mt-5 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-[#080d18] p-3 border border-[#172238]">
              <span className="text-slate-400">URL del Proyecto:</span>
              <span className="font-mono text-cyan-300">{supabaseUrl}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#080d18] p-3 border border-[#172238]">
              <span className="text-slate-400">Políticas de Seguridad:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                Row Level Security (RLS) habilitado en 9 tablas
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#080d18] p-3 border border-[#172238]">
              <span className="text-slate-400">Script de Migración SQL:</span>
              <button
                onClick={handleCopySchemaPath}
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40 transition-colors"
              >
                <Copy className="h-3 w-3" />
                <span>{copied ? '¡Copiado!' : 'Copiar ruta de migración'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tablas de Base de Datos */}
        <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-2">Esquema Relacional Inicial</h3>
          <p className="text-xs text-slate-400 mb-4">
            Estructura creada para la Fase 1 con preparación para auditorías e IA:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { name: 'businesses', desc: 'Prospectos y clientes comerciales' },
              { name: 'contacts', desc: 'Personas de contacto por negocio' },
              { name: 'audits', desc: 'Auditorías técnicas web' },
              { name: 'audit_issues', desc: 'Problemas individuales detectados' },
              { name: 'opportunities', desc: 'Negociaciones y valor estimado' },
              { name: 'proposals', desc: 'Propuestas comerciales' },
              { name: 'sales', desc: 'Ventas y facturación cerrada' },
              { name: 'projects', desc: 'Sitios web en desarrollo' },
              { name: 'activities', desc: 'Auditoría y trazabilidad comercial' },
            ].map((tbl) => (
              <div
                key={tbl.name}
                className="rounded-lg border border-[#172238] bg-[#080d18] p-2.5"
              >
                <span className="font-mono font-bold text-cyan-400 text-xs block">
                  {tbl.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {tbl.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
