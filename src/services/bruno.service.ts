import { createClient } from '@/lib/supabase/client';
import {
  Business,
  Audit,
  Contact,
  ClientDemo,
  DemoStatus,
  DemoContent,
  DemoServiceItem,
} from '@/types/database.types';
import { getApprovedReferencesByIndustry } from '@/services/references.service';
import { formatCurrency } from '@/lib/utils';

// Memoria local de respaldo para demos si la tabla aún no fue creada en Supabase remoto
const LOCAL_DEMOS_CACHE: ClientDemo[] = [];

/**
 * Normaliza un texto para generar un slug web seguro
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/**
 * Obtiene negocios elegibles para crearles una demo (prioriza con diagnóstico de Vera o prospectos calificados)
 */
export async function getEligibleBusinessesForDemo(client?: any): Promise<{
  business: Business;
  hasAudit: boolean;
  hasStrategy: boolean;
  recommendedProduct: string;
  hasExistingDemo: boolean;
  existingDemoStatus?: DemoStatus;
}[]> {
  const supabase = client || createClient();

  const { data: businesses, error: bErr } = await supabase
    .from('businesses')
    .select('*, audits(*)')
    .order('created_at', { ascending: false });

  if (bErr || !businesses) {
    return [];
  }

  // Obtener demos existentes para marcar cuáles ya tienen demo
  let existingDemos: { business_id: string; status: DemoStatus }[] = [];
  try {
    const { data: demos } = await supabase
      .from('client_demos')
      .select('business_id, status');
    if (demos) existingDemos = demos;
  } catch {
    existingDemos = LOCAL_DEMOS_CACHE.map((d) => ({
      business_id: d.business_id,
      status: d.status,
    }));
  }

  return businesses.map((b: any) => {
    const audits = Array.isArray(b.audits) ? b.audits : [];
    const latestAudit = audits.length > 0 ? audits[0] : null;
    const strategy = latestAudit?.ai_insights?.vera_strategy;
    const existing = existingDemos.find((d) => d.business_id === b.id);

    return {
      business: b as Business,
      hasAudit: Boolean(latestAudit),
      hasStrategy: Boolean(strategy),
      recommendedProduct: strategy?.recommendedServices?.[0]?.serviceName || 'Landing Express',
      hasExistingDemo: Boolean(existing),
      existingDemoStatus: existing?.status,
    };
  });
}

/**
 * Determina el tema y paleta adecuados según el rubro del negocio
 */
function determineThemeForIndustry(industry: string | null | undefined): {
  primaryColor: 'cyan' | 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber';
  style: 'clean-medical' | 'modern-business' | 'warm-service' | 'minimalist';
} {
  const ind = (industry || '').toLowerCase();
  if (ind.includes('odontol') || ind.includes('dental') || ind.includes('medic') || ind.includes('salud') || ind.includes('doctor')) {
    return { primaryColor: 'cyan', style: 'clean-medical' };
  }
  if (ind.includes('veterinari') || ind.includes('mascot')) {
    return { primaryColor: 'emerald', style: 'warm-service' };
  }
  if (ind.includes('inmobiliari') || ind.includes('propied')) {
    return { primaryColor: 'blue', style: 'modern-business' };
  }
  if (ind.includes('gastronom') || ind.includes('restauran') || ind.includes('cafe')) {
    return { primaryColor: 'amber', style: 'warm-service' };
  }
  if (ind.includes('contab') || ind.includes('abogad') || ind.includes('estudio') || ind.includes('profesional')) {
    return { primaryColor: 'indigo', style: 'minimalist' };
  }
  return { primaryColor: 'blue', style: 'modern-business' };
}

/**
 * Sintetiza servicios realistas o provisionales según el rubro y datos de Lola
 */
