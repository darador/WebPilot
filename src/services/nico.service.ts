import { createClient } from '@/lib/supabase/client';
import { normalizeDomain, normalizeEmail } from '@/lib/utils';
import {
  NicoSearch,
  NicoProspect,
  EmailProvenance,
  EmailVerificationStatus,
  NicoProspectStatus,
  Business,
} from '@/types/database.types';

export interface NicoSearchParams {
  industry: string;
  city: string;
  state_province?: string;
  country?: string;
  max_results?: number;
  sources?: string[];
}

// Memoria local de respaldo para búsquedas y prospectos de Nico (si las tablas remotas aún no existen)
const LOCAL_NICO_SEARCHES: NicoSearch[] = [];
const LOCAL_NICO_PROSPECTS: NicoProspect[] = [];

/**
 * Validador SSRF: Bloquea IPs privadas, bucle local y endpoints de metadatos en la nube.
 */
function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();

    // Bloquear localhost y variantes
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

    // Bloquear metadatos cloud (AWS, GCP, etc.)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false;
    }

    // Comprobación de rangos de IPs privadas IPv4
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
 * Limpia y normaliza números de teléfono argentinos
 */
function cleanPhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/[^0-9+]/g, '');
  return digits;
}

/**
 * Extrae emails de un bloque de texto HTML con snippet de contexto
 */
function extractEmailsWithContext(
  html: string,
  sourceUrl: string,
  isOfficialDomain: boolean
): EmailProvenance[] {
  const results: EmailProvenance[] = [];
  const seenEmails = new Set<string>();

  // 1. Detección por enlaces mailto:
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  let match: RegExpExecArray | null;
  while ((match = mailtoRegex.exec(html)) !== null) {
    const rawEmail = match[1].toLowerCase().trim();
    const start = Math.max(0, match.index - 50);
    const end = Math.min(html.length, match.index + match[0].length + 50);
    const context = html.slice(start, end).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!seenEmails.has(rawEmail) && isValidBusinessEmail(rawEmail, context)) {
      seenEmails.add(rawEmail);
      results.push({
        email: rawEmail,
        source_url: sourceUrl,
        source_type: isOfficialDomain ? 'OFICIAL' : 'SECUNDARIA',
        extraction_date: new Date().toISOString(),
        verification_status: isOfficialDomain
          ? 'VERIFICADO_EN_FUENTE_OFICIAL'
          : 'ENCONTRADO_EN_FUENTE_SECUNDARIA',
        context_snippet: context,
        mx_valid: null,
      });
    }
  }

  // 2. Detección por texto libre (RFC 5322 simplificado)
  const textEmailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = textEmailRegex.exec(html)) !== null) {
    const rawEmail = match[0].toLowerCase().trim();
    const start = Math.max(0, match.index - 50);
    const end = Math.min(html.length, match.index + match[0].length + 50);
    const context = html.slice(start, end).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!seenEmails.has(rawEmail) && isValidBusinessEmail(rawEmail, context)) {
      seenEmails.add(rawEmail);
      results.push({
        email: rawEmail,
        source_url: sourceUrl,
        source_type: isOfficialDomain ? 'OFICIAL' : 'SECUNDARIA',
        extraction_date: new Date().toISOString(),
        verification_status: isOfficialDomain
          ? 'VERIFICADO_EN_FUENTE_OFICIAL'
          : 'ENCONTRADO_EN_FUENTE_SECUNDARIA',
        context_snippet: context,
        mx_valid: null,
      });
    }
  }

  return results;
}

/**
 * Filtra emails que no corresponden a un negocio real (imágenes, fuentes, ejemplos, scripts, créditos de agencias)
 */
