import { createClient } from '@/lib/supabase/client';
import { Business, Audit, Contact, Activity, CRMStage, DemoStatus } from '@/types/database.types';
import { VeraCommercialStrategy } from '@/services/vera.service';
import { formatCurrency, formatDate } from '@/lib/utils';

export type ContactOutcome =
  | 'SIN_RESPUESTA'
  | 'INTERESADO'
  | 'SOLICITA_INFO'
  | 'SOLICITA_PRESUPUESTO'
  | 'NEGOCIACION'
  | 'NO_INTERESADO'
  | 'GANADO'
  | 'PERDIDO';

export type OutreachChannel = 'WHATSAPP' | 'EMAIL' | 'LLAMADA' | 'REUNION' | 'REDES' | 'OTRO';

export type MessageSituation =
  | 'SIN_WEB'
  | 'FALLAS_TITO'
  | 'REDISENO'
  | 'EXPLORATORIO'
  | 'SEGUIMIENTO';

export interface CataFollowUpData {
  followUpDate: string | null; // Formato YYYY-MM-DD
  nextAction: string | null;
  status: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
  lastContactDate?: string;
  lastChannel?: OutreachChannel;
  lastOutcome?: ContactOutcome;
  lastSummary?: string;
  contactCount?: number;
  updatedAt?: string;
}

export interface CataOpportunity {
  id: string;
  business: Business;
  primaryContact: Contact | null;
  audit: Audit | null;
  veraStrategy: VeraCommercialStrategy | null;
  recommendedService: string;
  suggestedPriceARS: number;
  suggestedPriceUSD: number;
  monthlyMaintenanceARS: number;
  monthlyMaintenanceUSD: number;
  firstYearTotalARS: number;
  firstYearTotalUSD: number;
  commitmentMonths: number;
  opportunityReason: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  commercialStage: CRMStage;
  lastActivity: Activity | null;
  cataSales: CataFollowUpData | null;
  demo?: {
    id: string;
    slug: string;
    status: DemoStatus;
    title: string;
    previewUrl: string;
  } | null;
  followUp: {
    date: string;
    nextAction: string;
    isOverdue: boolean;
    isToday: boolean;
    daysDiff: number; // negativo = vencido, 0 = hoy, positivo = futuro
  } | null;
}

export interface CataMetrics {
  totalOpportunities: number;
  pendingContact: number;
  contacted: number;
  responded: number;
  negotiation: number;
  won: number;
  lost: number;
  followUpsTotal: number;
  followUpsToday: number;
  followUpsOverdue: number;
  followUpsUpcoming: number;
}

export interface CataMessageDraft {
  situation: MessageSituation;
  situationLabel: string;
  situationDescription: string;
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
}

