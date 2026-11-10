import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1f2b42] bg-[#0a0f1d]/50 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{description}</p>

      {actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
