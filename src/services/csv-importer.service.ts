import Papa from 'papaparse';
import { createClient } from '@/lib/supabase/client';
import { normalizeDomain, normalizeEmail } from '@/lib/utils';
import { CsvRowData, ParsedCsvResult } from '@/schemas/csv-import';
import { CRMStage } from '@/types/database.types';

// Mapeos conocidos de cabeceras en español e inglés
const HEADER_SYNONYMS: Record<keyof CsvRowData, string[]> = {
  name: ['nombre', 'name', 'negocio', 'empresa', 'compañia', 'compania', 'business', 'business_name'],
  industry: ['rubro', 'industria', 'sector', 'categoria', 'industry', 'category'],
  city: ['localidad', 'ciudad', 'city', 'municipio'],
  state_province: ['provincia', 'estado', 'region', 'state', 'province'],
  country: ['pais', 'country'],
  website: ['sitio web', 'sitio_web', 'sitioweb', 'web', 'website', 'url', 'pagina_web'],
  phone: ['telefono', 'teléfono', 'phone', 'celular', 'whatsapp', 'tel'],
  email: ['email', 'correo', 'mail', 'correo_electronico', 'e-mail'],
  source: ['fuente', 'origen', 'source'],
  status: ['estado', 'estado_comercial', 'status', 'etapa'],
  notes: ['observaciones', 'notas', 'comentarios', 'notes', 'description'],
};

export function autoDetectColumnMapping(headers: string[]): Record<keyof CsvRowData, string> {
  const mapping: Partial<Record<keyof CsvRowData, string>> = {};

  (Object.keys(HEADER_SYNONYMS) as (keyof CsvRowData)[]).forEach((targetKey) => {
    const synonyms = HEADER_SYNONYMS[targetKey];
    const match = headers.find((h) => {
      const cleanHeader = h.trim().toLowerCase().replace(/[\s_-]+/g, '');
      return synonyms.some((syn) => syn.replace(/[\s_-]+/g, '') === cleanHeader);
    });
    if (match) {
      mapping[targetKey] = match;
    }
  });

  return mapping as Record<keyof CsvRowData, string>;
}

export async function parseAndValidateCsv(
  file: File,
  customMapping?: Partial<Record<keyof CsvRowData, string>>
): Promise<ParsedCsvResult> {
  const supabase = createClient();

  // 1. Obtener prospectos existentes en la base de datos para detección de duplicados
  const { data: existingBusinesses } = await supabase
    .from('businesses')
    .select('email, website, name');

  const existingEmails = new Set<string>();
  const existingDomains = new Set<string>();

  existingBusinesses?.forEach((b) => {
    if (b.email) existingEmails.add(normalizeEmail(b.email));
    if (b.website) existingDomains.add(normalizeDomain(b.website));
  });

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const mapping = customMapping || autoDetectColumnMapping(headers);

        const validRows: CsvRowData[] = [];
        const invalidRows: ParsedCsvResult['invalidRows'] = [];
        const duplicateRows: ParsedCsvResult['duplicateRows'] = [];

        // Sets locales para evitar duplicados en el mismo archivo CSV
        const seenEmailsInCsv = new Set<string>();
        const seenDomainsInCsv = new Set<string>();

        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +1 por 1-indexado, +1 por cabecera
          const errors: string[] = [];

          const getValue = (key: keyof CsvRowData): string => {
            const mappedHeader = mapping[key];
            if (mappedHeader && row[mappedHeader] !== undefined) {
              return String(row[mappedHeader]).trim();
            }
            return '';
          };

          const name = getValue('name');
          const email = getValue('email');
          const website = getValue('website');
          const industry = getValue('industry');
          const city = getValue('city');
          const state_province = getValue('state_province');
          const country = getValue('country') || 'Argentina';
          const phone = getValue('phone');
          const source = getValue('source') || 'CSV Import';
          let status = getValue('status')?.toUpperCase() as CRMStage;
          const notes = getValue('notes');

          if (!name) {
            errors.push('El nombre del negocio es obligatorio');
          }

          const validStages: CRMStage[] = [
            'NUEVO',
            'AUDITADO',
            'SELECCIONADO',
            'CONTACTADO',
            'RESPONDIÓ',
            'NEGOCIACIÓN',
            'GANADO',
            'PERDIDO',
          ];
          if (status && !validStages.includes(status)) {
            status = 'NUEVO';
          }

          if (errors.length > 0) {
            invalidRows.push({
              row: rowNumber,
              data: row,
              errors,
            });
            return;
          }

          const cleanRow: CsvRowData = {
            name,
            industry,
            city,
            state_province,
            country,
            website,
            phone,
            email,
            source,
            status: status || 'NUEVO',
            notes,
          };

          // Comprobación de duplicados por email
          const normEmail = normalizeEmail(email);
          if (normEmail) {
            if (existingEmails.has(normEmail)) {
              duplicateRows.push({
                row: rowNumber,
                data: cleanRow,
                duplicateReason: `Email existente en base de datos: ${email}`,
              });
              return;
            }
            if (seenEmailsInCsv.has(normEmail)) {
              duplicateRows.push({
                row: rowNumber,
                data: cleanRow,
                duplicateReason: `Email duplicado dentro del archivo CSV: ${email}`,
              });
              return;
            }
            seenEmailsInCsv.add(normEmail);
          }

          // Comprobación de duplicados por dominio web
          const normDomain = normalizeDomain(website);
          if (normDomain) {
            if (existingDomains.has(normDomain)) {
              duplicateRows.push({
                row: rowNumber,
                data: cleanRow,
                duplicateReason: `Dominio web existente en base de datos: ${normDomain}`,
              });
              return;
            }
            if (seenDomainsInCsv.has(normDomain)) {
              duplicateRows.push({
                row: rowNumber,
                data: cleanRow,
                duplicateReason: `Dominio web repetido dentro del archivo CSV: ${normDomain}`,
              });
              return;
            }
            seenDomainsInCsv.add(normDomain);
          }

          validRows.push(cleanRow);
        });

        resolve({
          validRows,
          invalidRows,
          duplicateRows,
          totalRows: results.data.length,
        });
      },
      error: (err) => {
        reject(new Error(`Error al procesar el archivo CSV: ${err.message}`));
      },
    });
  });
}

