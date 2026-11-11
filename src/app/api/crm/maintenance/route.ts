import { NextResponse } from 'next/server';
import { saveMaintenanceSubscription, MaintenanceSubscription } from '@/services/crm.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para gestionar el mantenimiento.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessId, subscription } = body as {
      businessId: string;
      subscription: MaintenanceSubscription;
    };

    if (!businessId || !subscription || !subscription.status) {
      return NextResponse.json(
        { error: 'Parámetros inválidos. Se requiere businessId y la información de suscripción.' },
        { status: 400 }
      );
    }

    const result = await saveMaintenanceSubscription(businessId, subscription, supabase);

    return NextResponse.json({
      success: true,
      subscription: result,
    });
  } catch (error: any) {
    console.error('Error en POST /api/crm/maintenance:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al guardar suscripción de mantenimiento.' },
      { status: 500 }
    );
  }
}
