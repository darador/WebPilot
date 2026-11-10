'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Building2, Globe, Mail, Phone, MapPin, Tag, FileText } from 'lucide-react';
import { prospectSchema, ProspectFormValues } from '@/schemas/prospect';
import { Business, CRMStage } from '@/types/database.types';
import { createProspect, updateProspect } from '@/services/prospects.service';
import { CRM_STAGES } from '@/lib/constants/crm';

interface ProspectModalProps {
  isOpen: boolean;
  prospectToEdit?: Business | null;
  onClose: () => void;
  onSuccess: (savedProspect: Business) => void;
}

export function ProspectModal({
  isOpen,
  prospectToEdit,
  onClose,
  onSuccess,
}: ProspectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(prospectToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      name: '',
      industry: '',
      city: '',
      state_province: '',
      country: 'Argentina',
      website: '',
      phone: '',
      email: '',
      source: 'Manual',
      status: 'NUEVO',
      notes: '',
    },
  });

  useEffect(() => {
    if (prospectToEdit) {
      reset({
        name: prospectToEdit.name,
        industry: prospectToEdit.industry || '',
        city: prospectToEdit.city || '',
        state_province: prospectToEdit.state_province || '',
        country: prospectToEdit.country || 'Argentina',
        website: prospectToEdit.website || '',
        phone: prospectToEdit.phone || '',
        email: prospectToEdit.email || '',
        source: prospectToEdit.source || 'Manual',
        status: prospectToEdit.status,
        notes: prospectToEdit.notes || '',
      });
    } else {
      reset({
        name: '',
        industry: '',
        city: '',
        state_province: '',
        country: 'Argentina',
        website: '',
        phone: '',
        email: '',
        source: 'Manual',
        status: 'NUEVO',
        notes: '',
      });
    }
    setErrorMessage(null);
  }, [prospectToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: ProspectFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let saved: Business;
      if (isEditing && prospectToEdit) {
        saved = await updateProspect(prospectToEdit.id, values);
      } else {
        saved = await createProspect(values);
      }
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      console.error('Error saving prospect:', err);
      setErrorMessage(err.message || 'Error al guardar el negocio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-[#1f2b44] bg-[#0c1220] shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1a2336] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isEditing ? `Editar negocio: ${prospectToEdit?.name}` : 'Agregar negocio'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Actualizá los datos del negocio' : 'Completá la información del negocio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#162035] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Nombre y Rubro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre del Negocio <span className="text-cyan-400">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Ej. Clínica Dental San Martín"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Rubro / Industria
              </label>
              <input
                {...register('industry')}
                placeholder="Ej. Odontología / Salud"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ubicación: Localidad, Provincia, País */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Localidad / Ciudad
              </label>
              <input
                {...register('city')}
                placeholder="Ej. Rosario"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Provincia
              </label>
              <input
                {...register('state_province')}
                placeholder="Ej. Santa Fe"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                País
              </label>
              <input
                {...register('country')}
                placeholder="Argentina"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contacto: Sitio Web, Email, Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sitio Web
              </label>
              <input
                {...register('website')}
                placeholder="https://ejemplo.com"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {errors.website && (
                <p className="mt-1 text-[11px] text-red-400">{errors.website.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                placeholder="contacto@empresa.com"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                {...register('phone')}
                placeholder="+54 9 11 1234-5678"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Estado Comercial y Fuente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estado Comercial
              </label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {CRM_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label} — {stage.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fuente de Información
              </label>
              <input
                {...register('source')}
                placeholder="Ej. Google Maps, LinkedIn, Referido"
                className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observaciones y Notas Iniciales
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Detalles sobre el negocio, tecnologías detectadas, comentarios de prospección..."
              className="w-full rounded-lg border border-[#1e2a42] bg-[#080d17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2336]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#1e2a42] bg-[#101726] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#162238] hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar negocio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
