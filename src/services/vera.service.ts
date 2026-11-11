import { createClient } from '@/lib/supabase/client';
import { Business, Audit, AuditIssue, CRMStage } from '@/types/database.types';
import { DEFAULT_SERVICES_CATALOG, ServiceItem } from '@/lib/constants/services';
import { formatCurrency } from '@/lib/utils';

export interface VeraOpportunity {
  category: 'DESARROLLO_WEB' | 'REDISENO_WEB' | 'OPTIMIZACION_VELOCIDAD' | 'SEO_LOCAL' | 'CANAL_CONVERSION' | 'MANTENIMIENTO' | 'REPUTACION';
  title: string;
  severity: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  factProven: string;
  commercialImpact: string;
}

export interface VeraRecommendedService {
  serviceId: string;
  serviceName: string;
  category: string;
  suggestedPriceARS: number;
  suggestedPriceUSD: number;
  isMonthly?: boolean;
  reason: string;
  justification: string;
  urgency: 'ALTA' | 'MEDIA' | 'BAJA';
}

export type VeraCommercialOutcome =
  | 'BUENA_PRESENCIA'          // Resultado A: NO OFRECER SERVICIOS
  | 'PROPUESTA_OPCIONAL'        // Resultado B: PROPUESTA OPCIONAL Y ESPECÍFICA
  | 'OPORTUNIDAD_CLARA'         // Resultado C: PREPARAR PROPUESTA COMERCIAL
  | 'INFORMACION_INSUFICIENTE';  // Resultado D: SOLICITAR REVISIÓN HUMANA

export type VeraActionRecommendation =
  | 'NO_OFRECER'
  | 'PROPUESTA_OPCIONAL'
  | 'PREPARAR_PROPUESTA'
  | 'REVISION_HUMANA';

export interface VeraCommercialStrategy {
  businessId: string;
  businessName: string;
  summary: string;
  commercialOutcome: VeraCommercialOutcome;
  commercialOutcomeLabel: string;
  actionRecommendation: VeraActionRecommendation;
  markedAsNoOpportunity?: boolean;
  markedAsNoOpportunityReason?: string;
  markedAsNoOpportunityDate?: string;
  digitalPresence: {
    tier: 'SIN_WEB' | 'DEFICIENTE' | 'MEJORABLE' | 'SOLIDA';
    tierLabel: string;
    hasWebsite: boolean;
    websiteUrl: string | null;
    hasPhone: boolean;
    hasWhatsApp: boolean;
    hasEmail: boolean;
    hasAddress: boolean;
    titoAuditCompleted: boolean;
    titoScore: number | null;
    titoIssuesCount: number;
    details: string[];
  };
  opportunities: VeraOpportunity[];
  recommendedServices: VeraRecommendedService[];
  suggestedPricing: {
    individualServicesTotalARS: number;
    individualServicesTotalUSD: number;
    bundleName: string;
    bundleDiscountPercentage: number;
    bundleFinalARS: number;
    bundleFinalUSD: number;
    monthlyMaintenanceARS: number;
    monthlyMaintenanceUSD: number;
    firstYearTotalARS?: number;
    firstYearTotalUSD?: number;
    commitmentMonths?: number;
    isCustomQuote: boolean;
    notes: string;
  };
  commercialArguments: {
    provenFacts: string[];
    interpretations: string[];
    commercialHypothesis: string[];
    painPoint: string;
    costOfInaction: string;
    ourSolution: string;
    whyNow: string;
  };
  outreachPitch: {
    whatsappMessage: string;
    emailSubject: string;
    emailBody: string;
  };
  missingDataAlerts: string[];
  analyzedAt: string;
}

export interface VeraBusinessSummary {
  business: Business;
  hasWebsite: boolean;
  titoAudit: {
    status: 'COMPLETADO' | 'PENDIENTE' | 'NO_APLICA' | 'FALLIDO';
    score: number | null;
    issuesCount: number;
  };
  veraStrategy: {
    hasStrategy: boolean;
    analyzedAt: string | null;
    commercialOutcome: VeraCommercialOutcome;
    commercialOutcomeLabel: string;
    actionRecommendation: VeraActionRecommendation;
    markedAsNoOpportunity?: boolean;
    primaryNeed: string | null;
    suggestedBundleARS: number | null;
    monthlyMaintenanceARS: number | null;
    firstYearTotalARS: number | null;
    servicesCount: number;
    urgency: 'ALTA' | 'MEDIA' | 'BAJA' | 'NINGUNA';
  };
}

/**
 * Motor de Estrategia Comercial de Vera:
 * Transforma datos técnicos y comerciales en una propuesta de valor precisa y honesta.
 */
