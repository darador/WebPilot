import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getOrchestratorLogs, getOrchestratorCycles } from '@/services/orchestrator.service';
import { OrchestratorAgentName, OrchestratorEventStatus } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para consultar la bitácora.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get('cycle_id') || undefined;
    const agent = (searchParams.get('agent') as OrchestratorAgentName) || undefined;
    const status = (searchParams.get('status') as OrchestratorEventStatus) || undefined;
    const search = searchParams.get('search') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const [logsResult, cycles] = await Promise.all([
      getOrchestratorLogs(
        {
          cycle_id: cycleId,
          agent,
          status,
          search,
          date_from: dateFrom,
          date_to: dateTo,
          limit,
          offset,
        },
        supabase
      ),
      getOrchestratorCycles(30, supabase),
    ]);

    return NextResponse.json({
      success: true,
      logs: logsResult.logs,
      total: logsResult.total,
      cycles,
    });
  } catch (error: any) {
    console.error('Error en GET /api/orchestrator/logs:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener registros de la bitácora.' },
      { status: 500 }
    );
  }
}
