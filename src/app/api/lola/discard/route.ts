import { NextResponse } from 'next/server';
import { discardLolaCandidates } from '@/services/lola.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Verificación básica de sesión
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Lola.' },
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
    const { candidateIds } = body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un candidato para descartar.' },
        { status: 400 }
      );
    }

    const discardedCount = await discardLolaCandidates(candidateIds, supabase);

    return NextResponse.json({ discardedCount });
  } catch (error: any) {
    console.error('Error en /api/lola/discard:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al descartar candidatos.' },
      { status: 500 }
    );
  }
}
