import { NextResponse } from 'next/server';
import { investigateSelectedCandidates } from '@/services/lola.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateIds } = body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un candidato para investigar.' },
        { status: 400 }
      );
    }

    // Ejecuta Etapa 3: Place Details solo para los seleccionados + Auditoría Web
    const result = await investigateSelectedCandidates(candidateIds);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/lola/investigate (Etapa 3):', error);
    return NextResponse.json(
      { error: error?.message || 'Error al investigar los candidatos seleccionados.' },
      { status: 500 }
    );
  }
}
