import { createClient } from '@/lib/supabase/client';
import { normalizeDomain, normalizeEmail } from '@/lib/utils';
import { LolaSearch, LolaCandidate, Business, LolaCandidateStatus } from '@/types/database.types';

export interface LolaSearchParams {
  industry: string;
  city: string;
  state_province?: string;
  country?: string;
  max_results?: number;
}

export type WebVerifiedStatus = 'PENDIENTE' | 'SIN_SITIO_WEB' | 'ACCESIBLE' | 'NO_VERIFICADO';

export interface WebsiteInvestigationResult {
  has_website: boolean;
  has_whatsapp: boolean;
  has_forms: boolean;
  is_mobile_friendly: boolean;
  site_title: string | null;
  site_description: string | null;
  email: string | null;
  services_detected: string[];
  notes: string;
  verified_status: WebVerifiedStatus;
}

export interface RawDiscoveryPlace {
  place_id: string;
  name: string;
  formatted_address: string;
}

export interface RawPlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  phone?: string | null;
  website?: string | null;
}

/**
 * Validador SSRF: Bloquea IPs privadas, locales y endpoints de metadatos en la nube.
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

      // 10.0.0.0/8
      if (b1 === 10) return false;
      // 172.16.0.0/12 (172.16 - 172.31)
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return false;
      // 192.168.0.0/16
      if (b1 === 192 && b2 === 168) return false;
      // 169.254.0.0/16 (Link local)
      if (b1 === 169 && b2 === 254) return false;
      // 127.0.0.0/8
      if (b1 === 127) return false;
      // 0.0.0.0/8
      if (b1 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Investigador de sitios web con protección SSRF y timeout estricto (6 segundos).
 * Extrae WhatsApp, formularios, responsive, y busca emails en la página.
 */
