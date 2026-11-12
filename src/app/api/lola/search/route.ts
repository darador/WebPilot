import { NextResponse } from 'next/server';
import {
  runLolaDiscovery,
  getLolaSearchWithCandidates,
  LolaSearchParams,
} from '@/services/lola.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Lola.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get('id');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Falta el parámetro id de búsqueda.' },
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
    console.error('Error en GET /api/lola/search:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al recuperar candidatos de la búsqueda.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verificación básica de sesión para Daro y Julieta (vía Bearer token o cookie)
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Lola.' },
        { status: 401 }
      );
    }

    if (isDemo) {
      return NextResponse.json(
        { error: 'Acción no permitida: Estás navegando con una cuenta de demostración en modo solo lectura.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { industry, city, state_province, country, max_results } = body;

    if (!industry || !industry.trim() || !city || !city.trim()) {
      return NextResponse.json(
        { error: 'El rubro y la localidad son obligatorios para que Lola pueda buscar.' },
        { status: 400 }
      );
    }

    const params: LolaSearchParams = {
      industry: industry.trim(),
      city: city.trim(),
      state_province: state_province?.trim() || 'Buenos Aires',
      country: country?.trim() || 'Argentina',
      max_results: Math.min(Math.max(Number(max_results) || 20, 1), 20),
    };

    // Ejecuta Etapa 1: Descubrimiento con Google Places API (New) sin costo de Contact Data
    const result = await runLolaDiscovery(params, user.id, supabase);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/lola/search (Etapa 1):', error);
    return NextResponse.json(
      { error: error?.message || 'Error al ejecutar descubrimiento con Google Places API.' },
      { status: 500 }
    );
  }
}