export const OUTCOME_LABELS: Record<ContactOutcome, { label: string; stageSuggestion: CRMStage; color: string }> = {
  SIN_RESPUESTA: { label: 'Sin respuesta', stageSuggestion: 'CONTACTADO', color: 'text-slate-400 bg-slate-900/60 border-slate-700' },
  INTERESADO: { label: 'Interesado', stageSuggestion: 'RESPONDIÓ', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-800' },
  SOLICITA_INFO: { label: 'Solicita información', stageSuggestion: 'RESPONDIÓ', color: 'text-blue-300 bg-blue-950/60 border-blue-800' },
  SOLICITA_PRESUPUESTO: { label: 'Solicita presupuesto', stageSuggestion: 'RESPONDIÓ', color: 'text-purple-300 bg-purple-950/60 border-purple-800' },
  NEGOCIACION: { label: 'En negociación', stageSuggestion: 'NEGOCIACIÓN', color: 'text-amber-300 bg-amber-950/60 border-amber-800' },
  NO_INTERESADO: { label: 'No interesado', stageSuggestion: 'PERDIDO', color: 'text-rose-400 bg-rose-950/60 border-rose-900' },
  GANADO: { label: 'Cliente ganado (Cierre)', stageSuggestion: 'GANADO', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800' },
  PERDIDO: { label: 'Cliente perdido / Descartado', stageSuggestion: 'PERDIDO', color: 'text-red-400 bg-red-950/60 border-red-900' },
};

export const CHANNEL_LABELS: Record<OutreachChannel, { label: string; icon: string }> = {
  WHATSAPP: { label: 'WhatsApp', icon: 'MessageCircle' },
  EMAIL: { label: 'Correo Electrónico', icon: 'Mail' },
  LLAMADA: { label: 'Llamada Telefónica', icon: 'PhoneCall' },
  REUNION: { label: 'Reunión Presencial / Virtual', icon: 'Calendar' },
  REDES: { label: 'Instagram / Redes Sociales', icon: 'Share2' },
  OTRO: { label: 'Otro canal', icon: 'HelpCircle' },
};

/**
 * Obtiene todas las oportunidades comerciales para Cata con datos consolidados de Lola, Tito y Vera.
 */
export async function getCataOpportunities(
  supabaseClient?: any,
  filters?: {
    status?: string;
    city?: string;
    industry?: string;
    followUpFilter?: string; // 'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NONE'
    search?: string;
  }
): Promise<{ opportunities: CataOpportunity[]; metrics: CataMetrics }> {
  const supabase = supabaseClient || createClient();

  // 1. Obtener todos los negocios
  let query = supabase.from('businesses').select('*').order('updated_at', { ascending: false });

  if (filters?.industry) {
    query = query.eq('industry', filters.industry);
  }
  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  if (filters?.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status as CRMStage);
  }

  const { data: businessesData, error: bErr } = await query;
  if (bErr || !businessesData) {
    console.error('Error fetching businesses for Cata:', bErr);
    return { opportunities: [], metrics: getEmptyMetrics() };
  }

  const businesses = businessesData as Business[];
  const businessIds = businesses.map((b) => b.id);

  if (businessIds.length === 0) {
    return { opportunities: [], metrics: getEmptyMetrics() };
  }

  // 2. Obtener auditorías (contienen diagnósticos de Tito y Vera en ai_insights)
  const { data: auditsData } = await supabase
    .from('audits')
    .select('*')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false });

  const auditsByBusiness = new Map<string, Audit>();
  (auditsData as Audit[] | null)?.forEach((audit) => {
    if (!auditsByBusiness.has(audit.business_id)) {
      auditsByBusiness.set(audit.business_id, audit);
    }
  });

  // 3. Obtener contactos primarios
  const { data: contactsData } = await supabase
    .from('contacts')
    .select('*')
    .in('business_id', businessIds)
    .eq('is_primary', true);

  const contactsByBusiness = new Map<string, Contact>();
  (contactsData as Contact[] | null)?.forEach((contact) => {
    contactsByBusiness.set(contact.business_id, contact);
  });

  // 4. Obtener última actividad registrada para cada negocio
  const { data: activitiesData } = await supabase
    .from('activities')
    .select('*')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false });

  const latestActivityByBusiness = new Map<string, Activity>();
  (activitiesData as Activity[] | null)?.forEach((act) => {
    if (!latestActivityByBusiness.has(act.business_id)) {
      latestActivityByBusiness.set(act.business_id, act);
    }
  });

  // 4.5. Obtener demos asociadas generadas por Bruno
  const demosByBusiness = new Map<string, any>();
  try {
    const { data: demosData } = await supabase
      .from('client_demos')
      .select('id, business_id, title, slug, status')
      .in('business_id', businessIds);

    (demosData || []).forEach((demo: any) => {
      const current = demosByBusiness.get(demo.business_id);
      if (!current || demo.status === 'APROBADA') {
        demosByBusiness.set(demo.business_id, {
          id: demo.id,
          slug: demo.slug,
          status: demo.status,
          title: demo.title,
          previewUrl: `/demo/${demo.slug}`,
        });
      }
    });
  } catch (err) {
    console.warn('client_demos no disponible en getCataOpportunities:', err);
  }

  // Fecha de hoy en formato YYYY-MM-DD (hora local)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr);

  // 5. Mapear oportunidades
  const opportunities: CataOpportunity[] = businesses.map((business) => {
    const audit = auditsByBusiness.get(business.id) || null;
    const veraStrategy = (audit?.ai_insights?.vera_strategy as VeraCommercialStrategy) || null;
    const cataSales = (audit?.ai_insights?.cata_sales as CataFollowUpData) || null;
    const primaryContact = contactsByBusiness.get(business.id) || null;
    const lastActivity = latestActivityByBusiness.get(business.id) || null;

    const outcome = veraStrategy?.commercialOutcome;
    const isNoOpportunity =
      outcome === 'BUENA_PRESENCIA' ||
      veraStrategy?.actionRecommendation === 'NO_OFRECER' ||
      Boolean(veraStrategy?.markedAsNoOpportunity);
    const isNeedsReview =
      outcome === 'INFORMACION_INSUFICIENTE' ||
      veraStrategy?.actionRecommendation === 'REVISION_HUMANA';

    // Calcular servicio, precio de desarrollo y mantenimiento mensual
    let recommendedService = '';
    let suggestedPriceARS = 0;
    let suggestedPriceUSD = 0;
    let monthlyMaintenanceARS = 0;
    let monthlyMaintenanceUSD = 0;
    let firstYearTotalARS = 0;
    let firstYearTotalUSD = 0;
    let commitmentMonths = 0;
    let opportunityReason = '';
    let priority: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA';

    if (isNoOpportunity) {
      recommendedService = 'Sin propuesta (Presencia sólida)';
      suggestedPriceARS = 0;
      suggestedPriceUSD = 0;
      monthlyMaintenanceARS = 0;
      monthlyMaintenanceUSD = 0;
      firstYearTotalARS = 0;
      firstYearTotalUSD = 0;
      commitmentMonths = 0;
      opportunityReason = 'Presencia digital sólida y funcional. Vera concluye no ofrecer servicios actualmente.';
      priority = 'BAJA';
    } else if (isNeedsReview) {
      recommendedService = 'Revisión humana requerida';
      suggestedPriceARS = 0;
      suggestedPriceUSD = 0;
      monthlyMaintenanceARS = 0;
      monthlyMaintenanceUSD = 0;
      firstYearTotalARS = 0;
      firstYearTotalUSD = 0;
      commitmentMonths = 0;
      opportunityReason = 'Auditoría no concluyente o error de conexión. Requiere verificación manual antes de contactar.';
      priority = 'BAJA';
    } else {
      recommendedService =
        veraStrategy?.recommendedServices?.[0]?.serviceName ||
        (!business.website ? 'Landing Express' : 'Optimización Web y Conversión');

      suggestedPriceARS =
        veraStrategy?.suggestedPricing?.bundleFinalARS ||
        veraStrategy?.recommendedServices?.[0]?.suggestedPriceARS ||
        (!business.website ? 69000 : 59000);

      suggestedPriceUSD =
        veraStrategy?.suggestedPricing?.bundleFinalUSD ||
        veraStrategy?.recommendedServices?.[0]?.suggestedPriceUSD ||
        (!business.website ? 60 : 50);

      monthlyMaintenanceARS =
        veraStrategy?.suggestedPricing?.monthlyMaintenanceARS ||
        (!business.website ? 19000 : 0);

      monthlyMaintenanceUSD =
        veraStrategy?.suggestedPricing?.monthlyMaintenanceUSD ||
        (!business.website ? 16 : 0);

      commitmentMonths = veraStrategy?.suggestedPricing?.commitmentMonths || (monthlyMaintenanceARS > 0 ? 12 : 0);
      firstYearTotalARS =
        veraStrategy?.suggestedPricing?.firstYearTotalARS ||
        (suggestedPriceARS + monthlyMaintenanceARS * commitmentMonths);

      firstYearTotalUSD =
        veraStrategy?.suggestedPricing?.firstYearTotalUSD ||
        (suggestedPriceUSD + monthlyMaintenanceUSD * commitmentMonths);

      opportunityReason =
        veraStrategy?.summary ||
        veraStrategy?.opportunities?.[0]?.commercialImpact ||
        (!business.website
          ? 'Negocio sin sitio web oficial: oportunidad para implementar Landing Express ($69.000 + $19.000/mes) y captar turnos por WhatsApp.'
          : 'Sitio web con oportunidades técnicas de velocidad y conversión móvil.');

      if (!business.website || veraStrategy?.opportunities?.some((o) => o.severity === 'CRITICO' || o.severity === 'ALTO')) {
        priority = 'ALTA';
      } else if (business.status === 'NEGOCIACIÓN' || business.status === 'RESPONDIÓ') {
        priority = 'ALTA';
      } else if (business.status === 'PERDIDO') {
        priority = 'BAJA';
      }
    }

    // Calcular seguimiento
    let followUp = null;
    if (cataSales?.followUpDate && cataSales.status === 'PENDIENTE') {
      const fDate = new Date(cataSales.followUpDate);
      const diffTime = fDate.getTime() - todayDate.getTime();
      const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

      followUp = {
        date: cataSales.followUpDate,
        nextAction: cataSales.nextAction || 'Seguimiento comercial de rutina',
        isOverdue: daysDiff < 0,
        isToday: daysDiff === 0,
        daysDiff,
      };
    }

    const demo = demosByBusiness.get(business.id) || null;

    return {
      id: business.id,
      business,
      primaryContact,
      audit,
      veraStrategy,
      recommendedService,
      suggestedPriceARS,
      suggestedPriceUSD,
      monthlyMaintenanceARS,
      monthlyMaintenanceUSD,
      firstYearTotalARS,
      firstYearTotalUSD,
      commitmentMonths,
      opportunityReason,
      priority,
      commercialStage: business.status,
      lastActivity,
      cataSales,
      followUp,
      demo,
    };
  });

  // 6. Calcular métricas
  const metrics: CataMetrics = {
    totalOpportunities: opportunities.length,
    pendingContact: opportunities.filter((o) =>
      ['NUEVO', 'AUDITADO', 'SELECCIONADO'].includes(o.commercialStage)
    ).length,
    contacted: opportunities.filter((o) => o.commercialStage === 'CONTACTADO').length,
    responded: opportunities.filter((o) => o.commercialStage === 'RESPONDIÓ').length,
    negotiation: opportunities.filter((o) => o.commercialStage === 'NEGOCIACIÓN').length,
    won: opportunities.filter((o) => o.commercialStage === 'GANADO').length,
    lost: opportunities.filter((o) => o.commercialStage === 'PERDIDO').length,
    followUpsTotal: opportunities.filter((o) => o.followUp !== null).length,
    followUpsToday: opportunities.filter((o) => o.followUp?.isToday).length,
    followUpsOverdue: opportunities.filter((o) => o.followUp?.isOverdue).length,
    followUpsUpcoming: opportunities.filter((o) => (o.followUp?.daysDiff || 0) > 0).length,
  };

  // 7. Filtrado en memoria para búsquedas y seguimientos
  let filtered = opportunities;

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.business.name.toLowerCase().includes(q) ||
        o.business.city?.toLowerCase().includes(q) ||
        o.business.phone?.toLowerCase().includes(q) ||
        o.business.email?.toLowerCase().includes(q) ||
        o.recommendedService.toLowerCase().includes(q)
    );
  }

  if (filters?.followUpFilter && filters.followUpFilter !== 'ALL') {
    if (filters.followUpFilter === 'OVERDUE') {
      filtered = filtered.filter((o) => o.followUp?.isOverdue);
    } else if (filters.followUpFilter === 'TODAY') {
      filtered = filtered.filter((o) => o.followUp?.isToday);
    } else if (filters.followUpFilter === 'UPCOMING') {
      filtered = filtered.filter((o) => (o.followUp?.daysDiff || 0) > 0);
    } else if (filters.followUpFilter === 'NONE') {
      filtered = filtered.filter((o) => !o.followUp);
    }
  }

  return { opportunities: filtered, metrics };
}

