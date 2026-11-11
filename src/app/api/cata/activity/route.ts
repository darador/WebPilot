import { NextResponse } from 'next/server';
import { recordCataActivity, OutreachChannel, ContactOutcome } from '@/services/cata.service';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { CRMStage } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no iniciada. Por favor iniciá sesión para registrar actividad con Cata.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      businessId,
      channel,
      outcome,
      summary,
      followUpDate,
      nextAction,
      newStage,
    } = body;

    if (!businessId || !channel || !outcome || !summary?.trim()) {
      return NextResponse.json(
        { error: 'Campos requeridos: businessId, channel, outcome y summary son obligatorios.' },
        { status: 400 }
      );
    }

    const result = await recordCataActivity(supabase, {
      businessId,
      channel: channel as OutreachChannel,
      outcome: outcome as ContactOutcome,
      summary: summary.trim(),
      followUpDate: followUpDate || null,
      nextAction: nextAction ? nextAction.trim() : null,
      newStage: newStage as CRMStage | undefined,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      activity: result.activity,
      updatedStage: result.updatedStage,
      message: 'Actividad registrada correctamente y estado comercial actualizado.',
    });
  } catch (error: any) {
    console.error('Error en /api/cata/activity:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al registrar actividad con Cata.' },
      { status: 500 }
    );
  }
}