function isValidBusinessEmail(email: string, context = ''): boolean {
  const lower = email.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Descartar si el contexto circundante indica que es el desarrollador web o plugin
  if (
    lowerContext.includes('diseño') ||
    lowerContext.includes('desarrollo') ||
    lowerContext.includes('desarrollado por') ||
    lowerContext.includes('diseñado por') ||
    lowerContext.includes('webmaster') ||
    lowerContext.includes('powered by') ||
    lowerContext.includes('plugin') ||
    lowerContext.includes('theme')
  ) {
    return false;
  }

  const invalidExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.css', '.js', '.woff', '.ttf'];
  if (invalidExtensions.some((ext) => lower.endsWith(ext))) return false;

  const invalidPrefixes = ['sentry@', 'example@', 'sample@', 'test@', 'wix@', 'wordpress@', 'domain@', 'user@', 'noreply@', 'no-reply@'];
  if (invalidPrefixes.some((p) => lower.startsWith(p))) return false;

  const invalidDomains = [
    'example.com',
    'domain.com',
    'test.com',
    'sentry.io',
    'w3.org',
    'quadlayers.com',
    'engeni.com',
    'wordpress.org',
    'wixpress.com',
    'elementor.com',
    'cloudflare.com',
    'gravatar.com',
  ];
  const domain = lower.split('@')[1];
  if (!domain || invalidDomains.includes(domain)) return false;

  return true;
}

/**
 * Extrae enlaces de redes sociales oficiales
 */
function extractSocialLinks(html: string): { platform: string; url: string }[] {
  const socials: { platform: string; url: string }[] = [];
  const seenUrls = new Set<string>();

  const patterns = [
    { platform: 'Instagram', regex: /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._-]+)\/?/gi },
    { platform: 'Facebook', regex: /https?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)\/?/gi },
    { platform: 'LinkedIn', regex: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9._-]+)\/?/gi },
  ];

  for (const { platform, regex } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      const fullUrl = match[0];
      const handle = match[1]?.toLowerCase();
      // Descartar páginas genéricas de login, share o plugins
      if (
        handle &&
        !['sharer', 'share', 'p', 'reel', 'stories', 'login', 'dialog', 'tr'].includes(handle) &&
        !seenUrls.has(fullUrl)
      ) {
        seenUrls.add(fullUrl);
        socials.push({ platform, url: fullUrl });
      }
    }
  }

  return socials;
}

/**
 * Extrae enlaces directos a WhatsApp
 */
function extractWhatsApp(html: string): string | null {
  const waRegex = /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/??([0-9]{10,15})/i;
  const match = html.match(waRegex);
  if (match) {
    return cleanPhoneNumber(match[1]);
  }
  return null;
}

/**
 * Extrae números telefónicos argentinos visibles
 */
function extractPhones(html: string): string | null {
  // Tel: links
  const telMatch = html.match(/href=["']tel:([+0-9\s\-()]+)["']/i);
  if (telMatch) {
    return cleanPhoneNumber(telMatch[1]);
  }

  // Regex para formato telefónico argentino (011 / 11 / código de área + 8 dígitos)
  const phoneRegex = /(?:\+?54\s?9?\s?)?(?:0?11|0?[23]\d{2,3})[-.\s]?\d{3,4}[-.\s]?\d{4}\b/;
  const textMatch = html.match(phoneRegex);
  if (textMatch) {
    return cleanPhoneNumber(textMatch[0]);
  }

  return null;
}

/**
 * Extrae título y meta-descripción de una página web
 */
function extractPageMetadata(html: string): { title: string | null; description: string | null } {
  let title: string | null = null;
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/\s+/g, ' ').trim();
  }

  let description: string | null = null;
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (descMatch) {
    description = descMatch[1].replace(/\s+/g, ' ').trim();
  }

  return { title, description };
}

/**
 * Realiza una consulta HTTP segura (SSRF-Safe, con timeout estricto y User-Agent identificado)
 */
async function fetchSafePage(
  url: string,
  timeoutMs = 7000
): Promise<{ ok: boolean; html: string; status: number; redirectedUrl?: string }> {
  if (!isSafeUrl(url)) {
    return { ok: false, html: '', status: 400 };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WebPilot-Nico/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { ok: false, html: '', status: res.status };
    }

    const html = await res.text();
    return { ok: true, html, status: res.status, redirectedUrl: res.url };
  } catch {
    clearTimeout(timeoutId);
    return { ok: false, html: '', status: 0 };
  }
}

