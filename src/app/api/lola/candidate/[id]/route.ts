import { NextResponse } from 'next/server';
import { updateCandidateManualData } from '@/services/lola.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificación básica de sesión (vía Bearer token o cookie)
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Lola.' },
        { status: 401 }
      );
    }

    const candidateId = params.id;
    const body = await req.json();

    const updated = await updateCandidateManualData(candidateId, body, supabase);

    return NextResponse.json({ candidate: updated });
  } catch (error: any) {
    console.error('Error en /api/lola/candidate/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar los datos del candidato.' },
      { status: 500 }
    );
  }
}
