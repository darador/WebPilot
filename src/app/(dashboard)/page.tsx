'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  SearchCode,
  Target,
  Trophy,
  DollarSign,
  UploadCloud,
  KanbanSquare,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { MetricCard } from '@/components/common/MetricCard';
import { EmptyState } from '@/components/common/EmptyState';
import {
  getDashboardMetrics,
  getRecentActivities,
  RecentActivityWithBusiness,
} from '@/services/dashboard.service';
import { DashboardMetrics } from '@/types/database.types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ACTIVITY_TYPE_LABELS } from '@/lib/constants/crm';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProspects: 0,
    newProspects: 0,
    auditedBusinesses: 0,
    qualifiedOpportunities: 0,
    wonClients: 0,
    totalRevenue: 0,
  });

  const [activities, setActivities] = useState<RecentActivityWithBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [m, a] = await Promise.all([
        getDashboardMetrics(),
        getRecentActivities(8),
      ]);
      setMetrics(m);
      setActivities(a);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  return (
    <div>
      <Topbar
        title="Panel General de Control"
        subtitle="Métricas operativas y actividad en tiempo real de la agencia"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Banner de Bienvenida y Estado del Sistema */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#0a1122] to-blue-950/30 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  FASE 1 — FUNDACIÓN DEL SISTEMA
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
                WebPilot AI Agency Operating System
              </h2>
              <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                Plataforma centralizada de prospección comercial, calificación técnica y gestión del ciclo de venta.
                Todos los datos reflejan registros en tiempo real en la base de datos PostgreSQL.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/prospects/import"
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-colors shadow-sm"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Importar CSV</span>
              </Link>

              <Link
                href="/crm"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                <KanbanSquare className="h-4 w-4" />
                <span>Ver CRM Pipeline</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Requerimiento: 6 Métricas reales */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Indicadores Clave de Desempeño (KPIs)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {/* 1. Total de prospectos */}
            <MetricCard
              title="Total Prospectos"
              value={metrics.totalProspects}
              icon={Users}
              description="Registros en base"
              colorScheme="cyan"
              isLoading={isLoading}
            />

            {/* 2. Prospectos nuevos */}
            <MetricCard
              title="Prospectos Nuevos"
              value={metrics.newProspects}
              icon={UserPlus}
              description="Sin contactar aún"
              colorScheme="blue"
              isLoading={isLoading}
            />

            {/* 3. Negocios auditados */}
            <MetricCard
              title="Negocios Auditados"
              value={metrics.auditedBusinesses}
              icon={SearchCode}
              description="Con auditoría técnica"
              colorScheme="purple"
              isLoading={isLoading}
            />

            {/* 4. Oportunidades calificadas */}
            <MetricCard
              title="Oportunidades"
              value={metrics.qualifiedOpportunities}
              icon={Target}
              description="En negociación"
              colorScheme="amber"
              isLoading={isLoading}
            />

            {/* 5. Clientes ganados */}
            <MetricCard
              title="Clientes Ganados"
              value={metrics.wonClients}
              icon={Trophy}
              description="Cierres confirmados"
              colorScheme="emerald"
              isLoading={isLoading}
            />

            {/* 6. Facturación acumulada */}
            <MetricCard
              title="Facturación"
              value={formatCurrency(metrics.totalRevenue)}
              icon={DollarSign}
              description="Monto acumulado ventas"
              colorScheme="emerald"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Sección inferior: Actividad Reciente & Accesos Rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad Reciente (2 cols) */}
          <div className="lg:col-span-2 rounded-xl border border-[#1a2336] bg-[#0c1220] p-5">
            <div className="flex items-center justify-between border-b border-[#182236] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Actividad Comercial Reciente</h3>
              </div>
              <Link
                href="/crm"
                className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
              >
                <span>Ir al Pipeline</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-slate-800/20 animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Sin actividad registrada todavía"
                description="Las actividades se generan automáticamente al cambiar de estado en el CRM o al registrar llamadas, emails y notas."
                actionLabel="Ir a Prospectos"
                actionHref="/prospects"
              />
            ) : (
              <div className="space-y-2.5">
                {activities.map((act) => {
                  const typeMeta = ACTIVITY_TYPE_LABELS[act.type] || {
                    label: act.type,
                    icon: 'FileText',
                  };

                  return (
                    <div
                      key={act.id}
                      className="flex items-start justify-between rounded-lg border border-[#172238] bg-[#080d18] p-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                          {typeMeta.label}
                        </span>

                        <div>
                          {act.business && (
                            <Link
                              href={`/prospects/${act.business.id}`}
                              className="font-semibold text-white hover:text-cyan-300 hover:underline block"
                            >
                              {act.business.name}
                            </Link>
                          )}
                          <p className="text-slate-300 text-xs mt-0.5 leading-snug">
                            {act.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap ml-3">
                        {formatDate(act.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accesos Rápidos y Próximas Fases */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1a2336] bg-[#0c1220] p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Accesos Directos</span>
              </h3>

              <div className="space-y-2 text-xs">
                <Link
                  href="/prospects?action=new"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#172238] bg-[#090e1a] text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all group"
                >
                  <span className="font-medium">Crear prospecto manual</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/prospects/import"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#172238] bg-[#090e1a] text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all group"
                >
                  <span className="font-medium">Importar archivo CSV</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/crm"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#172238] bg-[#090e1a] text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all group"
                >
                  <span className="font-medium">Tablero Kanban CRM</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>

            {/* Roadmap de Preparación para IA */}
            <div className="rounded-xl border border-[#1a2336] bg-[#090e1a] p-5 text-xs">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                Próximas Fases (Preparación)
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  <span>Fase 2: Motor de Auditoría Web y Lighthouse</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  <span>Fase 3: Análisis con IA y Detección de Problemas</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  <span>Fase 4: Generación Automática de Propuestas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
