import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getOrchestratorOverview } from '@/services/orchestrator.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada. Acceso restringido al Orquestador.' },
        { status: 401 }
      );
    }

    const overview = await getOrchestratorOverview(supabase);
    return NextResponse.json({ success: true, data: overview });
  } catch (error: any) {
    console.error('Error fetching orchestrator overview:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener resumen del orquestador' },
      { status: 500 }
    );
  }
}
