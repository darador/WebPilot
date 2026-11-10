import { createClient } from '@/lib/supabase/client';
import { normalizeDomain, normalizeEmail } from '@/lib/utils';
import { LolaSearch, LolaCandidate, Business } from '@/types/database.types';

export interface LolaSearchParams {
  industry: string;
  city: string;
  state_province?: string;
  country?: string;
  max_results?: number;
  web_filter?: 'ALL' | 'WITH_WEB' | 'WITHOUT_WEB';
}

export type WebVerifiedStatus = 'SIN_SITIO_WEB' | 'ACCESIBLE' | 'NO_VERIFICADO';

export interface WebsiteInvestigationResult {
  has_website: boolean;
  has_whatsapp: boolean;
  has_forms: boolean;
  is_mobile_friendly: boolean;
  site_title: string | null;
  site_description: string | null;
  services_detected: string[];
  notes: string;
  verified_status: WebVerifiedStatus;
}

export interface RawPlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  phone?: string;
  website?: string;
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
 * Investigador de sitios web con protección SSRF y timeout estricto.
 * Diferencia con precisión:
 * - 'SIN_SITIO_WEB': Sin sitio web informado en Google Places.
 * - 'ACCESIBLE': El sitio web responde correctamente (HTTP 200..399).
 * - 'NO_VERIFICADO': No se pudo verificar (timeout, error de red o error HTTP).
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
      services_detected: [],
      notes: 'Sin sitio web informado en Google Places. Oportunidad ideal para ofrecer presencia digital desde cero.',
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
        services_detected: [],
        notes: `No se pudo verificar el sitio web (Servidor respondió con código HTTP ${res.status}).`,
        verified_status: 'NO_VERIFICADO',
      };
    }

    const html = await res.text();

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

    return {
      has_website: true,
      has_whatsapp,
      has_forms,
      is_mobile_friendly,
      site_title,
      site_description,
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
      services_detected: [],
      notes: isTimeout
        ? 'No se pudo verificar el sitio web (Tiempo de espera agotado >6s).'
        : `No se pudo verificar el sitio web (${err?.message || 'Error de conexión'}).`,
      verified_status: 'NO_VERIFICADO',
    };
  }
}

/**
 * Consulta a Google Places API (New) vía Text Search con FieldMask.
 * Sin simulación ni datos inventados: si falla o no está configurada, informa el error real.
 */
export async function searchPlacesEngine(params: LolaSearchParams): Promise<{
  places: RawPlaceResult[];
  sourceUsed: string;
}> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'Falta configurar la variable de entorno GOOGLE_MAPS_API_KEY en .env.local. ' +
      'Para buscar comercios reales con Lola mediante Google Places API (New), ingresá tu clave de API en la configuración.'
    );
  }

  const textQuery = `${params.industry} en ${params.city}, ${params.state_province || ''} ${params.country || 'Argentina'}`.trim();
  const maxResultCount = Math.min(Math.max(params.max_results || 10, 1), 20);

  // Field Mask estricto con los campos permitidos y necesarios:
  // places.id, places.displayName, places.formattedAddress, places.nationalPhoneNumber, places.websiteUri
  const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri';

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey.trim(),
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
    const errorMsg =
      errorBody?.error?.message ||
      `HTTP ${res.status}: ${res.statusText || 'Error en la respuesta de Google Places'}`;

    throw new Error(`Google Places API respondió con error: ${errorMsg}`);
  }

  const json = await res.json();
  const rawPlaces = json.places || [];

  const places: RawPlaceResult[] = rawPlaces.map((p: any) => ({
    place_id: p.id,
    name: p.displayName?.text || 'Comercio sin nombre informado',
    formatted_address: p.formattedAddress || `${params.city}, Argentina`,
    phone: p.nationalPhoneNumber || null,
    website: p.websiteUri || null,
  }));

  return {
    places,
    sourceUsed: 'Google Places API (New)',
  };
}

/**
 * Ejecuta el pipeline completo de búsqueda e investigación de Lola.
 */