export async function importValidRows(
  rows: CsvRowData[],
  userId?: string | null
): Promise<{ insertedCount: number }> {
  if (rows.length === 0) return { insertedCount: 0 };

  const supabase = createClient();

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      resolvedUserId = user?.id || null;
    } catch {
      resolvedUserId = null;
    }
  }

  const recordsToInsert = rows.map((r) => ({
    name: r.name,
    industry: r.industry || null,
    city: r.city || null,
    state_province: r.state_province || null,
    country: r.country || 'Argentina',
    website: r.website || null,
    phone: r.phone || null,
    email: r.email || null,
    source: r.source || 'CSV Import',
    status: r.status || 'NUEVO',
    notes: r.notes || null,
    user_id: resolvedUserId,
  }));

  const { data, error } = await supabase
    .from('businesses')
    .insert(recordsToInsert)
    .select('id, name');

  if (error) {
    console.error('Error batch inserting businesses:', error);
    throw error;
  }

  // Registrar actividades de importación en lote
  if (data && data.length > 0) {
    const activitiesToInsert = data.map((b) => ({
      business_id: b.id,
      user_id: resolvedUserId,
      type: 'IMPORTACION' as const,
      description: `Prospecto importado mediante carga masiva CSV (${rows.length} registros)`,
      from_stage: null,
      to_stage: 'NUEVO' as const,
    }));

    await supabase.from('activities').insert(activitiesToInsert);
  }

  return { insertedCount: data?.length || 0 };
}

export function generateSampleCsv(): string {
  const headers = [
    'Nombre',
    'Rubro',
    'Localidad',
    'Provincia',
    'Pais',
    'Sitio Web',
    'Telefono',
    'Email',
    'Fuente',
    'Estado Comercial',
    'Observaciones',
  ];

  const sampleRows = [
    [
      'Clínica Odontológica DentalPlus',
      'Salud y Estética',
      'Rosario',
      'Santa Fe',
      'Argentina',
      'https://dentalplus-demo.com.ar',
      '+54 341 555-0192',
      'contacto@dentalplus-demo.com.ar',
      'Google Maps',
      'NUEVO',
      'Web antigua no responsive, gran potencial para rediseño',
    ],
    [
      'Estudio Contable Bianchi & Asoc.',
      'Finanzas y Legales',
      'Córdoba',
      'Córdoba',
      'Argentina',
      'https://estudiobianchi-demo.com',
      '+54 351 444-8899',
      'info@estudiobianchi-demo.com',
      'LinkedIn',
      'SELECCIONADO',
      'Interesados en automatizar captura de leads',
    ],
    [
      'Muebles & Diseño Vanguardia',
      'Hogar y Decoración',
      'Palermo, CABA',
      'Buenos Aires',
      'Argentina',
      'https://vanguardiamuebles-demo.ar',
      '+54 11 4876-1234',
      'ventas@vanguardiamuebles-demo.ar',
      'Instagram',
      'NUEVO',
      'E-commerce lento, sin catálogo optimizado para mobile',
    ],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((r) => r.map((field) => `"${field}"`).join(',')),
  ].join('\n');

  return csvContent;
}