function getEmptyMetrics(): CataMetrics {
  return {
    totalOpportunities: 0,
    pendingContact: 0,
    contacted: 0,
    responded: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
    followUpsTotal: 0,
    followUpsToday: 0,
    followUpsOverdue: 0,
    followUpsUpcoming: 0,
  };
}

/**
 * Genera mensajes comerciales personalizados de Cata para WhatsApp y Correo Electrónico
 * cubriendo las 5 situaciones solicitadas.
 */
export function generateCataMessages(
  business: Business,
  veraStrategy: VeraCommercialStrategy | null,
  audit?: Audit | null,
  demo?: { slug: string; status: DemoStatus; previewUrl: string } | null
): Record<MessageSituation, CataMessageDraft> {
  const name = business.name.trim();
  const city = business.city ? ` de ${business.city}` : '';
  const devPrice =
    veraStrategy?.suggestedPricing?.bundleFinalARS ||
    (!business.website ? 69000 : 59000);
  const monthlyPrice =
    veraStrategy?.suggestedPricing?.monthlyMaintenanceARS ||
    (!business.website ? 19000 : 19000);
  const commitmentMonths = veraStrategy?.suggestedPricing?.commitmentMonths || 12;
  const firstYearTotal =
    veraStrategy?.suggestedPricing?.firstYearTotalARS ||
    (devPrice + monthlyPrice * commitmentMonths);

  const devPriceFormatted = formatCurrency(devPrice);
  const monthlyPriceFormatted = formatCurrency(monthlyPrice);
  const firstYearFormatted = formatCurrency(firstYearTotal);

  const mainServiceName =
    veraStrategy?.recommendedServices?.[0]?.serviceName ||
    (!business.website ? 'Landing Express' : 'Optimización Web y Conversión');

  // Tito data highlights
  const titoIssues = audit?.ai_insights?.tito_audit?.issues || [];
  const titoSpeed = audit?.performance_data?.responseTimeMs || 0;
  const titoSummary =
    titoIssues.length > 0
      ? `notamos detalles puntuales como ${titoIssues[0].title.toLowerCase()}${titoSpeed > 1000 ? ` y tiempos de respuesta de ${(titoSpeed / 1000).toFixed(1)}s` : ''}`
      : 'notamos que la experiencia de navegación en celulares tiene aspectos clave para potenciar turnos';

  const demoAddon =
    demo && demo.status === 'APROBADA'
      ? `\n\n🎨 Además, para que puedan visualizar la idea, nuestro diseñador Bruno preparó una propuesta conceptual preliminar:\nhttps://webpilot.ar/demo/${demo.slug}`
      : '';

  return {
    // Situación 1: Sin sitio web
    SIN_WEB: {
      situation: 'SIN_WEB',
      situationLabel: 'Ofrecer sitio web desde cero',
      situationDescription: 'Para negocios que no cuentan con página web oficial y dependen solo de redes o mapas.',
      whatsappMessage: `Hola, ¿cómo están? Les escribo de WebPilot con respecto a *${name}*${city}.

Estuvimos conociendo su trabajo y notamos que hoy no cuentan con un sitio web oficial para que los pacientes los encuentren directamente en Google.

Desarrollamos una *Landing Express profesional* por solo *${devPriceFormatted} iniciales*, lista en 3 a 5 días y adaptada a celulares con botón directo a WhatsApp. Además, nos ocupamos de mantenerla online, actualizada y funcionando por una cuota mensual accesible de *${monthlyPriceFormatted}/mes* (compromiso inicial de 12 meses).${demoAddon}

¿Les gustaría que les comparta una propuesta breve de 1 minuto sin ningún compromiso? ¡Muchas gracias y que tengan un excelente día!`,
      emailSubject: `${name}: propuesta para sumar su sitio web oficial y captar más pacientes`,
      emailBody: `Estimado equipo de ${name},

Les escribimos desde WebPilot. Estuvimos investigando los principales centros de atención odontológica${city} y valoramos mucho la calidad de su trabajo.

Al revisar su presencia digital, identificamos una oportunidad directa: actualmente ${name} no cuenta con un sitio web oficial indexado en Google. Hoy en día, una gran parte de los pacientes busca especialistas directamente desde su celular antes de agendar un turno.

En WebPilot diseñamos sitios web modernos, ultrarrápidos y optimizados para salud y estética:
• Acceso directo a WhatsApp para agendar turnos con un clic.
• Explicación clara de especialidades y tratamientos (hasta 5 secciones).
• Ubicación exacta, integración con Google Maps y datos de contacto.
• Carga instantánea y adaptable a celulares.

Estructura de inversión transparente:
• Desarrollo inicial: ${devPriceFormatted} (pago único llave en mano, entrega en 3 a 5 días hábiles).
• Mantenimiento y hosting continuo: ${monthlyPriceFormatted}/mes (compromiso inicial de 12 meses).
• Inversión total estimada del primer año: ${firstYearFormatted}.

Nos ocupamos de que la página web esté siempre online, protegida con SSL y funcionando sin que el consultorio tenga que dedicar tiempo a cuestiones técnicas.

¿Tienen 5 minutos esta semana para que les enviemos el bosquejo interactivo sin ningún costo ni compromiso?

Atentamente,
Equipo Comercial • WebPilot AI
Dirección WebPilot AI`,
    },

    // Situación 2: Mejoras técnicas detectadas por Tito
    FALLAS_TITO: {
      situation: 'FALLAS_TITO',
      situationLabel: 'Mejoras técnicas (Fallas de Tito)',
      situationDescription: 'Para negocios con web activa donde Tito detectó lentitud, problemas mobile o falta de contacto.',
      whatsappMessage: `Hola, ¿cómo están? Les escribo de WebPilot con respecto a *${name}*.

Estuvimos revisando la web de su consultorio (${business.website || ''}) y notamos que ${titoSummary}.

Hoy más del 80% de los pacientes entra desde el teléfono, y cualquier demora hace que cierren la pestaña y elijan otro consultorio.

Podemos optimizar su sitio para que cargue al instante y cuente con WhatsApp directo por solo ${devPriceFormatted} iniciales, con abono de mantenimiento de ${monthlyPriceFormatted}/mes para que nunca vuelva a fallar.

Preparamos un informe técnico gratuito con los puntos exactos a corregir. ¿A qué teléfono o email les quedaría cómodo que se los enviemos?`,
      emailSubject: `Informe técnico breve sobre el sitio web de ${name}`,
      emailBody: `Hola equipo de ${name},

Les escribimos desde WebPilot, agencia especializada en optimización web y conversión para profesionales de la salud.

Realizamos una auditoría técnica superficial sobre su sitio web (${business.website || ''}) y detectamos oportunidades concretas que impactan en la retención de pacientes:

1. Velocidad de carga y respuesta en celulares.
2. Accesibilidad de los canales de contacto (WhatsApp y solicitud de turnos).
3. Indexación local en Google para búsquedas odontológicas.

Podemos solucionar estos puntos por una inversión inicial de ${devPriceFormatted} y un abono mensual de soporte y mantenimiento de ${monthlyPriceFormatted}/mes.

Nos gustaría compartirles sin cargo el diagnóstico detallado elaborado por nuestro inspector técnico para que puedan revisarlo con su equipo.

Si les interesa, respondan a este correo y se los enviamos en PDF de inmediato.

Saludos cordiales,
Equipo WebPilot AI`,
    },

    // Situación 3: Rediseño y modernización
    REDISENO: {
      situation: 'REDISENO',
      situationLabel: 'Propuesta de rediseño web',
      situationDescription: 'Para webs que quedaron desactualizadas visualmente o no transmiten la jerarquía del consultorio.',
      whatsappMessage: `Hola, ¿cómo están? Les escribo de WebPilot.

Estuvimos viendo el sitio web de *${name}* y sabemos el esfuerzo que lleva mantener la comunicación al día. Creemos que la imagen digital de su consultorio puede lucir mucho más moderna y alineada al nivel profesional que brindan.

En WebPilot rediseñamos sitios web médicos y odontológicos para transformarlos en una verdadera herramienta de captación: estética limpia, velocidad instantánea y botones directos para reservar turnos.

Inversión: ${devPriceFormatted} de desarrollo inicial y abono de mantenimiento y hosting de ${monthlyPriceFormatted}/mes (compromiso inicial 12 meses) para que la web esté siempre actualizada y segura.

¿Les gustaría ver un ejemplo interactivo de cómo podría verse la web renovada de ${name}? ¡Un saludo cordial!`,
      emailSubject: `Modernización y rediseño digital para ${name}`,
      emailBody: `Estimados profesionales de ${name},

Nos ponemos en contacto desde WebPilot. Estuvimos recorriendo su sitio web y nos gustaría acercarles una propuesta de modernización integral.

Su trayectoria médica merece una presencia digital que transmita confianza inmediata desde el primer segundo que un paciente ingresa:
• Diseño contemporáneo enfocado en estética y tecnología odontológica.
• Carga instantánea en cualquier smartphone.
• Botón flotante de WhatsApp siempre visible para consultas espontáneas.

Estructura de inversión:
• Desarrollo de rediseño: ${devPriceFormatted} (llave en mano, entrega en 5 a 7 días hábiles).
• Mantenimiento y hosting continuo: ${monthlyPriceFormatted}/mes (compromiso inicial 12 meses).
• Inversión total estimada del primer año: ${firstYearFormatted}.

¿Cuándo les quedaría cómodo coordinar una breve llamada de 5 minutos para evaluar si se ajusta a sus planes?

Muchas gracias por su tiempo,
Dirección • WebPilot AI`,
    },

    // Situación 4: Consulta exploratoria inicial
    EXPLORATORIO: {
      situation: 'EXPLORATORIO',
      situationLabel: 'Consulta de interés exploratoria',
      situationDescription: 'Mensaje sumamente breve y no invasivo para romper el hielo y validar interés.',
      whatsappMessage: `Hola, ¿cómo están? Les hago una consulta rápida: ¿quién coordina la comunicación o página web de *${name}*?

Les escribimos de WebPilot${city}. Tenemos una propuesta accesible y muy concreta (${devPriceFormatted} inicial + abono mensual de mantenimiento) para mejorar la captación de turnos online y nos gustaría hacérsela llegar a la persona adecuada.

¡Muchas gracias por su tiempo!`,
      emailSubject: `Consulta para el área de comunicación / dirección de ${name}`,
      emailBody: `Estimados,

Buenos días. Quería hacerles una consulta breve: ¿quién es la persona indicada en ${name} para coordinar temas vinculados al sitio web y la atracción de nuevos pacientes?

Desde WebPilot preparamos una propuesta orientada a optimizar la captación de consultas digitales para consultorios de la zona con esquemas de desarrollo accesibles desde ${devPriceFormatted} y abonos de soporte mensual.

Agradezco si me pueden indicar el contacto o si podemos coordinar unos minutos por esta vía.

Cordialmente,
Equipo Comercial • WebPilot AI`,
    },

    // Situación 5: Retomar conversación / Seguimiento de presupuesto
    SEGUIMIENTO: {
      situation: 'SEGUIMIENTO',
      situationLabel: 'Retomar conversación / Seguimiento',
      situationDescription: 'Para cuando ya hubo un contacto previo o se envió presupuesto y se aguarda respuesta.',
      whatsappMessage: `Hola, ¿cómo están? Les escribo para consultarles si pudieron revisar la propuesta que les enviamos para *${name}* (${devPriceFormatted} iniciales + abono mensual de ${monthlyPriceFormatted}/mes con hosting y soporte incluido).

Cualquier duda que tengan sobre el alcance del servicio, los tiempos o las formas de pago, estamos a total disposición para adaptarlo a lo que necesiten en este momento.

¿Les parece que coordinemos 5 minutitos hoy o mañana? ¡Un saludo cordial!`,
      emailSubject: `Seguimiento sobre propuesta de desarrollo web para ${name}`,
      emailBody: `Hola equipo de ${name},

Espero que se encuentren muy bien.

Les escribo simplemente para saber si tuvieron oportunidad de revisar la propuesta que les acercamos para ${name} (${devPriceFormatted} de desarrollo inicial y ${monthlyPriceFormatted}/mes de mantenimiento integral).

Entendemos que los tiempos en la clínica suelen ser muy intensos, por lo que quedamos a su entera disposición si necesitan que aclaremos algún punto técnico o evaluemos el cronograma de entrega.

¿Les viene bien que conversemos unos minutos esta semana?

Un cordial saludo,
Dirección • WebPilot AI`,
    },
  };
}

