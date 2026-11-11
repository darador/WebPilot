import { createClient } from '@/lib/supabase/client';
import { IndustryReference, ReferenceStatus } from '@/types/database.types';

export const STANDARD_INDUSTRIES = [
  'Odontología',
  'Medicina y salud',
  'Veterinarias',
  'Inmobiliarias',
  'Gastronomía',
  'Estudios contables',
  'Servicios profesionales',
  'Comercios',
] as const;

export const INITIAL_APPROVED_REFERENCES: IndustryReference[] = [
  {
    id: 'ref-ana-laura-batalles',
    name: 'Consultorio Odontológico Dra. Ana Laura Batalles',
    industry: 'Odontología',
    subindustry: 'Consultorio odontológico',
    website_url: 'https://draanalaurabatalles.com.ar/',
    city: 'Quilmes',
    country: 'Argentina',
    description:
      'Sitio web profesional de odontología general y estética, con presentación de la profesional, catálogo organizado de tratamientos, canales de contacto y contenido informativo para pacientes.',
    image_url: null,
    strengths: [
      'Presentación profesional.',
      'Información de tratamientos y especialidades.',
      'Presentación de la profesional.',
      'Integración con WhatsApp.',
      'Formulario de contacto.',
      'Ubicación y datos de contacto.',
      'Preguntas frecuentes.',
      'Contenido informativo.',
    ],
    structure: [
      'Hero principal con propuesta de valor y llamada a la acción',
      'Sobre la profesional (trayectoria, vocación y enfoque)',
      'Catálogo de tratamientos y especialidades odontológicas',
      'Instalaciones y aparatología del consultorio',
      'Preguntas frecuentes (FAQs) con resolución de dudas comunes',
      'Ubicación, mapa de Google Maps y horarios de atención',
      'Pie de página institucional con canales de contacto y redes',
    ],
    features: [
      'Botón flotante directo de WhatsApp',
      'Formulario de contacto y solicitud de turnos',
      'Mapa interactivo de Google Maps',
      'Diseño 100% adaptable a teléfonos móviles (responsive)',
      'Acordeón desplegable para preguntas frecuentes',
      'Certificado de seguridad SSL (navegación HTTPS)',
    ],
    design_aspects: [
      'Paleta de colores médicos limpia (blanco, azules y neutros)',
      'Tipografía moderna con jerarquía visual clara',
      'Espaciado generoso que transmite orden, higiene y calidez',
      'Fotografía profesional del consultorio y de la odontóloga',
    ],
    selection_reason:
      'Sitio web profesional que ofrece una buena presentación de la profesional, información organizada de tratamientos, canales de contacto y contenido informativo para pacientes.',
    notes:
      'Referencia benchmark para rubro odontológico y consultorios de salud en Buenos Aires. Modelo de presencia digital sólida sin necesidad de venta.',
    status: 'APROBADA',
    created_at: '2026-11-11T12:00:00Z',
    updated_at: '2026-11-11T12:00:00Z',
  },
];

export interface VeraReferenceComparison {
  hasReference: boolean;
  reference: IndustryReference | null;
  referenceName: string;
  referenceUrl: string;
  industry: string;
  solvedWell: string[];
  observableDifferences: string[];
  commercialImprovements: string[];
  unverifiedAspects: string[];
  benchmarkConclusion: string;
}

/**
 * Normaliza nombres de rubros para matching flexible (ej. "Odontólogos / Consultorios" -> "odontologia")
 */