export async function analyzeBusiness(
  businessId: string,
  customCatalog?: ServiceItem[],
  client?: any
): Promise<VeraCommercialStrategy> {
  const supabase = client || createClient();
  const catalog = customCatalog && customCatalog.length > 0 ? customCatalog : DEFAULT_SERVICES_CATALOG;

  // 1. Obtener datos del negocio
  const { data: business, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bErr || !business) {
    throw new Error('Negocio no encontrado en el CRM.');
  }

  // 2. Obtener datos complementarios de Lola (lola_candidates)
  const { data: candidate } = await supabase
    .from('lola_candidates')
    .select('*')
    .eq('business_id', businessId)
    .limit(1)
    .maybeSingle();

  // 3. Obtener última auditoría de Tito y sus problemas
  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestAudit = audits && audits.length > 0 ? (audits[0] as Audit) : null;
  let auditIssues: AuditIssue[] = [];

  if (latestAudit) {
    const { data: issues } = await supabase
      .from('audit_issues')
      .select('*')
      .eq('audit_id', latestAudit.id)
      .order('created_at', { ascending: true });
    auditIssues = (issues as AuditIssue[]) || [];
  }

  // 4. Variables clave de diagnóstico
  const isInstagram = Boolean(business.website && (business.website.includes('instagram.com') || business.website.includes('instagr.am')));
  const hasWebsite = Boolean(business.website && business.website.trim() && !business.website.includes('null') && !isInstagram);
  const websiteUrl = business.website ? business.website.trim() : null;
  const hasPhone = Boolean(business.phone && business.phone.trim());
  const hasEmail = Boolean(business.email && business.email.trim());
  const hasAddress = Boolean(candidate?.address || (business.city && business.state_province));
  const titoAuditCompleted = Boolean(latestAudit && latestAudit.performance_data && Object.keys(latestAudit.performance_data).length > 0);
  const titoScore = latestAudit?.score !== undefined ? Number(latestAudit.score) : null;

  const titoPerf = latestAudit?.performance_data || {};
  const titoSeo = latestAudit?.seo_data || {};
  const titoAi = latestAudit?.ai_insights || {};

  const isHttps = titoPerf.isHttps === true;
  const isHttpInsecure = titoPerf.isHttps === false;
  const responseTimeMs = Number(titoPerf.responseTimeMs || 0);
  const isSlowResponse = responseTimeMs > 1200;
  const isHeavyHtml = Number(titoPerf.htmlSizeKb || 0) > 180;
  const hasViewport = titoAi.hasViewport === true;
  const hasWhatsAppDetected = Boolean(titoAi.hasWhatsApp || candidate?.has_whatsapp);
  const hasFormsDetected = Boolean(titoAi.hasForms || candidate?.has_forms);
  const missingH1 = titoSeo.h1Count === 0;
  const shortTitle = titoSeo.titleLength !== undefined && Number(titoSeo.titleLength) < 25;
  const missingMetaDesc = titoSeo.hasMetaDescription === false;
  const imagesWithoutAlt = Number(titoSeo.imagesWithoutAltCount || 0);

  // 5. Diagnóstico de Confiabilidad y Auditoría de Tito
  const isAuditFailed = Boolean(
    hasWebsite &&
    latestAudit &&
    (titoPerf.statusCode === 0 ||
      titoPerf.statusCode >= 500 ||
      Boolean(titoPerf.errorMessage) ||
      (titoPerf.htmlSizeBytes !== undefined && Number(titoPerf.htmlSizeBytes) === 0))
  );
  const isAuditPending = Boolean(hasWebsite && !titoAuditCompleted);

  // Canales de contacto detectados
  const hasTelLinks = Boolean((titoPerf as any).hasTelLinks || business.phone);
  const hasDirectMobileChannel = Boolean(hasWhatsAppDetected || hasTelLinks);
  const hasAnyInquiryChannel = Boolean(hasWhatsAppDetected || hasFormsDetected || hasEmail || hasPhone);

  // 6. Clasificación en los Cuatro Resultados Posibles de Vera
  let commercialOutcome: VeraCommercialOutcome = 'OPORTUNIDAD_CLARA';
  let commercialOutcomeLabel = '';
  let actionRecommendation: VeraActionRecommendation = 'PREPARAR_PROPUESTA';
  let tier: 'SIN_WEB' | 'DEFICIENTE' | 'MEJORABLE' | 'SOLIDA' = 'MEJORABLE';
  let tierLabel = '';

  if (hasWebsite && (isAuditFailed || isAuditPending)) {
    // RESULTADO D: INFORMACIÓN INSUFICIENTE
    commercialOutcome = 'INFORMACION_INSUFICIENTE';
    commercialOutcomeLabel = 'Información insuficiente — Solicitar revisión humana';
    actionRecommendation = 'REVISION_HUMANA';
    tier = 'MEJORABLE';
    tierLabel = 'Información técnica insuficiente para emitir un diagnóstico confiable';
  } else if (!hasWebsite) {
    // RESULTADO C: OPORTUNIDAD COMERCIAL CLARA (Sin web propia)
    commercialOutcome = 'OPORTUNIDAD_CLARA';
    commercialOutcomeLabel = 'Oportunidad comercial clara — Sin presencia web propia';
    actionRecommendation = 'PREPARAR_PROPUESTA';
    tier = 'SIN_WEB';
    tierLabel = isInstagram
      ? 'Presencia limitada a redes sociales (Instagram sin sitio web propio indexable)'
      : 'Crítica: Sin sitio web registrado (Oportunidad de desarrollo desde cero)';
  } else {
    // El negocio tiene sitio web auditado por Tito
    const hasCriticalIssues = isHttpInsecure || !hasViewport || (titoScore !== null && titoScore < 50);

    if (hasCriticalIssues) {
      // RESULTADO C: OPORTUNIDAD COMERCIAL CLARA (Problemas estructurales comprobados)
      commercialOutcome = 'OPORTUNIDAD_CLARA';
      commercialOutcomeLabel = 'Oportunidad comercial clara — Problemas estructurales comprobados';
      actionRecommendation = 'PREPARAR_PROPUESTA';
      tier = 'DEFICIENTE';
      tierLabel = 'Deficiente: Web con advertencias de seguridad HTTP o sin adaptación móvil';
    } else {
      // No hay problemas críticos de seguridad o viewport.
      // Evaluamos el caso de referencia (ej: Dra. Ana Laura Batalles - https://draanalaurabatalles.com.ar/)
      // Web con diseño profesional, tratamientos, presentación, WhatsApp, formularios, teléfono, ubicación.
      // Criterio honesto: Si tiene HTTPS, viewport móvil, canal directo (WhatsApp o teléfono interactivo)
      // y respuesta aceptable (<1800ms) con score >= 68: NO SE DEBEN INVENTAR PROPUESTAS DE VENTA.
      const isSlowSevere = responseTimeMs >= 1800; // Demora perceptible real > 1.8s
      const isCompletelyWithoutDirectChannel = !hasWhatsAppDetected && !hasTelLinks; // Sin WhatsApp ni teléfono interactivo
      const hasSevereSeoIssue = titoSeo.hasTitle === false;

      if (!isSlowSevere && !isCompletelyWithoutDirectChannel && !hasSevereSeoIssue && (titoScore === null || titoScore >= 68)) {
        // RESULTADO A: BUENA PRESENCIA DIGITAL -> NO OFRECER SERVICIOS
        commercialOutcome = 'BUENA_PRESENCIA';
        commercialOutcomeLabel = 'Buena presencia digital — No ofrecer servicios';
        actionRecommendation = 'NO_OFRECER';
        tier = 'SOLIDA';
        tierLabel = 'Sólida: Web profesional y funcional con canales de contacto activos';
      } else {
        // RESULTADO B: PRESENCIA DIGITAL MEJORABLE -> PROPUESTA OPCIONAL Y ESPECÍFICA
        commercialOutcome = 'PROPUESTA_OPCIONAL';
        commercialOutcomeLabel = 'Presencia digital mejorable — Propuesta opcional y específica';
        actionRecommendation = 'PROPUESTA_OPCIONAL';
        tier = 'MEJORABLE';
        tierLabel = 'Mejorable: Web funcional con oportunidades puntuales de optimización';
      }
    }
  }

  // 7. Detección de oportunidades concretas y recomendación de servicios según el resultado
  const opportunities: VeraOpportunity[] = [];
  const recommendedServices: VeraRecommendedService[] = [];
  const missingDataAlerts: string[] = [];

  // Helper para buscar servicio en el catálogo
  const findService = (id: string): ServiceItem => {
    const targetId = id === 'landing-page' ? 'landing-express' : id;
    return (
      catalog.find((s) => s.id === targetId || s.id === id) ||
      DEFAULT_SERVICES_CATALOG.find((s) => s.id === targetId || s.id === id) ||
      DEFAULT_SERVICES_CATALOG[0]
    );
  };

  if (commercialOutcome === 'BUENA_PRESENCIA') {
    // CASO A: Buena presencia digital -> NO RECOMENDAR SERVICIOS NI ASIGNAR PRESUPUESTO
    opportunities.push({
      category: 'MANTENIMIENTO',
      title: 'Presencia digital sólida, completa y profesional',
      severity: 'BAJO',
      factProven: `El sitio web ${websiteUrl} cuenta con HTTPS seguro, diseño adaptable a celulares (viewport), tiempo de respuesta adecuado (${responseTimeMs} ms) y canales de contacto activos.`,
      commercialImpact: 'La experiencia del paciente es adecuada y no se identifican fricciones comerciales que justifiquen ofrecer nuestros servicios actualmente.',
    });
  } else if (commercialOutcome === 'INFORMACION_INSUFICIENTE') {
    // CASO D: Información insuficiente -> SOLICITAR REVISIÓN HUMANA (Sin venta)
    opportunities.push({
      category: 'MANTENIMIENTO',
      title: 'Auditoría técnica no concluyente (Requiere revisión manual)',
      severity: 'BAJO',
      factProven: titoPerf.errorMessage || (isAuditPending ? 'Auditoría técnica de Tito pendiente de ejecución.' : `No se pudo conectar de manera confiable al sitio ${websiteUrl}.`),
      commercialImpact: 'De acuerdo al principio de honestidad técnica de Vera, no se inventan propuestas comerciales sin datos fehacientes. Se solicita verificación humana.',
    });
  } else if (commercialOutcome === 'OPORTUNIDAD_CLARA' && !hasWebsite) {
    // CASO C.1: Negocio sin sitio web propio (o solo Instagram)
    if (isInstagram) {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Presencia digital limitada a Instagram sin web propia indexable en Google',
        severity: 'ALTO',
        factProven: `El negocio utiliza su perfil de Instagram (${websiteUrl}) como único canal web registrado.`,
        commercialImpact: 'Los pacientes que buscan profesionales en Google o Google Maps no navegan perfiles de Instagram y suelen optar por consultorios con sitio web directo.',
      });
    } else {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Ausencia total de canal web propio para captación de clientes',
        severity: 'CRITICO',
        factProven: 'No figura ningún sitio web registrado en Google Places ni en su ficha pública comercial.',
        commercialImpact: 'Los pacientes que buscan profesionales de su especialidad en la zona no encuentran una página de referencia con tratamientos, ubicación y horarios.',
      });
    }

    const nameLower = (business.name || '').toLowerCase();
    const isMultiPageInstitution =
      nameLower.includes('policonsultorio') ||
      nameLower.includes('sanatorio') ||
      nameLower.includes('hospital') ||
      nameLower.includes('sedes') ||
      nameLower.includes('centro médico integral');

    const isComplexClinic =
      !isMultiPageInstitution &&
      (nameLower.includes('instituto') ||
        nameLower.includes('clínica') ||
        nameLower.includes('odontología avanzada') ||
        nameLower.includes('implantes y estética'));

    if (isMultiPageInstitution) {
      const sInst = findService('sitio-institucional');
      recommendedServices.push({
        serviceId: sInst.id,
        serviceName: sInst.name,
        category: sInst.category,
        suggestedPriceARS: sInst.suggestedPriceARS,
        suggestedPriceUSD: sInst.suggestedPriceUSD,
        reason: 'Sitio web multipágina (hasta 5 páginas) para estructurar múltiples áreas, servicios y cuerpo profesional.',
        justification: `La estructura de "${business.name}" amerita páginas individuales para cada especialidad con presencia institucional completa.`,
        urgency: 'ALTA',
      });
      const sMantInst = findService('mantenimiento-institucional');
      recommendedServices.push({
        serviceId: sMantInst.id,
        serviceName: sMantInst.name,
        category: sMantInst.category,
        suggestedPriceARS: sMantInst.suggestedPriceARS,
        suggestedPriceUSD: sMantInst.suggestedPriceUSD,
        isMonthly: true,
        reason: 'Hosting multipágina de alta disponibilidad, certificado SSL y soporte técnico prioritario.',
        justification: 'Abono mensual de $29.000 ARS/mes con compromiso inicial de 12 meses.',
        urgency: 'MEDIA',
      });
    } else if (isComplexClinic) {
      const sPro = findService('landing-profesional');
      recommendedServices.push({
        serviceId: sPro.id,
        serviceName: sPro.name,
        category: sPro.category,
        suggestedPriceARS: sPro.suggestedPriceARS,
        suggestedPriceUSD: sPro.suggestedPriceUSD,
        reason: 'Landing page personalizada de hasta 7 secciones con presentación detallada de especialidades y formulario de consultas.',
        justification: `Permite a "${business.name}" exhibir sus servicios en profundidad con un diseño visual elaborado y 2 rondas de modificaciones.`,
        urgency: 'ALTA',
      });
      const sMantPro = findService('mantenimiento-profesional');
      recommendedServices.push({
        serviceId: sMantPro.id,
        serviceName: sMantPro.name,
        category: sMantPro.category,
        suggestedPriceARS: sMantPro.suggestedPriceARS,
        suggestedPriceUSD: sMantPro.suggestedPriceUSD,
        isMonthly: true,
        reason: 'Hosting optimizado, certificado SSL, copias de seguridad semanales y soporte técnico.',
        justification: 'Abono mensual de $24.000 ARS/mes con compromiso inicial de 12 meses.',
        urgency: 'MEDIA',
      });
    } else {
      // PRODUCTO PRINCIPAL DE VOLUMEN COMERCIAL: Landing Express ($69.000)
      const sExp = findService('landing-express');
      recommendedServices.push({
        serviceId: sExp.id,
        serviceName: sExp.name,
        category: sExp.category,
        suggestedPriceARS: sExp.suggestedPriceARS,
        suggestedPriceUSD: sExp.suggestedPriceUSD,
        reason: 'Landing page ágil de 5 secciones y entrega rápida (3 a 5 días) orientada a volumen y captación directa por WhatsApp.',
        justification: 'Precio de desarrollo sumamente accesible ($69.000 ARS) y rápido retorno de inversión: diseño profesional adaptable a celulares, botón directo a WhatsApp y Google Maps.',
        urgency: 'ALTA',
      });
      const sMantExp = findService('mantenimiento-express');
      recommendedServices.push({
        serviceId: sMantExp.id,
        serviceName: sMantExp.name,
        category: sMantExp.category,
        suggestedPriceARS: sMantExp.suggestedPriceARS,
        suggestedPriceUSD: sMantExp.suggestedPriceUSD,
        isMonthly: true,
        reason: 'Hosting de alta velocidad, certificado SSL, supervisión de disponibilidad y soporte ante problemas.',
        justification: 'Abono mensual accesible ($19.000 ARS/mes) con compromiso inicial de 12 meses. WebPilot se ocupa de todo.',
        urgency: 'MEDIA',
      });
    }
  } else if (commercialOutcome === 'OPORTUNIDAD_CLARA') {
    // CASO C.2: Sitio con problemas estructurales graves (inseguro HTTP o sin viewport móvil)
    if (isHttpInsecure) {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Sitio sin certificado de seguridad SSL (Advertencia "No es seguro")',
        severity: 'CRITICO',
        factProven: `La URL final es ${titoPerf.finalUrl || websiteUrl} bajo protocolo HTTP sin cifrar.`,
        commercialImpact: 'Los navegadores modernos muestran una advertencia roja de seguridad que genera desconfianza inmediata en los pacientes.',
      });
      const sRedesign = findService('rediseno-web');
      recommendedServices.push({
        serviceId: sRedesign.id,
        serviceName: sRedesign.name,
        category: sRedesign.category,
        suggestedPriceARS: sRedesign.suggestedPriceARS,
        suggestedPriceUSD: sRedesign.suggestedPriceUSD,
        reason: 'Modernización web completa con protocolo HTTPS y diseño responsive.',
        justification: 'Un sitio bajo HTTP sin cifrar suele tener tecnologías desactualizadas que requieren renovación integral.',
        urgency: 'ALTA',
      });
    }
    if (!hasViewport) {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Sitio no adaptado a celulares (Sin etiqueta viewport declarada)',
        severity: 'CRITICO',
        factProven: 'El código HTML no declara la etiqueta meta viewport para pantallas móviles.',
        commercialImpact: 'La página se visualiza diminuta en teléfonos y obliga al usuario a hacer zoom manual, dificultando la lectura y el contacto.',
      });
      if (!recommendedServices.some((s) => s.serviceId === 'rediseno-web')) {
        const sExp = findService('landing-express');
        recommendedServices.push({
          serviceId: sExp.id,
          serviceName: sExp.name,
          category: sExp.category,
          suggestedPriceARS: sExp.suggestedPriceARS,
          suggestedPriceUSD: sExp.suggestedPriceUSD,
          reason: 'Reemplazo por landing page responsive y ágil adaptada 100% a celulares.',
          justification: 'Garantiza navegación fluida en dispositivos móviles con botón directo a WhatsApp.',
          urgency: 'ALTA',
        });
      }
    }
  } else if (commercialOutcome === 'PROPUESTA_OPCIONAL') {
    // CASO B: Presencia digital mejorable -> ÚNICAMENTE SERVICIOS QUE RESUELVEN PROBLEMAS COMPROBADOS
    // 1. Lentitud comprobada severa (>1800ms)
    if (responseTimeMs >= 1800) {
      opportunities.push({
        category: 'OPTIMIZACION_VELOCIDAD',
        title: 'Carga inicial del sitio lenta (Servidor demorado)',
        severity: 'ALTO',
        factProven: `Tiempo medido de respuesta del servidor: ${responseTimeMs} ms (supera el estándar recomendado de 1.200 ms).`,
        commercialImpact: 'Los visitantes desde teléfonos móviles pueden experimentar demoras en la carga inicial de la página.',
      });
      const sSpeed = findService('optimizacion-velocidad');
      recommendedServices.push({
        serviceId: sSpeed.id,
        serviceName: sSpeed.name,
        category: sSpeed.category,
        suggestedPriceARS: sSpeed.suggestedPriceARS,
        suggestedPriceUSD: sSpeed.suggestedPriceUSD,
        reason: 'Optimización de caché, compresión y CDN para respuesta veloz del servidor.',
        justification: `Intervención técnica puntual para resolver los ${responseTimeMs} ms de demora sin necesidad de rediseñar la web.`,
        urgency: 'MEDIA',
      });
    }

    // 2. Falta de canal directo móvil (WhatsApp / Teléfono)
    if (!hasWhatsAppDetected && !hasTelLinks) {
      opportunities.push({
        category: 'CANAL_CONVERSION',
        title: 'Falta botón interactivo de mensajería directa en celulares',
        severity: 'ALTO',
        factProven: 'No se encontraron enlaces con protocolo wa.me ni enlaces clickeables tel: en el sitio web.',
        commercialImpact: 'Los usuarios que navegan desde smartphones no pueden iniciar una consulta con un solo toque y deben memorizar o anotar números.',
      });
      const sWa = findService('integracion-whatsapp');
      recommendedServices.push({
        serviceId: sWa.id,
        serviceName: sWa.name,
        category: sWa.category,
        suggestedPriceARS: sWa.suggestedPriceARS,
        suggestedPriceUSD: sWa.suggestedPriceUSD,
        reason: 'Integrar botón flotante de WhatsApp animado para consultas ágiles.',
        justification: 'Permite canalizar consultas directas de turnos desde el teléfono celular.',
        urgency: 'MEDIA',
      });
    }

    // 3. Sin canal de consulta fuera de horario (ni formulario ni email)
    if (!hasFormsDetected && !hasEmail) {
      opportunities.push({
        category: 'CANAL_CONVERSION',
        title: 'Sin canal asincrónico para consultas fuera de horario comercial',
        severity: 'MEDIO',
        factProven: 'El sitio no dispone de formulario de contacto ni dirección de email visible.',
        commercialImpact: 'Las personas que navegan fuera del horario de atención del consultorio no cuentan con un medio para dejar sus datos.',
      });
      const sForm = findService('formularios-turnos');
      recommendedServices.push({
        serviceId: sForm.id,
        serviceName: sForm.name,
        category: sForm.category,
        suggestedPriceARS: sForm.suggestedPriceARS,
        suggestedPriceUSD: sForm.suggestedPriceUSD,
        reason: 'Instalar formulario simple de consulta que notifica directo al profesional.',
        justification: 'Captura solicitudes de presupuesto o turnos en horarios no comerciales.',
        urgency: 'BAJA',
      });
    }

    // 4. Problemas severos de indexación on-page
    if (titoSeo.hasTitle === false) {
      opportunities.push({
        category: 'SEO_LOCAL',
        title: 'Falta etiqueta de título <title> en la página principal',
        severity: 'MEDIO',
        factProven: 'El código HTML no declara etiqueta de título para los motores de búsqueda.',
        commercialImpact: 'Google no puede mostrar el nombre o especialidad del consultorio adecuadamente en los resultados de búsqueda.',
      });
      const sSeo = findService('seo-local-maps');
      if (!recommendedServices.some((s) => s.serviceId === sSeo.id)) {
        recommendedServices.push({
          serviceId: sSeo.id,
          serviceName: sSeo.name,
          category: sSeo.category,
          suggestedPriceARS: sSeo.suggestedPriceARS,
          suggestedPriceUSD: sSeo.suggestedPriceUSD,
          reason: 'Optimización de etiquetas meta esenciales e integración con Google Maps.',
          justification: 'Corrige la indexación orgánica en Google para búsquedas locales de la zona.',
          urgency: 'BAJA',
        });
      }
    }
  }

  // 8. Alertas de información faltante en CRM
  if (!hasPhone) missingDataAlerts.push('No hay teléfono registrado. Se recomienda buscar el número de contacto directo.');
  if (!hasEmail) missingDataAlerts.push('No hay email registrado en la ficha comercial.');
  if (!hasAddress) missingDataAlerts.push('Dirección física incompleta o no especificada.');

  // 9. Cálculo de Precios y Paquete Recomendado (Bundle)
  const isZeroProposal = commercialOutcome === 'BUENA_PRESENCIA' || commercialOutcome === 'INFORMACION_INSUFICIENTE';

  const nonMonthlyServices = isZeroProposal ? [] : recommendedServices.filter((s) => !s.isMonthly);
  const monthlyServices = isZeroProposal ? [] : recommendedServices.filter((s) => s.isMonthly);

  const individualTotalARS = nonMonthlyServices.reduce((sum, s) => sum + s.suggestedPriceARS, 0);
  const individualTotalUSD = nonMonthlyServices.reduce((sum, s) => sum + s.suggestedPriceUSD, 0);

  const monthlyTotalARS = monthlyServices.reduce((sum, s) => sum + s.suggestedPriceARS, 0);
  const monthlyTotalUSD = monthlyServices.reduce((sum, s) => sum + s.suggestedPriceUSD, 0);

  // Paquete bonificado: 0% si es producto individual express/pro, o 15% si son múltiples servicios de desarrollo
  const bundleDiscountPercentage = nonMonthlyServices.length > 1 ? 15 : 0;
  const bundleFinalARS = Math.round(individualTotalARS * (1 - bundleDiscountPercentage / 100));
  const bundleFinalUSD = Math.round(individualTotalUSD * (1 - bundleDiscountPercentage / 100));

  // Inversión total del primer año
  const commitmentMonths = monthlyTotalARS > 0 ? 12 : 0;
  const firstYearTotalARS = bundleFinalARS + monthlyTotalARS * commitmentMonths;
  const firstYearTotalUSD = bundleFinalUSD + monthlyTotalUSD * commitmentMonths;

  let bundleName = 'Sin propuesta comercial requerida';
  if (commercialOutcome === 'BUENA_PRESENCIA') {
    bundleName = 'Sin propuesta comercial (Presencia sólida)';
  } else if (commercialOutcome === 'INFORMACION_INSUFICIENTE') {
    bundleName = 'Pausado (Pendiente de revisión humana)';
  } else if (!hasWebsite) {
    if (recommendedServices.some((s) => s.serviceId === 'sitio-institucional')) {
      bundleName = 'Pack Institucional Multipágina';
    } else if (recommendedServices.some((s) => s.serviceId === 'landing-profesional')) {
      bundleName = 'Pack Presencia Profesional (Landing 7 Secciones)';
    } else {
      bundleName = 'Pack Despegue Express (Landing Web + WhatsApp)';
    }
  } else if (commercialOutcome === 'OPORTUNIDAD_CLARA') {
    bundleName = 'Pack Modernización Web Estructural';
  } else {
    bundleName = `Intervención Puntual: ${recommendedServices[0]?.serviceName || 'Optimización Web'}`;
  }

  // 10. Argumentos Comerciales con Evidencia Verificable
  // Diferenciamos rigurosamente: Hechos Comprobados, Interpretaciones e Hipótesis Comerciales
  const provenFacts: string[] = [];
  const interpretations: string[] = [];
  const commercialHypothesis: string[] = [];
  let painPoint = '';
  let costOfInaction = '';
  let ourSolution = '';
  let whyNow = '';

  const cityName = business.city || 'la zona';

  if (commercialOutcome === 'BUENA_PRESENCIA') {
    provenFacts.push(
      `Sitio web oficial accesible con protocolo HTTPS seguro (${websiteUrl}).`,
      `Diseño adaptable a celulares con etiqueta viewport declarada.`,
      `Canales de contacto disponibles para el paciente (${hasWhatsAppDetected ? 'WhatsApp activo' : 'Teléfono registrado'}).`,
      `Tiempo de respuesta del servidor dentro de parámetros normales (${responseTimeMs} ms).`
    );
    interpretations.push(
      `El sitio cumple con los estándares necesarios para informar sobre tratamientos y recibir consultas.`,
      `La experiencia del usuario es satisfactoria y no presenta barreras técnicas críticas.`
    );
    commercialHypothesis.push(
      `Ofrecer un desarrollo o rediseño a este negocio carece de justificación honesta y dañaría la credibilidad de WebPilot.`,
      `Corresponde reconocer el trabajo bien hecho y mantener el registro en el CRM para seguimiento futuro sin prospección activa.`
    );
    painPoint = 'No se detectaron problemas comerciales significativos en la presencia web actual.';
    costOfInaction = 'Cero costo de inacción: el negocio ya dispone de un canal digital funcional para sus pacientes.';
    ourSolution = 'No ofrecer servicios comerciales en este momento. Mantener una postura de honestidad profesional.';
    whyNow = 'No corresponde forzar un contacto de venta. Conviene felicitar al profesional si se establece contacto o mantenerlo en seguimiento.';
  } else if (commercialOutcome === 'INFORMACION_INSUFICIENTE') {
    provenFacts.push(
      `La auditoría técnica no arrojó resultados concluyentes o registró error de conexión.`,
      titoPerf.errorMessage || 'No se pudo verificar fehacientemente el contenido de la web.'
    );
    interpretations.push(
      `Se desconoce el estado operativo real de la web o si el dominio está activo.`
    );
    commercialHypothesis.push(
      `No se debe realizar ninguna propuesta comercial sin comprobación humana previa para evitar errores.`
    );
    painPoint = 'Información técnica insuficiente para emitir un diagnóstico comercial confiable.';
    costOfInaction = 'Desconocido. Requiere inspección manual previa.';
    ourSolution = 'Realizar revisión humana manual por parte del equipo antes de cualquier contacto.';
    whyNow = 'Evitar contactar a un profesional con datos erróneos o desactualizados.';
  } else if (commercialOutcome === 'PROPUESTA_OPCIONAL') {
    provenFacts.push(
      `El sitio web ${websiteUrl} funciona en términos generales bajo HTTPS y diseño móvil.`,
      opportunities[0]?.factProven || 'Oportunidad puntual detectada en auditoría.'
    );
    interpretations.push(
      `El sitio es adecuado en lo general, pero este detalle específico genera una pequeña fricción para el usuario móvil.`
    );
    commercialHypothesis.push(
      `Una intervención técnica acotada y económica (${formatCurrency(bundleFinalARS)}) puede implementarse rápidamente sin alterar el resto de la web.`
    );
    painPoint = `Detalle puntual detectado en la web: ${opportunities[0]?.title || 'optimización puntual'}.`;
    costOfInaction = 'Algunos visitantes pueden experimentar demoras puntuales o preferir un canal de consulta más ágil.';
    ourSolution = `Servicio opcional y específico de ${recommendedServices.map((s) => s.serviceName).join(', ')} (${formatCurrency(bundleFinalARS)}), respetando la web existente.`;
    whyNow = 'Intervención rápida de bajo costo que se implementa en pocos días sin riesgo técnico.';
  } else {
    // OPORTUNIDAD_CLARA
    if (!hasWebsite) {
      provenFacts.push(
        'No figura ningún sitio web registrado en Google Places ni en la ficha pública comercial del negocio.',
        `Los pacientes que buscan servicios de ${business.industry || 'salud'} en ${cityName} dependen exclusivamente de reseñas o teléfonos fijos.`
      );
      interpretations.push(
        `Al no tener página propia con información detallada de tratamientos y horarios, los pacientes tienden a optar por consultorios con web visible.`
      );
      commercialHypothesis.push(
        `Una landing page accesible con botón directo a WhatsApp ($69.000 + $19.000/mes) facilitará la captación directa de consultas.`
      );
      painPoint = `Actualmente "${business.name}" no cuenta con un sitio web oficial. Los pacientes de ${cityName} no encuentran un espacio propio donde informarse o agendar turnos.`;
      costOfInaction = `Los pacientes que buscan profesionales en Google Maps terminan agendando con consultorios que ofrecen un canal web visible.`;
      ourSolution = `Landing Express profesional por ${formatCurrency(bundleFinalARS)} iniciales (3 a 5 días) + abono de mantenimiento de ${formatCurrency(monthlyTotalARS)}/mes con WebPilot encargándose de todo.`;
      whyNow = `Estrategia de volumen accesible que permite comenzar a captar pacientes con una inversión inicial mínima.`;
    } else {
      provenFacts.push(
        `El sitio web ${websiteUrl} presenta fallas críticas comprobadas: ${opportunities.map((o) => o.title).join(', ')}.`
      );
      interpretations.push(
        'Las fallas detectadas generan advertencias de seguridad o problemas de visualización en celulares que provocan desconfianza.'
      );
      commercialHypothesis.push(
        'Una modernización web completa permitirá resolver de raíz las advertencias y recuperar la confianza de los visitantes.'
      );
      painPoint = `Fallas estructurales en el sitio web actual (${opportunities.map((o) => o.title).join(', ')}).`;
      costOfInaction = 'Las advertencias de seguridad y la falta de adaptación móvil hacen que los visitantes abandonen la página antes de consultar.';
      ourSolution = `Modernización web por ${formatCurrency(bundleFinalARS)} con protocolo HTTPS seguro y diseño responsive.`;
      whyNow = 'Resolver problemas que perjudican activamente la imagen del consultorio en internet.';
    }
  }

  // 11. Mensajes Iniciales de Contacto Personalizados (WhatsApp y Email)
  let whatsappMessage = '';
  let emailSubject = '';
  let emailBody = '';

  if (commercialOutcome === 'BUENA_PRESENCIA') {
    whatsappMessage = `Hola! 👋 Me contacto del equipo de WebPilot con respecto a ${business.name}.\n\nEstuvimos revisando la presencia digital de su consultorio y queremos felicitarlos por la calidad de su página web (${websiteUrl}) y la claridad de sus canales de atención. Consideramos que cuentan con una presencia digital sólida.\n\nEn WebPilot AI valoramos el trabajo profesional bien hecho y no ofrecemos servicios cuando no hay una necesidad real comprobada. Quedamos a su disposición para cualquier consulta técnica futura.\n\n¡Que tengan una excelente semana!`;
    emailSubject = `Reconocimiento a la presencia digital de ${business.name}`;
    emailBody = `Estimado equipo de ${business.name},\n\nQueremos felicitarlos por la presencia web de su consultorio (${websiteUrl}). Nuestro análisis determinó que cuentan con una presencia digital sólida, segura y bien adaptada a dispositivos móviles.\n\nEn WebPilot AI creemos en el asesoramiento honesto: no recomendamos servicios comerciales cuando un negocio ya tiene una solución que funciona bien.\n\nQuedamos a su disposición en caso de que en el futuro requieran asistencia técnica especializada.\n\nSaludos cordiales,\nEquipo WebPilot AI`;
  } else if (commercialOutcome === 'INFORMACION_INSUFICIENTE') {
    whatsappMessage = `[REVISIÓN HUMANA REQUERIDA] No enviar mensaje hasta validar manualmente el estado del sitio ${websiteUrl}.`;
    emailSubject = `[Pendiente de revisión humana] ${business.name}`;
    emailBody = `Este negocio requiere validación manual previa por parte del equipo antes de iniciar cualquier contacto comercial.`;
  } else if (commercialOutcome === 'PROPUESTA_OPCIONAL') {
    whatsappMessage = `Hola! 👋 Me contacto del equipo de WebPilot con respecto a ${business.name}.\n\nEstuvimos viendo su página web (${websiteUrl}) y nos pareció muy completa en cuanto a información y presentación. Notamos únicamente una oportunidad puntual y opcional que podría sumarles comodidad: ${opportunities[0]?.title.toLowerCase() || 'optimización puntual'}.\n\nSi en algún momento desean mejorar este aspecto, en WebPilot podemos resolverlo puntualmente sin modificar el resto de su página. ¿Les interesaría recibir una breve información al respecto?\n\n¡Saludos cordiales!`;
    emailSubject = `Oportunidad puntual de optimización para ${business.name}`;
    emailBody = `Estimado equipo de ${business.name},\n\nEstuvimos revisando su sitio web (${websiteUrl}) y nos pareció muy completo en cuanto a información y estructura.\n\nSolo identificamos una oportunidad puntual que podría optimizarse:\n• ${opportunities[0]?.title}: ${opportunities[0]?.factProven}\n\nNuestra propuesta es puntual y específica: ${recommendedServices[0]?.serviceName} (${formatCurrency(bundleFinalARS)}), sin necesidad de rediseñar toda la web ni contratar servicios adicionales.\n\nQuedamos a disposición si desean evaluarlo.\n\nAtentamente,\nEquipo WebPilot AI`;
  } else {
    // OPORTUNIDAD_CLARA
    if (!hasWebsite) {
      whatsappMessage = `Hola! 👋 Me contacto del equipo de WebPilot con respecto a ${business.name}.\n\nEstuvimos analizando la presencia digital de los profesionales de ${cityName} y notamos que actualmente no cuentan con un sitio web propio para que los pacientes puedan conocer sus especialidades y solicitar turnos por WhatsApp.\n\nDesarrollamos una *Landing Express profesional* por solo *${formatCurrency(bundleFinalARS)} iniciales*, lista en 3 a 5 días y adaptada a celulares. Además, nos ocupamos de mantenerla online, actualizada y funcionando por un abono mensual accesible de *${formatCurrency(monthlyTotalARS)}/mes* (compromiso inicial de 12 meses).\n\n¿Tendrían 5 minutos esta semana para mostrarles una propuesta simple y sin compromiso?\n\n¡Muchas gracias y que tengan un excelente día!`;
      emailSubject = `Propuesta de presencia web y captación de pacientes para ${business.name}`;
      emailBody = `Estimado equipo de ${business.name},\n\nMi nombre es parte del equipo de WebPilot AI. Nos especializamos en potenciar la presencia digital y la captación de clientes de consultorios y empresas en ${cityName}.\n\n${painPoint}\n\nPara solucionar esto, preparamos una propuesta orientativa:\n${recommendedServices.map((s) => `• ${s.serviceName}: ${s.reason}`).join('\n')}\n\nEstructura de inversión transparente:\n• Desarrollo inicial: ${formatCurrency(bundleFinalARS)} (pago único)\n• Mantenimiento y hosting continuo: ${formatCurrency(monthlyTotalARS)}/mes (compromiso inicial de 12 meses)\n• Inversión total estimada del primer año: ${formatCurrency(firstYearTotalARS)}\n\nNos ocupamos de que su web esté siempre online, rápida, segura y lista para captar pacientes sin que el consultorio tenga que preocuparse por cuestiones técnicas.\n\n¿Tienen 5 minutos esta semana para que conversemos sin ningún compromiso?\n\nAtentamente,\nEquipo WebPilot AI\nDaro & Julieta`;
    } else {
      whatsappMessage = `Hola! 👋 Me contacto del equipo de WebPilot con respecto a ${business.name}.\n\nEstuvimos revisando su sitio web (${websiteUrl}) y notamos aspectos técnicos importantes que están dificultando la consulta de pacientes en celulares (${opportunities[0]?.title.toLowerCase() || 'problemas de navegación'}).\n\nPreparamos un breve informe técnico gratuito con recomendaciones para modernizarlo de manera accesible. ¿A quién podríamos compartirle este informe para que lo puedan evaluar?\n\n¡Saludos cordiales!`;
      emailSubject = `Diagnóstico técnico y modernización web para ${business.name}`;
      emailBody = `Estimado equipo de ${business.name},\n\nRevisamos su sitio web (${websiteUrl}) y detectamos oportunidades técnicas estructurales:\n${opportunities.map((o) => `• ${o.title}: ${o.factProven}`).join('\n')}\n\nNuestra propuesta para solucionarlo es ${recommendedServices.map((s) => s.serviceName).join(', ')} (${formatCurrency(bundleFinalARS)}).\n\nQuedamos a su disposición para conversar sin compromiso.\n\nSaludos cordiales,\nEquipo WebPilot AI`;
    }
  }

  // 12. Resumen Comercial General
  let summary = '';
  if (commercialOutcome === 'BUENA_PRESENCIA') {
    summary = `El negocio cuenta con una presencia digital sólida. No identificamos una necesidad concreta que justifique ofrecer nuestros servicios actualmente.`;
  } else if (commercialOutcome === 'INFORMACION_INSUFICIENTE') {
    summary = `No se pudo verificar fehacientemente la presencia digital de este negocio (auditoría no concluyente o error de conexión). Se solicita revisión humana manual.`;
  } else if (commercialOutcome === 'PROPUESTA_OPCIONAL') {
    summary = `Presencia web funcional con oportunidad puntual y opcional de optimización en ${opportunities.map((o) => o.title).join(', ')}.`;
  } else {
    summary = !hasWebsite
      ? `Oportunidad comercial clara de desarrollo web desde cero para ${business.name}. Ausencia de presencia digital propia en una zona con alta demanda.`
      : `Oportunidad comercial clara de modernización técnica para ${business.name}. Foco en resolver ${opportunities.map((o) => o.title).join(' y ')}.`;
  }

  // 13. Estructura completa de la estrategia de Vera
  const strategy: VeraCommercialStrategy = {
    businessId: business.id,
    businessName: business.name,
    summary,
    commercialOutcome,
    commercialOutcomeLabel,
    actionRecommendation,
    digitalPresence: {
      tier,
      tierLabel,
      hasWebsite,
      websiteUrl,
      hasPhone,
      hasWhatsApp: hasWhatsAppDetected,
      hasEmail,
      hasAddress,
      titoAuditCompleted,
      titoScore,
      titoIssuesCount: auditIssues.length,
      details: [
        hasWebsite ? `Sitio web activo: ${websiteUrl}` : 'Sin sitio web registrado',
        hasPhone ? `Teléfono registrado: ${business.phone}` : 'Sin teléfono en ficha',
        hasWhatsAppDetected ? 'WhatsApp detectado en sitio o ficha' : 'Sin botón directo de WhatsApp detectado',
        titoAuditCompleted
          ? `Auditoría técnica de Tito completada (Score: ${titoScore !== null ? `${titoScore}/100` : 'N/A'})`
          : hasWebsite
          ? 'Auditoría técnica de Tito pendiente o inconclusa'
          : 'No requiere auditoría técnica estática',
        `Diagnóstico comercial Vera: ${commercialOutcomeLabel}`,
      ],
    },
    opportunities,
    recommendedServices,
    suggestedPricing: {
      individualServicesTotalARS: individualTotalARS,
      individualServicesTotalUSD: individualTotalUSD,
      bundleName,
      bundleDiscountPercentage,
      bundleFinalARS,
      bundleFinalUSD,
      monthlyMaintenanceARS: monthlyTotalARS,
      monthlyMaintenanceUSD: monthlyTotalUSD,
      firstYearTotalARS,
      firstYearTotalUSD,
      commitmentMonths,
      isCustomQuote: false,
      notes: isZeroProposal
        ? 'Sin cotización de servicios requerida.'
        : `Desarrollo inicial: ${formatCurrency(bundleFinalARS)} (pago único). Mantenimiento y hosting: ${formatCurrency(monthlyTotalARS)}/mes (compromiso inicial ${commitmentMonths} meses). Inversión total 1.er año: ${formatCurrency(firstYearTotalARS)}.`,
    },
    commercialArguments: {
      provenFacts,
      interpretations,
      commercialHypothesis,
      painPoint,
      costOfInaction,
      ourSolution,
      whyNow,
    },
    outreachPitch: {
      whatsappMessage,
      emailSubject,
      emailBody,
    },
    missingDataAlerts,
    analyzedAt: new Date().toISOString(),
  };

  // 14. Guardar en Supabase: actualizar o crear registro en `audits` (campo ai_insights.vera_strategy)
  if (latestAudit) {
    const updatedAiInsights = {
      ...(latestAudit.ai_insights || {}),
      vera_strategy: strategy,
    };

    await supabase
      .from('audits')
      .update({
        ai_insights: updatedAiInsights,
        updated_at: new Date().toISOString(),
      })
      .eq('id', latestAudit.id);
  } else {
    // Si el negocio no tiene auditoría previa (ej: sin sitio web), creamos el registro de auditoría comercial en audits
    await supabase.from('audits').insert([
      {
        business_id: business.id,
        score: hasWebsite ? null : 20,
        performance_data: { notice: 'Negocio sin sitio web. Análisis comercial de Vera generado.' },
        seo_data: {},
        ai_insights: {
          vera_strategy: strategy,
          inspector: 'Vera — Estratega Comercial WebPilot AI',
        },
        status: 'COMPLETADO',
      },
    ]);
  }

  // 15. Sincronizar con la tabla `opportunities` del CRM (Pipeline de Ventas)
  // Solo sincronizamos activamente si hay una propuesta comercial real
  if (commercialOutcome === 'OPORTUNIDAD_CLARA' || commercialOutcome === 'PROPUESTA_OPCIONAL') {
    const { data: existingOpps } = await supabase
      .from('opportunities')
      .select('id')
      .eq('business_id', business.id)
      .limit(1);

    if (existingOpps && existingOpps.length > 0) {
      await supabase
        .from('opportunities')
        .update({
          title: `Estrategia Vera: ${bundleName}`,
          estimated_value: bundleFinalARS,
          stage: 'SELECCIONADO' as CRMStage,
          probability: 60,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingOpps[0].id);
    } else {
      await supabase.from('opportunities').insert([
        {
          business_id: business.id,
          user_id: business.user_id || null,
          title: `Estrategia Vera: ${bundleName}`,
          estimated_value: bundleFinalARS,
          stage: 'SELECCIONADO' as CRMStage,
          probability: 60,
        },
      ]);
    }

    // Actualizar estado del negocio en el CRM a SELECCIONADO
    if (business.status === 'NUEVO' || business.status === 'AUDITADO') {
      await supabase
        .from('businesses')
        .update({
          status: 'SELECCIONADO' as CRMStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id);
    }
  }

  // 16. Asentar actividad en el historial comercial
  let activityDesc = '';
  if (commercialOutcome === 'BUENA_PRESENCIA') {
    activityDesc = `Vera evaluó el negocio: Presencia digital sólida. No se identificaron necesidades concretas que justifiquen ofrecer servicios actualmente. Se preserva la relación comercial sin prospección activa.`;
  } else if (commercialOutcome === 'INFORMACION_INSUFICIENTE') {
    activityDesc = `Vera evaluó el negocio: Información técnica insuficiente para un diagnóstico concluyente. Se solicita revisión humana previa.`;
  } else if (commercialOutcome === 'PROPUESTA_OPCIONAL') {
    activityDesc = `Vera formuló propuesta opcional y específica: ${bundleName} (${formatCurrency(bundleFinalARS)}). Intervención puntual para resolver problemas comprobados.`;
  } else {
    activityDesc = `Vera formuló estrategia comercial: ${bundleName} (${formatCurrency(bundleFinalARS)} + ${formatCurrency(monthlyTotalARS)}/mes). Oportunidad clara detectada.`;
  }

  await supabase.from('activities').insert([
    {
      business_id: business.id,
      user_id: business.user_id || null,
      type: 'NOTA',
      description: activityDesc,
      from_stage: business.status,
      to_stage: business.status,
    },
  ]);

  return strategy;
}

/**
 * Permite marcar un negocio como "Sin oportunidad comercial por ahora".
 * Persiste la decisión en ai_insights.vera_strategy y registra una actividad en el CRM.
 */
export async function markAsNoOpportunity(
  businessId: string,
  reason: string = 'Presencia digital sólida y funcional. No requiere propuesta comercial activa.',
  client?: any
): Promise<void> {
  const supabase = client || createClient();

  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (audits && audits.length > 0) {
    const existingAudit = audits[0];
    const prevInsights = existingAudit.ai_insights || {};
    const prevStrategy = prevInsights.vera_strategy || {};

    const updatedStrategy: VeraCommercialStrategy = {
      ...prevStrategy,
      commercialOutcome: 'BUENA_PRESENCIA',
      commercialOutcomeLabel: 'Buena presencia digital — Sin oportunidad comercial por ahora',
      actionRecommendation: 'NO_OFRECER',
      markedAsNoOpportunity: true,
      markedAsNoOpportunityReason: reason,
      markedAsNoOpportunityDate: new Date().toISOString(),
      recommendedServices: [],
      suggestedPricing: {
        ...(prevStrategy.suggestedPricing || {}),
        bundleFinalARS: 0,
        bundleFinalUSD: 0,
        monthlyMaintenanceARS: 0,
        monthlyMaintenanceUSD: 0,
        firstYearTotalARS: 0,
        firstYearTotalUSD: 0,
        bundleName: 'Sin oportunidad comercial por ahora',
      },
    };

    await supabase
      .from('audits')
      .update({
        ai_insights: {
          ...prevInsights,
          vera_strategy: updatedStrategy,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingAudit.id);
  }

  // Registrar actividad en el CRM
  await supabase.from('activities').insert([
    {
      business_id: businessId,
      type: 'NOTA',
      description: `Vera AI: Marcado como «Sin oportunidad comercial por ahora». Razón: ${reason}. Se mantiene en el CRM para seguimiento institucional futuro.`,
      from_stage: null,
      to_stage: null,
    },
  ]);
}

/**
 * Obtiene el listado completo de negocios para el panel de Vera enriquecido con estados de Tito y Vera.
 */
export async function getVeraBusinesses(client?: any): Promise<VeraBusinessSummary[]> {
  const supabase = client || createClient();

  const { data: businesses, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .order('name', { ascending: true });

  if (bErr || !businesses) {
    console.error('Error al obtener negocios para Vera:', bErr);
    return [];
  }

  // Obtener auditorías existentes
  const { data: audits } = await supabase
    .from('audits')
    .select('id, business_id, score, performance_data, ai_insights, status, created_at')
    .order('created_at', { ascending: false });

  // Map de auditorías por business_id (la más reciente)
  const auditMap = new Map<string, any>();
  audits?.forEach((aud: any) => {
    if (!auditMap.has(aud.business_id)) {
      auditMap.set(aud.business_id, aud);
    }
  });

  return businesses.map((b: any) => {
    const aud = auditMap.get(b.id);
    const isInstagram = Boolean(b.website && (b.website.includes('instagram.com') || b.website.includes('instagr.am')));
    const hasWebsite = Boolean(b.website && b.website.trim() && !b.website.includes('null') && !isInstagram);
    const titoCompleted = Boolean(aud && aud.performance_data && Object.keys(aud.performance_data).length > 0 && aud.performance_data.statusCode);
    
    const veraStrategy: VeraCommercialStrategy | null = aud?.ai_insights?.vera_strategy || null;

    let titoStatus: 'COMPLETADO' | 'PENDIENTE' | 'NO_APLICA' | 'FALLIDO' = 'PENDIENTE';
    if (!hasWebsite) {
      titoStatus = 'NO_APLICA';
    } else if (aud?.performance_data?.errorMessage || aud?.performance_data?.statusCode === 0) {
      titoStatus = 'FALLIDO';
    } else if (titoCompleted) {
      titoStatus = 'COMPLETADO';
    }

    const outcome: VeraCommercialOutcome =
      veraStrategy?.commercialOutcome ||
      (veraStrategy?.suggestedPricing?.bundleFinalARS === 0
        ? 'BUENA_PRESENCIA'
        : !hasWebsite
        ? 'OPORTUNIDAD_CLARA'
        : 'PROPUESTA_OPCIONAL');

    const outcomeLabel: string =
      veraStrategy?.commercialOutcomeLabel ||
      (outcome === 'BUENA_PRESENCIA'
        ? 'Buena presencia digital — No ofrecer servicios'
        : outcome === 'PROPUESTA_OPCIONAL'
        ? 'Presencia digital mejorable — Propuesta opcional'
        : outcome === 'INFORMACION_INSUFICIENTE'
        ? 'Información insuficiente — Revisión humana'
        : 'Oportunidad comercial clara');

    const actionRec: VeraActionRecommendation =
      veraStrategy?.actionRecommendation ||
      (outcome === 'BUENA_PRESENCIA'
        ? 'NO_OFRECER'
        : outcome === 'INFORMACION_INSUFICIENTE'
        ? 'REVISION_HUMANA'
        : outcome === 'PROPUESTA_OPCIONAL'
        ? 'PROPUESTA_OPCIONAL'
        : 'PREPARAR_PROPUESTA');

    let primaryNeed = veraStrategy?.opportunities?.[0]?.title || null;
    if (outcome === 'BUENA_PRESENCIA') {
      primaryNeed = 'Presencia digital sólida (No ofrecer servicios)';
    } else if (outcome === 'INFORMACION_INSUFICIENTE') {
      primaryNeed = 'Información insuficiente (Revisión humana requerida)';
    }

    return {
      business: b as Business,
      hasWebsite,
      titoAudit: {
        status: titoStatus,
        score: aud && aud.score !== null ? Number(aud.score) : null,
        issuesCount: aud?.ai_insights?.totalIssuesCount || 0,
      },
      veraStrategy: {
        hasStrategy: Boolean(veraStrategy),
        analyzedAt: veraStrategy?.analyzedAt || null,
        commercialOutcome: outcome,
        commercialOutcomeLabel: outcomeLabel,
        actionRecommendation: actionRec,
        markedAsNoOpportunity: Boolean(veraStrategy?.markedAsNoOpportunity),
        primaryNeed,
        suggestedBundleARS: veraStrategy?.suggestedPricing?.bundleFinalARS ?? null,
        monthlyMaintenanceARS: veraStrategy?.suggestedPricing?.monthlyMaintenanceARS ?? null,
        firstYearTotalARS: veraStrategy?.suggestedPricing?.firstYearTotalARS ?? null,
        servicesCount: veraStrategy?.recommendedServices?.length || 0,
        urgency:
          outcome === 'BUENA_PRESENCIA'
            ? 'NINGUNA'
            : outcome === 'INFORMACION_INSUFICIENTE'
            ? 'BAJA'
            : ((veraStrategy?.recommendedServices?.[0]?.urgency as any) || 'MEDIA'),
      },
    };
  });
}

/**
 * Obtiene la estrategia comercial completa de Vera guardada para un negocio específico.
 */
export async function getBusinessStrategy(
  businessId: string,
  client?: any
): Promise<VeraCommercialStrategy | null> {
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

  return audits[0].ai_insights?.vera_strategy || null;
}
