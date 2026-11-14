import { NextRequest, NextResponse } from 'next/server';
import { approveNicoProspects } from '@/services/nico.service';
import { logOrchestratorEvent, createOrchestratorTask } from '@/services/orchestrator.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospectIds } = body;

    if (!Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes seleccionar al menos un prospecto para incorporar' },
        { status: 400 }
      );
    }

    const result = await approveNicoProspects(prospectIds);

    // Para cada negocio creado, encolar automáticamente la tarea correspondiente para Tito (si tiene web) o Vera (si no tiene web)
    for (const b of result.createdBusinesses) {
      const hasWeb = Boolean(b.website && b.website.trim().length > 3);
      if (hasWeb) {
        try {
          await createOrchestratorTask({
            agent: 'TITO',
            task_type: 'TITO_AUDIT',
            workflow_id: 'FLUJO_B',
            business_id: b.id,
            business_name: b.name,
            priority: 'MEDIA',
            payload: { businessId: b.id, url: b.website },
            dedup_key: `TITO_AUDIT:${b.id}`,
            requires_human_approval: false,
          });
        } catch (e) {
          console.warn('No se pudo encolar Tito para prospecto de Nico:', e);
        }
      } else {
        try {
          await createOrchestratorTask({
            agent: 'VERA',
            task_type: 'VERA_STRATEGY',
            workflow_id: 'FLUJO_B',
            business_id: b.id,
            business_name: b.name,
            priority: 'ALTA',
            payload: { businessId: b.id, industry: b.industry, city: b.city },
            dedup_key: `VERA_STRATEGY:${b.id}`,
            requires_human_approval: false,
          });
        } catch (e) {
          console.warn('No se pudo encolar Vera para prospecto de Nico:', e);
        }
      }
    }

    // Registrar en Bitácora de Patricia
    try {
      await logOrchestratorEvent({
        agent: 'NICO',
        action_type: 'NICO_APPROVE_CRM',
        description: `Incorporación al CRM: ${result.approvedCount} nuevos negocios creados, ${result.duplicateCount} duplicados detectados, ${result.enrichedCount} enriquecidos.`,
        status: 'COMPLETADO',
        result_data: {
          approvedCount: result.approvedCount,
          duplicateCount: result.duplicateCount,
          enrichedCount: result.enrichedCount,
        },
      });
    } catch (e) {
      console.warn('No se pudo registrar bitácora de aprobación Nico:', e);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Error en /api/nico/approve POST:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error al incorporar prospectos al CRM' },
      { status: 500 }
    );
  }
}
