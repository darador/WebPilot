import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getReferences, createReference } from '@/services/references.service';
import { ReferenceStatus } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada. Por favor iniciá sesión.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const industry = searchParams.get('industry') || undefined;
    const status = (searchParams.get('status') as ReferenceStatus | 'TODOS') || undefined;
    const search = searchParams.get('search') || undefined;

    const references = await getReferences({ industry, status, search }, supabase);
    return NextResponse.json({ success: true, data: references });
  } catch (error: any) {
    console.error('Error fetching references:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener referencias' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, isDemo } = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesión no iniciada. Por favor iniciá sesión.' },
        { status: 401 }
      );
    }

    if (isDemo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acción no permitida: Estás navegando con una cuenta de demostración en modo solo lectura.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.name || !body.industry || !body.website_url) {
      return NextResponse.json(
        { success: false, error: 'Nombre, rubro y URL del sitio web son obligatorios.' },
        { status: 400 }
      );
    }

    const newReference = await createReference(body, supabase);
    return NextResponse.json({ success: true, data: newReference });
  } catch (error: any) {
    console.error('Error creating reference:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al guardar referencia' },
      { status: 500 }
    );
  }
}
