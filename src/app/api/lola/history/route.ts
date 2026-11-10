import { NextResponse } from 'next/server';
import { getLolaSearchHistory } from '@/services/lola.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const history = await getLolaSearchHistory(limit);
    return NextResponse.json({ searches: history });
  } catch (error: any) {
    console.error('Error en /api/lola/history:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener historial de búsquedas.' },
      { status: 500 }
    );
  }
}
