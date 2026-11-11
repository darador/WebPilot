import { createClient } from '@/lib/supabase/client';
import { Audit, AuditIssue, Business, IssueSeverity, AuditStatus } from '@/types/database.types';

export interface InspectionRawData {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  isHttps: boolean;
  responseTimeMs: number;
  htmlSizeBytes: number;
  isCompressed: boolean;
  compressionType: string | null;
  hasTitle: boolean;
  titleText: string | null;
  titleLength: number;
  hasMetaDescription: boolean;
  metaDescriptionText: string | null;
  metaDescriptionLength: number;
  hasViewport: boolean;
  viewportContent: string | null;
  h1Count: number;
  h1Samples: string[];
  h2Count: number;
  canonicalUrl: string | null;
  metaRobots: string | null;
  totalImages: number;
  imagesWithoutAltCount: number;
  imagesWithoutAltSamples: string[];
  hasWhatsApp: boolean;
  whatsAppLinks: string[];
  hasTelLinks: boolean;
  telLinks: string[];
  hasForms: boolean;
  formCount: number;
  errorMessage?: string;
}

export interface TitoAuditResult {
  audit: Audit;
  issues: AuditIssue[];
  business: Business;
  commercialRecommendations: {
    serviceName: string;
    reason: string;
    evidencia: string;
    urgency: 'ALTA' | 'MEDIA' | 'BAJA';
  }[];
}

/**
 * Validador SSRF para Tito: Bloquea IPs privadas, locales y endpoints cloud internos.
 */
