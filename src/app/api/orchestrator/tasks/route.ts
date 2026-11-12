import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import {
  getOrchestratorTasks,
  createOrchestratorTask,
  executeOrchestratorTask,
} from '@/services/orchestrator.service';
import {
  OrchestratorAgentName,
  OrchestratorPriority,
  OrchestratorTaskStatus,
  OrchestratorTaskType,
  OrchestratorWorkflowId,
} from '@/types/database.types';

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

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as OrchestratorTaskStatus) || undefined;
    const agent = (searchParams.get('agent') as OrchestratorAgentName) || undefined;
    const workflow_id = (searchParams.get('workflow_id') as OrchestratorWorkflowId) || undefined;
    const business_id = searchParams.get('business_id') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const tasks = await getOrchestratorTasks(
      {
        status,
        agent,
        workflow_id,
        limit,
      },
      supabase
    );

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error('Error fetching orchestrator tasks:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada. Acceso restringido al Orquestador.' },
        { status: 401 }
      );
    }

    if (isDemo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acción no permitida: Estás navegando con una cuenta de demostración en modo solo lectura.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.agent || !body.task_type) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios: agent y task_type son requeridos.' },
        { status: 400 }
      );
    }

    const { task, wasDuplicate } = await createOrchestratorTask(
      {
        agent: body.agent as OrchestratorAgentName,
        task_type: body.task_type as OrchestratorTaskType,
        business_id: body.business_id || undefined,
        priority: (body.priority as OrchestratorPriority) || 'NORMAL',
        workflow_id: (body.workflow_id as OrchestratorWorkflowId) || 'MANUAL',
        payload: body.payload || {},
      },
      supabase
    );

    // Si se solicitó ejecución inmediata
    if (body.auto_execute) {
      const executed = await executeOrchestratorTask(task.id, supabase);
      return NextResponse.json({ success: true, data: executed, executed: true, wasDuplicate });
    }

    return NextResponse.json({ success: true, data: task, wasDuplicate });
  } catch (error: any) {
    console.error('Error creating orchestrator task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al crear la tarea' },
      { status: 500 }
    );
  }
}
