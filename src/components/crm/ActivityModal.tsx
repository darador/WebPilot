'use client';

import { useState } from 'react';
import { X, Save, PhoneCall, Mail, Calendar, FileText } from 'lucide-react';
import { ActivityType } from '@/types/database.types';
import { logActivity } from '@/services/crm.service';

interface ActivityModalProps {
  isOpen: boolean;
  businessId: string;
  businessName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTIVITY_TYPES: { id: ActivityType; label: string; icon: any }[] = [
  { id: 'LLAMADA', label: 'Llamada', icon: PhoneCall },
  { id: 'EMAIL', label: 'Email', icon: Mail },
  { id: 'REUNION', label: 'Reunión', icon: Calendar },
  { id: 'NOTA', label: 'Nota', icon: FileText },
];

export function ActivityModal({
  isOpen,
  businessId,
  businessName,
  onClose,
  onSuccess,
}: ActivityModalProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('LLAMADA');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor ingresá un detalle de la actividad.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await logActivity(businessId, selectedType, description.trim());
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error logging activity:', err);
      setError(err.message || 'Error al registrar la actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1f2b44] bg-[#0c1220] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1a2336] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Registrar Actividad Comercial</h3>
            <p className="text-xs text-cyan-400 mt-0.5">{businessName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tipo de Actividad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITY_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm'
                        : 'border-[#1a253c] bg-[#080d17] text-slate-400 hover:bg-[#121929] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Detalle y Conclusiones
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Ej. Se llamó al dueño, comentó que está interesado en renovar su sitio web porque no se adapta a celulares. Acordamos llamada el viernes."
              className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-[#1a2336] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#1e2a42] bg-[#101726] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#162238] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Actividad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
