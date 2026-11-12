import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { runOrchestratorCycle } from '@/services/orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Autorización: o bien usuario autenticado (Daro / Julieta) o bien CRON_SECRET de Vercel/Supabase
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.ORCHESTRATOR_CRON_SECRET;
    const isCronAuthorized =
      cronSecret && authHeader === `Bearer ${cronSecret}`;

    let clientToUse: any = null;

    if (!isCronAuthorized) {
      const { user, supabase, isDemo } = await getAuthenticatedUser(req);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'No autorizado. Se requiere sesión de operador o token CRON.',
          },
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
      clientToUse = supabase;
    }

    const summary = await runOrchestratorCycle(clientToUse);

    return NextResponse.json({
      success: true,
      message: 'Ciclo de orquestación ejecutado exitosamente.',
      data: summary,
    });
  } catch (error: any) {
    console.error('Error running orchestrator cycle:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al ejecutar ciclo del orquestador',
      },
      { status: 500 }
    );
  }
}