export async function runLolaProspecting(
  params: LolaSearchParams,
  userId?: string | null
): Promise<{
  search: LolaSearch;
  candidates: LolaCandidate[];
}> {
  const startTime = Date.now();
  const supabase = createClient();

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
        max_results: params.max_results || 10,
        web_filter: params.web_filter || 'ALL',
        status: 'EN_PROCESO',
        total_found: 0,
        with_website: 0,
        without_website: 0,
        investigated_count: 0,
        approved_count: 0,
        source_used: 'Google Places API (New)',
      },
    ])
    .select()
    .single();

  if (searchError || !searchSession) {
    throw new Error(`Error al registrar sesión de búsqueda: ${searchError?.message}`);
  }

  try {
    // 2. Ejecutar búsqueda real en Google Places API (New)
    const { places, sourceUsed } = await searchPlacesEngine(params);

    // Filtrar según web_filter si el usuario lo especificó
    let filteredPlaces = places;
    if (params.web_filter === 'WITH_WEB') {
      filteredPlaces = places.filter((p) => Boolean(p.website));
    } else if (params.web_filter === 'WITHOUT_WEB') {
      filteredPlaces = places.filter((p) => !p.website);
    }

    // 3. Investigar presencia web de cada candidato real
    const candidateInserts: any[] = [];
    let withWebCount = 0;
    let withoutWebCount = 0;

    for (const place of filteredPlaces) {
      if (place.website) {
        withWebCount++;
      } else {
        withoutWebCount++;
      }

      // Comprobar si el sitio responde
      const investigation = await investigateWebsite(place.website);

      candidateInserts.push({
        search_id: searchSession.id,
        place_id: place.place_id,
        name: place.name,
        industry: params.industry,
        city: params.city,
        state_province: params.state_province || 'Buenos Aires',
        country: params.country || 'Argentina',
        website: place.website || null,
        phone: place.phone || null,
        email: null,
        source: 'Google Places API (New)',
        url_origin: place.website || null,
        has_website: investigation.has_website,
        has_whatsapp: investigation.has_whatsapp,
        has_forms: investigation.has_forms,
        is_mobile_friendly: investigation.is_mobile_friendly,
        site_title: investigation.site_title,
        site_description: investigation.site_description,
        services_detected: investigation.services_detected,
        notes: investigation.notes,
        verified_status: investigation.verified_status,
        import_status: 'PENDIENTE',
      });
    }

    // 4. Guardar candidatos en la base de datos
    let insertedCandidates: LolaCandidate[] = [];
    if (candidateInserts.length > 0) {
      const { data: saved, error: candError } = await supabase
        .from('lola_candidates')
        .insert(candidateInserts)
        .select();

      if (candError) {
        console.error('Error insertando candidatos:', candError);
        throw new Error(`Error guardando candidatos encontrados: ${candError.message}`);
      } else {
        insertedCandidates = (saved as LolaCandidate[]) || [];
      }
    }

    // 5. Actualizar sesión de búsqueda como COMPLETADA
    const duration_ms = Date.now() - startTime;
    const { data: updatedSearch } = await supabase
      .from('lola_searches')
      .update({
        status: 'COMPLETADO',
        total_found: filteredPlaces.length,
        with_website: withWebCount,
        without_website: withoutWebCount,
        investigated_count: filteredPlaces.length,
        source_used: sourceUsed,
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
        error_message: error?.message || 'Error durante la consulta a Google Places API',
      })
      .eq('id', searchSession.id);

    throw error;
  }
}

/**
 * Aprueba uno o varios candidatos de Lola y los incorpora a `businesses`.
 * Realiza deduplicación por dominio, email o nombre idéntico.
 */
export async function approveLolaCandidates(
  candidateIds: string[],
  userId?: string | null
): Promise<{
  approvedCount: number;
  duplicateCount: number;
  createdBusinesses: Business[];
}> {
  const supabase = createClient();

  // 1. Obtener los candidatos solicitados
  const { data: candidates, error: candError } = await supabase
    .from('lola_candidates')
    .select('*')
    .in('id', candidateIds);

  if (candError || !candidates || candidates.length === 0) {
    return { approvedCount: 0, duplicateCount: 0, createdBusinesses: [] };
  }

  // 2. Obtener negocios existentes para deduplicación
  const { data: existingBusinesses } = await supabase
    .from('businesses')
    .select('id, name, email, website');

  const existingDomains = new Set<string>();
  const existingEmails = new Set<string>();
  const existingNames = new Set<string>();

  existingBusinesses?.forEach((b) => {
    if (b.website) existingDomains.add(normalizeDomain(b.website));
    if (b.email) existingEmails.add(normalizeEmail(b.email));
    if (b.name) existingNames.add(b.name.trim().toLowerCase());
  });

  const createdBusinesses: Business[] = [];
  let duplicateCount = 0;

  for (const cand of candidates as LolaCandidate[]) {
    // Si ya fue aprobado, saltear
    if (cand.import_status === 'APROBADO' && cand.business_id) {
      continue;
    }

    const candDomain = normalizeDomain(cand.website);
    const candEmail = normalizeEmail(cand.email);
    const candName = cand.name.trim().toLowerCase();

    // Detección de duplicados
    const isDupDomain = candDomain && existingDomains.has(candDomain);
    const isDupEmail = candEmail && existingEmails.has(candEmail);
    const isDupName = existingNames.has(candName);

    if (isDupDomain || isDupEmail || isDupName) {
      duplicateCount++;
      continue;
    }

    // Insertar en businesses con atribución clara
    const { data: newBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert([
        {
          user_id: userId || null,
          name: cand.name,
          industry: cand.industry || null,
          city: cand.city || null,
          state_province: cand.state_province || null,
          country: cand.country || 'Argentina',
          website: cand.website || null,
          phone: cand.phone || null,
          email: cand.email || null,
          source: 'Google Places API (New)',
          status: 'NUEVO',
          notes: cand.notes ? `[Google Place ID: ${cand.place_id || 'N/A'}] ${cand.notes}` : `Prospectado por Lola con Google Places.`,
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
    if (candDomain) existingDomains.add(candDomain);
    if (candEmail) existingEmails.add(candEmail);
    existingNames.add(candName);

    // Registrar actividad en CRM con trazabilidad
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
        import_status: 'APROBADO',
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
 * Obtiene el historial de búsquedas de Lola.
 */
export async function getLolaSearchHistory(limit = 10): Promise<LolaSearch[]> {
  const supabase = createClient();
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
export async function getLolaCandidates(searchId: string): Promise<LolaCandidate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lola_candidates')
    .select('*')
    .eq('search_id', searchId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Lola candidates:', error);
    return [];
  }

  return (data as LolaCandidate[]) || [];
}