function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return false;
    }

    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false;
    }

    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const b1 = parseInt(ipMatch[1], 10);
      const b2 = parseInt(ipMatch[2], 10);

      if (b1 === 10) return false;
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return false;
      if (b1 === 192 && b2 === 168) return false;
      if (b1 === 169 && b2 === 254) return false;
      if (b1 === 127) return false;
      if (b1 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Inspección técnica estática profunda del HTML y headers del sitio web.
 */
export async function inspectWebsite(rawUrl: string): Promise<InspectionRawData> {
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  if (!isSafeUrl(targetUrl)) {
    throw new Error(`La URL ${targetUrl} fue rechazada por motivos de seguridad SSRF (dirección local o privada).`);
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos timeout

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WebPilotTechnicalInspector/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const finalUrl = res.url || targetUrl;
    const isHttps = finalUrl.toLowerCase().startsWith('https://');
    const contentEncoding = res.headers.get('content-encoding');
    const isCompressed = !!contentEncoding && contentEncoding !== 'identity';

    const html = await res.text();
    const htmlSizeBytes = Buffer.byteLength(html, 'utf8');

    // 1. Título
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : null;

    // 2. Meta descripción
    const metaDescMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDescriptionText = metaDescMatch ? metaDescMatch[1].trim() : null;

    // 3. Viewport
    const viewportMatch =
      html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']viewport["'][^>]*>/i);
    const hasViewport = !!viewportMatch;
    const viewportContent = viewportMatch ? viewportMatch[1].trim() : null;

    // 4. Encabezados H1 y H2
    const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi));
    const h1Samples = h1Matches
      .map((m) => m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 3);

    const h2Matches = Array.from(html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi));

    // 5. Canonical y Robots
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;

    const robotsMatch =
      html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i);
    const metaRobots = robotsMatch ? robotsMatch[1].trim() : null;

    // 6. Imágenes y etiquetas ALT
    const imgMatches = Array.from(html.matchAll(/<img\b([^>]*)>/gi));
    const totalImages = imgMatches.length;
    const imagesWithoutAltSamples: string[] = [];
    let imagesWithoutAltCount = 0;

    for (const match of imgMatches) {
      const attrs = match[1];
      const hasAlt = /alt=(["'])(.*?)\1/i.test(attrs);
      const altValueMatch = attrs.match(/alt=(["'])(.*?)\1/i);
      const altContent = altValueMatch ? altValueMatch[2].trim() : '';

      if (!hasAlt || altContent.length === 0) {
        imagesWithoutAltCount++;
        if (imagesWithoutAltSamples.length < 5) {
          const srcMatch = attrs.match(/src=(["'])(.*?)\1/i);
          const src = srcMatch ? srcMatch[2] : 'imagen-sin-src';
          const filename = src.split('/').pop()?.split('?')[0] || src;
          imagesWithoutAltSamples.push(filename);
        }
      }
    }

    // 7. Canales de conversión (WhatsApp, Teléfono, Formularios)
    const whatsAppLinks: string[] = [];
    const waMatches = Array.from(
      html.matchAll(/href=(["'])(https?:\/\/(?:wa\.me|api\.whatsapp\.com)[^"']*)\1/gi)
    );
    waMatches.forEach((m) => {
      if (!whatsAppLinks.includes(m[2])) whatsAppLinks.push(m[2]);
    });
    const hasWhatsApp = whatsAppLinks.length > 0 || /whatsapp/i.test(html);

    const telLinks: string[] = [];
    const telMatches = Array.from(html.matchAll(/href=(["'])tel:([^"']*)\1/gi));
    telMatches.forEach((m) => {
      if (!telLinks.includes(m[2])) telLinks.push(m[2]);
    });
    const hasTelLinks = telLinks.length > 0;

    const formMatches = Array.from(html.matchAll(/<form\b[^>]*>/gi));
    const formCount = formMatches.length;
    const hasForms = formCount > 0;

    return {
      url: targetUrl,
      finalUrl,
      statusCode: res.status,
      statusText: res.statusText,
      isHttps,
      responseTimeMs,
      htmlSizeBytes,
      isCompressed,
      compressionType: contentEncoding,
      hasTitle: !!titleText,
      titleText,
      titleLength: titleText ? titleText.length : 0,
      hasMetaDescription: !!metaDescriptionText,
      metaDescriptionText,
      metaDescriptionLength: metaDescriptionText ? metaDescriptionText.length : 0,
      hasViewport,
      viewportContent,
      h1Count: h1Matches.length,
      h1Samples,
      h2Count: h2Matches.length,
      canonicalUrl,
      metaRobots,
      totalImages,
      imagesWithoutAltCount,
      imagesWithoutAltSamples,
      hasWhatsApp,
      whatsAppLinks,
      hasTelLinks,
      telLinks,
      hasForms,
      formCount,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError';
    return {
      url: targetUrl,
      finalUrl: targetUrl,
      statusCode: 0,
      statusText: isTimeout ? 'Timeout (>12s)' : 'Error de Conexión',
      isHttps: targetUrl.startsWith('https://'),
      responseTimeMs: Date.now() - startTime,
      htmlSizeBytes: 0,
      isCompressed: false,
      compressionType: null,
      hasTitle: false,
      titleText: null,
      titleLength: 0,
      hasMetaDescription: false,
      metaDescriptionText: null,
      metaDescriptionLength: 0,
      hasViewport: false,
      viewportContent: null,
      h1Count: 0,
      h1Samples: [],
      h2Count: 0,
      canonicalUrl: null,
      metaRobots: null,
      totalImages: 0,
      imagesWithoutAltCount: 0,
      imagesWithoutAltSamples: [],
      hasWhatsApp: false,
      whatsAppLinks: [],
      hasTelLinks: false,
      telLinks: [],
      hasForms: false,
      formCount: 0,
      errorMessage: isTimeout
        ? 'El servidor tardó más de 12 segundos en responder y se agotó el tiempo de espera.'
        : `No se pudo conectar al sitio web: ${err?.message || 'Error de red o servidor caído'}.`,
    };
  }
}

/**
 * Ejecuta la auditoría completa de Tito sobre un negocio específico.
 */
export async function auditBusiness(
  businessId: string,
  client?: any
): Promise<TitoAuditResult> {
  const supabase = client || createClient();

  // 1. Obtener datos del negocio
  const { data: business, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bErr || !business) {
    throw new Error('Negocio no encontrado en la base de datos.');
  }

  if (!business.website || !business.website.trim()) {
    throw new Error(`El negocio "${business.name}" no tiene un sitio web registrado para auditar.`);
  }

  // 2. Inspección técnica del sitio
  const raw = await inspectWebsite(business.website);

  // 3. Extracción de problemas (Issues) con evidencia verificable
  const issuesToCreate: {
    category: string;
    title: string;
    description: string;
    severity: IssueSeverity;
    recommendation: string;
  }[] = [];

  const commercialRecommendations: {
    serviceName: string;
    reason: string;
    evidencia: string;
    urgency: 'ALTA' | 'MEDIA' | 'BAJA';
  }[] = [];

  // Si falló la conexión por completo
  if (raw.errorMessage) {
    issuesToCreate.push({
      category: 'Disponibilidad y Conexión',
      title: 'Sitio web no responde o conexión fallida',
      description: `Evidencia técnica: ${raw.errorMessage} (URL probada: ${raw.url}).`,
      severity: 'CRITICO',
      recommendation: 'Revisar la configuración DNS, el estado del hosting o renovar el dominio caído.',
    });

    commercialRecommendations.push({
      serviceName: 'Restablecimiento y Alojamiento Web Profesional',
      reason: 'El sitio web del negocio se encuentra caído o inaccesible para los clientes.',
      evidencia: raw.errorMessage,
      urgency: 'ALTA',
    });
  } else {
    // A. SEGURIDAD Y PROTOCOLO
    if (!raw.isHttps) {
      issuesToCreate.push({
        category: 'Seguridad',
        title: 'Sitio sin cifrado SSL / HTTPS activo',
        description: `Evidencia técnica: La URL final es "${raw.finalUrl}". No redirige automáticamente a protocolo seguro HTTPS. Los navegadores muestran la advertencia "No es seguro" a los visitantes.`,
        severity: 'ALTO',
        recommendation: 'Instalar certificado SSL gratuito (Let\'s Encrypt o Cloudflare) y forzar redirección 301 de HTTP a HTTPS.',
      });

      commercialRecommendations.push({
        serviceName: 'Migración a HTTPS y Certificado de Seguridad SSL',
        reason: 'Los pacientes que visitan el sitio reciben una advertencia de seguridad que daña la confianza en la clínica.',
        evidencia: `URL sin candado de seguridad: ${raw.finalUrl}`,
        urgency: 'ALTA',
      });
    }

    // B. RENDIMIENTO TÉCNICO
    if (raw.responseTimeMs > 1200) {
      issuesToCreate.push({
        category: 'Rendimiento',
        title: 'Tiempo de respuesta del servidor HTML elevado',
        description: `Evidencia técnica: El servidor demoró ${raw.responseTimeMs} ms en entregar el documento HTML base (se recomienda un tiempo menor a 600 ms).`,
        severity: 'MEDIO',
        recommendation: 'Optimizar la respuesta del backend, implementar caché a nivel de servidor o utilizar una CDN como Cloudflare.',
      });

      commercialRecommendations.push({
        serviceName: 'Optimización de Velocidad y Caché de Carga',
        reason: 'La lentitud inicial al abrir la página provoca que potenciales clientes abandonen antes de ver los servicios.',
        evidencia: `Tiempo de respuesta medido: ${raw.responseTimeMs} ms`,
        urgency: 'MEDIA',
      });
    }

    const htmlKb = Math.round(raw.htmlSizeBytes / 1024);
    if (htmlKb > 200) {
      issuesToCreate.push({
        category: 'Rendimiento',
        title: 'Documento HTML base con peso excesivo',
        description: `Evidencia técnica: El tamaño del HTML es de ${htmlKb} KB (${raw.htmlSizeBytes} bytes) sin contar scripts ni imágenes externas. Esto suele indicar código en línea no optimizado o constructores visuales pesados.`,
        severity: 'MEDIO',
        recommendation: 'Extraer estilos CSS y scripts a archivos externos minificados, limpiar código innecesario.',
      });
    }

    if (!raw.isCompressed && raw.htmlSizeBytes > 50000) {
      issuesToCreate.push({
        category: 'Rendimiento',
        title: 'Sin compresión de transferencia (Gzip / Brotli)',
        description: `Evidencia técnica: El encabezado Content-Encoding es "${raw.compressionType || 'ninguno'}". El servidor envía el contenido sin comprimir.`,
        severity: 'BAJO',
        recommendation: 'Habilitar compresión Gzip o Brotli en el servidor web (Nginx, Apache o hosting).',
      });
    }

    // C. EXPERIENCIA MÓVIL
    if (!raw.hasViewport) {
      issuesToCreate.push({
        category: 'Experiencia Móvil',
        title: 'Falta etiqueta Viewport para dispositivos móviles',
        description: 'Evidencia técnica: No se encontró la etiqueta <meta name="viewport"> en el <head> del documento. Los teléfonos mostrarán la página en formato de escritorio alejado.',
        severity: 'CRITICO',
        recommendation: 'Agregar <meta name="viewport" content="width=device-width, initial-scale=1.0"> en el encabezado HTML.',
      });

      commercialRecommendations.push({
        serviceName: 'Rediseño Web Responsive Mobile-First',
        reason: 'El sitio no está adaptado para teléfonos celulares, haciendo imposible la lectura cómoda para los pacientes móviles.',
        evidencia: 'Etiqueta meta viewport ausente en el código fuente.',
        urgency: 'ALTA',
      });
    }

    // D. SEO TÉCNICO
    if (!raw.hasTitle) {
      issuesToCreate.push({
        category: 'SEO',
        title: 'Falta etiqueta Title fundamental',
        description: 'Evidencia técnica: No se encontró ninguna etiqueta <title> en el código HTML de la página.',
        severity: 'ALTO',
        recommendation: 'Definir un título único que incluya el nombre del negocio, su especialidad y su localidad.',
      });
    } else if (raw.titleLength < 20) {
      issuesToCreate.push({
        category: 'SEO',
        title: 'Título de página demasiado breve o poco descriptivo',
        description: `Evidencia técnica: El título actual es "${raw.titleText}" (${raw.titleLength} caracteres). No incluye palabras clave de especialidad ni localidad (ej: "Quilmes").`,
        severity: 'MEDIO',
        recommendation: 'Ampliar el título a entre 40 y 60 caracteres incorporando la especialidad y la zona geográfica.',
      });

      commercialRecommendations.push({
        serviceName: 'Optimización SEO On-Page y Posicionamiento Local',
        reason: 'El negocio no aprovecha el título ni las etiquetas clave para posicionar en búsquedas locales de Google.',
        evidencia: `Título insuficiente: "${raw.titleText}" (${raw.titleLength} caracteres)`,
        urgency: 'MEDIA',
      });
    }

    if (!raw.hasMetaDescription) {
      issuesToCreate.push({
        category: 'SEO',
        title: 'Falta meta descripción para motores de búsqueda',
        description: 'Evidencia técnica: No se encontró la etiqueta <meta name="description">. Google generará un texto aleatorio en los resultados de búsqueda.',
        severity: 'MEDIO',
        recommendation: 'Redactar una meta descripción atractiva de entre 120 y 155 caracteres con llamada a la acción.',
      });
    }

    if (raw.h1Count === 0) {
      issuesToCreate.push({
        category: 'SEO',
        title: 'Falta encabezado principal H1 en la estructura',
        description: 'Evidencia técnica: El documento HTML no contiene ninguna etiqueta <h1>. Los buscadores necesitan el H1 para identificar el tema principal de la página.',
        severity: 'ALTO',
        recommendation: 'Incorporar un encabezado <h1> claro y descriptivo en la parte superior del contenido.',
      });
    } else if (raw.h1Count > 1) {
      issuesToCreate.push({
        category: 'SEO',
        title: 'Múltiples etiquetas H1 detectadas',
        description: `Evidencia técnica: Se encontraron ${raw.h1Count} etiquetas <h1> (${raw.h1Samples.map((s) => `"${s}"`).join(', ')}). La buena práctica indica tener un único H1 por página.`,
        severity: 'BAJO',
        recommendation: 'Conservar un solo H1 principal y transformar los restantes en etiquetas <h2> o <h3>.',
      });
    }

    if (raw.imagesWithoutAltCount > 0) {
      issuesToCreate.push({
        category: 'SEO',
        title: `${raw.imagesWithoutAltCount} imágenes sin texto alternativo (atributo alt)`,
        description: `Evidencia técnica: De ${raw.totalImages} imágenes encontradas, ${raw.imagesWithoutAltCount} carecen de texto descriptivo. Ejemplos detectados: ${raw.imagesWithoutAltSamples.join(', ')}.`,
        severity: 'MEDIO',
        recommendation: 'Añadir atributos alt descriptivos a cada imagen para mejorar accesibilidad y posicionamiento en Google Imágenes.',
      });
    }

    // E. CONVERSIÓN COMERCIAL
    if (!raw.hasWhatsApp) {
      issuesToCreate.push({
        category: 'Conversión Comercial',
        title: 'Sin botón directo de WhatsApp para pacientes',
        description: 'Evidencia técnica: No se detectaron enlaces con protocolo wa.me o api.whatsapp.com en el código fuente. El 80% de los pacientes locales en Argentina prefieren coordinar turnos por WhatsApp.',
        severity: 'ALTO',
        recommendation: 'Instalar un botón flotante y enlaces directos de WhatsApp en la cabecera y pie de página.',
      });

      commercialRecommendations.push({
        serviceName: 'Integración de Botón Flotante y Canal Directo de WhatsApp',
        reason: 'Los visitantes no tienen forma inmediata de hacer una consulta rápida desde su celular, perdiendo clientes potenciales.',
        evidencia: 'No se detectaron enlaces a WhatsApp en la web.',
        urgency: 'ALTA',
      });
    }

    if (!raw.hasTelLinks && !raw.hasWhatsApp) {
      issuesToCreate.push({
        category: 'Conversión Comercial',
        title: 'Sin enlaces telefónicos interactivos (tel:)',
        description: 'Evidencia técnica: No se detectaron enlaces con atributo href="tel:...". En dispositivos móviles los usuarios no pueden marcar con un solo toque.',
        severity: 'MEDIO',
        recommendation: 'Configurar los números de teléfono como enlaces interactivos tel:+54...',
      });
    }

    if (!raw.hasForms) {
      issuesToCreate.push({
        category: 'Conversión Comercial',
        title: 'Sin formulario de contacto o solicitud de turnos',
        description: 'Evidencia técnica: No se encontró ninguna etiqueta <form> para que los visitantes puedan dejar su consulta fuera de horario de atención.',
        severity: 'BAJO',
        recommendation: 'Agregar un formulario sencillo de 3 campos (Nombre, Teléfono, Motivo de consulta).',
      });
    }
  }

  // 4. Calcular índice técnico orientativo (sobre 100)
  let calculatedScore = 100;
  issuesToCreate.forEach((iss) => {
    if (iss.severity === 'CRITICO') calculatedScore -= 30;
    else if (iss.severity === 'ALTO') calculatedScore -= 15;
    else if (iss.severity === 'MEDIO') calculatedScore -= 8;
    else if (iss.severity === 'BAJO') calculatedScore -= 3;
  });
  calculatedScore = Math.max(Math.min(calculatedScore, 100), 10);

  // 5. Preparar estructuras JSONB para Supabase
  const performanceData = {
    responseTimeMs: raw.responseTimeMs,
    htmlSizeBytes: raw.htmlSizeBytes,
    htmlSizeKb: Math.round(raw.htmlSizeBytes / 1024),
    isCompressed: raw.isCompressed,
    compressionType: raw.compressionType,
    statusCode: raw.statusCode,
    finalUrl: raw.finalUrl,
    isHttps: raw.isHttps,
    coreWebVitalsNotice:
      'Medición de renderizado en navegador (LCP, FID/INP, CLS) no disponible en inspección estática (requiere simulación de renderizado con Chrome o datos de campo de Google).',
  };

  const seoData = {
    hasTitle: raw.hasTitle,
    titleText: raw.titleText,
    titleLength: raw.titleLength,
    hasMetaDescription: raw.hasMetaDescription,
    metaDescriptionText: raw.metaDescriptionText,
    metaDescriptionLength: raw.metaDescriptionLength,
    h1Count: raw.h1Count,
    h1Samples: raw.h1Samples,
    h2Count: raw.h2Count,
    canonicalUrl: raw.canonicalUrl,
    metaRobots: raw.metaRobots,
    totalImages: raw.totalImages,
    imagesWithoutAltCount: raw.imagesWithoutAltCount,
    imagesWithoutAltSamples: raw.imagesWithoutAltSamples,
  };

  const aiInsights = {
    inspector: 'Tito — Inspector Técnico WebPilot AI',
    auditDate: new Date().toISOString(),
    hasViewport: raw.hasViewport,
    viewportContent: raw.viewportContent,
    viewportNotice: raw.hasViewport
      ? 'Etiqueta viewport configurada. Se recomienda comprobación visual en pantalla para descartar desbordes horizontales.'
      : 'Etiqueta viewport ausente. No responsive.',
    hasWhatsApp: raw.hasWhatsApp,
    whatsAppLinks: raw.whatsAppLinks,
    hasTelLinks: raw.hasTelLinks,
    hasForms: raw.hasForms,
    formCount: raw.formCount,
    totalIssuesCount: issuesToCreate.length,
    criticalCount: issuesToCreate.filter((i) => i.severity === 'CRITICO').length,
    highCount: issuesToCreate.filter((i) => i.severity === 'ALTO').length,
    mediumCount: issuesToCreate.filter((i) => i.severity === 'MEDIO').length,
    lowCount: issuesToCreate.filter((i) => i.severity === 'BAJO').length,
    commercialRecommendations,
  };

  // 6. Guardar en base de datos: eliminar auditorías previas de este negocio o crear nueva
  const { data: createdAudit, error: auditError } = await supabase
    .from('audits')
    .insert([
      {
        business_id: business.id,
        score: calculatedScore,
        performance_data: performanceData,
        seo_data: seoData,
        ai_insights: aiInsights,
        status: (raw.errorMessage ? 'FALLIDO' : 'COMPLETADO') as AuditStatus,
      },
    ])
    .select()
    .single();

  if (auditError || !createdAudit) {
    throw new Error(`Error al registrar auditoría en la base de datos: ${auditError?.message}`);
  }

  // 7. Guardar los problemas detectados en `audit_issues`
  const issuesPayload = issuesToCreate.map((iss) => ({
    audit_id: createdAudit.id,
    business_id: business.id,
    category: iss.category,
    title: iss.title,
    description: iss.description,
    severity: iss.severity,
    recommendation: iss.recommendation,
  }));

  let savedIssues: AuditIssue[] = [];
  if (issuesPayload.length > 0) {
    const { data: insertedIssues, error: issuesError } = await supabase
      .from('audit_issues')
      .insert(issuesPayload)
      .select();

    if (issuesError) {
      console.error('Error insertando problemas de auditoría:', issuesError);
    } else {
      savedIssues = (insertedIssues as AuditIssue[]) || [];
    }
  }

  // 8. Actualizar estado del negocio en CRM de 'NUEVO' a 'AUDITADO'
  if (business.status === 'NUEVO') {
    await supabase
      .from('businesses')
      .update({ status: 'AUDITADO', updated_at: new Date().toISOString() })
      .eq('id', business.id);
  }

  // 9. Registrar actividad en historial
  const critCount = issuesToCreate.filter((i) => i.severity === 'CRITICO' || i.severity === 'ALTO').length;
  await supabase.from('activities').insert([
    {
      business_id: business.id,
      user_id: business.user_id || null,
      type: 'NOTA',
      description: `Tito completó la inspección técnica de ${raw.finalUrl}. Se detectaron ${issuesToCreate.length} observaciones (${critCount} de atención prioritaria).`,
      from_stage: business.status,
      to_stage: business.status === 'NUEVO' ? 'AUDITADO' : business.status,
    },
  ]);

  return {
    audit: createdAudit as Audit,
    issues: savedIssues,
    business: { ...business, status: business.status === 'NUEVO' ? 'AUDITADO' : business.status },
    commercialRecommendations,
  };
}

/**
 * Obtiene los negocios agrupados para Tito:
 * - withWebsite: negocios con sitio web (incluyendo su última auditoría si existe).
 * - withoutWebsite: oportunidades de desarrollo web desde cero (sin web).
 */
export async function getTitoBusinesses(client?: any): Promise<{
  withWebsite: (Business & { latestAudit?: Audit | null; issuesCount?: number })[];
  withoutWebsite: Business[];
}> {
  const supabase = client || createClient();

  const { data: businesses, error: bErr } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (bErr || !businesses) {
    console.error('Error al obtener negocios para Tito:', bErr);
    return { withWebsite: [], withoutWebsite: [] };
  }

  const withWeb: (Business & { latestAudit?: Audit | null; issuesCount?: number })[] = [];
  const withoutWeb: Business[] = [];

  businesses.forEach((b: Business) => {
    if (b.website && b.website.trim().length > 0) {
      withWeb.push({ ...b });
    } else {
      withoutWeb.push(b);
    }
  });

  // Obtener las últimas auditorías para los negocios con web
  if (withWeb.length > 0) {
    const businessIds = withWeb.map((b) => b.id);
    const { data: audits } = await supabase
      .from('audits')
      .select('*')
      .in('business_id', businessIds)
      .order('created_at', { ascending: false });

    if (audits) {
      const auditsByBiz = new Map<string, Audit>();
      audits.forEach((a: Audit) => {
        if (!auditsByBiz.has(a.business_id)) {
          auditsByBiz.set(a.business_id, a);
        }
      });

      withWeb.forEach((b) => {
        b.latestAudit = auditsByBiz.get(b.id) || null;
      });
    }
  }

  return { withWebsite: withWeb, withoutWebsite: withoutWeb };
}

/**
 * Obtiene el informe de auditoría más reciente de un negocio específico junto con sus problemas.
 */
export async function getBusinessAuditDetail(
  businessId: string,
  client?: any
): Promise<{ audit: Audit | null; issues: AuditIssue[] }> {
  const supabase = client || createClient();

  const { data: audits, error: aErr } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (aErr || !audits || audits.length === 0) {
    return { audit: null, issues: [] };
  }

  const latestAudit = audits[0] as Audit;

  const { data: issues, error: iErr } = await supabase
    .from('audit_issues')
    .select('*')
    .eq('audit_id', latestAudit.id)
    .order('created_at', { ascending: true });

  if (iErr) {
    console.error('Error al obtener audit_issues:', iErr);
    return { audit: latestAudit, issues: [] };
  }

  return { audit: latestAudit, issues: (issues as AuditIssue[]) || [] };
}