function synthesizeServices(
  industry: string | null | undefined,
  lolaCandidate?: any
): { items: DemoServiceItem[]; provisionalFlags: string[] } {
  const detected = Array.isArray(lolaCandidate?.services_detected)
    ? lolaCandidate.services_detected
    : [];

  const provisionalFlags: string[] = [];

  if (detected.length > 0) {
    return {
      items: detected.slice(0, 4).map((s: string) => ({
        title: s,
        description: `Atención personalizada y asesoramiento específico en ${s.toLowerCase()}.`,
        isProvisional: false,
      })),
      provisionalFlags,
    };
  }

  // Si no hay servicios detectados, proveer estructura típica con flag de provisional
  const ind = (industry || '').toLowerCase();
  provisionalFlags.push('Servicios estructurados como propuesta modelo para el rubro (sujetos a confirmación con el profesional).');

  if (ind.includes('odontol') || ind.includes('dental')) {
    return {
      items: [
        {
          title: 'Odontología General y Prevención',
          description: 'Diagnóstico integral, limpiezas y cuidado preventivo para una salud bucal duradera.',
          isProvisional: true,
        },
        {
          title: 'Estética Dental y Blanqueamiento',
          description: 'Tratamientos modernos para mejorar la armonía y luminosidad de tu sonrisa.',
          isProvisional: true,
        },
        {
          title: 'Ortodoncia y Alineación',
          description: 'Corrección de la posición dental con técnicas adaptadas a adultos y jóvenes.',
          isProvisional: true,
        },
        {
          title: 'Implantes y Rehabilitación',
          description: 'Recuperación de piezas dentales con tecnología de alta precisión y confort.',
          isProvisional: true,
        },
      ],
      provisionalFlags,
    };
  }

  if (ind.includes('veterinari')) {
    return {
      items: [
        { title: 'Consultas Clínicas', description: 'Atención médica integral y diagnóstico preventivo para mascotas.', isProvisional: true },
        { title: 'Vacunación y Desparasitación', description: 'Planes sanitarios completos según la edad y raza.', isProvisional: true },
        { title: 'Cirugías y Procedimientos', description: 'Quirófano equipado con monitoreo seguro para procedimientos programados.', isProvisional: true },
        { title: 'Urgencias y Farmacia Veterinaria', description: 'Atención rápida y provisión de medicamentos certificados.', isProvisional: true },
      ],
      provisionalFlags,
    };
  }

  // Genérico profesional
  return {
    items: [
      { title: 'Asesoramiento Personalizado', description: 'Atención directa para entender tus requerimientos y orientarte.', isProvisional: true },
      { title: 'Servicios Profesionales Especializados', description: 'Soluciones técnicas ejecutadas con estándares de calidad y compromiso.', isProvisional: true },
      { title: 'Atención Ágil y Canales Directos', description: 'Coordinación rápida de turnos o reuniones vía WhatsApp y teléfono.', isProvisional: true },
    ],
    provisionalFlags,
  };
}

/**
 * MOTOR DE BRUNO: Genera una demo conceptual completa y personalizada para un negocio
 */
