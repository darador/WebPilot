import { NextResponse } from 'next/server';
import { discardLolaCandidates } from '@/services/lola.service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Verificación básica de sesión
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { candidateIds } = body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un candidato para descartar.' },
        { status: 400 }
      );
    }

    const discardedCount = await discardLolaCandidates(candidateIds);

    return NextResponse.json({ discardedCount });
  } catch (error: any) {
    console.error('Error en /api/lola/discard:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al descartar candidatos.' },
      { status: 500 }
    );
  }
}
