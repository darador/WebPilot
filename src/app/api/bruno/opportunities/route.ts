import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getEligibleBusinessesForDemo } from '@/services/bruno.service';

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

    const list = await getEligibleBusinessesForDemo(supabase);
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error('Error fetching eligible businesses for Bruno demo:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener negocios elegibles' },
      { status: 500 }
    );
  }
}