export async function generateDemoForBusiness(
  businessId: string,
  options?: {
    productType?: string;
    customTitle?: string;
    preferredReferenceId?: string;
  },
  client?: any
): Promise<ClientDemo> {
  const supabase = client || createClient();

  // 1. Obtener datos del negocio
  const { data: business, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bErr || !business) {
    throw new Error('Negocio no encontrado en el CRM.');
  }

  // 2. Obtener datos de Lola
  const { data: lolaCandidate } = await supabase
    .from('lola_candidates')
    .select('*')
    .eq('business_id', businessId)
    .limit(1)
    .maybeSingle();

  // 3. Obtener estrategia de Vera
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestAudit = audits && audits.length > 0 ? (audits[0] as Audit) : null;
  const veraStrategy = latestAudit?.ai_insights?.vera_strategy;

  // 4. Obtener referencias de la Biblioteca de Referencias
  let referenceName: string | null = null;
  let referenceId: string | null = null;
  let benchmarkNotice = 'Estructura basada en plantilla profesional genérica de WebPilot AI.';

  try {
    const approvedRefs = await getApprovedReferencesByIndustry(business.industry || '', supabase);
    if (approvedRefs && approvedRefs.length > 0) {
      const ref = approvedRefs[0];
      referenceId = ref.id;
      referenceName = ref.name;
      benchmarkNotice = `Estructura e inspiración visual basada en referencia aprobada: ${ref.name} (${ref.industry}).`;
    }
  } catch (err) {
    console.warn('No se pudieron consultar referencias para la demo de Bruno:', err);
  }

  // 5. Sintetizar servicios y banderas provisionales
  const { items: servicesItems, provisionalFlags } = synthesizeServices(business.industry, lolaCandidate);

  // Teléfono y WhatsApp verificados
  const phone = business.phone ? business.phone.trim() : null;
  const hasPhone = Boolean(phone);
  const whatsappPhone = hasPhone ? phone : null;

  if (!hasPhone) {
    provisionalFlags.push('Teléfono de WhatsApp provisional (se requiere número oficial del cliente para habilitar el botón directo).');
  }

  const city = business.city ? business.city.trim() : null;
  const address = lolaCandidate?.address || business.address || null;
  const locationLabel = [address, city].filter(Boolean).join(', ') || 'Zona de atención comercial';

  const theme = determineThemeForIndustry(business.industry);
  const productType = options?.productType || veraStrategy?.recommendedServices?.[0]?.serviceId || 'landing-express';

  // 6. Construir contenido de la Demo
  const content: DemoContent = {
    businessName: business.name.trim(),
    tagline: `Atención profesional y de confianza en ${city || 'tu zona'}`,
    industry: business.industry || 'Servicios Profesionales',
    subindustry: lolaCandidate?.subindustry || null,
    hero: {
      title: `Cuidamos lo que más te importa con atención profesional`,
      subtitle: `Conocé nuestros tratamientos y servicios en ${city || 'la zona'}. Coordiná tu consulta directamente por WhatsApp.`,
      badgeText: `Propuesta de presencia digital • ${city || 'Atención local'}`,
      ctaPrimary: {
        label: hasPhone ? 'Consultar por WhatsApp' : 'Contactar ahora',
        action: hasPhone ? 'whatsapp' : 'contact_form',
      },
      ctaSecondary: {
        label: 'Ver Especialidades',
        action: '#servicios',
      },
    },
    services: {
      heading: 'Nuestros Tratamientos y Servicios',
      subheading: 'Soluciones integrales pensadas para brindarte la mejor experiencia y resultados.',
      items: servicesItems,
    },
    features: {
      heading: '¿Por qué elegirnos?',
      items: [
        {
          title: 'Atención Personalizada',
          description: 'Escuchamos tus necesidades para ofrecerte el tratamiento o solución adecuada.',
        },
        {
          title: 'Tecnología y Confort',
          description: 'Equipamiento moderno e instalaciones pensadas para que te sientas a gusto.',
        },
        {
          title: 'Puntualidad y Respeto',
          description: 'Compromiso con los horarios coordinados para cuidar tu tiempo.',
        },
      ],
    },
    contact: {
      heading: 'Ubicación y Canales de Contacto',
      phone: phone || 'A coordinar',
      whatsappPhone: whatsappPhone,
      whatsappMessage: `¡Hola! Me comunico a través del sitio web de ${business.name} para solicitar información y disponibilidad de turnos.`,
      email: business.email ? business.email.trim() : null,
      address: address,
      city: city,
      state: business.state_province || null,
      mapQuery: [business.name, address, city].filter(Boolean).join(', '),
      hours: 'Lunes a Viernes de 09:00 a 19:00 hs (Horario a confirmar)',
    },
    theme,
    provisionalFlags,
    benchmarkNotice,
    generatedBy: 'Bruno • Agente de Experiencia y Diseño (WebPilot AI)',
  };

  const title = options?.customTitle || `Demo: ${business.name}`;
  const slug = `${slugify(business.name)}-${Date.now().toString().slice(-6)}`;

  // 7. Persistir en Supabase o memoria
  let savedDemo: ClientDemo;

  try {
    const { data: inserted, error: insertErr } = await supabase
      .from('client_demos')
      .insert([
        {
          business_id: business.id,
          title,
          slug,
          status: 'PENDIENTE_REVISION',
          product_type: productType,
          reference_id: referenceId,
          reference_name: referenceName,
          content,
        },
      ])
      .select('*, business:businesses(*)')
      .single();

    if (insertErr || !inserted) {
      throw insertErr || new Error('No se pudo insertar en client_demos');
    }

    savedDemo = inserted as ClientDemo;
  } catch (err) {
    console.warn('Error guardando demo en Supabase client_demos, utilizando almacenamiento local:', err);
    savedDemo = {
      id: `demo-${Date.now()}`,
      business_id: business.id,
      title,
      slug,
      status: 'PENDIENTE_REVISION',
      product_type: productType,
      reference_id: referenceId,
      reference_name: referenceName,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      business,
    };
    LOCAL_DEMOS_CACHE.unshift(savedDemo);
  }

  return savedDemo;
}

