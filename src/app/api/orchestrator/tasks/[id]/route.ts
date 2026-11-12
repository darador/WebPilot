import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import {
  getOrchestratorTaskById,
  updateOrchestratorTask,
  executeOrchestratorTask,
  retryOrchestratorTask,
  cancelOrchestratorTask,
  handleHumanApproval,
} from '@/services/orchestrator.service';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const task = await getOrchestratorTaskById(params.id, supabase);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Error fetching orchestrator task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener la tarea' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada.' },
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
    const action = body.action as
      | 'EXECUTE'
      | 'RETRY'
      | 'CANCEL'
      | 'APPROVE'
      | 'REJECT'
      | undefined;

    let updatedTask;

    if (action === 'EXECUTE') {
      updatedTask = await executeOrchestratorTask(params.id, supabase);
    } else if (action === 'RETRY') {
      updatedTask = await retryOrchestratorTask(params.id, supabase);
    } else if (action === 'CANCEL') {
      updatedTask = await cancelOrchestratorTask(
        params.id,
        body.reason || 'Cancelada manualmente por el operador.',
        supabase
      );
    } else if (action === 'APPROVE') {
      const approver = user.email?.split('@')[0] || 'Daro / Julieta';
      updatedTask = await handleHumanApproval(
        params.id,
        true,
        approver,
        body.notes,
        supabase
      );
    } else if (action === 'REJECT') {
      const approver = user.email?.split('@')[0] || 'Daro / Julieta';
      updatedTask = await handleHumanApproval(
        params.id,
        false,
        approver,
        body.notes,
        supabase
      );
    } else {
      updatedTask = await updateOrchestratorTask(params.id, body, supabase);
    }

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error: any) {
    console.error('Error updating orchestrator task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada.' },
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

    const cancelled = await cancelOrchestratorTask(
      params.id,
      'Cancelada por el usuario desde la interfaz.',
      supabase
    );

    return NextResponse.json({ success: true, data: cancelled });
  } catch (error: any) {
    console.error('Error cancelling task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al cancelar tarea' },
      { status: 500 }
    );
  }
}
