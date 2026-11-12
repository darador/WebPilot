'use client';

import React from 'react';
import { Eye, ShieldAlert } from 'lucide-react';
import { useUserRole } from '@/lib/auth/useUserRole';

interface DemoBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function DemoBadge({ variant = 'compact', className = '' }: DemoBadgeProps) {
  const { isDemo, isLoading } = useUserRole();

  if (isLoading || !isDemo) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm animate-in fade-in duration-150 ${className}`}
        title="Estás conectado con una cuenta de demostración (Solo Lectura)"
      >
        <Eye className="h-3 w-3 text-amber-400 shrink-0" />
        <span>MODO DEMOSTRACIÓN — SOLO LECTURA</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-150 ${className}`}
    >
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold block tracking-tight">MODO DEMOSTRACIÓN — SOLO LECTURA</span>
          <span className="text-[11px] text-amber-300/80">
            Podés explorar todos los módulos y resultados. Las acciones operativas y de edición están deshabilitadas.
          </span>
        </div>
      </div>
    </div>
  );
}
