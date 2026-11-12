import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { updateReference, deleteReference } from '@/services/references.service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updated = await updateReference(params.id, body, supabase);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating reference:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al actualizar referencia' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await deleteReference(params.id, supabase);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reference:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al eliminar referencia' },
      { status: 500 }
    );
  }
}
