import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateReference, deleteReference } from '@/services/references.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
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
    const supabase = await createClient();
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
