import { NextResponse } from 'next/server';
import { generateCataMessages } from '@/services/cata.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { Business, Audit } from '@/types/database.types';
import { VeraCommercialStrategy } from '@/services/vera.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para acceder a Cata.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Parámetro businessId es requerido.' },
        { status: 400 }
      );
    }

    // Obtener negocio
    const { data: business, error: bErr } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (bErr || !business) {
      return NextResponse.json(
        { error: 'Negocio no encontrado.' },
        { status: 404 }
      );
    }

    // Obtener auditoría y estrategia de Vera
    const { data: audits } = await supabase
      .from('audits')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latestAudit = audits?.[0] as Audit | undefined;
    const veraStrategy = (latestAudit?.ai_insights?.vera_strategy as VeraCommercialStrategy) || null;

    const messages = generateCataMessages(
      business as Business,
      veraStrategy,
      latestAudit || null
    );

    return NextResponse.json({
      success: true,
      business,
      veraStrategy,
      messages,
    });
  } catch (error: any) {
    console.error('Error en /api/cata/messages:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al preparar mensajes de Cata.' },
      { status: 500 }
    );
  }
}
