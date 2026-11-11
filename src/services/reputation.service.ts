import { createClient } from '@/lib/supabase/client';
import { Audit, Business } from '@/types/database.types';

export interface BusinessReview {
  id: string;
  author: string;
  rating: number; // 1 a 5
  date?: string;
  text: string;
  businessResponse?: string | null;
  source: 'MANUAL' | 'GOOGLE_PLACES';
  sentiment?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO';
  topics?: string[];
  createdAt: string;
}

export interface ReputationIssue {
  category: 'TURNOS_Y_HORARIOS' | 'COMUNICACION_Y_ATENCION' | 'TIEMPOS_DE_ESPERA' | 'PRECIOS_Y_TRANSPARENCIA' | 'CALIDAD_SERVICIO';
  categoryLabel: string;
  title: string;
  severity: 'ALTO' | 'MEDIO' | 'BAJO';
  isPattern: boolean; // true si 2+ opiniones lo señalan, false si es un comentario individual
  description: string;
  evidenceQuotes: string[];
  clientCount: number;
}

export interface ReputationStrength {
  title: string;
  description: string;
  evidenceQuotes: string[];
  frequencyCount: number;
}

export interface ReputationOpportunity {
  opportunityTitle: string;
  clientPainPoint: string;
  recommendedService: string;
  salesPitchSnippet: string;
}

export interface ReputationAnalysis {
  businessId: string;
  businessName: string;
  totalReviewsCount: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  isSampleLimited: boolean;
  sampleNotice: string;
  executiveSummary: string;
  strengths: ReputationStrength[];
  recurringIssues: ReputationIssue[];
  commercialOpportunities: ReputationOpportunity[];
  analyzedAt: string;
}

export interface BusinessReputationData {
  reviews: BusinessReview[];
  analysis: ReputationAnalysis | null;
}

/**
 * Palabras clave y heurística para clasificación temática de reseñas odontológicas y comerciales.
 */
const TOPIC_KEYWORDS: Record<
  ReputationIssue['category'],
  { label: string; positiveWords: string[]; negativeWords: string[] }
> = {
  TURNOS_Y_HORARIOS: {
    label: 'Turnos y Disponibilidad Horaria',
    positiveWords: ['rápido turno', 'fácil agendar', 'puntual', 'horario cómodo', 'consigo turno'],
    negativeWords: [
      'cuesta conseguir turno',
      'no hay turno',
      'meses para un turno',
      'reprograman',
      'cancelaron el turno',
      'poca disponibilidad',
      'no dan turnos',
      'demoran en dar turno',
    ],
  },
  COMUNICACION_Y_ATENCION: {
    label: 'Comunicación y Canales de Contacto',
    positiveWords: ['amable', 'cordial', 'respondieron rápido', 'excelente trato', 'muy atentos', 'cálidos'],
    negativeWords: [
      'no atienden el teléfono',
      'no contestan',
      'no responden el whatsapp',
      'imposible comunicarse',
      'nadie atiende',
      'secretaria poco amable',
      'mala atención telefónica',
      'no contestan los mensajes',
    ],
  },
  TIEMPOS_DE_ESPERA: {
    label: 'Tiempos de Espera en Sala',
    positiveWords: ['atienden puntual', 'sin demoras', 'a tiempo', 'no tuve que esperar'],
    negativeWords: [
      'demora',
      'mucho tiempo esperando',
      'esperé 1 hora',
      'esperé más de',
      'sala de espera llena',
      'retraso',
      'tardan mucho',
    ],
  },
  PRECIOS_Y_TRANSPARENCIA: {
    label: 'Claridad en Precios y Presupuestos',
    positiveWords: ['buen precio', 'precio accesible', 'presupuesto claro', 'honesto', 'buena relación precio'],
    negativeWords: [
      'caro',
      'no me dijeron el precio',
      'sorpresa con el cobro',
      'no tienen lista de precios',
      'no informan precios',
      'presupuesto confuso',
      'falta de claridad',
    ],
  },
  CALIDAD_SERVICIO: {
    label: 'Calidad Profesional y Tratamientos',
    positiveWords: [
      'excelente profesional',
      'sin dolor',
      'muy cuidadoso',
      'instalaciones impecables',
      'tecnología moderna',
      'super recomendable',
      'gran doctor',
      'gran doctora',
    ],
    negativeWords: [
      'me dolió',
      'tuve que volver',
      'mal tratamiento',
      'poco profesional',
      'desprolijo',
      'no me explicó',
    ],
  },
};

/**
 * Analiza un conjunto de reseñas y genera el informe de Inteligencia de Reputación.
 */
