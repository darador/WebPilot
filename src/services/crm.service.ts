import { createClient } from '@/lib/supabase/client';
import { Business, CRMStage, Activity, ActivityType } from '@/types/database.types';

export interface PipelineColumn {
  stage: CRMStage;
  businesses: Business[];
}

export async function getPipelineData(): Promise<Record<CRMStage, Business[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching pipeline data:', error);
    throw error;
  }

  const pipeline: Record<CRMStage, Business[]> = {
    NUEVO: [],
    AUDITADO: [],
    SELECCIONADO: [],
    CONTACTADO: [],
    RESPONDIÓ: [],
    NEGOCIACIÓN: [],
    GANADO: [],
    PERDIDO: [],
  };

  (data as Business[] | null)?.forEach((business) => {
    if (pipeline[business.status]) {
      pipeline[business.status].push(business);
    } else {
      pipeline.NUEVO.push(business);
    }
  });

  return pipeline;
}

export async function updateBusinessStage(
  businessId: string,
  newStage: CRMStage,
  oldStage?: CRMStage,
  userId?: string | null
): Promise<void> {
  const supabase = createClient();

  // Actualizar el negocio
  const { error } = await supabase
    .from('businesses')
    .update({
      status: newStage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId);

  if (error) {
    console.error('Error updating business stage:', error);
    throw error;
  }

  // Si no se ejecutó el trigger de PostgreSQL (por ejemplo RLS o cliente directo), registramos la actividad explícita de respaldo
  if (oldStage && oldStage !== newStage) {
    await supabase.from('activities').insert([
      {
        business_id: businessId,
        user_id: userId || null,
        type: 'CAMBIO_ESTADO',
        description: `Estado comercial cambiado de ${oldStage} a ${newStage}`,
        from_stage: oldStage,
        to_stage: newStage,
      },
    ]);
  }
}

export async function logActivity(
  businessId: string,
  type: ActivityType,
  description: string,
  userId?: string | null
): Promise<Activity> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('activities')
    .insert([
      {
        business_id: businessId,
        user_id: userId || null,
        type,
        description,
        from_stage: null,
        to_stage: null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error logging activity:', error);
    throw error;
  }

  // Refrescar updated_at en el negocio
  await supabase
    .from('businesses')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', businessId);

  return data as Activity;
}

export async function getBusinessActivities(businessId: string): Promise<Activity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return (data as Activity[]) || [];
}