/**
 * Registra una actividad comercial de contacto o seguimiento,
 * actualiza el negocio en el CRM y guarda los metadatos en audits.ai_insights.cata_sales.
 */
export async function recordCataActivity(
  supabaseClient: any,
  params: {
    businessId: string;
    channel: OutreachChannel;
    outcome: ContactOutcome;
    summary: string;
    followUpDate?: string | null;
    nextAction?: string | null;
    newStage?: CRMStage;
    userId?: string | null;
  }
): Promise<{ success: boolean; activity: Activity; updatedStage: CRMStage }> {
  const supabase = supabaseClient || createClient();

  // 1. Obtener negocio actual
  const { data: business, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.businessId)
    .single();

  if (bErr || !business) {
    throw new Error('Negocio no encontrado para registrar actividad.');
  }

  // 2. Determinar nuevo estado del CRM
  const suggestedStage = OUTCOME_LABELS[params.outcome]?.stageSuggestion || 'CONTACTADO';
  const finalStage: CRMStage = params.newStage || suggestedStage;

  // 3. Crear descripción clara para el historial del CRM
  const channelMeta = CHANNEL_LABELS[params.channel] || { label: params.channel };
  const outcomeMeta = OUTCOME_LABELS[params.outcome] || { label: params.outcome };
  const followUpText = params.followUpDate
    ? ` • Próximo seguimiento: ${formatDate(params.followUpDate)}${params.nextAction ? ` (${params.nextAction})` : ''}`
    : '';

  const fullDescription = `[Cata Comercial] Canal: ${channelMeta.label} | Resultado: ${outcomeMeta.label}${followUpText}\n\nResumen: ${params.summary.trim()}`;

  // Mapear ActivityType para Supabase
  let activityType: 'LLAMADA' | 'EMAIL' | 'REUNION' | 'NOTA' = 'NOTA';
  if (params.channel === 'LLAMADA') activityType = 'LLAMADA';
  else if (params.channel === 'EMAIL') activityType = 'EMAIL';
  else if (params.channel === 'REUNION') activityType = 'REUNION';

  // 4. Insertar actividad
  const { data: activityData, error: actErr } = await supabase
    .from('activities')
    .insert([
      {
        business_id: params.businessId,
        user_id: params.userId || business.user_id || null,
        type: activityType,
        description: fullDescription,
        from_stage: business.status,
        to_stage: finalStage !== business.status ? finalStage : null,
      },
    ])
    .select()
    .single();

  if (actErr) {
    console.error('Error insertando actividad de Cata:', actErr);
    throw actErr;
  }

  // 5. Actualizar estado y fecha en el negocio
  await supabase
    .from('businesses')
    .update({
      status: finalStage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.businessId);

  // 6. Persistir datos estructurados de seguimiento en audits.ai_insights.cata_sales
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', params.businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  const cataSalesPayload: CataFollowUpData = {
    followUpDate: params.followUpDate || null,
    nextAction: params.nextAction || null,
    status: params.followUpDate ? 'PENDIENTE' : 'COMPLETADO',
    lastContactDate: new Date().toISOString(),
    lastChannel: params.channel,
    lastOutcome: params.outcome,
    lastSummary: params.summary.trim(),
    contactCount: ((audits?.[0]?.ai_insights?.cata_sales?.contactCount || 0) as number) + 1,
    updatedAt: new Date().toISOString(),
  };

  if (audits && audits.length > 0) {
    const latestAudit = audits[0] as Audit;
    const updatedAiInsights = {
      ...(latestAudit.ai_insights || {}),
      cata_sales: cataSalesPayload,
    };

    await supabase
      .from('audits')
      .update({
        ai_insights: updatedAiInsights,
        updated_at: new Date().toISOString(),
      })
      .eq('id', latestAudit.id);
  } else {
    // Si no tiene auditoría previa, creamos registro base en audits
    await supabase.from('audits').insert([
      {
        business_id: params.businessId,
        score: null,
        performance_data: { notice: 'Seguimiento comercial de Cata' },
        seo_data: {},
        ai_insights: {
          cata_sales: cataSalesPayload,
          inspector: 'Cata — Responsable Comercial WebPilot AI',
        },
        status: 'COMPLETADO',
      },
    ]);
  }

  return {
    success: true,
    activity: activityData as Activity,
    updatedStage: finalStage,
  };
}
