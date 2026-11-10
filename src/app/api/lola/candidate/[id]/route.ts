import { NextResponse } from 'next/server';
import { updateCandidateManualData } from '@/services/lola.service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificación básica de sesión
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const candidateId = params.id;
    const body = await req.json();

    const updated = await updateCandidateManualData(candidateId, body);

    return NextResponse.json({ candidate: updated });
  } catch (error: any) {
    console.error('Error en /api/lola/candidate/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar los datos del candidato.' },
      { status: 500 }
    );
  }
}