/**
 * Obtiene el listado de demos generadas
 */
export async function getClientDemos(
  filters?: {
    status?: DemoStatus | 'TODOS';
    search?: string;
  },
  client?: any
): Promise<ClientDemo[]> {
  const supabase = client || createClient();

  try {
    let query = supabase
      .from('client_demos')
      .select('*, business:businesses(*)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'TODOS') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (!error && data) {
      let result = data as ClientDemo[];
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.business?.name.toLowerCase().includes(q) ||
            d.business?.city?.toLowerCase().includes(q)
        );
      }
      return result;
    }
  } catch (err) {
    console.warn('Error leyendo client_demos desde Supabase:', err);
  }

  // Fallback memoria
  let list = [...LOCAL_DEMOS_CACHE];
  if (filters?.status && filters.status !== 'TODOS') {
    list = list.filter((d) => d.status === filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.business?.name.toLowerCase().includes(q)
    );
  }
  return list;
}

/**
 * Obtiene una demo por ID o por Slug (para vista previa pública o interna)
 */
export async function getDemoByIdOrSlug(
  idOrSlug: string,
  client?: any
): Promise<ClientDemo | null> {
  const supabase = client || createClient();

  try {
    // Intentar por ID o por Slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const query = supabase
      .from('client_demos')
      .select('*, business:businesses(*)');

    const { data, error } = isUuid
      ? await query.eq('id', idOrSlug).maybeSingle()
      : await query.eq('slug', idOrSlug).maybeSingle();

    if (!error && data) {
      return data as ClientDemo;
    }
  } catch (err) {
    console.warn('Error buscando demo en Supabase:', err);
  }

  // Buscar en cache local
  const found = LOCAL_DEMOS_CACHE.find(
    (d) => d.id === idOrSlug || d.slug === idOrSlug
  );
  return found || null;
}

/**
 * Actualiza el estado de una demo (Aprobar, Rechazar, Marcar como Enviada)
 */
export async function updateDemoStatus(
  id: string,
  newStatus: DemoStatus,
  feedbackNotes?: string,
  client?: any
): Promise<ClientDemo> {
  const supabase = client || createClient();

  try {
    const updatePayload: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (feedbackNotes !== undefined) {
      updatePayload.feedback_notes = feedbackNotes;
    }

    const { data, error } = await supabase
      .from('client_demos')
      .update(updatePayload)
      .eq('id', id)
      .select('*, business:businesses(*)')
      .single();

    if (!error && data) {
      return data as ClientDemo;
    }
  } catch (err) {
    console.warn('Error actualizando estado en Supabase:', err);
  }

  // Fallback cache local
  const item = LOCAL_DEMOS_CACHE.find((d) => d.id === id);
  if (item) {
    item.status = newStatus;
    if (feedbackNotes !== undefined) item.feedback_notes = feedbackNotes;
    item.updated_at = new Date().toISOString();
    return item;
  }

  throw new Error('No se encontró la demo para actualizar');
}

/**
 * Elimina una demo
 */
export async function deleteDemo(id: string, client?: any): Promise<boolean> {
  const supabase = client || createClient();

  try {
    await supabase.from('client_demos').delete().eq('id', id);
  } catch (err) {
    console.warn('Error eliminando demo en Supabase:', err);
  }

  const idx = LOCAL_DEMOS_CACHE.findIndex((d) => d.id === id);
  if (idx !== -1) {
    LOCAL_DEMOS_CACHE.splice(idx, 1);
  }
  return true;
}