export async function investigateWebsite(url: string | null | undefined): Promise<WebsiteInvestigationResult> {
  if (!url || !url.trim()) {
    return {
      has_website: false,
      has_whatsapp: false,
      has_forms: false,
      is_mobile_friendly: false,
      site_title: null,
      site_description: null,
      email: null,
      services_detected: [],
      notes: 'Sin sitio web informado en Google Places. Excelente oportunidad para ofrecer desarrollo web inicial.',
      verified_status: 'SIN_SITIO_WEB',
    };
  }

  const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;

  if (!isSafeUrl(cleanUrl)) {
    return {
      has_website: false,
      has_whatsapp: false,
      has_forms: false,
      is_mobile_friendly: false,
      site_title: null,
      site_description: null,
      email: null,
      services_detected: [],
      notes: 'No se pudo verificar el sitio web (URL no segura o dirección IP interna).',
      verified_status: 'NO_VERIFICADO',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebPilotBot/1.0; +https://webpilot.ia)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        has_website: false,
        has_whatsapp: false,
        has_forms: false,
        is_mobile_friendly: false,
        site_title: null,
        site_description: null,
        email: null,
        services_detected: [],
        notes: `No se pudo verificar el sitio web (Servidor respondió con código HTTP ${res.status}).`,
        verified_status: 'NO_VERIFICADO',
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && contentType !== '') {
      return {
        has_website: true,
        has_whatsapp: false,
        has_forms: false,
        is_mobile_friendly: false,
        site_title: null,
        site_description: null,
        email: null,
        services_detected: [],
        notes: `Sitio web accesible (${contentType}).`,
        verified_status: 'ACCESIBLE',
      };
    }

    const rawText = await res.text();
    const html = rawText.slice(0, 250000);

    // Extracción de título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const site_title = titleMatch ? titleMatch[1].trim().slice(0, 150) : null;

    // Extracción de meta description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const site_description = descMatch ? descMatch[1].trim().slice(0, 250) : null;

    // Detección de WhatsApp
    const has_whatsapp =
      /wa\.me\/|api\.whatsapp\.com\/|whatsapp:\/\/|chat\.whatsapp\.com/i.test(html);

    // Detección de formularios de contacto
    const has_forms = /<form/i.test(html) && /submit|contacto|contact|enviar/i.test(html);

    // Detección de viewport móvil
    const is_mobile_friendly = /<meta[^>]*name=["']viewport["']/i.test(html);

    // Búsqueda de email en HTML
    let detectedEmail: string | null = null;
    const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (mailtoMatch) {
      detectedEmail = mailtoMatch[1].toLowerCase();
    } else {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const allEmails = html.match(emailRegex);
      if (allEmails && allEmails.length > 0) {
        // Filtrar extensiones comunes de imágenes o assets
        const valid = allEmails.find(
          (em) => !em.endsWith('.png') && !em.endsWith('.jpg') && !em.endsWith('.webp')
        );
        if (valid) detectedEmail = valid.toLowerCase();
      }
    }

    // Detección de servicios clave
    const services_detected: string[] = [];
    if (/asesor|consult/i.test(html)) services_detected.push('Asesoramiento');
    if (/presupuesto|cotiz/i.test(html)) services_detected.push('Cotizaciones online');
    if (/ecommerce|tienda|carrito|comprar/i.test(html)) services_detected.push('E-commerce');
    if (/turnos|reservas|agenda/i.test(html)) services_detected.push('Turnos/Reservas');

    // Construcción de notas diagnósticas de Lola
    const observations: string[] = [];
    if (site_title) observations.push(`Título: "${site_title}".`);
    if (!has_whatsapp) {
      observations.push('Sin botón de WhatsApp directo visible (mejora comercial urgente).');
    } else {
      observations.push('Cuenta con enlace directo a WhatsApp.');
    }
    if (!is_mobile_friendly) {
      observations.push('No adaptado para dispositivos móviles (falta viewport responsive).');
    }
    if (has_forms) {
      observations.push('Tiene formulario de contacto.');
    }
    if (detectedEmail) {
      observations.push(`Email detectado en web: ${detectedEmail}.`);
    }

    return {
      has_website: true,
      has_whatsapp,
      has_forms,
      is_mobile_friendly,
      site_title,
      site_description,
      email: detectedEmail,
      services_detected,
      notes: observations.join(' ') || 'Sitio web accesible y verificado.',
      verified_status: 'ACCESIBLE',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError';
    return {
      has_website: false,
      has_whatsapp: false,
      has_forms: false,
      is_mobile_friendly: false,
      site_title: null,
      site_description: null,
      email: null,
      services_detected: [],
      notes: isTimeout
        ? 'No se pudo verificar el sitio web (Tiempo de espera agotado >6s).'
        : `No se pudo verificar el sitio web (${err?.message || 'Error de conexión'}).`,
      verified_status: 'NO_VERIFICADO',
    };
  }
}

/**
 * Obtiene la clave de Google Maps/Places API desde las variables de entorno.
 * Soporta GOOGLE_MAPS_API_KEY, GOOGLE_PLACES_API_KEY y NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 * Limpia comillas o espacios accidentales.
 */
export function getGoogleMapsApiKey(): string | null {
  const rawKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    null;

  if (!rawKey) return null;
  const clean = rawKey.trim().replace(/^['"]+|['"]+$/g, '');
  return clean.length > 0 ? clean : null;
}

/**
 * Traduce y formatea los errores de Google Places API a mensajes comprensibles para el usuario.
 */
function formatGooglePlacesError(status: number, errorBody: any): string {
  const code = errorBody?.error?.code || status;
  const rawMsg = errorBody?.error?.message || '';
  const details = JSON.stringify(errorBody?.error?.details || []);
  const combined = `${rawMsg} ${details}`.toUpperCase();

  if (code === 400 || combined.includes('API_KEY_INVALID') || combined.includes('INVALID_ARGUMENT')) {
    return 'La clave de Google Maps configurada (GOOGLE_MAPS_API_KEY) es inválida o tiene un formato incorrecto. Verificá la clave generada en Google Cloud Console.';
  }

  if (
    combined.includes('BILLING_NOT_ENABLED') ||
    combined.includes('BILLING_DISABLED') ||
    combined.includes('BILLING')
  ) {
    return 'Tu proyecto de Google Cloud no tiene una cuenta de facturación vinculada o activa. Google exige vincular una tarjeta para activar la cuota gratuita mensual de $200 USD.';
  }

  if (
    code === 403 ||
    combined.includes('PERMISSION_DENIED') ||
    combined.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') ||
    combined.includes('PLACES_API_NOT_ENABLED') ||
    combined.includes('NOT_ENABLED') ||
    combined.includes('API HAS NOT BEEN USED')
  ) {
    if (combined.includes('IP_REFERRER_BLOCKED') || combined.includes('HTTP_REFERRER')) {
      return 'La clave de Google Maps tiene restricciones de IP o dominio HTTP que impiden que el servidor consulte Google Places.';
    }
    return 'La API "Places API (New)" no está habilitada en tu proyecto de Google Cloud Console. Buscala en la biblioteca de APIs de console.cloud.google.com y hacé clic en "Habilitar".';
  }

  if (code === 429 || combined.includes('RESOURCE_EXHAUSTED') || combined.includes('QUOTA')) {
    return 'Se ha alcanzado la cuota o límite de consultas de Google Places API en tu cuenta de Google Cloud.';
  }

  if (status >= 500) {
    return `Los servidores de Google Places experimentaron un error temporal (HTTP ${status}). Intentá nuevamente en unos instantes.`;
  }

  return `Google Places API respondió con error (HTTP ${status}): ${rawMsg || 'Error en la solicitud'}`;
}

// ============================================================================
// ETAPA 1 — DESCUBRIR (Text Search con FieldMask Basic/Essentials)
// Optimización de costos: No pide teléfono ni sitio web en esta etapa.
// ============================================================================
export async function runLolaDiscovery(
  params: LolaSearchParams,
  userId?: string | null,
  client?: any
): Promise<{
  search: LolaSearch;
  candidates: LolaCandidate[];
}> {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    throw new Error(
      'Falta configurar la variable de entorno GOOGLE_MAPS_API_KEY. ' +
      'Si estás ejecutando en Vercel, agregala en Project Settings ➔ Environment Variables. ' +
      'Si estás ejecutando en local, agregala en el archivo .env.local.'
    );
  }

  const startTime = Date.now();
  const supabase = client || createClient();

  // 1. Crear sesión de búsqueda en estado EN_PROCESO
  const { data: searchSession, error: searchError } = await supabase
    .from('lola_searches')
    .insert([
      {
        user_id: userId || null,
        industry: params.industry,
        city: params.city,
        state_province: params.state_province || 'Buenos Aires',
        country: params.country || 'Argentina',
        max_results: Math.min(Math.max(params.max_results || 20, 1), 20),
        web_filter: 'ALL',
        status: 'EN_PROCESO',
        total_found: 0,
        with_website: 0,
        without_website: 0,
        investigated_count: 0,
        approved_count: 0,
        api_calls_count: 1,
        source_used: 'Google Places API (New) — Text Search (Descubrimiento)',
      },
    ])
    .select()
    .single();

  if (searchError || !searchSession) {
    throw new Error(`Error al registrar sesión de búsqueda: ${searchError?.message}`);
  }

  try {
    const textQuery = `${params.industry} en ${params.city}, ${params.state_province || ''} ${params.country || 'Argentina'}`.trim();
    const maxResultCount = Math.min(Math.max(params.max_results || 20, 1), 20);

    // Field Mask ESTRICTAMENTE BÁSICO (Essentials Tier):
    // Solo ID, Nombre y Dirección. No solicita campos de contacto para no elevar el costo.
    const fieldMask = 'places.id,places.displayName,places.formattedAddress';

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount,
        languageCode: 'es',
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(formatGooglePlacesError(res.status, errorBody));
    }

    const json = await res.json();
    const rawPlaces = json.places || [];

    // Manejo cuando no hay resultados
    if (rawPlaces.length === 0) {
      const duration_ms = Date.now() - startTime;
      const { data: updatedSearch } = await supabase
        .from('lola_searches')
        .update({
          status: 'COMPLETADO',
          total_found: 0,
          duration_ms,
        })
        .eq('id', searchSession.id)
        .select()
        .single();

      return {
        search: (updatedSearch as LolaSearch) || searchSession,
        candidates: [],
      };
    }

    // Deduplicación preventiva contra comercios ya registrados en el CRM (businesses)
    const { data: existingBusinesses } = await supabase
      .from('businesses')
      .select('id, name, google_place_id');

    const existingPlaceIds = new Set<string>();
    const existingNames = new Set<string>();

    (existingBusinesses || []).forEach((b: any) => {
      if (b.google_place_id) existingPlaceIds.add(b.google_place_id);
      if (b.name) existingNames.add(b.name.trim().toLowerCase());
    });

    // Guardar candidatos descubiertos en lola_candidates con import_status = 'DESCUBIERTO'
    const candidateInserts: any[] = rawPlaces.map((p: any) => {
      const placeId = p.id;
      const displayName = p.displayName?.text || 'Comercio sin nombre informado';
      const isAlreadyInCrm =
        (placeId && existingPlaceIds.has(placeId)) ||
        existingNames.has(displayName.trim().toLowerCase());

      return {
        search_id: searchSession.id,
        place_id: placeId,
        name: displayName,
        industry: params.industry,
        city: params.city,
        state_province: params.state_province || 'Buenos Aires',
        country: params.country || 'Argentina',
        address: p.formattedAddress || `${params.city}, Argentina`,
        website: null,
        phone: null,
        email: null,
        source: 'Google Places API (New) — Descubrimiento',
        has_website: false,
        has_whatsapp: false,
        has_forms: false,
        is_mobile_friendly: false,
        site_title: null,
        site_description: null,
        services_detected: [],
        notes: isAlreadyInCrm
          ? 'Comercio ya registrado en el CRM WebPilot.'
          : 'Descubierto en Google Places. Pendiente de selección para investigación en profundidad.',
        verified_status: isAlreadyInCrm ? 'DUPLICADO' : 'PENDIENTE',
        import_status: isAlreadyInCrm ? 'DESCARTADO' : ('DESCUBIERTO' as LolaCandidateStatus),
      };
    });

    let insertedCandidates: LolaCandidate[] = [];
    if (candidateInserts.length > 0) {
      const { data: saved, error: candError } = await supabase
        .from('lola_candidates')
        .insert(candidateInserts)
        .select();

      if (candError) {
        throw new Error(`Error guardando candidatos descubiertos: ${candError.message}`);
      }
      insertedCandidates = (saved as LolaCandidate[]) || [];
    }

    const duration_ms = Date.now() - startTime;
    const { data: updatedSearch } = await supabase
      .from('lola_searches')
      .update({
        status: 'COMPLETADO',
        total_found: insertedCandidates.length,
        duration_ms,
      })
      .eq('id', searchSession.id)
      .select()
      .single();

    return {
      search: (updatedSearch as LolaSearch) || searchSession,
      candidates: insertedCandidates,
    };
  } catch (error: any) {
    await supabase
      .from('lola_searches')
      .update({
        status: 'ERROR',
        error_message: error?.message || 'Error durante el descubrimiento con Google Places API',
      })
      .eq('id', searchSession.id);

    throw error;
  }
}

// ============================================================================
// ETAPA 3 — INVESTIGACIÓN EN PROFUNDIDAD (Place Details + Web Audit)
// Solo para los candidatos seleccionados por Daro y Julieta.
// ============================================================================
export async function investigateSelectedCandidates(
  candidateIds: string[],
  client?: any
): Promise<{
  investigatedCandidates: LolaCandidate[];
  apiCallsCount: number;
}> {
  if (!candidateIds || candidateIds.length === 0) {
    return { investigatedCandidates: [], apiCallsCount: 0 };
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    console.warn('Lola: Variable GOOGLE_MAPS_API_KEY no configurada. Se continuará con auditoría web estática si hay URL registrada.');
  }

  const supabase = client || createClient();

  // 1. Obtener los candidatos seleccionados
  const { data: candidates, error: fetchErr } = await supabase
    .from('lola_candidates')
    .select('*')
    .in('id', candidateIds);

  if (fetchErr || !candidates || candidates.length === 0) {
    return { investigatedCandidates: [], apiCallsCount: 0 };
  }

  const investigatedCandidates: LolaCandidate[] = [];
  let apiCallsCount = 0;

  for (const cand of candidates as LolaCandidate[]) {
    let phone = cand.phone;
    let website = cand.website;
    let address = cand.address;

    // 2. Si tiene place_id y aún no tiene teléfono/sitio web consultado, consultar Google Place Details
    // Solo si no es un comercio duplicado para no consumir cuotas innecesariamente
    if (apiKey && cand.place_id && cand.verified_status !== 'DUPLICADO' && (!phone || !website)) {
      try {
        const detailsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(cand.place_id)}`;
        const detailsRes = await fetch(detailsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'id,displayName,nationalPhoneNumber,websiteUri,formattedAddress',
          },
        });

        apiCallsCount++;

        if (detailsRes.ok) {
          const detailsJson = await detailsRes.json();
          phone = detailsJson.nationalPhoneNumber || phone;
          website = detailsJson.websiteUri || website;
          address = detailsJson.formattedAddress || address;
        } else {
          console.warn(`Place Details falló para ${cand.place_id}: HTTP ${detailsRes.status}`);
        }
      } catch (e) {
        console.warn(`Error en Place Details para ${cand.place_id}:`, e);
      }
    }

    // 3. Investigar sitio web (si existe) desde la fuente oficial del propio negocio
    const webAudit = await investigateWebsite(website);

    // 4. Actualizar el candidato a estado INVESTIGADO con trazabilidad completa
    const updatePayload: Partial<LolaCandidate> = {
      phone: phone || null,
      website: website || null,
      email: cand.email || webAudit.email || null,
      address: address || cand.address,
      has_website: webAudit.has_website,
      has_whatsapp: webAudit.has_whatsapp,
      has_forms: webAudit.has_forms,
      is_mobile_friendly: webAudit.is_mobile_friendly,
      site_title: webAudit.site_title,
      site_description: webAudit.site_description,
      services_detected: webAudit.services_detected,
      notes: webAudit.notes,
      verified_status: webAudit.verified_status,
      import_status: 'INVESTIGADO' as LolaCandidateStatus,
      investigated_at: new Date().toISOString(),
      source: 'Google Places API (New) + Investigación Web WebPilot',
    };

    const { data: updated, error: updErr } = await supabase
      .from('lola_candidates')
      .update(updatePayload)
      .eq('id', cand.id)
      .select()
      .single();

    if (!updErr && updated) {
      investigatedCandidates.push(updated as LolaCandidate);
    }
  }

  // Actualizar contadores en la sesión de búsqueda
  if (candidates.length > 0) {
    const searchId = candidates[0].search_id;
    const { data: searchRow } = await supabase
      .from('lola_searches')
      .select('investigated_count, api_calls_count, with_website, without_website')
      .eq('id', searchId)
      .single();

    if (searchRow) {
      const withWeb = investigatedCandidates.filter((c) => Boolean(c.website)).length;
      const withoutWeb = investigatedCandidates.filter((c) => !c.website).length;

      await supabase
        .from('lola_searches')
        .update({
          investigated_count: (searchRow.investigated_count || 0) + investigatedCandidates.length,
          api_calls_count: (searchRow.api_calls_count || 1) + apiCallsCount,
          with_website: (searchRow.with_website || 0) + withWeb,
          without_website: (searchRow.without_website || 0) + withoutWeb,
        })
        .eq('id', searchId);
    }
  }

  return {
    investigatedCandidates,
    apiCallsCount,
  };
}

// ============================================================================
// EDICIÓN MANUAL DE INFORMACIÓN FALTANTE
// Permite que el usuario complete teléfono, email, web o notas antes de aprobar
// ============================================================================
export async function updateCandidateManualData(
  candidateId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
    notes?: string;
  },
  client?: any
): Promise<LolaCandidate> {
  const supabase = client || createClient();

  const payload: any = {
    manually_edited: true,
  };

  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.phone !== undefined) payload.phone = data.phone.trim() || null;
  if (data.email !== undefined) payload.email = data.email.trim() || null;
  if (data.website !== undefined) payload.website = data.website.trim() || null;
  if (data.notes !== undefined) payload.notes = data.notes.trim() || null;

  const { data: updated, error } = await supabase
    .from('lola_candidates')
    .update(payload)
    .eq('id', candidateId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Error al actualizar datos del candidato: ${error?.message}`);
  }

  return updated as LolaCandidate;
}

// ============================================================================
// ETAPA 4 — APROBACIÓN Y DESCARTE
// Solo los candidatos aprobados explícitamente se incorporan a businesses (CRM)
// ============================================================================
export async function approveLolaCandidates(
  candidateIds: string[],
  userId?: string | null,
  client?: any
): Promise<{
  approvedCount: number;
  duplicateCount: number;
  createdBusinesses: Business[];
}> {
  const supabase = client || createClient();

  // 1. Obtener los candidatos seleccionados
  const { data: candidates, error: candError } = await supabase
    .from('lola_candidates')
    .select('*')
    .in('id', candidateIds);

  if (candError || !candidates || candidates.length === 0) {
    return { approvedCount: 0, duplicateCount: 0, createdBusinesses: [] };
  }

  // 2. Obtener negocios existentes para deduplicación estricta
  const { data: existingBusinesses } = await supabase
    .from('businesses')
    .select('id, name, email, website, google_place_id');

  const existingPlaceIds = new Set<string>();
  const existingDomains = new Set<string>();
  const existingEmails = new Set<string>();
  const existingNames = new Set<string>();

  existingBusinesses?.forEach((b: any) => {
    if (b.google_place_id) existingPlaceIds.add(b.google_place_id);
    if (b.website) existingDomains.add(normalizeDomain(b.website));
    if (b.email) existingEmails.add(normalizeEmail(b.email));
    if (b.name) existingNames.add(b.name.trim().toLowerCase());
  });

  const createdBusinesses: Business[] = [];
  let duplicateCount = 0;

  for (const cand of candidates as LolaCandidate[]) {
    // Si ya fue aprobado y vinculado a un negocio, omitir
    if (cand.import_status === 'APROBADO' && cand.business_id) {
      continue;
    }

    const candDomain = normalizeDomain(cand.website);
    const candEmail = normalizeEmail(cand.email);
    const candName = cand.name.trim().toLowerCase();

    // Detección de duplicados (por place_id, dominio, email o nombre)
    const isDupPlaceId = cand.place_id && existingPlaceIds.has(cand.place_id);
    const isDupDomain = candDomain && existingDomains.has(candDomain);
    const isDupEmail = candEmail && existingEmails.has(candEmail);
    const isDupName = existingNames.has(candName);

    if (isDupPlaceId || isDupDomain || isDupEmail || isDupName) {
      duplicateCount++;
      continue;
    }

    // Separación explícita de capas de datos (Google Places, Sitio Oficial y Aporte Manual)
    const notesParts: string[] = [];

    // 1. Capa Google Places (Place ID canónico de Google)
    if (cand.place_id) {
      notesParts.push(`[Google Places]: ID ${cand.place_id}.`);
    }

    // 2. Capa Sitio Oficial del negocio
    if (cand.website) {
      const details = [];
      if (cand.has_whatsapp) details.push('WhatsApp detectado');
      if (cand.is_mobile_friendly) details.push('Responsive móvil');
      if (cand.site_title) details.push(`Título: "${cand.site_title}"`);
      notesParts.push(`[Sitio Oficial]: ${cand.website} (${details.join(', ') || 'Web analizada'}).`);
    } else {
      notesParts.push('[Sitio Oficial]: Sin sitio web registrado en Google Places.');
    }

    // 3. Capa Aporte Manual (completado por Daro o Julieta)
    if (cand.manually_edited) {
      notesParts.push('[Aporte Manual]: Información de contacto o notas completadas por el operador.');
    }

    // 4. Observaciones comerciales
    if (cand.notes && !cand.notes.startsWith('Sin sitio web')) {
      notesParts.push(`[Diagnóstico]: ${cand.notes}`);
    }

    const structuredNotes = notesParts.join(' ');

    const { data: newBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert([
        {
          user_id: userId || null,
          name: cand.name,
          google_place_id: cand.place_id || null,
          industry: cand.industry || null,
          city: cand.city || null,
          state_province: cand.state_province || null,
          country: cand.country || 'Argentina',
          website: cand.website || null,
          phone: cand.phone || null,
          email: cand.email || null,
          source: 'Google Places API (New)',
          status: 'NUEVO',
          notes: structuredNotes || 'Prospectado e investigado por Lola AI.',
        },
      ])
      .select()
      .single();

    if (insertError || !newBusiness) {
      console.error('Error aprobando candidato a business:', insertError);
      continue;
    }

    createdBusinesses.push(newBusiness as Business);

    // Registrar en los sets locales para evitar duplicar en el mismo lote
    if (cand.place_id) existingPlaceIds.add(cand.place_id);
    if (candDomain) existingDomains.add(candDomain);
    if (candEmail) existingEmails.add(candEmail);
    existingNames.add(candName);

    // Registrar actividad en CRM con trazabilidad de Place ID y usuario
    await supabase.from('activities').insert([
      {
        business_id: newBusiness.id,
        user_id: userId || null,
        type: 'NOTA',
        description: `Negocio incorporado desde Google Places API (New) por Lola. Place ID: ${cand.place_id || 'N/A'}.`,
        from_stage: null,
        to_stage: 'NUEVO',
      },
    ]);

    // Marcar candidato como APROBADO
    await supabase
      .from('lola_candidates')
      .update({
        import_status: 'APROBADO' as LolaCandidateStatus,
        business_id: newBusiness.id,
      })
      .eq('id', cand.id);

    // Incrementar approved_count en la sesión de búsqueda
    const { data: searchRow } = await supabase
      .from('lola_searches')
      .select('approved_count')
      .eq('id', cand.search_id)
      .single();

    if (searchRow) {
      await supabase
        .from('lola_searches')
        .update({ approved_count: (searchRow.approved_count || 0) + 1 })
        .eq('id', cand.search_id);
    }
  }

  return {
    approvedCount: createdBusinesses.length,
    duplicateCount,
    createdBusinesses,
  };
}

/**
 * Descarta candidatos que no califican para la agencia.
 */
export async function discardLolaCandidates(candidateIds: string[], client?: any): Promise<number> {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from('lola_candidates')
    .update({ import_status: 'DESCARTADO' as LolaCandidateStatus })
    .in('id', candidateIds)
    .select();

  if (error) {
    throw new Error(`Error al descartar candidatos: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Obtiene el historial de búsquedas de Lola.
 */
export async function getLolaSearchHistory(limit = 10, client?: any): Promise<LolaSearch[]> {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from('lola_searches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching Lola searches:', error);
    return [];
  }

  return (data as LolaSearch[]) || [];
}

/**
 * Obtiene candidatos de una búsqueda específica.
 */
export async function getLolaCandidates(searchId: string, client?: any): Promise<LolaCandidate[]> {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from('lola_candidates')
    .select('*')
    .eq('search_id', searchId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching Lola candidates:', error);
    return [];
  }

  return (data as LolaCandidate[]) || [];
}

/**
 * Obtiene una búsqueda específica junto con todos sus candidatos para reanudar el trabajo.
 */
export async function getLolaSearchWithCandidates(
  searchId: string,
  client?: any
): Promise<{ search: LolaSearch | null; candidates: LolaCandidate[] }> {
  const supabase = client || createClient();

  const { data: search, error: sErr } = await supabase
    .from('lola_searches')
    .select('*')
    .eq('id', searchId)
    .single();

  if (sErr || !search) {
    console.error('Error fetching search session:', sErr);
    return { search: null, candidates: [] };
  }

  const { data: candidates, error: cErr } = await supabase
    .from('lola_candidates')
    .select('*')
    .eq('search_id', searchId)
    .order('created_at', { ascending: true });

  if (cErr) {
    console.error('Error fetching Lola candidates for search:', cErr);
    return { search: search as LolaSearch, candidates: [] };
  }

  return {
    search: search as LolaSearch,
    candidates: (candidates as LolaCandidate[]) || [],
  };
}