/**
 * Ejecuta búsqueda abierta en DuckDuckGo HTML sin requerir API key ni scraping de Google Maps
 */
async function searchDuckDuckGo(
  query: string,
  maxResults = 15
): Promise<{ title: string; link: string; snippet: string }[]> {
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const { ok, html } = await fetchSafePage(searchUrl, 8000);

  if (!ok || !html) {
    return [];
  }

  const results: { title: string; link: string; snippet: string }[] = [];
  // Parsear resultados en el HTML de DuckDuckGo
  const resultBlocks = html.split('<div class="result results_links');

  for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
    const block = resultBlocks[i];

    // Extraer enlace
    const linkMatch = block.match(/href="([^"]+)"/);
    if (!linkMatch) continue;

    let targetUrl = linkMatch[1];
    // DuckDuckGo encapsula URLs en /l/?uddg=...
    if (targetUrl.includes('uddg=')) {
      const uddgMatch = targetUrl.match(/uddg=([^&]+)/);
      if (uddgMatch) {
        targetUrl = decodeURIComponent(uddgMatch[1]);
      }
    }

    // Omitir enlaces internos de DuckDuckGo o motores de búsqueda
    if (!targetUrl.startsWith('http') || targetUrl.includes('duckduckgo.com') || targetUrl.includes('yandex.')) {
      continue;
    }

    // Extraer título
    const titleMatch = block.match(/class="result__snippet[^>]*>([\s\S]*?)<\/a>/) ||
      block.match(/class="result__url[^>]*>([\s\S]*?)<\/a>/) ||
      block.match(/<a[^>]*class="result__snippet[^>]*>([\s\S]*?)<\/a>/);

    // Título principal en cabecera
    const headerMatch = block.match(/<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const title = headerMatch ? headerMatch[1].replace(/<[^>]*>/g, '').trim() : 'Sin título';

    // Snippet
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    results.push({
      title,
      link: targetUrl,
      snippet,
    });
  }

  return results;
}

/**
 * Colecciones de directorios, colegios profesionales y fuentes abiertas por rubro y localidad
 */
function getTargetSourcesForSearch(industry: string, city: string): { name: string; query: string }[] {
  const ind = industry.toLowerCase();
  const c = city.trim();

  const queries: { name: string; query: string }[] = [];

  // 1. Búsqueda de sitios web oficiales con página de contacto
  queries.push({
    name: 'Buscador Web Público (Sitios Oficiales)',
    query: `site:.com.ar "${industry}" "${c}" contacto email OR whatsapp OR telefono`,
  });

  // 2. Colegios y asociaciones profesionales o cámaras
  if (ind.includes('odontol') || ind.includes('dent')) {
    queries.push({
      name: 'Colegio de Odontólogos y Guías Profesionales',
      query: `colegio odontologos provincia buenos aires "${c}" OR "circulo odontologico"`,
    });
    queries.push({
      name: 'Directorios Odontológicos Locales',
      query: `consultorio odontologico "${c}" turnos direccion web`,
    });
  } else if (ind.includes('estet') || ind.includes('belleza') || ind.includes('spa')) {
    queries.push({
      name: 'Directorios de Salud y Estética',
      query: `centro de estetica corporal facial "${c}" turnos whatsapp contacto`,
    });
  } else if (ind.includes('contab') || ind.includes('estudio') || ind.includes('contador')) {
    queries.push({
      name: 'Consejo Profesional de Ciencias Económicas y Guías',
      query: `estudio contable impositivo "${c}" asesoramiento contacto email`,
    });
  } else if (ind.includes('abogad') || ind.includes('legal')) {
    queries.push({
      name: 'Colegio de Abogados y Estudios Jurídicos',
      query: `estudio juridico abogados "${c}" contacto email web`,
    });
  } else {
    queries.push({
      name: 'Guías y Directorios Comerciales Locales',
      query: `guia comercial empresas "${industry}" "${c}" telefono contacto`,
    });
  }

  return queries;
}

/**
 * Investigador Profundo de Prospectos de Nico:
 * Navega la web oficial o perfil público, descubre página de contacto y recolecta información auditable.
 */
async function investigateCandidateWebsite(
  url: string,
  businessName: string,
  industry: string,
  city: string,
  sourceName: string
): Promise<Partial<NicoProspect> | null> {
  const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  if (!isSafeUrl(cleanUrl)) return null;

  const homeRes = await fetchSafePage(cleanUrl, 7000);
  if (!homeRes.ok || !homeRes.html) return null;

  const html = homeRes.html;
  const parsedUrl = new URL(cleanUrl);
  const domain = parsedUrl.hostname.toLowerCase();

  // 1. Extraer Metadatos y Nombre Canónico
  const { title, description } = extractPageMetadata(html);
  let resolvedName = businessName;
  const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);
  if (ogSiteName && ogSiteName[1].trim().length > 2) {
    resolvedName = ogSiteName[1].trim();
  } else if (title) {
    const cleanedTitle = title.split(/[-|•–—]/)[0].trim();
    if (cleanedTitle.length > 3 && !cleanedTitle.toLowerCase().includes('inicio') && !cleanedTitle.toLowerCase().includes('home')) {
      resolvedName = cleanedTitle;
    }
  }

  // 2. Extraer Emails en la Home
  let allEmails = extractEmailsWithContext(html, cleanUrl, true);

  // 2.1 Inspeccionar Schema.org JSON-LD si existe
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const ld = JSON.parse(jsonLdMatch[1]);
      if (ld.name && typeof ld.name === 'string' && ld.name.length > 2) {
        resolvedName = ld.name.trim();
      }
      if (ld.email && typeof ld.email === 'string' && isValidBusinessEmail(ld.email)) {
        const cleanLdEmail = ld.email.toLowerCase().trim();
        if (!allEmails.some((e) => e.email === cleanLdEmail)) {
          allEmails.unshift({
            email: cleanLdEmail,
            source_url: cleanUrl,
            source_type: 'OFICIAL',
            extraction_date: new Date().toISOString(),
            verification_status: 'VERIFICADO_EN_FUENTE_OFICIAL',
            context_snippet: 'Schema.org JSON-LD microdata oficial',
          });
        }
      }
    } catch {
      // Ignorar JSON malformado
    }
  }

  // 3. Buscar página de contacto específica si no se encontró email en home
  let contactPageUrl: string | null = null;
  const contactLinkMatch = html.match(
    /<a[^>]*href=["']([^"']*(?:contacto|contactenos|contact-us|sobre-nosotros|ubicacion)[^"']*)["'][^>]*>/i
  );

  if (contactLinkMatch) {
    const rawContactHref = contactLinkMatch[1];
    try {
      const resolvedContactUrl = new URL(rawContactHref, cleanUrl).toString();
      if (isSafeUrl(resolvedContactUrl) && resolvedContactUrl !== cleanUrl) {
        contactPageUrl = resolvedContactUrl;
        const contactRes = await fetchSafePage(resolvedContactUrl, 6000);
        if (contactRes.ok && contactRes.html) {
          const contactEmails = extractEmailsWithContext(contactRes.html, resolvedContactUrl, true);
          // Mezclar sin duplicar
          for (const ce of contactEmails) {
            if (!allEmails.some((e) => e.email === ce.email)) {
              allEmails.push(ce);
            }
          }
        }
      }
    } catch {
      // Ignorar URL malformada
    }
  }

  // 4. Extraer Teléfono y WhatsApp
  const whatsapp = extractWhatsApp(html);
  const phone = extractPhones(html);

  // 5. Extraer Redes Sociales
  const social_links = extractSocialLinks(html);

  // 6. Extraer Dirección si aparece en el HTML
  let address: string | null = null;
  const addrMatch = html.match(/(?:direcci[oó]n|estamos en|visitanos en)[:\s]*([^<\n.]{10,80})/i);
  if (addrMatch) {
    address = addrMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // Email principal (el primero verificado en fuente oficial)
  const primaryEmailProvenance = allEmails.find((e) => e.verification_status === 'VERIFICADO_EN_FUENTE_OFICIAL') || allEmails[0] || null;
  const secondaryEmails = allEmails.filter((e) => e.email !== primaryEmailProvenance?.email);

  return {
    name: resolvedName || businessName || title || `${industry} en ${city}`,
    industry,
    city,
    country: 'Argentina',
    address: address || `${city}, Buenos Aires`,
    description: description || `Comercio dedicado a ${industry.toLowerCase()} en ${city}.`,
    website: cleanUrl,
    phone: phone || null,
    whatsapp: whatsapp || null,
    contact_page_url: contactPageUrl,
    social_links,
    email: primaryEmailProvenance?.email || null,
    email_provenance: primaryEmailProvenance,
    secondary_emails: secondaryEmails,
    source_domain: domain,
    source_url: cleanUrl,
    source_name: sourceName,
    evidence_notes: `Investigado por Nico en sitio oficial (${domain}). ${
      primaryEmailProvenance
        ? `Email detectado con trazabilidad en ${primaryEmailProvenance.source_url}.`
        : 'Sin email directo en web (canal WhatsApp disponible).'
    }`,
  };
}

