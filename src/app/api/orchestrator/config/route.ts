import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import {
  getOrchestratorConfig,
  updateOrchestratorConfig,
  toggleOrchestratorPause,
  toggleOrchestratorFlow,
} from '@/services/orchestrator.service';
import { OrchestratorWorkflowId } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const config = await getOrchestratorConfig(supabase);
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error fetching orchestrator config:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    let updatedConfig;

    if (typeof body.is_paused === 'boolean') {
      updatedConfig = await toggleOrchestratorPause(body.is_paused, supabase);
    } else if (body.toggle_flow && typeof body.flow_enabled === 'boolean') {
      updatedConfig = await toggleOrchestratorFlow(
        body.toggle_flow as OrchestratorWorkflowId,
        body.flow_enabled,
        supabase
      );
    } else {
      updatedConfig = await updateOrchestratorConfig(body, supabase);
    }

    return NextResponse.json({ success: true, data: updatedConfig });
  } catch (error: any) {
    console.error('Error updating orchestrator config:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
