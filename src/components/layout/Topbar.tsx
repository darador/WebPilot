'use client';

import Link from 'next/link';
import { Plus, Database, Sparkles, RefreshCw } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Topbar({ title, subtitle, onRefresh, isRefreshing }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1a2336] bg-[#070b12]/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
          {title || 'WebPilot AI Control Center'}
        </h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#1a2336] bg-[#0d1424] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#152037] hover:text-white transition-colors disabled:opacity-50"
            title="Refrescar datos"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Actualizar</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-2.5 py-1 text-xs text-emerald-400">
          <Database className="h-3 w-3" />
          <span className="font-mono text-[11px]">PostgreSQL RLS Activo</span>
        </div>

        <Link
          href="/prospects?action=new"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Agregar negocio</span>
        </Link>
      </div>
    </header>
  );
}
