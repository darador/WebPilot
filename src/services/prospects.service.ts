import { createClient } from '@/lib/supabase/client';
import { Business, Contact, Activity, CRMStage } from '@/types/database.types';
import { ProspectFormValues } from '@/schemas/prospect';

export interface GetProspectsParams {
  search?: string;
  industry?: string;
  city?: string;
  status?: string;
  sortBy?: 'created_at' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface GetProspectsResult {
  data: Business[];
  count: number;
  totalPages: number;
  currentPage: number;
}

export async function getProspects({
  search = '',
  industry = '',
  city = '',
  status = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  pageSize = 15,
}: GetProspectsParams = {}): Promise<GetProspectsResult> {
  const supabase = createClient();

  let query = supabase.from('businesses').select('*', { count: 'exact' });

  // Búsqueda textual
  if (search.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(
      `name.ilike.${s},email.ilike.${s},website.ilike.${s},phone.ilike.${s},city.ilike.${s}`
    );
  }

  // Filtros
  if (industry) {
    query = query.eq('industry', industry);
  }
  if (city) {
    query = query.eq('city', city);
  }
  if (status) {
    query = query.eq('status', status as CRMStage);
  }

  // Orden
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching prospects:', error);
    throw error;
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: (data as Business[]) || [],
    count: totalCount,
    totalPages: totalPages > 0 ? totalPages : 1,
    currentPage: page,
  };
}

export interface ProspectDetail extends Business {
  contacts: Contact[];
  activities: Activity[];
}

export async function getProspectById(id: string): Promise<ProspectDetail | null> {
  const supabase = createClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !business) {
    console.error('Error fetching prospect by ID:', error);
    return null;
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('business_id', id)
    .order('is_primary', { ascending: false });

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('business_id', id)
    .order('created_at', { ascending: false });

  return {
    ...(business as Business),
    contacts: (contacts as Contact[]) || [],
    activities: (activities as Activity[]) || [],
  };
}

export async function createProspect(
  values: ProspectFormValues,
  userId?: string | null
): Promise<Business> {
  const supabase = createClient();

  const payload: Partial<Business> = {
    name: values.name.trim(),
    industry: values.industry?.trim() || null,
    city: values.city?.trim() || null,
    state_province: values.state_province?.trim() || null,
    country: values.country?.trim() || 'Argentina',
    website: values.website?.trim() || null,
    phone: values.phone?.trim() || null,
    email: values.email?.trim() || null,
    source: values.source || 'Manual',
    status: values.status || 'NUEVO',
    notes: values.notes?.trim() || null,
    user_id: userId || null,
  };

  const { data, error } = await supabase
    .from('businesses')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating prospect:', error);
    throw error;
  }

  // Registrar actividad inicial
  await supabase.from('activities').insert([
    {
      business_id: data.id,
      user_id: userId || null,
      type: 'NOTA',
      description: 'Prospecto dado de alta en la plataforma',
      from_stage: null,
      to_stage: data.status,
    },
  ]);

  return data as Business;
}

export async function updateProspect(
  id: string,
  values: Partial<ProspectFormValues>
): Promise<Business> {
  const supabase = createClient();

  const payload: Partial<Business> = {
    ...values,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prospect:', error);
    throw error;
  }

  return data as Business;
}

export async function deleteProspect(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from('businesses').delete().eq('id', id);

  if (error) {
    console.error('Error deleting prospect:', error);
    throw error;
  }

  return true;
}

export async function getDistinctFilters(): Promise<{ industries: string[]; cities: string[] }> {
  const supabase = createClient();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('industry, city');

  const industriesSet = new Set<string>();
  const citiesSet = new Set<string>();

  businesses?.forEach((b) => {
    if (b.industry?.trim()) industriesSet.add(b.industry.trim());
    if (b.city?.trim()) citiesSet.add(b.city.trim());
  });

  return {
    industries: Array.from(industriesSet).sort(),
    cities: Array.from(citiesSet).sort(),
  };
}