// ==============================================================================
// EJECUCIÓN PRINCIPAL DE PROSPECCIÓN DE NICO
// ==============================================================================

/**
 * Ejecuta una búsqueda de prospectos web con Nico
 */
export async function runNicoProspecting(
  params: NicoSearchParams,
  userId?: string | null,
  client?: any
): Promise<{
  search: NicoSearch;
  prospects: NicoProspect[];
}> {
  const startTime = Date.now();
  const supabase = client || createClient();

  const industry = params.industry.trim();
  const city = params.city.trim();
  const maxResults = Math.min(params.max_results || 20, 30); // Control de consumo: máximo 30 por tanda
  const searchId = `nico-search-${Date.now()}`;

  // Verificar si hay API key de Firecrawl en el entorno
  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY || null;
  const isPaidService = Boolean(firecrawlApiKey);

  // 1. Obtener fuentes sugeridas para el rubro y localidad
  const targetSources = getTargetSourcesForSearch(industry, city);
  const sourcesUsed = targetSources.map((s) => s.name);

  // 2. Consultar negocios existentes en el CRM para deduplicación temprana
  let existingBusinesses: { id: string; name: string; website: string | null; email: string | null; phone: string | null }[] = [];
  try {
    const { data } = await supabase.from('businesses').select('id, name, website, email, phone');
    if (data) existingBusinesses = data;
  } catch {
    // Si falla Supabase, continuar
  }

  const existingDomains = new Set<string>();
  const existingEmails = new Set<string>();
  const existingNames = new Set<string>();
  const existingPhones = new Set<string>();

  existingBusinesses.forEach((b) => {
    if (b.website) existingDomains.add(normalizeDomain(b.website));
    if (b.email) existingEmails.add(normalizeEmail(b.email));
    if (b.name) existingNames.add(b.name.trim().toLowerCase());
    if (b.phone) existingPhones.add(cleanPhoneNumber(b.phone).slice(-8));
  });

  // 3. Ejecutar recolección web
  const discoveredCandidates: { title: string; link: string; snippet: string; sourceName: string }[] = [];
  const visitedDomains = new Set<string>();

  for (const source of targetSources) {
    if (discoveredCandidates.length >= maxResults * 2) break;
    try {
      const searchHits = await searchDuckDuckGo(source.query, 10);
      for (const hit of searchHits) {
        try {
          const u = new URL(hit.link);
          const dom = u.hostname.toLowerCase();
          // Control de consumo: evitar visitar repetidamente el mismo dominio
          if (!visitedDomains.has(dom)) {
            visitedDomains.add(dom);
            discoveredCandidates.push({
              title: hit.title,
              link: hit.link,
              snippet: hit.snippet,
              sourceName: source.name,
            });
          }
        } catch {
          // Ignorar URL inválida
        }
      }
    } catch (err) {
      console.warn(`Nico: Error en fuente ${source.name}:`, err);
    }
  }

  // 4. Investigar cada candidato y estructurar prospectos
  const prospects: NicoProspect[] = [];
  let duplicateCount = 0;
  let withWebsiteCount = 0;
  let withEmailCount = 0;
  let officialEmailCount = 0;
  let secondaryEmailCount = 0;

  for (const cand of discoveredCandidates) {
    if (prospects.length >= maxResults) break;

    try {
      // Limpiar nombre comercial a partir del título
      let cleanName = cand.title
        .replace(new RegExp(`\\b${city}\\b`, 'gi'), '')
        .replace(new RegExp(`\\b${industry}\\b`, 'gi'), '')
        .replace(/[-|•].*$/, '') // Eliminar slogans tras guión o barra
        .trim();

      if (!cleanName || cleanName.length < 3) {
        cleanName = cand.title.split(/[-|•]/)[0]?.trim() || `${industry} ${city}`;
      }

      // Investigar a fondo el sitio web del candidato
      const deepInfo = await investigateCandidateWebsite(cand.link, cleanName, industry, city, cand.sourceName);
      if (!deepInfo) continue;

      const website = deepInfo.website || cand.link;
      const domain = normalizeDomain(website);
      const email = deepInfo.email || null;
      const normEmail = normalizeEmail(email);
      const normName = (deepInfo.name || cleanName).trim().toLowerCase();
      const phoneDigits = deepInfo.phone ? cleanPhoneNumber(deepInfo.phone).slice(-8) : '';

      // Comprobar si ya existe en el CRM
      const isDupDomain = domain ? existingDomains.has(domain) : false;
      const isDupEmail = normEmail ? existingEmails.has(normEmail) : false;
      const isDupName = existingNames.has(normName);
      const isDupPhone = phoneDigits ? existingPhones.has(phoneDigits) : false;

      const isDuplicate = isDupDomain || isDupEmail || isDupName || isDupPhone;
      let matchedBusinessId: string | null = null;

      if (isDuplicate) {
        duplicateCount++;
        const matched = existingBusinesses.find(
          (b) =>
            (domain && b.website && normalizeDomain(b.website) === domain) ||
            (normEmail && b.email && normalizeEmail(b.email) === normEmail) ||
            b.name.trim().toLowerCase() === normName
        );
        matchedBusinessId = matched?.id || null;
      }

      if (website) withWebsiteCount++;
      if (email) {
        withEmailCount++;
        if (deepInfo.email_provenance?.verification_status === 'VERIFICADO_EN_FUENTE_OFICIAL') {
          officialEmailCount++;
        } else {
          secondaryEmailCount++;
        }
      }

      const prospect: NicoProspect = {
        id: `nico-prospect-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        search_id: searchId,
        name: deepInfo.name || cleanName,
        industry,
        city,
        state_province: 'Buenos Aires',
        country: 'Argentina',
        address: deepInfo.address || `${city}, Buenos Aires`,
        description: deepInfo.description || cand.snippet,
        website: website || null,
        phone: deepInfo.phone || null,
        whatsapp: deepInfo.whatsapp || null,
        contact_page_url: deepInfo.contact_page_url || null,
        social_links: deepInfo.social_links || [],
        email: email,
        email_provenance: deepInfo.email_provenance || null,
        secondary_emails: deepInfo.secondary_emails || [],
        source_domain: deepInfo.source_domain || domain || 'web-publica',
        source_url: deepInfo.source_url || cand.link,
        source_name: deepInfo.source_name || cand.sourceName,
        evidence_notes: deepInfo.evidence_notes || `Extraído de ${cand.sourceName}`,
        is_duplicate_crm: isDuplicate,
        duplicate_business_id: matchedBusinessId,
        import_status: 'DESCUBIERTO',
        created_at: new Date().toISOString(),
      };

      prospects.push(prospect);

      // Agregar a los sets locales para evitar duplicar en el mismo lote
      if (domain) existingDomains.add(domain);
      if (normEmail) existingEmails.add(normEmail);
      existingNames.add(normName);
    } catch (e) {
      console.warn('Nico: Error procesando candidato:', e);
    }
  }

  const durationMs = Date.now() - startTime;
  const newProspectsCount = prospects.length - duplicateCount;

  // 5. Crear registro de búsqueda
  const search: NicoSearch = {
    id: searchId,
    user_id: userId || null,
    query_industry: industry,
    query_city: city,
    max_results: maxResults,
    sources_used: sourcesUsed,
    is_paid_service: isPaidService,
    total_found: prospects.length,
    new_prospects_count: Math.max(0, newProspectsCount),
    duplicate_count: duplicateCount,
    with_website_count: withWebsiteCount,
    with_email_count: withEmailCount,
    official_email_count: officialEmailCount,
    secondary_email_count: secondaryEmailCount,
    status: 'COMPLETADO',
    duration_ms: durationMs,
    created_at: new Date().toISOString(),
  };

  // 6. Persistir en memoria local y en Supabase si está disponible
  LOCAL_NICO_SEARCHES.unshift(search);
  LOCAL_NICO_PROSPECTS.push(...prospects);

  try {
    await supabase.from('nico_searches').insert([search]);
    await supabase.from('nico_prospects').insert(prospects);
  } catch (err) {
    console.warn('Nico: Tablas remotas nico_searches no disponibles en Supabase, usando memoria local persistida.');
  }

  return { search, prospects };
}

// ==============================================================================
// INCORPORACIÓN AL CRM CON DEDUPLICACIÓN ESTRICTA
// ==============================================================================

/**
 * Incorpora prospectos descubiertos por Nico al CRM existente (`businesses`)
 */
export async function approveNicoProspects(
  prospectIds: string[],
  userId?: string | null,
  client?: any
): Promise<{
  approvedCount: number;
  duplicateCount: number;
  enrichedCount: number;
  createdBusinesses: Business[];
}> {
  const supabase = client || createClient();

  // 1. Obtener prospectos seleccionados
  const prospects = LOCAL_NICO_PROSPECTS.filter((p) => prospectIds.includes(p.id));

  if (prospects.length === 0) {
    return { approvedCount: 0, duplicateCount: 0, enrichedCount: 0, createdBusinesses: [] };
  }

  // 2. Obtener negocios del CRM
  const { data: existingBusinesses } = await supabase
    .from('businesses')
    .select('id, name, email, website, phone, notes');

  const existingDomains = new Map<string, any>();
  const existingEmails = new Map<string, any>();
  const existingNames = new Map<string, any>();

  existingBusinesses?.forEach((b: any) => {
    if (b.website) existingDomains.set(normalizeDomain(b.website), b);
    if (b.email) existingEmails.set(normalizeEmail(b.email), b);
    if (b.name) existingNames.set(b.name.trim().toLowerCase(), b);
  });

  const createdBusinesses: Business[] = [];
  let duplicateCount = 0;
  let enrichedCount = 0;

  for (const prospect of prospects) {
    if (prospect.import_status === 'APROBADO' && prospect.business_id) {
      continue;
    }

    const pDomain = normalizeDomain(prospect.website);
    const pEmail = normalizeEmail(prospect.email);
    const pName = prospect.name.trim().toLowerCase();

    // Detección de duplicado exacto en CRM
    const matched =
      (pDomain && existingDomains.get(pDomain)) ||
      (pEmail && existingEmails.get(pEmail)) ||
      existingNames.get(pName);

    if (matched) {
      duplicateCount++;
      // ENRIQUECIMIENTO: Si el prospecto existente no tiene email o teléfono y Nico lo encontró, actualizar sin sobrescribir datos fiables
      const updatePayload: Record<string, any> = {};
      if (!matched.email && prospect.email) {
        updatePayload.email = prospect.email;
      }
      if (!matched.phone && (prospect.whatsapp || prospect.phone)) {
        updatePayload.phone = prospect.whatsapp || prospect.phone;
      }

      if (Object.keys(updatePayload).length > 0) {
        const enrichedNotes = `${matched.notes || ''} [Enriquecido por Nico]: Email verificado (${prospect.email}) en ${prospect.source_url}.`;
        updatePayload.notes = enrichedNotes;

        try {
          await supabase.from('businesses').update(updatePayload).eq('id', matched.id);
          enrichedCount++;
        } catch (e) {
          console.warn('Error enriqueciendo negocio existente:', e);
        }
      }

      prospect.import_status = 'APROBADO';
      prospect.business_id = matched.id;
      continue;
    }

    // 3. Crear nuevo negocio en CRM con procedencia clara de NICO
    const notesParts: string[] = [
      `[Origen]: NICO AI (Inteligencia Web Comercial).`,
      `[Fuente]: ${prospect.source_name} (${prospect.source_url}).`,
    ];

    if (prospect.email) {
      notesParts.push(
        `[Email Verificado]: ${prospect.email} (Estado: ${prospect.email_provenance?.verification_status || 'OFICIAL'}).`
      );
    }
    if (prospect.whatsapp) {
      notesParts.push(`[WhatsApp Detectado]: ${prospect.whatsapp}.`);
    }
    if (prospect.social_links && prospect.social_links.length > 0) {
      notesParts.push(`[Redes]: ${prospect.social_links.map((s) => `${s.platform} (${s.url})`).join(', ')}.`);
    }

    const structuredNotes = notesParts.join(' ');

    const { data: newBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert([
        {
          user_id: userId || null,
          name: prospect.name,
          industry: prospect.industry,
          city: prospect.city,
          state_province: prospect.state_province || 'Buenos Aires',
          country: prospect.country || 'Argentina',
          website: prospect.website || null,
          phone: prospect.whatsapp || prospect.phone || null,
          email: prospect.email || null,
          source: 'NICO',
          status: 'NUEVO',
          notes: structuredNotes,
        },
      ])
      .select()
      .single();

    if (insertError || !newBusiness) {
      console.error('Error insertando prospecto de Nico en businesses:', insertError);
      continue;
    }

    createdBusinesses.push(newBusiness as Business);
    prospect.import_status = 'APROBADO';
    prospect.business_id = newBusiness.id;

    // Actualizar registros locales para no duplicar en el mismo ciclo
    if (pDomain) existingDomains.set(pDomain, newBusiness);
    if (pEmail) existingEmails.set(pEmail, newBusiness);
    existingNames.set(pName, newBusiness);
  }

  return {
    approvedCount: createdBusinesses.length,
    duplicateCount,
    enrichedCount,
    createdBusinesses,
  };
}

/**
 * Obtiene el historial de búsquedas de Nico
 */
export async function getNicoSearches(client?: any): Promise<NicoSearch[]> {
  const supabase = client || createClient();
  try {
    const { data, error } = await supabase
      .from('nico_searches')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as NicoSearch[];
    }
  } catch {
    // Usar cache local
  }
  return LOCAL_NICO_SEARCHES;
}

/**
 * Obtiene los prospectos descubiertos por una búsqueda o todos los recientes
 */
export async function getNicoProspects(searchId?: string, client?: any): Promise<NicoProspect[]> {
  const supabase = client || createClient();
  try {
    let query = supabase.from('nico_prospects').select('*').order('created_at', { ascending: false });
    if (searchId) {
      query = query.eq('search_id', searchId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as NicoProspect[];
    }
  } catch {
    // Usar cache local
  }

  if (searchId) {
    return LOCAL_NICO_PROSPECTS.filter((p) => p.search_id === searchId);
  }
  return LOCAL_NICO_PROSPECTS;
}
