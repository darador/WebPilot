import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Normaliza una URL o dominio para comparaciones de duplicados.
 * Elimina https://, http://, www., paths y query params, y pasa a minúsculas.
 */
export function normalizeDomain(url: string | null | undefined): string {
  if (!url) return '';
  let clean = url.trim().toLowerCase();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  clean = clean.split('/')[0];
  clean = clean.split('?')[0];
  clean = clean.split('#')[0];
  return clean.trim();
}

/**
 * Normaliza un email para comparaciones de duplicados.
 */
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Construye la URL oficial de Google Maps para un negocio.
 * Si tiene Google Place ID: query=NOMBRE_DEL_NEGOCIO&query_place_id=GOOGLE_PLACE_ID
 * Si no tiene: realiza búsqueda por nombre y dirección/localidad.
 */
export function buildGoogleMapsUrl(prospect: {
  name: string;
  google_place_id?: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  state_province?: string | null;
  country?: string | null;
}): string {
  const baseUrl = 'https://www.google.com/maps/search/?api=1';

  let placeId = prospect.google_place_id?.trim() || null;
  if (!placeId && prospect.notes) {
    const match = prospect.notes.match(/\[Google Places\]:\s*ID\s+([A-Za-z0-9_\-]+)/);
    if (match && match[1]) {
      placeId = match[1].trim();
    }
  }

  if (placeId) {
    const query = encodeURIComponent(prospect.name.trim());
    const qPlaceId = encodeURIComponent(placeId);
    return `${baseUrl}&query=${query}&query_place_id=${qPlaceId}`;
  }

  const queryParts = [
    prospect.name,
    prospect.address,
    prospect.city,
    prospect.state_province,
    prospect.country || 'Argentina',
  ]
    .map((p) => p?.trim())
    .filter(Boolean);

  return `${baseUrl}&query=${encodeURIComponent(queryParts.join(', '))}`;
}
