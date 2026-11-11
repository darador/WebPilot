import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientDemos, generateDemoForBusiness } from '@/services/bruno.service';
import { DemoStatus } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get('status') as DemoStatus | 'TODOS') || undefined;
    const search = searchParams.get('search') || undefined;

    const demos = await getClientDemos({ status, search }, supabase);
    return NextResponse.json({ success: true, data: demos });
  } catch (error: any) {
    console.error('Error fetching demos:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener demos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    if (!body.businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId es requerido para generar la demo.' },
        { status: 400 }
      );
    }

    const demo = await generateDemoForBusiness(
      body.businessId,
      {
        productType: body.productType,
        customTitle: body.customTitle,
        preferredReferenceId: body.preferredReferenceId,
      },
      supabase
    );

    return NextResponse.json({ success: true, data: demo });
  } catch (error: any) {
    console.error('Error generating demo:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al generar la demo de Bruno' },
      { status: 500 }
    );
  }
}
