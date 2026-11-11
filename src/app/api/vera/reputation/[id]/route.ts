import { NextResponse } from 'next/server';
import { getBusinessReputation } from '@/services/reputation.service';
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

    const businessId = params.id;
    const data = await getBusinessReputation(businessId, supabase);

    return NextResponse.json({
      success: true,
      data: data || { reviews: [], analysis: null },
    });
  } catch (error: any) {
    console.error('Error en GET /api/vera/reputation/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener reputación del negocio.' },
      { status: 500 }
    );
  }
}