export function normalizeIndustry(industry: string | null | undefined): string {
  if (!industry) return '';
  return industry
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica si dos rubros coinciden conceptualmente
 */
export function doesIndustryMatch(indA: string, indB: string): boolean {
  const a = normalizeIndustry(indA);
  const b = normalizeIndustry(indB);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;

  // Aliases comunes
  if ((a.includes('odontolog') || a.includes('dental') || a.includes('diente')) &&
      (b.includes('odontolog') || b.includes('dental'))) {
    return true;
  }
  if ((a.includes('salud') || a.includes('medic') || a.includes('doctor') || a.includes('clinica')) &&
      (b.includes('salud') || b.includes('medic'))) {
    return true;
  }
  if ((a.includes('veterinari') || a.includes('mascot')) && b.includes('veterinari')) {
    return true;
  }
  if ((a.includes('inmobiliari') || a.includes('propied')) && b.includes('inmobiliari')) {
    return true;
  }
  if ((a.includes('gastronom') || a.includes('restauran') || a.includes('bar') || a.includes('cafe')) &&
      (b.includes('gastronom') || b.includes('restauran'))) {
    return true;
  }
  if ((a.includes('contab') || a.includes('contador') || a.includes('estudio')) && b.includes('contab')) {
    return true;
  }
  return false;
}

/**
 * Obtiene referencias desde Supabase con fallback a las iniciales
 */
export async function getReferences(
  filters?: {
    industry?: string;
    status?: ReferenceStatus | 'TODOS';
    search?: string;
  },
  client?: any
): Promise<IndustryReference[]> {
  const supabase = client || createClient();

  try {
    let query = supabase
      .from('industry_references')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.industry && filters.industry !== 'TODOS') {
      query = query.eq('industry', filters.industry);
    }

    if (filters?.status && filters.status !== 'TODOS') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    let items: IndustryReference[] = [];

    if (!error && data && data.length > 0) {
      items = data.map((d: any) => ({
        ...d,
        strengths: Array.isArray(d.strengths) ? d.strengths : [],
        structure: Array.isArray(d.structure) ? d.structure : [],
        features: Array.isArray(d.features) ? d.features : [],
        design_aspects: Array.isArray(d.design_aspects) ? d.design_aspects : [],
      }));
    } else {
      // Si la tabla no existe aún o está vacía, usar datos semilla
      items = [...INITIAL_APPROVED_REFERENCES];
      if (filters?.industry && filters.industry !== 'TODOS') {
        items = items.filter((r) => doesIndustryMatch(r.industry, filters.industry!));
      }
      if (filters?.status && filters.status !== 'TODOS') {
        items = items.filter((r) => r.status === filters.status);
      }
    }

    // Filtrar por término de búsqueda
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.industry.toLowerCase().includes(q) ||
          r.website_url.toLowerCase().includes(q) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          r.description.toLowerCase().includes(q)
      );
    }

    return items;
  } catch (err) {
    console.warn('Error querying industry_references from Supabase, using fallback:', err);
    let items = [...INITIAL_APPROVED_REFERENCES];
    if (filters?.industry && filters.industry !== 'TODOS') {
      items = items.filter((r) => doesIndustryMatch(r.industry, filters.industry!));
    }
    if (filters?.status && filters.status !== 'TODOS') {
      items = items.filter((r) => r.status === filters.status);
    }
    return items;
  }
}

/**
 * Obtiene referencias aprobadas para un rubro específico
 */
export async function getApprovedReferencesByIndustry(
  industry: string,
  client?: any
): Promise<IndustryReference[]> {
  const all = await getReferences({ status: 'APROBADA' }, client);
  return all.filter((r) => doesIndustryMatch(r.industry, industry));
}

/**
 * Crea una nueva referencia en la biblioteca
 */
