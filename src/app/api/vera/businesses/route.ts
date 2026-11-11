import { NextResponse } from 'next/server';
import { getVeraBusinesses } from '@/services/vera.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para acceder a Vera.' },
        { status: 401 }
      );
    }

    const businesses = await getVeraBusinesses(supabase);

    return NextResponse.json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error: any) {
    console.error('Error en /api/vera/businesses:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener negocios para Vera.' },
      { status: 500 }
    );
  }
}
