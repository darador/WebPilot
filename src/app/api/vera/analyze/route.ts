import { NextResponse } from 'next/server';
import { analyzeBusiness } from '@/services/vera.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { ServiceItem } from '@/lib/constants/services';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para operar a Vera.' },
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
    const { businessIds, customCatalog } = body as {
      businessIds: string[];
      customCatalog?: ServiceItem[];
    };

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un negocio para analizar con Vera.' },
        { status: 400 }
      );
    }

    const strategies = [];
    const errors = [];

    for (const bId of businessIds) {
      try {
        const strategy = await analyzeBusiness(bId, customCatalog, supabase);
        strategies.push(strategy);
      } catch (err: any) {
        console.error(`Error analizando negocio ${bId} con Vera:`, err);
        errors.push({ businessId: bId, error: err?.message || 'Error desconocido' });
      }
    }

    return NextResponse.json({
      success: true,
      analyzedCount: strategies.length,
      strategies,
      errors,
    });
  } catch (error: any) {
    console.error('Error en /api/vera/analyze:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al ejecutar análisis comercial con Vera.' },
      { status: 500 }
    );
  }
}