export async function createReference(
  data: Omit<IndustryReference, 'id' | 'created_at' | 'updated_at'>,
  client?: any
): Promise<IndustryReference> {
  const supabase = client || createClient();

  const newRef = {
    ...data,
    strengths: data.strengths || [],
    structure: data.structure || [],
    features: data.features || [],
    design_aspects: data.design_aspects || [],
  };

  const { data: inserted, error } = await supabase
    .from('industry_references')
    .insert([newRef])
    .select('*')
    .single();

  if (error || !inserted) {
    console.error('Error creating reference in Supabase:', error);
    // Fallback local memory return
    return {
      ...newRef,
      id: `ref-local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as IndustryReference;
  }

  return inserted as IndustryReference;
}

/**
 * Actualiza una referencia existente
 */
export async function updateReference(
  id: string,
  data: Partial<IndustryReference>,
  client?: any
): Promise<IndustryReference> {
  const supabase = client || createClient();

  const { data: updated, error } = await supabase
    .from('industry_references')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !updated) {
    throw new Error(error?.message || 'No se pudo actualizar la referencia');
  }

  return updated as IndustryReference;
}

/**
 * Elimina una referencia
 */
export async function deleteReference(id: string, client?: any): Promise<boolean> {
  const supabase = client || createClient();

  const { error } = await supabase
    .from('industry_references')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'No se pudo eliminar la referencia');
  }

  return true;
}

/**
 * Compara objetivamente un negocio auditado con una referencia aprobada del mismo rubro.
 * Sigue la regla fundamental: Diferencias NO implican venta obligatoria.
 */
export function compareBusinessWithReference(
  business: {
    name: string;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
  },
  auditData: {
    score?: number | null;
    hasHttps?: boolean;
    hasViewport?: boolean;
    hasWhatsapp?: boolean;
    hasForms?: boolean;
    responseTimeMs?: number | null;
    title?: string | null;
    description?: string | null;
  } | null,
  reference: IndustryReference | null
): VeraReferenceComparison {
  if (!reference) {
    return {
      hasReference: false,
      reference: null,
      referenceName: '',
      referenceUrl: '',
      industry: '',
      solvedWell: [],
      observableDifferences: [],
      commercialImprovements: [],
      unverifiedAspects: [],
      benchmarkConclusion: 'No hay referencias aprobadas registradas para este rubro aún.',
    };
  }

  const solvedWell: string[] = [];
  const observableDifferences: string[] = [];
  const commercialImprovements: string[] = [];
  const unverifiedAspects: string[] = [];

  const hasWeb = Boolean(business.website && business.website.trim() && !business.website.includes('instagram.com'));
  const hasHttps = Boolean(auditData?.hasHttps);
  const hasViewport = Boolean(auditData?.hasViewport);
  const hasWhatsapp = Boolean(auditData?.hasWhatsapp);
  const hasForms = Boolean(auditData?.hasForms);
  const hasEmail = Boolean(business.email && business.email.trim());
  const hasPhone = Boolean(business.phone && business.phone.trim());

  // 1. Aspectos que el negocio ya resuelve correctamente
  if (hasHttps) solvedWell.push('Certificado SSL activo y navegación segura (HTTPS).');
  if (hasViewport) solvedWell.push('Adaptabilidad responsive para pantallas móviles detectada.');
  if (hasWhatsapp) solvedWell.push('Canal directo a WhatsApp visible para consultas ágiles.');
  if (hasForms) solvedWell.push('Formulario web para recepción de mensajes o consultas.');
  if (hasPhone) solvedWell.push('Número telefónico de contacto informado y visible.');
  if (hasEmail) solvedWell.push('Canal de correo electrónico para comunicaciones formales.');
  if (auditData?.score && auditData.score >= 70) {
    solvedWell.push(`Rendimiento técnico y estructuración adecuada (Score ${auditData.score}/100).`);
  }
  if (solvedWell.length === 0) {
    solvedWell.push('Dispone de ficha comercial registrada y canales tradicionales.');
  }

  // 2. Diferencias observables respecto de la referencia
  if (!hasWeb) {
    observableDifferences.push(`La referencia cuenta con un sitio web independiente completo (${reference.name}), mientras que el negocio actualmente carece de portal web propio.`);
  } else {
    if (!hasWhatsapp) {
      observableDifferences.push(`La referencia ofrece botón flotante directo a WhatsApp en celulares; el negocio no lo tiene habilitado de forma directa.`);
    }
    if (!hasForms) {
      observableDifferences.push(`La referencia cuenta con formulario de consultas estructurado; el negocio no dispone de formulario web visible.`);
    }
    observableDifferences.push(`La referencia presenta catálogo organizado de especialidades/tratamientos y sección detallada de FAQs.`);
    observableDifferences.push(`La referencia incluye bio profesional y presentación del equipo para generar cercanía y confianza previa a la consulta.`);
  }

  // 3. Mejoras que podrían tener valor comercial (orientativo, sin inventar)
  if (!hasWeb) {
    commercialImprovements.push('Incorporar una Landing Express profesional con presentación de servicios, ubicación y WhatsApp directo para igualar el estándar del rubro.');
  } else {
    if (!hasWhatsapp) {
      commercialImprovements.push('Habilitar acceso directo de WhatsApp para agilizar la conversión de pacientes o clientes desde celulares.');
    }
    if (reference.strengths.some((s) => s.toLowerCase().includes('preguntas frecuentes'))) {
      commercialImprovements.push('Incorporar un bloque de Preguntas Frecuentes (FAQs) para resolver objeciones recurrentes de los pacientes.');
    }
    commercialImprovements.push('Estructurar la presentación del equipo profesional y tratamientos con llamadas a la acción claras.');
  }

  // 4. Aspectos que no se pudieron verificar
  unverifiedAspects.push('Sistema interno de gestión o reserva de turnos online.');
  unverifiedAspects.push('Tasa de conversión efectiva entre consultas recibidas y contrataciones.');
  unverifiedAspects.push('Políticas de seguimiento posconsulta y retención de pacientes.');

  // Conclusión orientativa
  let benchmarkConclusion = '';
  if (!hasWeb) {
    benchmarkConclusion = `El negocio se encuentra en clara desventaja frente a referentes del rubro como ${reference.name}, justificando una propuesta de desarrollo inicial.`;
  } else if (solvedWell.length >= 4) {
    benchmarkConclusion = `El negocio cuenta con los pilares esenciales de presencia digital ya resueltos. Las diferencias frente a ${reference.name} son matices de contenido y organización, no emergencias comerciales.`;
  } else {
    benchmarkConclusion = `El negocio cuenta con presencia funcional, aunque existen oportunidades puntuales de optimización en canales directos inspiradas en el estándar de ${reference.name}.`;
  }

  return {
    hasReference: true,
    reference,
    referenceName: reference.name,
    referenceUrl: reference.website_url,
    industry: reference.industry,
    solvedWell,
    observableDifferences,
    commercialImprovements,
    unverifiedAspects,
    benchmarkConclusion,
  };
}
