import { NextResponse } from 'next/server';
import { auditBusiness } from '@/services/tito.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Tito.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessIds } = body;

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un negocio para auditar.' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const bId of businessIds) {
      try {
        const res = await auditBusiness(bId, supabase);
        results.push(res);
      } catch (err: any) {
        console.error(`Error auditando negocio ${bId}:`, err);
        errors.push({ businessId: bId, error: err?.message || 'Error desconocido' });
      }
    }

    return NextResponse.json({
      success: true,
      auditedCount: results.length,
      results,
      errors,
    });
  } catch (error: any) {
    console.error('Error en /api/tito/audit:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al ejecutar auditoría con Tito.' },
      { status: 500 }
    );
  }
}
