import { NextResponse } from 'next/server';
import { approveLolaCandidates } from '@/services/lola.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. Verificación básica de sesión (vía Bearer token o cookie)
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Lola.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { candidateIds } = body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un candidato para incorporar.' },
        { status: 400 }
      );
    }

    const result = await approveLolaCandidates(candidateIds, user.id, supabase);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/lola/approve:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al incorporar candidatos al directorio.' },
      { status: 500 }
    );
  }
}
