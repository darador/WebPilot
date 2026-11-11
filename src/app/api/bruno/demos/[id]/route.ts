import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoByIdOrSlug, updateDemoStatus, deleteDemo } from '@/services/bruno.service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const demo = await getDemoByIdOrSlug(params.id, supabase);

    if (!demo) {
      return NextResponse.json(
        { success: false, error: 'Demo no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: demo });
  } catch (error: any) {
    console.error('Error fetching demo:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener la demo' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'El campo status es requerido' },
        { status: 400 }
      );
    }

    const updated = await updateDemoStatus(
      params.id,
      body.status,
      body.feedbackNotes,
      supabase
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating demo status:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al actualizar estado de la demo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    await deleteDemo(params.id, supabase);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting demo:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al eliminar demo' },
      { status: 500 }
    );
  }
}
