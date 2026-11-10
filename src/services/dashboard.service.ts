import { createClient } from '@/lib/supabase/client';
import { DashboardMetrics, Activity, Business } from '@/types/database.types';

export interface RecentActivityWithBusiness extends Activity {
  business?: {
    id: string;
    name: string;
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();

  try {
    // 1. Total prospectos
    const { count: totalProspects, error: errTotal } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    if (errTotal) {
      console.warn('Error fetching total prospects:', errTotal.message);
    }

    // 2. Prospectos nuevos
    const { count: newProspects } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'NUEVO');

    // 3. Negocios auditados
    const { count: auditedBusinesses } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true });

    // 4. Oportunidades calificadas
    const { count: qualifiedOpportunities } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true });

    // 5. Clientes ganados
    const { count: wonClients } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'GANADO');

    // 6. Facturación acumulada (suma real de ventas)
    const { data: salesData } = await supabase
      .from('sales')
      .select('final_amount');

    const totalRevenue = salesData?.reduce(
      (acc, curr) => acc + (Number(curr.final_amount) || 0),
      0
    ) || 0;

    return {
      totalProspects: totalProspects ?? 0,
      newProspects: newProspects ?? 0,
      auditedBusinesses: auditedBusinesses ?? 0,
      qualifiedOpportunities: qualifiedOpportunities ?? 0,
      wonClients: wonClients ?? 0,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    return {
      totalProspects: 0,
      newProspects: 0,
      auditedBusinesses: 0,
      qualifiedOpportunities: 0,
      wonClients: 0,
      totalRevenue: 0,
    };
  }
}

export async function getRecentActivities(limit: number = 8): Promise<RecentActivityWithBusiness[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        business:businesses (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching recent activities:', error.message);
      return [];
    }

    return (data as unknown as RecentActivityWithBusiness[]) || [];
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    return [];
  }
}
