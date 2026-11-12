import { NextResponse } from 'next/server';
import { markAsNoOpportunity } from '@/services/vera.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para actualizar el estado comercial.' },
        { status: 401 }
      );
    }

    if (isDemo) {
      return NextResponse.json(
        { error: 'Acción no permitida: Estás navegando con una cuenta de demostración en modo solo lectura.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { businessId, reason } = body as {
      businessId: string;
      reason?: string;
    };

    if (!businessId) {
      return NextResponse.json(
        { error: 'ID de negocio requerido.' },
        { status: 400 }
      );
    }

    await markAsNoOpportunity(
      businessId,
      reason || 'Presencia digital sólida y funcional. No requiere propuesta comercial activa.',
      supabase
    );

    return NextResponse.json({
      success: true,
      message: 'Negocio marcado como «Sin oportunidad comercial por ahora».',
    });
  } catch (error: any) {
    console.error('Error en POST /api/vera/dismiss:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar estado del negocio.' },
      { status: 500 }
    );
  }
}
