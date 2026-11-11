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

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      resolvedUserId = user?.id || null;
    } catch {
      resolvedUserId = null;
    }
  }

  const { data, error } = await supabase
    .from('activities')
    .insert([
      {
        business_id: businessId,
        user_id: resolvedUserId,
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

export type MaintenanceStatus = 'ACTIVO' | 'PAUSADO' | 'CANCELADO';

export interface MaintenanceSubscription {
  status: MaintenanceStatus;
  monthlyFeeARS: number;
  monthlyFeeUSD?: number;
  startDate: string;
  commitmentEndDate: string;
  commitmentMonths: number;
  notes?: string;
  updatedAt: string;
}

export async function saveMaintenanceSubscription(
  businessId: string,
  subscription: MaintenanceSubscription,
  client?: any
): Promise<MaintenanceSubscription> {
  const supabase = client || createClient();

  const { data: audits } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('audit_date', { ascending: false })
    .limit(1);

  const existingAudit = audits && audits.length > 0 ? audits[0] : null;

  if (existingAudit) {
    const prevInsights = (existingAudit.ai_insights as any) || {};
    const updatedInsights = {
      ...prevInsights,
      maintenance_subscription: subscription,
    };

    const { error: updateErr } = await supabase
      .from('audits')
      .update({
        ai_insights: updatedInsights,
      })
      .eq('id', existingAudit.id);

    if (updateErr) {
      console.error('Error updating maintenance subscription in audit:', updateErr);
      throw new Error('No se pudo guardar la suscripción de mantenimiento en la auditoría.');
    }
  } else {
    // Si no hay auditoría previa, creamos un registro de auditoría base para almacenar la suscripción
    const { error: insertErr } = await supabase
      .from('audits')
      .insert([
        {
          business_id: businessId,
          audit_date: new Date().toISOString(),
          performance_score: null,
          seo_score: null,
          mobile_score: null,
          security_score: null,
          load_time_ms: null,
          detected_technologies: [],
          ai_insights: {
            maintenance_subscription: subscription,
          },
        },
      ]);

    if (insertErr) {
      console.error('Error creating audit for maintenance subscription:', insertErr);
      throw new Error('No se pudo inicializar el registro de suscripción de mantenimiento.');
    }
  }

  // Refrescar updated_at en el negocio
  await supabase
    .from('businesses')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', businessId);

  return subscription;
}
