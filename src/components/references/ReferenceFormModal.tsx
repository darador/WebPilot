'use client';

import { useState, useEffect } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { IndustryReference, ReferenceStatus } from '@/types/database.types';
import { STANDARD_INDUSTRIES } from '@/services/references.service';

interface ReferenceFormModalProps {
  referenceToEdit: IndustryReference | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ReferenceFormModal({
  referenceToEdit,
  isOpen,
  onClose,
  onSaved,
}: ReferenceFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<string>(STANDARD_INDUSTRIES[0]);
  const [subindustry, setSubindustry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [description, setDescription] = useState('');
  const [selectionReason, setSelectionReason] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [structureText, setStructureText] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [designAspectsText, setDesignAspectsText] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ReferenceStatus>('APROBADA');

  useEffect(() => {
    if (referenceToEdit) {
      setName(referenceToEdit.name || '');
      setIndustry(referenceToEdit.industry || STANDARD_INDUSTRIES[0]);
      setSubindustry(referenceToEdit.subindustry || '');
      setWebsiteUrl(referenceToEdit.website_url || '');
      setCity(referenceToEdit.city || '');
      setCountry(referenceToEdit.country || 'Argentina');
      setDescription(referenceToEdit.description || '');
      setSelectionReason(referenceToEdit.selection_reason || '');
      setStrengthsText((referenceToEdit.strengths || []).join('\n'));
      setStructureText((referenceToEdit.structure || []).join('\n'));
      setFeaturesText((referenceToEdit.features || []).join('\n'));
      setDesignAspectsText((referenceToEdit.design_aspects || []).join('\n'));
      setNotes(referenceToEdit.notes || '');
      setStatus(referenceToEdit.status || 'APROBADA');
    } else {
      setName('');
      setIndustry(STANDARD_INDUSTRIES[0]);
      setSubindustry('');
      setWebsiteUrl('');
      setCity('');
      setCountry('Argentina');
      setDescription('');
      setSelectionReason('');
      setStrengthsText('');
      setStructureText('');
      setFeaturesText('');
      setDesignAspectsText('');
      setNotes('');
      setStatus('APROBADA');
    }
    setError(null);
  }, [referenceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !websiteUrl.trim() || !description.trim() || !selectionReason.trim()) {
      setError('Por favor completá los campos obligatorios (Nombre, URL, Descripción y Motivo).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parseLines = (text: string) =>
      text
        .split('\n')
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean);

    const payload = {
      name: name.trim(),
      industry: industry.trim(),
      subindustry: subindustry.trim() || null,
      website_url: websiteUrl.trim(),
      city: city.trim() || null,
      country: country.trim() || 'Argentina',
      description: description.trim(),
      selection_reason: selectionReason.trim(),
      strengths: parseLines(strengthsText),
      structure: parseLines(structureText),
      features: parseLines(featuresText),
      design_aspects: parseLines(designAspectsText),
      notes: notes.trim() || null,
      status,
    };

    try {
      const url = referenceToEdit
        ? `/api/references/${referenceToEdit.id}`
        : '/api/references';
      const method = referenceToEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Ocurrió un error al guardar');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#1a2336] bg-[#0c1220] shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#162035] bg-[#080d18] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              {referenceToEdit ? 'Editar Referencia' : 'Nueva Referencia por Rubro'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1a2336] text-slate-400 hover:bg-[#131d33] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Nombre y Rubro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Nombre del Negocio / Referencia *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Consultorio Dra. Ana Laura Batalles"
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Rubro Principal *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {STANDARD_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
                <option value="Otro">Otro rubro...</option>
              </select>
            </div>
          </div>

          {/* Subrubro y URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Subrubro (Opcional)
              </label>
              <input
                type="text"
                value={subindustry}
                onChange={(e) => setSubindustry(e.target.value)}
                placeholder="Ej. Consultorio odontológico, Estética..."
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                URL del Sitio Web *
              </label>
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Localidad, País y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Localidad / Ciudad
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Quilmes"
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                País
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Argentina"
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Estado de Aprobación *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReferenceStatus)}
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="APROBADA">APROBADA (Visible para Vera y Bruno)</option>
                <option value="PENDIENTE">PENDIENTE de revisión</option>
                <option value="DESCARTADA">DESCARTADA</option>
              </select>
            </div>
          </div>

          {/* Descripción General */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Descripción General *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumen del enfoque del sitio, público objetivo y propuesta..."
              className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Motivo de Selección */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Motivo por el que fue seleccionado como referencia *
            </label>
            <textarea
              required
              rows={2}
              value={selectionReason}
              onChange={(e) => setSelectionReason(e.target.value)}
              placeholder="¿Por qué destaca este sitio frente al promedio del rubro?..."
              className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Puntos Fuertes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Puntos Fuertes Identificados (uno por línea)
            </label>
            <textarea
              rows={3}
              value={strengthsText}
              onChange={(e) => setStrengthsText(e.target.value)}
              placeholder="Presentación profesional&#10;Integración con WhatsApp&#10;Preguntas frecuentes organizadas..."
              className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          {/* Estructura de Páginas y Secciones */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Estructura de Secciones / Arquitectura (una por línea)
            </label>
            <textarea
              rows={3}
              value={structureText}
              onChange={(e) => setStructureText(e.target.value)}
              placeholder="Hero principal con llamada a la acción&#10;Sobre la profesional y equipo&#10;Tratamientos y especialidades&#10;Preguntas frecuentes&#10;Ubicación y mapa..."
              className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          {/* Funcionalidades y Diseño */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Funcionalidades Destacadas (por línea)
              </label>
              <textarea
                rows={3}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="Botón flotante WhatsApp&#10;Formulario de turnos&#10;Mapa interactivo..."
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Criterios de Diseño (por línea)
              </label>
              <textarea
                rows={3}
                value={designAspectsText}
                onChange={(e) => setDesignAspectsText(e.target.value)}
                placeholder="Paleta médica limpia&#10;Tipografía jerarquizada&#10;Espaciado generoso..."
                className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Observaciones Internas */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Observaciones Internas
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas para el equipo..."
              className="w-full rounded-lg border border-[#1c273e] bg-[#070b14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#162035] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#1a2336] bg-[#0c1220] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#131d33] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Referencia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
