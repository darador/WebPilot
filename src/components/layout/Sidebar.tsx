'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  KanbanSquare,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bot,
  Search,
  SearchCode,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Lola — Prospección',
    href: '/agents/lola',
    icon: Sparkles,
    badge: 'Agente',
  },
  {
    label: 'Tito — Auditoría',
    href: '/agents/tito',
    icon: SearchCode,
    badge: 'Agente',
  },
  {
    label: 'Nuestro equipo',
    href: '/team',
    icon: Bot,
    badge: '6 IA',
  },
  {
    label: 'Negocios',
    href: '/prospects',
    icon: Users,
    badge: null,
  },
  {
    label: 'Importar CSV',
    href: '/prospects/import',
    icon: UploadCloud,
    badge: 'Lotes',
  },
  {
    label: 'CRM Pipeline',
    href: '/crm',
    icon: KanbanSquare,
    badge: '8 etapas',
  },
  {
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#1a2336] bg-[#090e1a]/95 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#1a2336] px-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">WebPilot</span>
              <span className="text-cyan-400 font-black text-xs tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Agency Automation Engine</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Plataforma Interna
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-[#121a2c] hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-mono',
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-[#162137] text-slate-300 border border-slate-700/60'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Session */}
      <div className="border-t border-[#1a2336] p-3 space-y-2 bg-[#070b14]">
        <div className="flex items-center gap-3 rounded-lg px-2.5 py-2 bg-[#0d1424] border border-[#1a253d]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-bold">
            {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'WP'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {userEmail || 'Operador WebPilot'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sesión activa</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-red-950/30 hover:text-red-300 border border-transparent hover:border-red-900/40 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
