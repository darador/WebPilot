import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  colorScheme?: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber' | 'slate';
  isLoading?: boolean;
}

const COLOR_MAP = {
  cyan: {
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    border: 'hover:border-cyan-500/40',
    highlight: 'text-cyan-400',
  },
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    border: 'hover:border-blue-500/40',
    highlight: 'text-blue-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    border: 'hover:border-purple-500/40',
    highlight: 'text-purple-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    border: 'hover:border-emerald-500/40',
    highlight: 'text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'hover:border-amber-500/40',
    highlight: 'text-amber-400',
  },
  slate: {
    iconBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    border: 'hover:border-slate-500/40',
    highlight: 'text-slate-300',
  },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme = 'cyan',
  isLoading = false,
}: MetricCardProps) {
  const scheme = COLOR_MAP[colorScheme];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-[#1a2336] bg-[#0c1220] p-4 transition-all duration-200 hover:shadow-lg',
        scheme.border
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border transition-transform group-hover:scale-105',
            scheme.iconBg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-24 rounded bg-slate-800/60 animate-pulse" />
        ) : (
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {value}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>{description}</span>
          {trend && (
            <span className={cn('font-medium font-mono', scheme.highlight)}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
