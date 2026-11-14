import { NextRequest, NextResponse } from 'next/server';
import { getNicoProspects } from '@/services/nico.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchId = req.nextUrl.searchParams.get('searchId') || undefined;
    const prospects = await getNicoProspects(searchId);

    return NextResponse.json({
      success: true,
      prospects,
    });
  } catch (err: any) {
    console.error('Error en /api/nico/prospects GET:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error al obtener prospectos' },
      { status: 500 }
    );
  }
}
