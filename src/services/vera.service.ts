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

export interface VeraCommercialStrategy {
  businessId: string;
  businessName: string;
  summary: string;
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
    isCustomQuote: boolean;
    notes: string;
  };
  commercialArguments: {
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
    status: 'COMPLETADO' | 'PENDIENTE' | 'NO_APLICA';
    score: number | null;
    issuesCount: number;
  };
  veraStrategy: {
    hasStrategy: boolean;
    analyzedAt: string | null;
    primaryNeed: string | null;
    suggestedBundleARS: number | null;
    servicesCount: number;
    urgency: 'ALTA' | 'MEDIA' | 'BAJA';
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

  // 5. Determinar Tier de Presencia Digital
  let tier: 'SIN_WEB' | 'DEFICIENTE' | 'MEJORABLE' | 'SOLIDA' = 'MEJORABLE';
  let tierLabel = 'Presencia web mejorable con oportunidades de captación';

  if (!hasWebsite && isInstagram) {
    tier = 'SIN_WEB';
    tierLabel = 'Presencia limitada a redes sociales (Instagram sin sitio web propio)';
  } else if (!hasWebsite) {
    tier = 'SIN_WEB';
    tierLabel = 'Crítica: Sin sitio web registrado (Oportunidad de desarrollo desde cero)';
  } else if (isHttpInsecure || !hasViewport || (titoScore !== null && titoScore < 50)) {
    tier = 'DEFICIENTE';
    tierLabel = 'Deficiente: Web con advertencias de seguridad o sin adaptación móvil';
  } else if (titoScore !== null && titoScore >= 80 && hasWhatsAppDetected) {
    tier = 'SOLIDA';
    tierLabel = 'Sólida: Base técnica adecuada, foco en optimización continua y mantenimiento';
  }

  // 6. Detección de oportunidades concretas con hechos comprobables
  const opportunities: VeraOpportunity[] = [];
  const recommendedServices: VeraRecommendedService[] = [];
  const missingDataAlerts: string[] = [];

  // Helper para buscar servicio en el catálogo
  const findService = (id: string): ServiceItem => {
    return catalog.find((s) => s.id === id) || DEFAULT_SERVICES_CATALOG.find((s) => s.id === id)!;
  };

  // CASO 1: NEGOCIOS SIN SITIO WEB (O SOLO INSTAGRAM)
  if (!hasWebsite) {
    if (isInstagram) {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Presencia digital limitada a Instagram sin web propia indexable en Google',
        severity: 'ALTO',
        factProven: `El negocio utiliza su perfil de Instagram (${websiteUrl}) como único canal web.`,
        commercialImpact: 'Los pacientes que buscan profesionales en Google o Google Maps no navegan perfiles de Instagram y optan por consultorios con web directa.',
      });
    } else {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Ausencia total de canal web propio para captación de clientes',
        severity: 'CRITICO',
        factProven: 'No figura ningún sitio web registrado en Google Places ni en su ficha pública comercial.',
        commercialImpact: 'Los pacientes que buscan profesionales de su especialidad en la zona no encuentran una página de referencia y eligen a consultorios competidores con sitio visible.',
      });
    }

    const isClinicOrConsultorio = business.industry?.toLowerCase().includes('odont') || business.name.toLowerCase().includes('consultorio') || business.name.toLowerCase().includes('centro');

    if (isClinicOrConsultorio) {
      const sInst = findService('sitio-institucional');
      recommendedServices.push({
        serviceId: sInst.id,
        serviceName: sInst.name,
        category: sInst.category,
        suggestedPriceARS: sInst.suggestedPriceARS,
        suggestedPriceUSD: sInst.suggestedPriceUSD,
        reason: 'Permite presentar al equipo de profesionales, especialidades, fotos del consultorio y canal de turnos.',
        justification: `El negocio es un centro/consultorio consolidado ("${business.name}") que necesita transmitir confianza médica y respaldo institucional.`,
        urgency: 'ALTA',
      });
    } else {
      const sLand = findService('landing-page');
      recommendedServices.push({
        serviceId: sLand.id,
        serviceName: sLand.name,
        category: sLand.category,
        suggestedPriceARS: sLand.suggestedPriceARS,
        suggestedPriceUSD: sLand.suggestedPriceUSD,
        reason: 'Solución ágil y de costo accesible para comenzar a recibir consultas directas por WhatsApp desde Google.',
        justification: `Negocio sin presencia web que requiere un punto de contacto profesional sin grandes demoras de desarrollo.`,
        urgency: 'ALTA',
      });
    }

    // SEO Local
    const sSeo = findService('seo-local-maps');
    recommendedServices.push({
      serviceId: sSeo.id,
      serviceName: sSeo.name,
      category: sSeo.category,
      suggestedPriceARS: sSeo.suggestedPriceARS,
      suggestedPriceUSD: sSeo.suggestedPriceUSD,
      reason: 'Vincular la nueva web al perfil de Google Maps para aparecer en los primeros resultados de la zona.',
      justification: `La ficha actual en Google Maps se potencia drásticamente al vincular un dominio con SEO local configurado.`,
      urgency: 'ALTA',
    });

    // Mantenimiento
    const sMant = findService('mantenimiento-mensual');
    recommendedServices.push({
      serviceId: sMant.id,
      serviceName: sMant.name,
      category: sMant.category,
      suggestedPriceARS: sMant.suggestedPriceARS,
      suggestedPriceUSD: sMant.suggestedPriceUSD,
      isMonthly: true,
      reason: 'Garantizar hosting de alto rendimiento, soporte continuo y certificado SSL sin complicaciones técnicas para el cliente.',
      justification: 'Los profesionales de la salud y comercios prefieren delegar completamente los aspectos técnicos de hosting y actualizaciones.',
      urgency: 'MEDIA',
    });
  } else {
    // CASO 2: NEGOCIOS CON SITIO WEB
    if (!titoAuditCompleted) {
      opportunities.push({
        category: 'OPTIMIZACION_VELOCIDAD',
        title: 'Auditoría técnica de Tito pendiente',
        severity: 'BAJO',
        factProven: `El sitio ${websiteUrl} aún no fue auditado en profundidad por Tito.`,
        commercialImpact: 'Falta confirmar métricas exactas de velocidad y seguridad antes de presentar un informe de diagnóstico exhaustivo.',
      });
    }

    // A. SEGURIDAD Y SSL
    if (isHttpInsecure) {
      opportunities.push({
        category: 'DESARROLLO_WEB',
        title: 'Sitio sin candado de seguridad SSL (Cartel "No es seguro")',
        severity: 'CRITICO',
        factProven: `La URL final es ${titoPerf.finalUrl || websiteUrl} bajo protocolo HTTP sin cifrar.`,
        commercialImpact: 'Los pacientes que ingresan ven una advertencia de seguridad en Chrome/Safari que genera desconfianza inmediata y abandono.',
      });

      const sRedesign = findService('rediseno-web');
      recommendedServices.push({
        serviceId: sRedesign.id,
        serviceName: sRedesign.name,
        category: sRedesign.category,
        suggestedPriceARS: sRedesign.suggestedPriceARS,
        suggestedPriceUSD: sRedesign.suggestedPriceUSD,
        reason: 'Migrar a una arquitectura segura con HTTPS forzado y diseño moderno.',
        justification: `Un sitio que aún corre bajo HTTP suele tener tecnologías obsoletas que ameritan una modernización completa.`,
        urgency: 'ALTA',
      });
    }

    // B. RENDIMIENTO Y VELOCIDAD
    if (isSlowResponse || isHeavyHtml) {
      opportunities.push({
        category: 'OPTIMIZACION_VELOCIDAD',
        title: 'Carga inicial del sitio lenta (Servidor demorado)',
        severity: 'ALTO',
        factProven: `Tiempo medido de entrega de HTML: ${responseTimeMs} ms (recomendado < 600 ms). Peso HTML: ${titoPerf.htmlSizeKb || 0} KB.`,
        commercialImpact: 'Más del 40% de los visitantes desde teléfonos celulares abandonan si la página tarda más de 3 segundos en responder.',
      });

      const sSpeed = findService('optimizacion-velocidad');
      recommendedServices.push({
        serviceId: sSpeed.id,
        serviceName: sSpeed.name,
        category: sSpeed.category,
        suggestedPriceARS: sSpeed.suggestedPriceARS,
        suggestedPriceUSD: sSpeed.suggestedPriceUSD,
        reason: 'Configurar caché de servidor, compresión Brotli/Gzip y CDN Cloudflare para respuesta inmediata.',
        justification: `La lentitud actual de ${responseTimeMs} ms perjudica el posicionamiento en Google y agota la paciencia de potenciales pacientes.`,
        urgency: 'ALTA',
      });
    }

    // C. CONVERSIÓN COMERCIAL (WhatsApp)
    if (!hasWhatsAppDetected) {
      opportunities.push({
        category: 'CANAL_CONVERSION',
        title: 'Falta botón directo e interactivo de WhatsApp',
        severity: 'ALTO',
        factProven: 'No se detectaron enlaces wa.me ni botones flotantes de mensajería en el sitio web.',
        commercialImpact: 'En Argentina, más del 80% de las consultas y turnos se concretan por WhatsApp. Obligar al usuario a copiar un número fijo reduce la tasa de contacto.',
      });

      const sWa = findService('integracion-whatsapp');
      recommendedServices.push({
        serviceId: sWa.id,
        serviceName: sWa.name,
        category: sWa.category,
        suggestedPriceARS: sWa.suggestedPriceARS,
        suggestedPriceUSD: sWa.suggestedPriceUSD,
        reason: 'Integrar botón flotante de WhatsApp animado con mensaje preconfigurado de consulta.',
        justification: 'Incremento directo e inmediato en el volumen de consultas semanales con un cambio técnico rápido.',
        urgency: 'ALTA',
      });
    }

    // D. FORMULARIOS DE CAPTACIÓN
    if (!hasFormsDetected) {
      opportunities.push({
        category: 'CANAL_CONVERSION',
        title: 'Sin formulario de contacto para consultas fuera de horario',
        severity: 'MEDIO',
        factProven: 'El código fuente no posee formularios <form> de consulta o solicitud de presupuesto.',
        commercialImpact: 'Las visitas que ingresan por la noche o fines de semana no tienen dónde dejar su consulta si el teléfono no atiende.',
      });

      const sForm = findService('formularios-turnos');
      recommendedServices.push({
        serviceId: sForm.id,
        serviceName: sForm.name,
        category: sForm.category,
        suggestedPriceARS: sForm.suggestedPriceARS,
        suggestedPriceUSD: sForm.suggestedPriceUSD,
        reason: 'Instalar formulario rápido de 3 campos que envía la notificación directa al profesional.',
        justification: 'Captura pacientes que navegan fuera del horario comercial del consultorio.',
        urgency: 'MEDIA',
      });
    }

    // E. SEO LOCAL Y VISIBILIDAD
    if (missingH1 || shortTitle || missingMetaDesc || imagesWithoutAlt > 3) {
      const detailsList = [];
      if (missingH1) detailsList.push('sin encabezado H1');
      if (shortTitle) detailsList.push('título muy breve o no optimizado');
      if (missingMetaDesc) detailsList.push('sin meta descripción');
      if (imagesWithoutAlt > 0) detailsList.push(`${imagesWithoutAlt} fotos sin texto alt`);

      opportunities.push({
        category: 'SEO_LOCAL',
        title: 'Oportunidad de mejora en posicionamiento SEO local',
        severity: 'MEDIO',
        factProven: `Problemas on-page detectados por Tito: ${detailsList.join(', ')}.`,
        commercialImpact: 'Google no cuenta con señales claras para posicionar la clínica en búsquedas locales como "dentista en Quilmes" o especialidades odontológicas.',
      });

      const sSeo = findService('seo-local-maps');
      if (!recommendedServices.some((s) => s.serviceId === sSeo.id)) {
        recommendedServices.push({
          serviceId: sSeo.id,
          serviceName: sSeo.name,
          category: sSeo.category,
          suggestedPriceARS: sSeo.suggestedPriceARS,
          suggestedPriceUSD: sSeo.suggestedPriceUSD,
          reason: 'Optimizar la estructura on-page e integrar con la ficha de Google Maps para ganar visibilidad orgánica.',
          justification: `Corrección de ${detailsList.join(', ')} para superar a consultorios cercanos en Google.`,
          urgency: 'MEDIA',
        });
      }
    }

    // F. MANTENIMIENTO WEB
    const sMant = findService('mantenimiento-mensual');
    if (!recommendedServices.some((s) => s.serviceId === sMant.id)) {
      recommendedServices.push({
        serviceId: sMant.id,
        serviceName: sMant.name,
        category: sMant.category,
        suggestedPriceARS: sMant.suggestedPriceARS,
        suggestedPriceUSD: sMant.suggestedPriceUSD,
        isMonthly: true,
        reason: 'Soporte técnico continuo, monitoreo de disponibilidad, copias de seguridad y cambios de contenido.',
        justification: 'Asegura que el sitio se mantenga siempre actualizado y libre de fallas técnicas.',
        urgency: 'BAJA',
      });
    }
  }

  // 7. Alertas de información faltante en CRM
  if (!hasPhone) missingDataAlerts.push('No hay teléfono registrado. Se recomienda buscar el número de contacto directo.');
  if (!hasEmail) missingDataAlerts.push('No hay email registrado en la ficha comercial.');
  if (!hasAddress) missingDataAlerts.push('Dirección física incompleta o no especificada.');

  // 8. Cálculo de Precios y Paquete Recomendado (Bundle)
  const nonMonthlyServices = recommendedServices.filter((s) => !s.isMonthly);
  const monthlyServices = recommendedServices.filter((s) => s.isMonthly);

  const individualTotalARS = nonMonthlyServices.reduce((sum, s) => sum + s.suggestedPriceARS, 0);
  const individualTotalUSD = nonMonthlyServices.reduce((sum, s) => sum + s.suggestedPriceUSD, 0);

  const monthlyTotalARS = monthlyServices.reduce((sum, s) => sum + s.suggestedPriceARS, 0);
  const monthlyTotalUSD = monthlyServices.reduce((sum, s) => sum + s.suggestedPriceUSD, 0);

  // Paquete bonificado: 15% de descuento al contratar en conjunto
  const bundleDiscountPercentage = nonMonthlyServices.length > 1 ? 15 : 0;
  const bundleFinalARS = Math.round(individualTotalARS * (1 - bundleDiscountPercentage / 100));
  const bundleFinalUSD = Math.round(individualTotalUSD * (1 - bundleDiscountPercentage / 100));

  let bundleName = 'Plan WebPilot Estándar';
  if (!hasWebsite) {
    bundleName = 'Pack Despegue Digital (Sitio Web + SEO Local + WhatsApp)';
  } else if (isHttpInsecure || isSlowResponse) {
    bundleName = 'Pack Modernización y Optimización de Rendimiento Web';
  } else if (!hasWhatsAppDetected) {
    bundleName = 'Pack Conversión Rápida (WhatsApp + Captación de Turnos)';
  }

  // 9. Argumentos Comerciales de Venta
  const primaryOpp = opportunities[0] || {
    title: 'Mejora de posicionamiento digital',
    commercialImpact: 'Optimizar la presencia web para captar más pacientes locales.',
  };

  const painPoint = !hasWebsite
    ? `Actualmente "${business.name}" no cuenta con un sitio web oficial. Cuando los pacientes de ${business.city || 'la zona'} buscan profesionales en Google o quieren verificar servicios y horarios, no encuentran un espacio propio donde informarse o agendar turnos.`
    : `En su sitio web actual (${websiteUrl}), se detectaron aspectos que frenan la captación de pacientes: ${opportunities.map((o) => o.title).slice(0, 2).join(' y ')}.`;

  const costOfInaction = !hasWebsite
    ? `Cada semana, decenas de pacientes en ${business.city || 'su localidad'} buscan atención odontológica y terminan agendando con consultorios que ofrecen un canal web claro con botón de WhatsApp directo.`
    : `La lentitud o la falta de un canal directo como WhatsApp provoca que los visitantes abandonen la página antes de consultar, desaprovechando las visitas que llegan desde Google Maps.`;

  const ourSolution = !hasWebsite
    ? `Desde WebPilot desarrollamos un sitio web moderno, optimizado para celulares y conectado directamente a su WhatsApp en menos de 10 días, sin necesidad de que el consultorio tenga conocimientos técnicos.`
    : `En WebPilot realizamos una intervención técnica puntual para resolver la velocidad, seguridad e integrar canales directos de WhatsApp y formularios, dejando la web funcionando a máxima capacidad de conversión.`;

  const whyNow = `El rubro de ${business.industry || 'servicios profesionales'} en ${business.city || 'la zona'} tiene una alta demanda de búsqueda en Google. Resolver esto ahora permite captar los pacientes antes que los consultorios de la competencia.`;

  // 10. Mensajes Iniciales de Contacto Personalizados (WhatsApp y Email)
  const contactPhone = business.phone ? business.phone.replace(/[^0-9]/g, '') : '';
  const cityName = business.city || 'su zona';

  const whatsappMessage = !hasWebsite
    ? `Hola! 👋 Me contacto del equipo de WebPilot con respecto a ${business.name}.\n\nEstuvimos analizando la presencia digital de los profesionales de ${cityName} y notamos que actualmente no cuentan con un sitio web propio para que los pacientes puedan conocer sus especialidades y solicitar turnos por WhatsApp.\n\nNos dedicamos a desarrollar sitios web rápidos y profesionales para consultorios, totalmente listos para captar pacientes desde el celular. ¿Tendrían 5 minutos esta semana para mostrarles una propuesta simple y sin compromiso?\n\n¡Muchas gracias y que tengan un excelente día!`
    : `Hola! 👋 Me contacto del equipo de WebPilot con respecto a ${business.name}.\n\nEstuvimos revisando su sitio web (${websiteUrl}) y notamos un par de detalles puntuales que están haciendo que potenciales pacientes de ${cityName} se pierdan antes de consultar (${opportunities[0]?.title.toLowerCase() || 'oportunidades de mejora'}).\n\nPreparamos un breve diagnóstico gratuito con las recomendaciones para optimizarlo y sumar más consultas por WhatsApp. ¿A quién podríamos compartirle este informe para que lo puedan evaluar?\n\n¡Saludos cordiales!`;

  const emailSubject = !hasWebsite
    ? `Propuesta de presencia web y captación de pacientes para ${business.name}`
    : `Diagnóstico y optimización web para ${business.name}`;

  const emailBody = `Estimado equipo de ${business.name},\n\nMi nombre es parte del equipo de WebPilot AI. Nos especializamos en potenciar la presencia digital y la captación de clientes de consultorios y empresas en ${cityName}.\n\n${painPoint}\n\nPara solucionar esto, preparamos una propuesta orientativa que incluye:\n${recommendedServices.map((s) => `• ${s.serviceName}: ${s.reason}`).join('\n')}\n\nInversión sugerida en paquete bonificado: ${formatCurrency(bundleFinalARS)} (o US$ ${bundleFinalUSD}).\n\nNos encantaría coordinar una breve llamada de 10 minutos para presentarles el diagnóstico completo sin ningún tipo de compromiso.\n\nQuedamos a su total disposición.\n\nAtentamente,\nEquipo WebPilot AI\nwww.webpilot.ai`;

  // 11. Estructura completa de la estrategia de Vera
  const strategy: VeraCommercialStrategy = {
    businessId: business.id,
    businessName: business.name,
    summary: !hasWebsite
      ? `Oportunidad de desarrollo web desde cero para ${business.name}. Ausencia de presencia digital propia en una zona con alta demanda de servicios de ${business.industry || 'salud'}.`
      : `Estrategia de optimización técnica y comercial para ${business.name}. Foco en resolver ${opportunities.map((o) => o.title).slice(0, 2).join(' y ')}.`,
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
        titoAuditCompleted ? `Auditoría técnica de Tito completada (Score: ${titoScore}/100)` : (hasWebsite ? 'Auditoría técnica de Tito pendiente' : 'No requiere auditoría técnica estática'),
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
      isCustomQuote: false,
      notes: `Precios calculados con el catálogo de servicios de WebPilot. Paquete "${bundleName}" con ${bundleDiscountPercentage}% de bonificación en contratación conjunta.`,
    },
    commercialArguments: {
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

  // 12. Guardar en Supabase: actualizar o crear registro en `audits` (campo ai_insights.vera_strategy)
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
        score: hasWebsite ? null : 20, // 20 para negocio sin web
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

  // 13. Sincronizar con la tabla `opportunities` del CRM (Pipeline de Ventas)
  // Verificar si ya existe una oportunidad para este negocio
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

  // 14. Actualizar estado del negocio en el CRM de NUEVO/AUDITADO a SELECCIONADO
  if (business.status === 'NUEVO' || business.status === 'AUDITADO') {
    await supabase
      .from('businesses')
      .update({
        status: 'SELECCIONADO' as CRMStage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id);
  }

  // 15. Asentar actividad en el historial comercial
  await supabase.from('activities').insert([
    {
      business_id: business.id,
      user_id: business.user_id || null,
      type: 'NOTA',
      description: `Vera completó la estrategia comercial: ${bundleName} (${formatCurrency(bundleFinalARS)}). Detectadas ${opportunities.length} oportunidades y ${recommendedServices.length} servicios recomendados.`,
      from_stage: business.status,
      to_stage: 'SELECCIONADO',
    },
  ]);

  return strategy;
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

    let titoStatus: 'COMPLETADO' | 'PENDIENTE' | 'NO_APLICA' = 'PENDIENTE';
    if (!hasWebsite) {
      titoStatus = 'NO_APLICA';
    } else if (titoCompleted) {
      titoStatus = 'COMPLETADO';
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
        primaryNeed: veraStrategy?.opportunities[0]?.title || null,
        suggestedBundleARS: veraStrategy?.suggestedPricing?.bundleFinalARS || null,
        servicesCount: veraStrategy?.recommendedServices?.length || 0,
        urgency: (veraStrategy?.recommendedServices[0]?.urgency as 'ALTA' | 'MEDIA' | 'BAJA') || 'MEDIA',
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
