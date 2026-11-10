import { CRMStage, ActivityType } from '@/types/database.types';

export interface StageDefinition {
  id: CRMStage;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
}

export const CRM_STAGES: StageDefinition[] = [
  {
    id: 'NUEVO',
    label: 'Nuevo',
    description: 'Prospectos ingresados pendientes de evaluación',
    color: '#94a3b8',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-700',
  },
  {
    id: 'AUDITADO',
    label: 'Auditado',
    description: 'Con análisis técnico web completado',
    color: '#06b6d4',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-700/50',
  },
  {
    id: 'SELECCIONADO',
    label: 'Seleccionado',
    description: 'Calificado para contacto estratégico',
    color: '#3b82f6',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-700/50',
  },
  {
    id: 'CONTACTADO',
    label: 'Contactado',
    description: 'Primer contacto o propuesta inicial enviada',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-700/50',
  },
  {
    id: 'RESPONDIÓ',
    label: 'Respondió',
    description: 'Respuesta recibida o interés manifestado',
    color: '#ec4899',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-700/50',
  },
  {
    id: 'NEGOCIACIÓN',
    label: 'Negociación',
    description: 'Discusión de propuesta y alcance comercial',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-700/50',
  },
  {
    id: 'GANADO',
    label: 'Ganado',
    description: 'Cliente cerrado y venta confirmada',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-700/50',
  },
  {
    id: 'PERDIDO',
    label: 'Perdido',
    description: 'Declinó o descartado',
    color: '#ef4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    badgeClass: 'bg-red-500/15 text-red-300 border-red-700/50',
  },
];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, { label: string; icon: string }> = {
  CAMBIO_ESTADO: { label: 'Cambio de Estado', icon: 'RefreshCw' },
  LLAMADA: { label: 'Llamada telefónica', icon: 'PhoneCall' },
  EMAIL: { label: 'Email enviado', icon: 'Mail' },
  REUNION: { label: 'Reunión comercial', icon: 'Calendar' },
  NOTA: { label: 'Nota interna', icon: 'FileText' },
  IMPORTACION: { label: 'Importado por CSV', icon: 'UploadCloud' },
};
