import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-red-900/40 bg-[#0d1424] p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Acción destructiva</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-300 leading-relaxed">{message}</p>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-lg border border-[#1e2a42] bg-[#111a2f] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#16233f] hover:text-white transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30 disabled:opacity-50"
          >
            {isProcessing ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
