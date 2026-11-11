import { NextResponse } from 'next/server';
import { investigateSelectedCandidates } from '@/services/lola.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Verificación básica de sesión (vía Bearer token o cookie)
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
        { error: 'Debes seleccionar al menos un candidato para investigar.' },
        { status: 400 }
      );
    }

    // Ejecuta Etapa 3: Place Details solo para los seleccionados + Auditoría Web
    const result = await investigateSelectedCandidates(candidateIds, supabase);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/lola/investigate (Etapa 3):', error);
    return NextResponse.json(
      { error: error?.message || 'Error al investigar los candidatos seleccionados.' },
      { status: 500 }
    );
  }
}
