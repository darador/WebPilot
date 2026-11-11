import { NextResponse } from 'next/server';
import { getBusinessAuditDetail } from '@/services/tito.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada.' },
        { status: 401 }
      );
    }

    const businessId = params.id;
    if (!businessId) {
      return NextResponse.json(
        { error: 'ID de negocio no provisto.' },
        { status: 400 }
      );
    }

    const data = await getBusinessAuditDetail(businessId, supabase);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en /api/tito/audit/[id]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener informe de auditoría.' },
      { status: 500 }
    );
  }
}
