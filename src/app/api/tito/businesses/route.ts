import { NextResponse } from 'next/server';
import { getTitoBusinesses } from '@/services/tito.service';
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

    const data = await getTitoBusinesses(supabase);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en /api/tito/businesses:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener negocios para Tito.' },
      { status: 500 }
    );
  }
}
