import { NextResponse } from 'next/server';
import { getCataOpportunities } from '@/services/cata.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para acceder a Cata.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const city = searchParams.get('city') || undefined;
    const industry = searchParams.get('industry') || undefined;
    const followUpFilter = searchParams.get('followUpFilter') || undefined;
    const search = searchParams.get('search') || undefined;

    const { opportunities, metrics } = await getCataOpportunities(supabase, {
      status,
      city,
      industry,
      followUpFilter,
      search,
    });

    return NextResponse.json({
      success: true,
      metrics,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error: any) {
    console.error('Error en /api/cata/opportunities:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener oportunidades para Cata.' },
      { status: 500 }
    );
  }
}
