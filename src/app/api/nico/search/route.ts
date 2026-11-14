import { NextRequest, NextResponse } from 'next/server';
import { runNicoProspecting, getNicoSearches } from '@/services/nico.service';
import { logOrchestratorEvent } from '@/services/orchestrator.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { industry, city, max_results, sources } = body;

    if (!industry || !city) {
      return NextResponse.json(
        { success: false, error: 'Rubro y localidad son obligatorios' },
        { status: 400 }
      );
    }

    const { search, prospects } = await runNicoProspecting({
      industry,
      city,
      max_results: max_results ? parseInt(max_results, 10) : 20,
      sources,
    });

    // Registrar en la Bitácora de Patricia
    try {
      await logOrchestratorEvent({
        agent: 'NICO',
        action_type: 'NICO_SEARCH',
        description: `Búsqueda web en "${city}" (${industry}): ${prospects.length} comercios descubiertos (${search.new_prospects_count} nuevos, ${search.duplicate_count} duplicados).`,
        status: 'COMPLETADO',
        duration_ms: search.duration_ms,
        result_data: {
          totalFound: search.total_found,
          newCount: search.new_prospects_count,
          duplicateCount: search.duplicate_count,
          officialEmails: search.official_email_count,
          secondaryEmails: search.secondary_email_count,
        },
      });
    } catch (e) {
      console.warn('No se pudo registrar bitácora para búsqueda de Nico:', e);
    }

    return NextResponse.json({
      success: true,
      search,
      prospects,
    });
  } catch (err: any) {
    console.error('Error en /api/nico/search POST:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error al ejecutar búsqueda de Nico' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const searches = await getNicoSearches();
    return NextResponse.json({ success: true, searches });
  } catch (err: any) {
    console.error('Error en /api/nico/search GET:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
