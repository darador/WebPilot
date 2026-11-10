import { NextResponse } from 'next/server';
import { runLolaProspecting, LolaSearchParams } from '@/services/lola.service';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, city, state_province, country, max_results, web_filter } = body;

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
      max_results: Number(max_results) || 10,
      web_filter: web_filter || 'ALL',
    };

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      userId = null;
    }

    const result = await runLolaProspecting(params, userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en /api/lola/search:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al procesar la prospección de Lola.' },
      { status: 500 }
    );
  }
}
