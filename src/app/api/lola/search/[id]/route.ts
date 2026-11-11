import { NextResponse } from 'next/server';
import { getLolaSearchWithCandidates } from '@/services/lola.service';
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

    const searchId = params.id;
    if (!searchId) {
      return NextResponse.json(
        { error: 'ID de búsqueda no provisto.' },
        { status: 400 }
      );
    }

    const result = await getLolaSearchWithCandidates(searchId, supabase);

    if (!result.search) {
      return NextResponse.json(
        { error: 'Búsqueda no encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en GET /api/lola/search/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al recuperar candidatos de la búsqueda.' },
      { status: 500 }
    );
  }
}
