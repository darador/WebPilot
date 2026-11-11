import { NextResponse } from 'next/server';
import { getLolaSearchHistory } from '@/services/lola.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const history = await getLolaSearchHistory(limit, supabase);
    return NextResponse.json({ searches: history });
  } catch (error: any) {
    console.error('Error en /api/lola/history:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener historial de búsquedas.' },
      { status: 500 }
    );
  }
}
