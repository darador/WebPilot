import { NextResponse } from 'next/server';
import { runLolaDiscovery, LolaSearchParams } from '@/services/lola.service';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
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

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      userId = null;
    }

    // Ejecuta Etapa 1: Descubrimiento con Google Places API (New) sin costo de Contact Data
    const result = await runLolaDiscovery(params, userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/lola/search (Etapa 1):', error);
    return NextResponse.json(
      { error: error?.message || 'Error al ejecutar descubrimiento con Google Places API.' },
      { status: 500 }
    );
  }
}