export function processReputationAnalysis(
  business: Business,
  reviews: BusinessReview[]
): ReputationAnalysis {
  if (reviews.length === 0) {
    return {
      businessId: business.id,
      businessName: business.name,
      totalReviewsCount: 0,
      averageRating: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      isSampleLimited: true,
      sampleNotice: 'No hay reseñas registradas aún para este negocio.',
      executiveSummary: 'Sin datos de opiniones disponibles para analizar.',
      strengths: [],
      recurringIssues: [],
      commercialOpportunities: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  // 1. Métricas cuantitativas
  const totalReviewsCount = reviews.length;
  const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = Math.round((ratingSum / totalReviewsCount) * 10) / 10;

  const positiveReviews = reviews.filter((r) => r.rating >= 4);
  const neutralReviews = reviews.filter((r) => r.rating === 3);
  const negativeReviews = reviews.filter((r) => r.rating <= 2);

  const isSampleLimited = totalReviewsCount < 3;
  const sampleNotice = isSampleLimited
    ? `Muestra reducida (${totalReviewsCount} reseña${totalReviewsCount > 1 ? 's' : ''}). Las conclusiones representan casos individuales y no necesariamente patrones consolidados.`
    : `Análisis basado en ${totalReviewsCount} opiniones registradas.`;

  // 2. Extracción de Fortalezas
  const strengths: ReputationStrength[] = [];

  // Chequeo de trato profesional y calidad
  const professionalPraise = positiveReviews.filter((r) =>
    /profesional|excelente|recomiendo|cuidadoso|atención|atencion|calidez|impecable/i.test(r.text)
  );
  if (professionalPraise.length > 0) {
    strengths.push({
      title: 'Alta valoración de la calidad humana y profesional',
      description: 'Los pacientes destacan la calidez en la atención y la confianza que transmite el equipo.',
      evidenceQuotes: professionalPraise.slice(0, 2).map((r) => `"${r.text.slice(0, 140)}..."`),
      frequencyCount: professionalPraise.length,
    });
  }

  // Chequeo de instalaciones o tecnología
  const techPraise = positiveReviews.filter((r) =>
    /limpio|moderno|instalacion|consultorio|impecable|tecnología|hermoso/i.test(r.text)
  );
  if (techPraise.length > 0) {
    strengths.push({
      title: 'Espacio físico y equipamiento valorado positivamente',
      description: 'Menciones favorables respecto al consultorio, higiene y confort del lugar.',
      evidenceQuotes: techPraise.slice(0, 2).map((r) => `"${r.text.slice(0, 140)}..."`),
      frequencyCount: techPraise.length,
    });
  }

  // 3. Extracción de Problemas Recurrentes
  const recurringIssues: ReputationIssue[] = [];

  // A. Comunicación y teléfono
  const commIssues = reviews.filter((r) =>
    /no atienden|no contestan|teléfono|telefono|whatsapp|imposible comunicarse|nadie atiende|comunicar/i.test(
      r.text
    )
  );
  if (commIssues.length > 0) {
    const isPattern = commIssues.length >= 2;
    recurringIssues.push({
      category: 'COMUNICACION_Y_ATENCION',
      categoryLabel: 'Canales de Comunicación',
      title: isPattern
        ? 'Dificultad recurrente de los clientes para contactarse o recibir respuesta'
        : 'Comentario puntual sobre demoras al comunicarse telefónicamente',
      severity: isPattern ? 'ALTO' : 'MEDIO',
      isPattern,
      description: isPattern
        ? `${commIssues.length} opiniones distintas coinciden en que el teléfono no es atendido con fluidez o los mensajes tardan en ser respondidos.`
        : 'Se registró una opinión señalando dificultades de contacto.',
      evidenceQuotes: commIssues.slice(0, 3).map((r) => `"${r.text}"`),
      clientCount: commIssues.length,
    });
  }

  // B. Dificultad para solicitar turnos
  const apptIssues = reviews.filter((r) =>
    /turno|turnos|agendar|cancelaron|reprogramaron|meses para|esperar tanto tiempo/i.test(r.text)
  );
  if (apptIssues.length > 0) {
    const isPattern = apptIssues.length >= 2;
    recurringIssues.push({
      category: 'TURNOS_Y_HORARIOS',
      categoryLabel: 'Gestión de Turnos',
      title: isPattern
        ? 'Fricción en la asignación y coordinación de turnos'
        : 'Observación aislada sobre tiempos para conseguir turno',
      severity: isPattern ? 'ALTO' : 'MEDIO',
      isPattern,
      description: isPattern
        ? `${apptIssues.length} pacientes mencionan complicaciones para reservar turnos con agilidad.`
        : 'Se reportó una dificultad al coordinar un turno.',
      evidenceQuotes: apptIssues.slice(0, 3).map((r) => `"${r.text}"`),
      clientCount: apptIssues.length,
    });
  }

  // C. Tiempos de espera
  const waitIssues = reviews.filter((r) =>
    /espera|esperar|demora|sala de espera|tardaron|atendieron tarde/i.test(r.text)
  );
  if (waitIssues.length > 0) {
    const isPattern = waitIssues.length >= 2;
    recurringIssues.push({
      category: 'TIEMPOS_DE_ESPERA',
      categoryLabel: 'Tiempos de Espera',
      title: isPattern
        ? 'Demoras en la sala de espera por encima de lo pactado'
        : 'Comentario puntual sobre demora en la atención',
      severity: isPattern ? 'MEDIO' : 'BAJO',
      isPattern,
      description: isPattern
        ? 'Varios pacientes señalan que la atención comienza con demoras respecto al horario acordado.'
        : 'Se registró un comentario sobre tiempo de espera en sala.',
      evidenceQuotes: waitIssues.slice(0, 2).map((r) => `"${r.text}"`),
      clientCount: waitIssues.length,
    });
  }

  // D. Información sobre tratamientos y precios
  const priceIssues = reviews.filter((r) =>
    /precio|cobro|costo|presupuesto|informar|sorpresa|obra social/i.test(r.text) && r.rating <= 3
  );
  if (priceIssues.length > 0) {
    const isPattern = priceIssues.length >= 2;
    recurringIssues.push({
      category: 'PRECIOS_Y_TRANSPARENCIA',
      categoryLabel: 'Información y Presupuestos',
      title: isPattern
        ? 'Dudas o falta de información previa sobre costos y coberturas'
        : 'Observación puntual respecto a costos o presupuesto',
      severity: 'MEDIO',
      isPattern,
      description: 'Los pacientes sugieren que sería útil contar con información más clara antes de asistir.',
      evidenceQuotes: priceIssues.slice(0, 2).map((r) => `"${r.text}"`),
      clientCount: priceIssues.length,
    });
  }

  // 4. Mapeo a Oportunidades Comerciales de WebPilot
  const commercialOpportunities: ReputationOpportunity[] = [];

  // Si hay problemas de comunicación telefónica -> Botón flotante WhatsApp
  if (commIssues.length > 0) {
    commercialOpportunities.push({
      opportunityTitle: 'Canal de WhatsApp automatizado para eliminar fricción de llamadas',
      clientPainPoint: 'Los pacientes intentan llamar por teléfono en horarios donde el personal atiende a otros pacientes.',
      recommendedService: 'Canal Directo de WhatsApp y Botón Flotante ($60.000 ARS)',
      salesPitchSnippet: `Notamos en sus opiniones de Google que algunos pacientes mencionan dificultades para comunicarse telefónicamente. Implementar un botón directo de WhatsApp en su web permite que dejen su consulta con un clic sin saturar la línea telefónica.`,
    });
  }

  // Si hay problemas con turnos -> Formulario inteligente de turnos
  if (apptIssues.length > 0) {
    commercialOpportunities.push({
      opportunityTitle: 'Sistema de solicitud de turnos online 24/7',
      clientPainPoint: 'Coordinar turnos manualmente por teléfono genera demoras y cuellos de botella.',
      recommendedService: 'Formulario Inteligente de Captación de Turnos ($80.000 ARS)',
      salesPitchSnippet: `Varios pacientes valoran su atención pero desearían agendar turnos más rápido. Un formulario web conectado a su equipo permite recibir solicitudes las 24 horas del día incluso fuera de horario.`,
    });
  }

  // Si tienen gran reputación (4.5+) pero no tienen web o su web es precaria -> Potenciación SEO Local
  if (averageRating >= 4.3) {
    commercialOpportunities.push({
      opportunityTitle: 'Aprovechar la alta reputación para dominar búsquedas locales de Google',
      clientPainPoint: 'Tienen excelentes opiniones (promedio de ' + averageRating + ' estrellas) pero sin un sitio web optimizado muchos pacientes nuevos no los descubren.',
      recommendedService: !business.website
        ? 'Sitio Web Institucional Completo con Reseñas Destacadas ($320.000 ARS)'
        : 'Posicionamiento SEO Local y Google Maps ($140.000 ARS)',
      salesPitchSnippet: `Tienen una calificación envidiable de ${averageRating} estrellas en Google. Al vincular estas reseñas en una web profesional con SEO local, convertimos esa excelente reputación en nuevos pacientes todas las semanas.`,
    });
  }

  // 5. Resumen Ejecutivo
  let executiveSummary = `Calificación promedio de ${averageRating}★ sobre ${totalReviewsCount} opiniones analizadas. `;
  if (recurringIssues.length === 0) {
    executiveSummary += 'Reputación altamente positiva y sin fricciones operativas evidentes. Excelente base para potenciar presencia digital.';
  } else {
    const issuesSummary = recurringIssues.map((i) => i.categoryLabel.toLowerCase()).join(', ');
    executiveSummary += `Se detectaron oportunidades de mejora principalmente en ${issuesSummary}.`;
  }

  return {
    businessId: business.id,
    businessName: business.name,
    totalReviewsCount,
    averageRating,
    positiveCount: positiveReviews.length,
    neutralCount: neutralReviews.length,
    negativeCount: negativeReviews.length,
    isSampleLimited,
    sampleNotice,
    executiveSummary,
    strengths,
    recurringIssues,
    commercialOpportunities,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Guarda reseñas manuales y ejecuta el análisis de reputación para un negocio.
 */
export async function saveBusinessReviews(
  businessId: string,
  reviews: BusinessReview[],
  client?: any
): Promise<{ reviews: BusinessReview[]; analysis: ReputationAnalysis }> {
  const supabase = client || createClient();

  // Obtener negocio
  const { data: business, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bErr || !business) {
    throw new Error('Negocio no encontrado para asociar reseñas.');
  }

  // Ejecutar análisis de reputación
  const analysis = processReputationAnalysis(business as Business, reviews);

  // Obtener última auditoría para persistir en ai_insights.reputation
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  const reputationPayload: BusinessReputationData = {
    reviews,
    analysis,
  };

  if (audits && audits.length > 0) {
    const latestAudit = audits[0] as Audit;
    const updatedAiInsights = {
      ...(latestAudit.ai_insights || {}),
      reputation: reputationPayload,
    };

    await supabase
      .from('audits')
      .update({
        ai_insights: updatedAiInsights,
        updated_at: new Date().toISOString(),
      })
      .eq('id', latestAudit.id);
  } else {
    // Si no tiene auditoría previa, creamos registro en audits
    await supabase.from('audits').insert([
      {
        business_id: businessId,
        score: null,
        performance_data: { notice: 'Módulo de Inteligencia de Reputación' },
        seo_data: {},
        ai_insights: {
          reputation: reputationPayload,
          inspector: 'Vera — Inteligencia de Reputación',
        },
        status: 'COMPLETADO',
      },
    ]);
  }

  // Registrar actividad en el CRM si hay reseñas cargadas
  if (reviews.length > 0) {
    await supabase.from('activities').insert([
      {
        business_id: businessId,
        user_id: business.user_id || null,
        type: 'NOTA',
        description: `Vera analizó ${reviews.length} reseñas (${analysis.averageRating}★). Detectadas ${analysis.recurringIssues.length} áreas de oportunidad comercial.`,
        from_stage: business.status,
      },
    ]);
  }

  return { reviews, analysis };
}

/**
 * Obtiene las reseñas y el análisis de reputación guardado para un negocio.
 */
export async function getBusinessReputation(
  businessId: string,
  client?: any
): Promise<BusinessReputationData | null> {
  const supabase = client || createClient();

  const { data: audits, error } = await supabase
    .from('audits')
    .select('ai_insights')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !audits || audits.length === 0) {
    return null;
  }

  return audits[0].ai_insights?.reputation || null;
}

/**
 * Obtiene el resumen de reputación para todos los negocios del CRM.
 */
export async function getReputationOverview(
  client?: any
): Promise<
  {
    business: Business;
    reviewCount: number;
    averageRating: number | null;
    analysis: ReputationAnalysis | null;
  }[]
> {
  const supabase = client || createClient();

  const { data: businesses, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .order('name', { ascending: true });

  if (bErr || !businesses) {
    return [];
  }

  const { data: audits } = await supabase
    .from('audits')
    .select('business_id, ai_insights')
    .order('created_at', { ascending: false });

  const auditMap = new Map<string, any>();
  audits?.forEach((a: any) => {
    if (!auditMap.has(a.business_id)) {
      auditMap.set(a.business_id, a);
    }
  });

  return businesses.map((b: any) => {
    const aud = auditMap.get(b.id);
    const rep: BusinessReputationData | null = aud?.ai_insights?.reputation || null;

    return {
      business: b as Business,
      reviewCount: rep?.reviews?.length || 0,
      averageRating: rep?.analysis?.averageRating || null,
      analysis: rep?.analysis || null,
    };
  });
}
