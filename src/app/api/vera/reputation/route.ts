import { NextResponse } from 'next/server';
import { getReputationOverview, saveBusinessReviews, BusinessReview } from '@/services/reputation.service';
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

    const overview = await getReputationOverview(supabase);

    return NextResponse.json({
      success: true,
      count: overview.length,
      data: overview,
    });
  } catch (error: any) {
    console.error('Error en GET /api/vera/reputation:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener resumen de reputación.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessId, reviews } = body as {
      businessId: string;
      reviews: BusinessReview[];
    };

    if (!businessId) {
      return NextResponse.json(
        { error: 'ID de negocio requerido.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(reviews)) {
      return NextResponse.json(
        { error: 'Formato inválido de reseñas.' },
        { status: 400 }
      );
    }

    const result = await saveBusinessReviews(businessId, reviews, supabase);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error en POST /api/vera/reputation:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al guardar y analizar reseñas.' },
      { status: 500 }
    );
  }
}
