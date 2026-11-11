import { NextResponse } from 'next/server';
import { getBusinessStrategy } from '@/services/vera.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const businessId = params.id;
    const strategy = await getBusinessStrategy(businessId, supabase);

    if (!strategy) {
      return NextResponse.json(
        { error: 'Estrategia comercial no encontrada para este negocio.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error: any) {
    console.error('Error en /api/vera/strategy/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener estrategia de Vera.' },
      { status: 500 }
    );
  }
}
