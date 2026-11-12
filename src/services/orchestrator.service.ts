import { createClient } from '@/lib/supabase/client';
import {
  OrchestratorTask,
  OrchestratorTaskStatus,
  OrchestratorAgentName,
  OrchestratorTaskType,
  OrchestratorWorkflowId,
  OrchestratorPriority,
  OrchestratorConfig,
  OrchestratorLimits,
  OrchestratorCycleSummary,
  Business,
} from '@/types/database.types';
import { runLolaDiscovery } from '@/services/lola.service';
import { auditBusiness } from '@/services/tito.service';
import { analyzeBusiness } from '@/services/vera.service';
import { generateDemoForBusiness, getClientDemos } from '@/services/bruno.service';
import { getCataOpportunities, generateCataMessages } from '@/services/cata.service';

// Configuración inicial por defecto
export const DEFAULT_ORCHESTRATOR_LIMITS: OrchestratorLimits = {
  max_lola_searches_per_cycle: 2,
  max_new_candidates_per_cycle: 20,
  max_tito_audits_per_cycle: 10,
  max_bruno_demos_per_cycle: 3,
  max_retries: 2,
};

export const DEFAULT_ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  id: 'default',
  is_paused: false,
  active_flows: {
    flujoA: true,
    flujoB: true,
    flujoC: true,
    flujoD: true,
  },
  limits: DEFAULT_ORCHESTRATOR_LIMITS,
  last_run_at: null,
  last_run_summary: null,
  updated_at: new Date().toISOString(),
};

// Memoria local de respaldo (fallback si las tablas aún no existen en Supabase remoto)
const LOCAL_TASKS_CACHE: OrchestratorTask[] = [];
let LOCAL_CONFIG_CACHE: OrchestratorConfig = { ...DEFAULT_ORCHESTRATOR_CONFIG };

// Semillas de tareas iniciales demostrativas para primera carga si la tabla está vacía
const INITIAL_DEMO_TASKS: OrchestratorTask[] = [
  {
    id: 'task-init-01',
    agent: 'LOLA',
    task_type: 'LOLA_DISCOVERY',
    workflow_id: 'FLUJO_A',
    business_name: 'Búsqueda Quilmes • Odontología',
    status: 'COMPLETADA',
    priority: 'MEDIA',
    payload: { city: 'Quilmes', industry: 'Odontología', maxResults: 15 },
    result: { candidatesFound: 12, searchId: 'lola-search-init' },
    retry_count: 0,
    max_retries: 2,
    next_action: '12 candidatos disponibles en Lola para investigación y selección.',
    requires_human_approval: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    started_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    created_by: 'ORCHESTRATOR',
  },
  {
    id: 'task-init-02',
    agent: 'TITO',
    task_type: 'TITO_AUDIT',
    workflow_id: 'FLUJO_B',
    business_name: 'Consultorio Odontológico Dra. Batalles',
    status: 'COMPLETADA',
    priority: 'MEDIA',
    payload: { url: 'https://draanalaurabatalles.com.ar/' },
    result: { score: 92, issuesCount: 1, conclusion: 'Sitio sólido con buena presencia' },
    retry_count: 0,
    max_retries: 2,
    next_action: 'Auditoría completada. Transferido a Vera para evaluación comercial.',
    requires_human_approval: false,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    started_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 2.9).toISOString(),
    created_by: 'ORCHESTRATOR',
  },
  {
    id: 'task-init-03',
    agent: 'VERA',
    task_type: 'VERA_STRATEGY',
    workflow_id: 'FLUJO_B',
    business_name: 'Centro Di Paolo Dra. Natalia Di Paolo',
    status: 'COMPLETADA',
    priority: 'ALTA',
    payload: { industry: 'Odontología', city: 'Quilmes' },
    result: {
      resultType: 'OPORTUNIDAD_CLARA',
      recommendedService: 'Landing Express Odontológica',
      justification: 'Sin sitio web funcional propio. Excelente reputación local.',
    },
    retry_count: 0,
    max_retries: 2,
    next_action: 'Oportunidad confirmada. Preparada tarea para que Bruno desarrolle la demo.',
    requires_human_approval: false,
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    started_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 2.4).toISOString(),
    created_by: 'ORCHESTRATOR',
  },
  {
    id: 'task-init-04',
    agent: 'BRUNO',
    task_type: 'BRUNO_DEMO',
    workflow_id: 'FLUJO_C',
    business_name: 'Centro Di Paolo Dra. Natalia Di Paolo',
    status: 'ESPERANDO_APROBACION',
    priority: 'ALTA',
    payload: { productType: 'landing-express' },
    result: {
      demoId: 'demo-centro-di-paolo',
      slug: 'centro-di-paolo-dra-natalia-di-paolo-240287',
      template: 'DentalMasterTemplate',
    },
    retry_count: 0,
    max_retries: 2,
    next_action: 'Propuesta conceptual generada. Requiere Autorización de CEO.',
    requires_human_approval: true,
    approval_status: 'PENDIENTE',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    started_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    created_by: 'ORCHESTRATOR',
  },
];

// Inicializar memoria local con las semillas
LOCAL_TASKS_CACHE.push(...INITIAL_DEMO_TASKS);

// ==============================================================================
// 1. CONFIGURACIÓN Y ESTADO GENERAL
// ==============================================================================

/**
 * Obtiene la configuración actual del Orquestador
 */
export async function getOrchestratorConfig(client?: any): Promise<OrchestratorConfig> {
  const supabase = client || createClient();

  try {
    const { data, error } = await supabase
      .from('orchestrator_config')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      LOCAL_CONFIG_CACHE = {
        id: data.id,
        is_paused: Boolean(data.is_paused),
        active_flows: data.active_flows || DEFAULT_ORCHESTRATOR_CONFIG.active_flows,
        limits: data.limits || DEFAULT_ORCHESTRATOR_LIMITS,
        last_run_at: data.last_run_at,
        last_run_summary: data.last_run_summary,
        updated_at: data.updated_at,
      };
      return LOCAL_CONFIG_CACHE;
    }
  } catch (err) {
    console.warn('Orquestador: Leyendo config desde cache local (Supabase fallback):', err);
  }

  return LOCAL_CONFIG_CACHE;
}

/**
 * Actualiza la configuración del Orquestador
 */
export async function updateOrchestratorConfig(
  updates: Partial<OrchestratorConfig>,
  client?: any
): Promise<OrchestratorConfig> {
  const supabase = client || createClient();

  const current = await getOrchestratorConfig(supabase);
  const updated: OrchestratorConfig = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('orchestrator_config')
      .upsert(
        {
          id: 'default',
          is_paused: updated.is_paused,
          active_flows: updated.active_flows,
          limits: updated.limits,
          last_run_at: updated.last_run_at,
          last_run_summary: updated.last_run_summary,
          updated_at: updated.updated_at,
        },
        { onConflict: 'id' }
      );

    if (error) throw error;
  } catch (err) {
    console.warn('Orquestador: Error actualizando config en Supabase, guardado localmente:', err);
  }

  LOCAL_CONFIG_CACHE = updated;
  return LOCAL_CONFIG_CACHE;
}

/**
 * Pausa o reanuda el Orquestador
 */
export async function toggleOrchestratorPause(
  pausedOrClient?: boolean | any,
  client?: any
): Promise<{ is_paused: boolean }> {
  let targetPaused: boolean;
  let supabase = client;

  if (typeof pausedOrClient === 'boolean') {
    targetPaused = pausedOrClient;
  } else {
    supabase = pausedOrClient;
    const current = await getOrchestratorConfig(supabase);
    targetPaused = !current.is_paused;
  }

  await updateOrchestratorConfig({ is_paused: targetPaused }, supabase);
  return { is_paused: targetPaused };
}

/**
 * Activa o desactiva un flujo específico
 */
export async function toggleOrchestratorFlow(
  flowKeyOrId: string,
  enabledOrClient?: boolean | any,
  client?: any
): Promise<OrchestratorConfig['active_flows']> {
  let supabase = client;
  let isExplicit = typeof enabledOrClient === 'boolean';

  // Mapear FLUJO_A -> flujoA si viene en mayúsculas
  const map: Record<string, 'flujoA' | 'flujoB' | 'flujoC' | 'flujoD'> = {
    FLUJO_A: 'flujoA',
    FLUJO_B: 'flujoB',
    FLUJO_C: 'flujoC',
    FLUJO_D: 'flujoD',
    flujoA: 'flujoA',
    flujoB: 'flujoB',
    flujoC: 'flujoC',
    flujoD: 'flujoD',
  };

  const key = map[flowKeyOrId] || 'flujoA';

  if (!isExplicit) {
    supabase = enabledOrClient;
  }

  const current = await getOrchestratorConfig(supabase);
  const nextVal = isExplicit ? (enabledOrClient as boolean) : !current.active_flows[key];

  const newFlows = {
    ...current.active_flows,
    [key]: nextVal,
  };
  await updateOrchestratorConfig({ active_flows: newFlows }, supabase);
  return newFlows;
}

// ==============================================================================
// 2. MOTOR DE TAREAS PERSISTENTES
// ==============================================================================

/**
 * Sanitiza mensajes de tareas para garantizar la consistencia en autorizaciones de CEO
 */
export function sanitizeTaskMessages<T extends { next_action?: string | null; error_message?: string | null }>(task: T): T {
  if (!task) return task;
  let next = task.next_action;
  if (next) {
    next = next
      .replace(/esperando revisión y aprobación de daro o julieta en el visor\.?/gi, 'Requiere Autorización de CEO en el visor.')
      .replace(/espera aprobación humana de daro o julieta\.?/gi, 'Requiere Autorización de CEO.')
      .replace(/revisión y aprobación de daro o julieta/gi, 'Autorización de CEO')
      .replace(/aprobación humana de daro o julieta/gi, 'Autorización de CEO')
      .replace(/daro o julieta/gi, 'CEO')
      .replace(/daro y julieta/gi, 'CEO');
  }
  return {
    ...task,
    next_action: next,
  };
}

/**
 * Obtiene el listado de tareas con filtros
 */
export async function getOrchestratorTasks(
  filters?: {
    status?: OrchestratorTaskStatus | 'TODOS';
    agent?: OrchestratorAgentName | 'TODOS';
    workflow_id?: OrchestratorWorkflowId | 'TODOS';
    requires_approval_only?: boolean;
    search?: string;
    limit?: number;
  },
  client?: any
): Promise<OrchestratorTask[]> {
  const supabase = client || createClient();

  try {
    let query = supabase
      .from('orchestrator_tasks')
      .select('*, business:businesses(*)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'TODOS') {
      query = query.eq('status', filters.status);
    }
    if (filters?.agent && filters.agent !== 'TODOS') {
      query = query.eq('agent', filters.agent);
    }
    if (filters?.workflow_id && filters.workflow_id !== 'TODOS') {
      query = query.eq('workflow_id', filters.workflow_id);
    }
    if (filters?.requires_approval_only) {
      query = query.eq('requires_human_approval', true).eq('status', 'ESPERANDO_APROBACION');
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      let items = (data as OrchestratorTask[]).map(sanitizeTaskMessages);
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(
          (t) =>
            t.business_name?.toLowerCase().includes(q) ||
            t.task_type.toLowerCase().includes(q) ||
            t.next_action?.toLowerCase().includes(q)
        );
      }
      return items;
    }
  } catch (err) {
    console.warn('Orquestador: Consultando tareas desde memoria local:', err);
  }

  // Fallback memoria local
  let list = LOCAL_TASKS_CACHE.map(sanitizeTaskMessages);

  if (filters?.status && filters.status !== 'TODOS') {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters?.agent && filters.agent !== 'TODOS') {
    list = list.filter((t) => t.agent === filters.agent);
  }
  if (filters?.workflow_id && filters.workflow_id !== 'TODOS') {
    list = list.filter((t) => t.workflow_id === filters.workflow_id);
  }
  if (filters?.requires_approval_only) {
    list = list.filter((t) => t.requires_human_approval && t.status === 'ESPERANDO_APROBACION');
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.business_name?.toLowerCase().includes(q) ||
        t.task_type.toLowerCase().includes(q) ||
        t.next_action?.toLowerCase().includes(q)
    );
  }

  return list.slice(0, filters?.limit || 100);
}

/**
 * Obtiene el detalle de una tarea por ID
 */
export async function getOrchestratorTaskById(
  id: string,
  client?: any
): Promise<OrchestratorTask | null> {
  const supabase = client || createClient();

  try {
    const { data, error } = await supabase
      .from('orchestrator_tasks')
      .select('*, business:businesses(*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return sanitizeTaskMessages(data as OrchestratorTask);
    }
  } catch (err) {
    console.warn('Orquestador: Error buscando tarea en Supabase:', err);
  }

  const local = LOCAL_TASKS_CACHE.find((t) => t.id === id);
  return local ? sanitizeTaskMessages(local) : null;
}

/**
 * Crea una nueva tarea con protección contra duplicados (Idempotencia)
 */
export async function createOrchestratorTask(
  taskData: {
    agent: OrchestratorAgentName;
    task_type: OrchestratorTaskType;
    workflow_id?: OrchestratorWorkflowId;
    business_id?: string | null;
    business_name?: string | null;
    priority?: OrchestratorPriority;
    payload?: Record<string, any>;
    next_action?: string;
    requires_human_approval?: boolean;
    created_by?: string;
    dedup_key?: string;
  },
  client?: any
): Promise<{ task: OrchestratorTask; wasDuplicate: boolean }> {
  const supabase = client || createClient();

  // 1. Clave de deduplicación automática si no fue provista
  const dedupKey =
    taskData.dedup_key ||
    (taskData.business_id
      ? `${taskData.task_type}:${taskData.business_id}`
      : `${taskData.task_type}:${JSON.stringify(taskData.payload || {})}`);

  // 2. Verificar duplicado activo en memoria local
  const activeExisting = LOCAL_TASKS_CACHE.find(
    (t) =>
      t.dedup_key === dedupKey &&
      ['PENDIENTE', 'EN_EJECUCION', 'ESPERANDO_APROBACION'].includes(t.status)
  );

  if (activeExisting) {
    return { task: sanitizeTaskMessages(activeExisting), wasDuplicate: true };
  }

  // 3. Verificar duplicado activo en Supabase
  try {
    const { data: existingDb } = await supabase
      .from('orchestrator_tasks')
      .select('*, business:businesses(*)')
      .eq('dedup_key', dedupKey)
      .in('status', ['PENDIENTE', 'EN_EJECUCION', 'ESPERANDO_APROBACION'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingDb) {
      return { task: sanitizeTaskMessages(existingDb as OrchestratorTask), wasDuplicate: true };
    }
  } catch (err) {
    // Si la tabla no está disponible o falla RLS temporalmente, se apoya en memoria local
  }

  const newTask: OrchestratorTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agent: taskData.agent,
    task_type: taskData.task_type,
    workflow_id: taskData.workflow_id || 'MANUAL',
    business_id: taskData.business_id || null,
    business_name: taskData.business_name || null,
    status: taskData.requires_human_approval ? 'ESPERANDO_APROBACION' : 'PENDIENTE',
    priority: taskData.priority || 'MEDIA',
    payload: taskData.payload || {},
    result: {},
    retry_count: 0,
    max_retries: 2,
    next_action: taskData.next_action || `Tarea asignada a ${taskData.agent} para su ejecución.`,
    requires_human_approval: Boolean(taskData.requires_human_approval),
    approval_status: taskData.requires_human_approval ? 'PENDIENTE' : null,
    dedup_key: dedupKey,
    created_at: new Date().toISOString(),
    created_by: taskData.created_by || 'ORCHESTRATOR',
  };

  // 3. Persistir en Supabase
  try {
    const { data, error } = await supabase
      .from('orchestrator_tasks')
      .insert([
        {
          agent: newTask.agent,
          task_type: newTask.task_type,
          workflow_id: newTask.workflow_id,
          business_id: newTask.business_id,
          business_name: newTask.business_name,
          status: newTask.status,
          priority: newTask.priority,
          payload: newTask.payload,
          retry_count: newTask.retry_count,
          max_retries: newTask.max_retries,
          next_action: newTask.next_action,
          requires_human_approval: newTask.requires_human_approval,
          approval_status: newTask.approval_status,
          dedup_key: newTask.dedup_key,
          created_by: newTask.created_by,
        },
      ])
      .select('*, business:businesses(*)')
      .single();

    if (!error && data) {
      LOCAL_TASKS_CACHE.unshift(data as OrchestratorTask);
      return { task: data as OrchestratorTask, wasDuplicate: false };
    }
  } catch (err) {
    console.warn('Orquestador: Insertando tarea en memoria local:', err);
  }

  LOCAL_TASKS_CACHE.unshift(newTask);
  return { task: newTask, wasDuplicate: false };
}

/**
 * Actualiza el estado y resultado de una tarea
 */
export async function updateOrchestratorTask(
  id: string,
  updates: Partial<OrchestratorTask>,
  client?: any
): Promise<OrchestratorTask> {
  const supabase = client || createClient();

  try {
    const { data, error } = await supabase
      .from('orchestrator_tasks')
      .update(updates)
      .eq('id', id)
      .select('*, business:businesses(*)')
      .single();

    if (!error && data) {
      const idx = LOCAL_TASKS_CACHE.findIndex((t) => t.id === id);
      if (idx !== -1) LOCAL_TASKS_CACHE[idx] = data as OrchestratorTask;
      return data as OrchestratorTask;
    }
  } catch (err) {
    console.warn('Orquestador: Actualizando tarea en cache local:', err);
  }

  const idx = LOCAL_TASKS_CACHE.findIndex((t) => t.id === id);
  if (idx !== -1) {
    LOCAL_TASKS_CACHE[idx] = {
      ...LOCAL_TASKS_CACHE[idx],
      ...updates,
    };
    return LOCAL_TASKS_CACHE[idx];
  }

  throw new Error(`Tarea no encontrada para actualizar: ${id}`);
}

/**
 * Cancela una tarea
 */
export async function cancelOrchestratorTask(
  id: string,
  reasonOrClient?: string | any,
  client?: any
): Promise<OrchestratorTask> {
  const reason = typeof reasonOrClient === 'string' ? reasonOrClient : 'Tarea cancelada manualmente por el operador.';
  const supabase = typeof reasonOrClient === 'string' ? client : reasonOrClient;

  return updateOrchestratorTask(
    id,
    {
      status: 'CANCELADA',
      completed_at: new Date().toISOString(),
      next_action: reason,
    },
    supabase
  );
}

/**
 * Reintenta una tarea fallida o cancelada
 */
export async function retryOrchestratorTask(id: string, client?: any): Promise<OrchestratorTask> {
  return updateOrchestratorTask(
    id,
    {
      status: 'PENDIENTE',
      error_message: null,
      started_at: null,
      completed_at: null,
      next_action: 'Tarea reencolada para nuevo intento.',
    },
    client
  );
}

/**
 * Aprueba o rechaza una tarea pendiente de aprobación humana (Daro o Julieta)
 */
export async function handleHumanApproval(
  id: string,
  actionOrApproved: 'APROBADO' | 'RECHAZADO' | boolean,
  approverOrNotes?: string,
  notesOrClient?: string | any,
  client?: any
): Promise<OrchestratorTask> {
  let isApproved: boolean;
  if (typeof actionOrApproved === 'boolean') {
    isApproved = actionOrApproved;
  } else {
    isApproved = actionOrApproved === 'APROBADO';
  }

  const action = isApproved ? 'APROBADO' : 'RECHAZADO';
  const notes = typeof notesOrClient === 'string' ? notesOrClient : approverOrNotes;
  const supabase = client || (typeof notesOrClient !== 'string' ? notesOrClient : undefined);

  const current = await getOrchestratorTaskById(id, supabase);
  if (!current) throw new Error('Tarea no encontrada');

  const updates: Partial<OrchestratorTask> = {
    approval_status: action,
    approval_notes: notes || null,
  };

  if (isApproved) {
    updates.status = 'COMPLETADA';
    updates.completed_at = new Date().toISOString();
    updates.next_action = `Aprobación concedida por el operador. ${notes ? `Notas: ${notes}. ` : ''}Listo para continuar con el siguiente paso.`;

    // Si era una demo de Bruno, actualizar también el estado de la demo en client_demos
    if (current.task_type === 'BRUNO_DEMO' && current.result?.demoId) {
      try {
        const { updateDemoStatus } = await import('@/services/bruno.service');
        await updateDemoStatus(current.result.demoId, 'APROBADA', notes || 'Aprobada vía Orquestador', supabase);
      } catch (e) {
        console.warn('Error sincronizando aprobación de demo con Bruno:', e);
      }
    }
  } else {
    updates.status = 'CANCELADA';
    updates.completed_at = new Date().toISOString();
    updates.next_action = `Rechazada por el operador. Motivo: ${notes || 'Sin observaciones'}.`;
  }

  return updateOrchestratorTask(id, updates, supabase);
}

// ==============================================================================
// 3. MOTOR DE EJECUCIÓN (CONEXIÓN REAL CON AGENTES)
// ==============================================================================

/**
 * Ejecuta una tarea individual despachándola al agente correspondiente
 */
export async function executeOrchestratorTask(
  taskOrId: OrchestratorTask | string,
  client?: any
): Promise<OrchestratorTask> {
  const supabase = client || createClient();

  let task: OrchestratorTask;
  if (typeof taskOrId === 'string') {
    const fetched = await getOrchestratorTaskById(taskOrId, supabase);
    if (!fetched) throw new Error(`Tarea ${taskOrId} no encontrada`);
    task = fetched;
  } else {
    task = taskOrId;
  }

  // 1. Marcar como EN_EJECUCION
  await updateOrchestratorTask(
    task.id,
    {
      status: 'EN_EJECUCION',
      started_at: new Date().toISOString(),
    },
    supabase
  );

  try {
    let resultPayload: Record<string, any> = {};
    let nextActionMsg = '';
    let requiresApproval = false;
    let finalStatus: OrchestratorTaskStatus = 'COMPLETADA';

    // 2. Despacho por Agente y Tipo de Tarea
    switch (task.task_type) {
      // ----------------------------------------------------
      // AGENTE LOLA: Descubrimiento de prospectos
      // ----------------------------------------------------
      case 'LOLA_DISCOVERY': {
        const city = task.payload.city || 'Quilmes';
        const industry = task.payload.industry || 'Odontología';
        const maxResults = Math.min(task.payload.maxResults || 20, 20);

        const discovery = await runLolaDiscovery(
          {
            industry,
            city,
            max_results: maxResults,
          },
          null,
          supabase
        );

        resultPayload = {
          searchId: discovery.search?.id,
          totalFound: discovery.search?.total_found || discovery.candidates.length,
          candidatesCount: discovery.candidates.length,
          city,
          industry,
        };

        nextActionMsg = `${discovery.candidates.length} prospectos descubiertos en ${city} (${industry}). Disponibles en Lola para inspección.`;
        break;
      }

      // ----------------------------------------------------
      // AGENTE TITO: Auditoría técnica de sitio web
      // ----------------------------------------------------
      case 'TITO_AUDIT': {
        if (!task.business_id) {
          throw new Error('TITO_AUDIT requiere business_id');
        }

        // 1. Verificar si el negocio cuenta con sitio web válido
        const { data: bData } = await supabase
          .from('businesses')
          .select('id, name, website')
          .eq('id', task.business_id)
          .maybeSingle();

        const siteUrl = bData?.website || task.payload?.url;
        if (!siteUrl || siteUrl.trim().length <= 3) {
          // El comercio no tiene sitio web: Tito no intenta auditarlo y lo identifica para Vera
          resultPayload = {
            hasWebsite: false,
            score: null,
            skipped: true,
            reason: 'Comercio sin sitio web registrado. Transferido a Vera para evaluación de desarrollo desde cero.',
          };
          nextActionMsg = `Comercio sin sitio web. Tito transfiere el prospecto a Vera para propuesta de Landing Express.`;
          break;
        }

        const auditRes = await auditBusiness(task.business_id, supabase);

        resultPayload = {
          auditId: auditRes.audit.id,
          score: auditRes.audit.score,
          issuesCount: auditRes.issues.length,
          hasWebsite: true,
        };

        nextActionMsg = `Auditoría técnica finalizada (Puntaje: ${auditRes.audit.score || 'N/A'}/100, ${auditRes.issues.length} observaciones). Listo para análisis estratégico de Vera.`;
        break;
      }

      // ----------------------------------------------------
      // AGENTE VERA: Estrategia y evaluación comercial
      // ----------------------------------------------------
      case 'VERA_STRATEGY': {
        if (!task.business_id) {
          throw new Error('VERA_STRATEGY requiere business_id');
        }

        // Verificar que no se analice prematuramente si tiene web pero la auditoría de Tito está pendiente
        const { data: bData } = await supabase
          .from('businesses')
          .select('id, name, website, audits(*)')
          .eq('id', task.business_id)
          .maybeSingle();

        const bAudits = Array.isArray(bData?.audits) ? bData.audits : [];
        const hasCompletedAudit = bAudits.some((a: any) => a.status === 'COMPLETADO' || a.score != null);
        const hasWeb = Boolean(bData?.website && bData.website.trim().length > 3);

        if (hasWeb && !hasCompletedAudit) {
          resultPayload = {
            delayed: true,
            reason: 'Auditoría técnica de Tito aún no finalizada.',
          };
          nextActionMsg = `Evaluación pausada: esperando que Tito complete la auditoría de ${bData?.website}.`;
          finalStatus = 'PENDIENTE';
          break;
        }

        const analysis = await analyzeBusiness(task.business_id, undefined, supabase);

        resultPayload = {
          commercialOutcome: analysis.commercialOutcome,
          commercialOutcomeLabel: analysis.commercialOutcomeLabel,
          recommendedService: analysis.recommendedServices?.[0] || null,
          verdict: analysis.summary,
        };

        if (analysis.commercialOutcome === 'OPORTUNIDAD_CLARA') {
          nextActionMsg = `Oportunidad comercial identificada: ${analysis.recommendedServices?.[0]?.serviceName || 'Sitio Web'}. Listo para que Bruno prepare la propuesta conceptual.`;
        } else if (analysis.commercialOutcome === 'BUENA_PRESENCIA') {
          nextActionMsg = `Vera determinó presencia digital sólida. Criterio: NO ofrecer servicios. Flujo concluido honestamente.`;
        } else {
          nextActionMsg = `Evaluación completada: ${analysis.commercialOutcomeLabel}. Flujo actualizado.`;
        }
        break;
      }

      // ----------------------------------------------------
      // AGENTE BRUNO: Generación de propuesta conceptual / Demo
      // ----------------------------------------------------
      case 'BRUNO_DEMO': {
        if (!task.business_id) {
          throw new Error('BRUNO_DEMO requiere business_id');
        }

        // Bruno solo recibe oportunidades evaluadas y aprobadas por Vera
        const { data: bData } = await supabase
          .from('businesses')
          .select('id, name, audits(*)')
          .eq('id', task.business_id)
          .maybeSingle();

        const bAudits = Array.isArray(bData?.audits) ? bData.audits : [];
        const latestAudit = bAudits.length > 0 ? bAudits[0] : null;
        const veraStrategy = latestAudit?.ai_insights?.vera_strategy;

        if (!veraStrategy) {
          resultPayload = {
            skipped: true,
            reason: 'Negocio sin diagnóstico estratégico previo de Vera.',
          };
          nextActionMsg = `Generación de demo cancelada: requiere evaluación previa de Vera.`;
          finalStatus = 'CANCELADA';
          break;
        }

        if (
          veraStrategy.commercialOutcome === 'BUENA_PRESENCIA' ||
          veraStrategy.actionRecommendation === 'NO_OFRECER' ||
          veraStrategy.markedAsNoOpportunity
        ) {
          resultPayload = {
            skipped: true,
            reason: 'Vera determinó que el comercio tiene presencia sólida o no ofrecer servicios.',
          };
          nextActionMsg = `Bruno descarta generación de demo: Vera dictaminó no ofrecer servicios comerciales.`;
          finalStatus = 'COMPLETADA';
          break;
        }

        // Protección contra demos duplicadas activas
        const existingDemos = await getClientDemos({}, supabase);
        const activeDemo = existingDemos.find(
          (d) => d.business_id === task.business_id && d.status !== 'RECHAZADA'
        );

        if (activeDemo) {
          resultPayload = {
            skipped: true,
            demoId: activeDemo.id,
            slug: activeDemo.slug,
            status: activeDemo.status,
            reason: 'Ya existe una demo comercial activa para este negocio.',
          };
          nextActionMsg = `Demo existente localizada (${activeDemo.title}). No se duplicó la propuesta.`;
        } else {
          const demo = await generateDemoForBusiness(
            task.business_id,
            {
              productType: task.payload.productType || veraStrategy.recommendedServices?.[0]?.serviceName,
              customTitle: task.payload.customTitle,
            },
            supabase
          );

          resultPayload = {
            demoId: demo.id,
            slug: demo.slug,
            status: demo.status,
            title: demo.title,
          };

          // La demo creada siempre requiere aprobación humana antes de pasar a Cata
          requiresApproval = true;
          finalStatus = 'ESPERANDO_APROBACION';
          nextActionMsg = `Demo conceptual generada por Bruno. Requiere Autorización de CEO en el visor.`;
        }
        break;
      }

      // ----------------------------------------------------
      // AGENTE CATA: Preparación de seguimiento comercial
      // ----------------------------------------------------
      case 'CATA_FOLLOWUP': {
        const cataData = await getCataOpportunities(supabase);
        const opps = cataData?.opportunities || [];
        const opp = opps.find((o) => o.business?.id === task.business_id) || opps[0];

        if (!opp || !opp.business) {
          resultPayload = { skipped: true, reason: 'No hay oportunidad registrada en Cata' };
          nextActionMsg = 'No se encontró oportunidad activa para preparar mensajes.';
        } else {
          // Si la oportunidad tiene demo generada pero aún no fue aprobada por el CEO, esperar
          if (opp.demo && opp.demo.status !== 'APROBADA') {
            resultPayload = {
              delayed: true,
              demoStatus: opp.demo.status,
              reason: 'Demo conceptual pendiente de Autorización de CEO.',
            };
            nextActionMsg = `Cata en pausa: esperando Autorización de CEO para la demo antes de redactar borradores comerciales.`;
            finalStatus = 'ESPERANDO_APROBACION';
            requiresApproval = true;
            break;
          }

          const drafts = generateCataMessages(
            opp.business,
            opp.veraStrategy,
            opp.audit,
            opp.demo ? { slug: opp.demo.slug, status: opp.demo.status, previewUrl: opp.demo.previewUrl } : null
          );
          const draftsCount = Object.keys(drafts).length;
          resultPayload = {
            opportunityId: opp.id,
            businessName: opp.business.name,
            draftsPrepared: draftsCount,
            channelSuggestions: ['WhatsApp Directo', 'Correo Formal'],
            drafts,
          };
          nextActionMsg = `${draftsCount} borradores comerciales preparados por Cata. Listos para envío manual previa aprobación humana.`;
        }
        break;
      }

      default:
        throw new Error(`Tipo de tarea desconocido: ${task.task_type}`);
    }

    // 3. Registrar éxito y próximo paso
    return await updateOrchestratorTask(
      task.id,
      {
        status: finalStatus,
        result: resultPayload,
        error_message: null,
        next_action: nextActionMsg,
        requires_human_approval: requiresApproval,
        approval_status: requiresApproval ? 'PENDIENTE' : null,
        completed_at: new Date().toISOString(),
      },
      supabase
    );
  } catch (err: any) {
    const errorMsg = err?.message || 'Error desconocido durante la ejecución de la tarea';
    const newRetryCount = (task.retry_count || 0) + 1;
    const isFailed = newRetryCount >= task.max_retries;

    console.error(`Orquestador: Error ejecutando tarea ${task.id} (${task.task_type}):`, err);

    return await updateOrchestratorTask(
      task.id,
      {
        status: isFailed ? 'FALLIDA' : 'PENDIENTE',
        error_message: errorMsg,
        retry_count: newRetryCount,
        next_action: isFailed
          ? `Operación fallida tras ${newRetryCount} intentos. Requiere revisión técnica manual.`
          : `Fallo transitorio (${errorMsg}). Se reintentará en el próximo ciclo (Intento ${newRetryCount}/${task.max_retries}).`,
        completed_at: isFailed ? new Date().toISOString() : null,
      },
      supabase
    );
  }
}

// ==============================================================================
// 4. CICLO COMPLETO DEL ORQUESTADOR (DIRECTOR DE OPERACIONES)
// ==============================================================================

/**
 * Ejecuta un ciclo de supervisión y despacho del Orquestador
 */
export async function runOrchestratorCycle(client?: any): Promise<OrchestratorCycleSummary> {
  const supabase = client || createClient();
  const config = await getOrchestratorConfig(supabase);

  const cycleId = `cycle-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // 1. Si está en pausa, reportar y detener
  if (config.is_paused) {
    return {
      cycle_id: cycleId,
      timestamp,
      status: 'PAUSADO',
      tasks_processed: 0,
      tasks_created: 0,
      tasks_completed: 0,
      tasks_failed: 0,
      approvals_needed: 0,
      agents_active: [],
      details: ['El Orquestador se encuentra en pausa por decisión del operador.'],
    };
  }

  const details: string[] = [];
  const agentsActiveSet = new Set<OrchestratorAgentName>();
  let tasksCreatedCount = 0;
  let tasksCompletedCount = 0;
  let tasksFailedCount = 0;
  let approvalsNeededCount = 0;

  // Helper para verificar si un flujo está activo (soporta 'flujoA' o 'FLUJO_A')
  const isFlowActive = (flowKey: 'flujoA' | 'flujoB' | 'flujoC' | 'flujoD') => {
    const uppercase = flowKey.replace('flujo', 'FLUJO_') as string;
    const flows = config.active_flows as Record<string, boolean>;
    return Boolean(flows[flowKey] ?? flows[uppercase] ?? true);
  };

  // ----------------------------------------------------------------------------
  // ETAPA 1: Procesar tareas pendientes preexistentes en cola (ej: manuales / reintentos)
  // ----------------------------------------------------------------------------
  const pendingTasks = await getOrchestratorTasks({ status: 'PENDIENTE', limit: 10 }, supabase);

  for (const task of pendingTasks) {
    agentsActiveSet.add(task.agent);
    try {
      const finished = await executeOrchestratorTask(task, supabase);
      if (finished.status === 'COMPLETADA') tasksCompletedCount++;
      else if (finished.status === 'FALLIDA') tasksFailedCount++;
      else if (finished.status === 'ESPERANDO_APROBACION') approvalsNeededCount++;
      details.push(`[${task.agent}] ${task.task_type} (${task.business_name || 'General'}): ${finished.next_action}`);
    } catch (e: any) {
      tasksFailedCount++;
      details.push(`[${task.agent}] Error: ${e.message}`);
    }
  }

  // ----------------------------------------------------------------------------
  // ETAPA 2: FLUJO A & B — INGESTIÓN DE CANDIDATOS DESCUBIERTOS POR LOLA AL CRM
  // Patricia detecta comercios descubiertos en lola_candidates que aún no ingresaron
  // al CRM (businesses). Los investiga (obtiene website y teléfono) y los incorpora
  // deduplicados para que Tito y Vera los procesen en esta misma pasada.
  // ----------------------------------------------------------------------------
  try {
    const { data: pendingCandidates } = await supabase
      .from('lola_candidates')
      .select('*')
      .in('import_status', ['DESCUBIERTO', 'INVESTIGADO', 'PENDIENTE'])
      .is('business_id', null)
      .order('created_at', { ascending: false })
      .limit(config.limits.max_new_candidates_per_cycle || 20);

    if (pendingCandidates && pendingCandidates.length > 0) {
      agentsActiveSet.add('LOLA');

      // 1. Filtrar solo los no descartados ni duplicados
      const validCandidates = pendingCandidates.filter(
        (c: any) => c.verified_status !== 'DUPLICADO' && c.import_status !== 'DESCARTADO'
      );

      if (validCandidates.length > 0) {
        // 2. Investigar los que aún no tengan website o teléfono para poder auditar con Tito
        const uninvestigatedIds = validCandidates
          .filter((c: any) => !c.website && !c.phone && c.place_id && c.import_status !== 'INVESTIGADO')
          .map((c: any) => c.id);

        if (uninvestigatedIds.length > 0) {
          try {
            const { investigateSelectedCandidates } = await import('@/services/lola.service');
            await investigateSelectedCandidates(uninvestigatedIds, supabase);
            details.push(`[LOLA] Se investigaron datos y sitios web para ${uninvestigatedIds.length} comercios descubiertos.`);
          } catch (e: any) {
            console.warn('Orquestador: Error investigando candidatos en Places:', e.message);
          }
        }

        // 3. Incorporar los comercios al CRM (businesses) respetando deduplicación
        const { approveLolaCandidates } = await import('@/services/lola.service');
        const approvedRes = await approveLolaCandidates(
          validCandidates.map((c: any) => c.id),
          null,
          supabase
        );

        if (approvedRes.approvedCount > 0) {
          tasksCreatedCount += approvedRes.approvedCount;
          tasksCompletedCount += approvedRes.approvedCount;
          details.push(`[LOLA] ${approvedRes.approvedCount} nuevos comercios incorporados al CRM (${approvedRes.duplicateCount} duplicados omitidos).`);
        }
      }
    }
  } catch (err: any) {
    console.warn('Orquestador: Advertencia durante la ingestión de candidatos de Lola:', err);
  }

  // ----------------------------------------------------------------------------
  // ETAPA 3: FLUJO B — TITO (Auditoría Técnica de sitios web)
  // Audita comercios que TIENEN sitio web y aún NO cuentan con auditoría técnica.
  // Si no tiene sitio web, Tito NO lo audita y se deja para evaluación directa en Vera.
  // ----------------------------------------------------------------------------
  let businesses: any[] = [];
  try {
    const { data: bList } = await supabase
      .from('businesses')
      .select('*, audits(*)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (bList) businesses = bList;
  } catch (err: any) {
    console.warn('Orquestador: Error consultando prospectos en Supabase:', err);
  }

  if (isFlowActive('flujoB') && businesses.length > 0) {
    let auditsRunCount = 0;
    const maxTito = config.limits.max_tito_audits_per_cycle || 10;

    for (const b of businesses) {
      if (auditsRunCount >= maxTito) break;

      const audits = Array.isArray(b.audits) ? b.audits : [];
      const hasCompletedAudit = audits.some((a: any) => a.status === 'COMPLETADO' || a.score != null);
      const hasWebsite = Boolean(b.website && b.website.trim().length > 3);

      // Si tiene sitio web y no tiene auditoría previa completada: Asignar y ejecutar Tito
      if (hasWebsite && !hasCompletedAudit) {
        const { task, wasDuplicate } = await createOrchestratorTask(
          {
            agent: 'TITO',
            task_type: 'TITO_AUDIT',
            workflow_id: 'FLUJO_B',
            business_id: b.id,
            business_name: b.name,
            priority: 'MEDIA',
            payload: { businessId: b.id, url: b.website },
            next_action: `Tito auditará el sitio web (${b.website}) para evaluar performance y SEO.`,
            dedup_key: `TITO_AUDIT:${b.id}`,
          },
          supabase
        );

        if (!wasDuplicate && task.status === 'PENDIENTE') {
          auditsRunCount++;
          tasksCreatedCount++;
          agentsActiveSet.add('TITO');

          try {
            const finished = await executeOrchestratorTask(task, supabase);
            if (finished.status === 'COMPLETADA') {
              tasksCompletedCount++;
              details.push(`[TITO] Auditoría técnica completada para ${b.name}: Puntaje ${finished.result?.score || 'N/A'}/100.`);
              // Actualizar audits localmente para que Vera pueda procesarlo en esta misma pasada del ciclo
              b.audits = [{ id: finished.result?.auditId, score: finished.result?.score, ai_insights: {} }];
            } else if (finished.status === 'FALLIDA') {
              tasksFailedCount++;
              details.push(`[TITO] Falló auditoría de ${b.name}: ${finished.error_message}`);
            }
          } catch (err: any) {
            tasksFailedCount++;
            details.push(`[TITO] Error ejecutando auditoría de ${b.name}: ${err.message}`);
          }
        }
      }
    }
  }

  // ----------------------------------------------------------------------------
  // ETAPA 4: FLUJO B — VERA (Estrategia y Evaluación Comercial)
  // Evalúa:
  // a) Negocios CON sitio web que ya tienen auditoría técnica (Tito) y aún NO tienen estrategia de Vera.
  // b) Negocios SIN sitio web que aún NO tienen estrategia de Vera (desarrollo desde cero).
  // No analiza prematuramente si la auditoría técnica requerida está pendiente.
  // ----------------------------------------------------------------------------
  if (isFlowActive('flujoB') && businesses.length > 0) {
    let veraRunCount = 0;
    const maxVera = 10;

    for (const b of businesses) {
      if (veraRunCount >= maxVera) break;

      const audits = Array.isArray(b.audits) ? b.audits : [];
      const latestAudit = audits.length > 0 ? audits[0] : null;
      const hasVeraStrategy = Boolean(latestAudit?.ai_insights?.vera_strategy);
      const hasWebsite = Boolean(b.website && b.website.trim().length > 3);

      // CASO A: Negocio CON sitio web que YA tiene auditoría técnica y aún no tiene estrategia de Vera
      if (hasWebsite && latestAudit && !hasVeraStrategy) {
        const { task, wasDuplicate } = await createOrchestratorTask(
          {
            agent: 'VERA',
            task_type: 'VERA_STRATEGY',
            workflow_id: 'FLUJO_B',
            business_id: b.id,
            business_name: b.name,
            priority: 'ALTA',
            payload: { businessId: b.id, auditId: latestAudit.id },
            next_action: `Vera analizará la auditoría técnica y formulará la estrategia comercial para ${b.name}.`,
            dedup_key: `VERA_STRATEGY:${b.id}`,
          },
          supabase
        );

        if (!wasDuplicate && task.status === 'PENDIENTE') {
          veraRunCount++;
          tasksCreatedCount++;
          agentsActiveSet.add('VERA');

          try {
            const finished = await executeOrchestratorTask(task, supabase);
            if (finished.status === 'COMPLETADA') {
              tasksCompletedCount++;
              const outcome = finished.result?.commercialOutcomeLabel || finished.result?.commercialOutcome || 'Estrategia formulada';
              details.push(`[VERA] Estrategia completada para ${b.name}: ${outcome}.`);
              if (latestAudit.ai_insights) {
                latestAudit.ai_insights.vera_strategy = finished.result;
              }
            } else if (finished.status === 'FALLIDA') {
              tasksFailedCount++;
              details.push(`[VERA] Falló evaluación de ${b.name}: ${finished.error_message}`);
            }
          } catch (err: any) {
            tasksFailedCount++;
            details.push(`[VERA] Error en evaluación de ${b.name}: ${err.message}`);
          }
        }
      }

      // CASO B: Negocio SIN sitio web que todavía no tiene estrategia comercial de Vera
      if (!hasWebsite && !hasVeraStrategy) {
        const { task, wasDuplicate } = await createOrchestratorTask(
          {
            agent: 'VERA',
            task_type: 'VERA_STRATEGY',
            workflow_id: 'FLUJO_B',
            business_id: b.id,
            business_name: b.name,
            priority: 'ALTA',
            payload: { businessId: b.id, withoutWebsite: true },
            next_action: `Negocio sin web. Vera evaluará propuesta de desarrollo desde cero (Landing Express).`,
            dedup_key: `VERA_STRATEGY:${b.id}`,
          },
          supabase
        );

        if (!wasDuplicate && task.status === 'PENDIENTE') {
          veraRunCount++;
          tasksCreatedCount++;
          agentsActiveSet.add('VERA');

          try {
            const finished = await executeOrchestratorTask(task, supabase);
            if (finished.status === 'COMPLETADA') {
              tasksCompletedCount++;
              const outcome = finished.result?.commercialOutcomeLabel || finished.result?.commercialOutcome || 'Estrategia formulada';
              details.push(`[VERA] Estrategia sin web completada para ${b.name}: ${outcome}.`);
            } else if (finished.status === 'FALLIDA') {
              tasksFailedCount++;
              details.push(`[VERA] Falló evaluación sin web de ${b.name}: ${finished.error_message}`);
            }
          } catch (err: any) {
            tasksFailedCount++;
            details.push(`[VERA] Error en evaluación sin web de ${b.name}: ${err.message}`);
          }
        }
      }
    }
  }

  // ----------------------------------------------------------------------------
  // ETAPA 5: FLUJO C — BRUNO (Demos Comerciales para Oportunidades Claras)
  // Recibe ÚNICAMENTE los prospectos evaluados por Vera con OPORTUNIDAD_CLARA.
  // Respeta límites y requiere Autorización de CEO en el visor.
  // ----------------------------------------------------------------------------
  if (isFlowActive('flujoC')) {
    try {
      const { getEligibleBusinessesForDemo } = await import('@/services/bruno.service');
      const eligible = await getEligibleBusinessesForDemo(supabase);

      let demosCreated = 0;
      const maxBruno = config.limits.max_bruno_demos_per_cycle || 3;

      for (const item of eligible) {
        if (demosCreated >= maxBruno) break;

        // Solo crear demo si Vera dictaminó oportunidad y no existe demo activa
        if (item.hasStrategy && !item.hasExistingDemo) {
          const { task, wasDuplicate } = await createOrchestratorTask(
            {
              agent: 'BRUNO',
              task_type: 'BRUNO_DEMO',
              workflow_id: 'FLUJO_C',
              business_id: item.business.id,
              business_name: item.business.name,
              priority: 'ALTA',
              payload: {
                businessId: item.business.id,
                productType: item.recommendedProduct || 'landing-express',
              },
              next_action: `Bruno preparará propuesta conceptual en base al diagnóstico de Vera.`,
              dedup_key: `BRUNO_DEMO:${item.business.id}`,
            },
            supabase
          );

          if (!wasDuplicate && task.status === 'PENDIENTE') {
            demosCreated++;
            tasksCreatedCount++;
            agentsActiveSet.add('BRUNO');

            try {
              const finished = await executeOrchestratorTask(task, supabase);
              if (finished.status === 'ESPERANDO_APROBACION') {
                approvalsNeededCount++;
                details.push(`[BRUNO] Demo conceptual creada para ${item.business.name}. Requiere Autorización de CEO en el visor.`);
              } else if (finished.status === 'COMPLETADA') {
                tasksCompletedCount++;
                details.push(`[BRUNO] Demo lista para ${item.business.name}.`);
              } else if (finished.status === 'FALLIDA') {
                tasksFailedCount++;
                details.push(`[BRUNO] Falló generación de demo para ${item.business.name}: ${finished.error_message}`);
              }
            } catch (err: any) {
              tasksFailedCount++;
              details.push(`[BRUNO] Error generando demo para ${item.business.name}: ${err.message}`);
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Orquestador Flujo C: Advertencia durante el encadenamiento:', err);
    }
  }

  // ----------------------------------------------------------------------------
  // ETAPA 6: FLUJO D — CATA (Contacto Comercial y Seguimiento)
  // Prepara borradores personalizados para oportunidades con demo aprobada por el CEO.
  // Nunca envía mensajes de forma automática.
  // ----------------------------------------------------------------------------
  if (isFlowActive('flujoD')) {
    try {
      const { getCataOpportunities } = await import('@/services/cata.service');
      const cataData = await getCataOpportunities(supabase);
      const opps = cataData?.opportunities || [];

      let draftsPrepared = 0;
      const maxCata = 5;

      for (const opp of opps) {
        if (draftsPrepared >= maxCata) break;

        const demoApproved = !opp.demo || opp.demo.status === 'APROBADA';
        const isQualified = opp.veraStrategy && (
          opp.veraStrategy.commercialOutcome === 'OPORTUNIDAD_CLARA' ||
          opp.veraStrategy.commercialOutcome === 'PROPUESTA_OPCIONAL'
        );

        if (isQualified && demoApproved && opp.business?.id) {
          const { task, wasDuplicate } = await createOrchestratorTask(
            {
              agent: 'CATA',
              task_type: 'CATA_FOLLOWUP',
              workflow_id: 'FLUJO_D',
              business_id: opp.business.id,
              business_name: opp.business.name,
              priority: 'MEDIA',
              payload: { businessId: opp.business.id },
              next_action: `Cata preparará borradores de mensajes comerciales para ${opp.business.name}.`,
              dedup_key: `CATA_FOLLOWUP:${opp.business.id}`,
            },
            supabase
          );

          if (!wasDuplicate && task.status === 'PENDIENTE') {
            draftsPrepared++;
            tasksCreatedCount++;
            agentsActiveSet.add('CATA');

            try {
              const finished = await executeOrchestratorTask(task, supabase);
              if (finished.status === 'COMPLETADA') {
                tasksCompletedCount++;
                details.push(`[CATA] Borradores comerciales preparados para ${opp.business.name} (WhatsApp y Correo).`);
              } else if (finished.status === 'FALLIDA') {
                tasksFailedCount++;
              }
            } catch (err: any) {
              tasksFailedCount++;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Orquestador Flujo D: Advertencia durante el encadenamiento:', err);
    }
  }

  // ----------------------------------------------------------------------------
  // ETAPA 7: Consolidar Resumen del Ciclo
  // ----------------------------------------------------------------------------
  const summary: OrchestratorCycleSummary = {
    cycle_id: cycleId,
    timestamp,
    status: tasksFailedCount > 0 ? 'PARCIAL' : 'COMPLETADO',
    tasks_processed: pendingTasks.length + tasksCreatedCount,
    tasks_created: tasksCreatedCount,
    tasks_completed: tasksCompletedCount,
    tasks_failed: tasksFailedCount,
    approvals_needed: approvalsNeededCount,
    agents_active: Array.from(agentsActiveSet),
    details: details.length > 0 ? details : ['Sin novedades operativas pendientes.'],
  };

  // 6. Actualizar timestamp de última ejecución
  await updateOrchestratorConfig(
    {
      last_run_at: timestamp,
      last_run_summary: summary,
    },
    supabase
  );

  return summary;
}

// ==============================================================================
// 5. MÉTRICAS Y PANEL DE ESTADO
// ==============================================================================

/**
 * Obtiene las métricas consolidadas del Centro de Operaciones
 */
export async function getOrchestratorOverview(client?: any): Promise<{
  config: OrchestratorConfig;
  counts: {
    total: number;
    pending: number;
    running: number;
    waitingApproval: number;
    completed: number;
    failed: number;
  };
  agentsStatus: Record<
    OrchestratorAgentName,
    {
      name: string;
      role: string;
      state: 'DISPONIBLE' | 'OCUPADO' | 'EN_ESPERA';
      lastTask: string | null;
    }
  >;
  agentStatuses: Array<{
    agent: OrchestratorAgentName;
    name: string;
    role: string;
    state: 'DISPONIBLE' | 'OCUPADO' | 'EN_ESPERA';
    lastTask: { type: string; status: string } | null;
  }>;
  recentTasks: OrchestratorTask[];
  pendingApprovals: OrchestratorTask[];
}> {
  const supabase = client || createClient();

  const config = await getOrchestratorConfig(supabase);
  const allTasks = await getOrchestratorTasks({ limit: 100 }, supabase);

  const counts = {
    total: allTasks.length,
    pending: allTasks.filter((t) => t.status === 'PENDIENTE').length,
    running: allTasks.filter((t) => t.status === 'EN_EJECUCION').length,
    waitingApproval: allTasks.filter((t) => t.status === 'ESPERANDO_APROBACION').length,
    completed: allTasks.filter((t) => t.status === 'COMPLETADA').length,
    failed: allTasks.filter((t) => t.status === 'FALLIDA').length,
  };

  const getAgentLastTask = (agent: OrchestratorAgentName) => {
    const t = allTasks.find((item) => item.agent === agent);
    return t ? `${t.task_type} (${t.status})` : null;
  };

  const getAgentLastTaskObj = (agent: OrchestratorAgentName) => {
    const t = allTasks.find((item) => item.agent === agent);
    return t ? { type: t.task_type, status: t.status } : null;
  };

  const getAgentState = (agent: OrchestratorAgentName): 'DISPONIBLE' | 'OCUPADO' | 'EN_ESPERA' => {
    const running = allTasks.some((t) => t.agent === agent && t.status === 'EN_EJECUCION');
    if (running) return 'OCUPADO';
    const pending = allTasks.some((t) => t.agent === agent && t.status === 'PENDIENTE');
    if (pending) return 'EN_ESPERA';
    return 'DISPONIBLE';
  };

  const agentsStatus: Record<
    OrchestratorAgentName,
    {
      name: string;
      role: string;
      state: 'DISPONIBLE' | 'OCUPADO' | 'EN_ESPERA';
      lastTask: string | null;
    }
  > = {
    LOLA: {
      name: 'Lola',
      role: 'Prospección en Google Places',
      state: getAgentState('LOLA'),
      lastTask: getAgentLastTask('LOLA'),
    },
    TITO: {
      name: 'Tito',
      role: 'Auditoría Técnica y SEO',
      state: getAgentState('TITO'),
      lastTask: getAgentLastTask('TITO'),
    },
    VERA: {
      name: 'Vera',
      role: 'Estrategia y Evaluación Comercial',
      state: getAgentState('VERA'),
      lastTask: getAgentLastTask('VERA'),
    },
    BRUNO: {
      name: 'Bruno',
      role: 'Desarrollo Web y Propuestas Demo',
      state: getAgentState('BRUNO'),
      lastTask: getAgentLastTask('BRUNO'),
    },
    CATA: {
      name: 'Cata',
      role: 'Contacto Comercial y Seguimiento',
      state: getAgentState('CATA'),
      lastTask: getAgentLastTask('CATA'),
    },
  };

  const agentStatuses = [
    {
      agent: 'LOLA' as OrchestratorAgentName,
      name: 'Lola',
      role: 'Prospección en Google Places',
      state: getAgentState('LOLA'),
      lastTask: getAgentLastTaskObj('LOLA'),
    },
    {
      agent: 'TITO' as OrchestratorAgentName,
      name: 'Tito',
      role: 'Auditoría Técnica y SEO',
      state: getAgentState('TITO'),
      lastTask: getAgentLastTaskObj('TITO'),
    },
    {
      agent: 'VERA' as OrchestratorAgentName,
      name: 'Vera',
      role: 'Estrategia y Evaluación Comercial',
      state: getAgentState('VERA'),
      lastTask: getAgentLastTaskObj('VERA'),
    },
    {
      agent: 'BRUNO' as OrchestratorAgentName,
      name: 'Bruno',
      role: 'Desarrollo Web y Propuestas Demo',
      state: getAgentState('BRUNO'),
      lastTask: getAgentLastTaskObj('BRUNO'),
    },
    {
      agent: 'CATA' as OrchestratorAgentName,
      name: 'Cata',
      role: 'Contacto Comercial y Seguimiento',
      state: getAgentState('CATA'),
      lastTask: getAgentLastTaskObj('CATA'),
    },
  ];

  const pendingApprovals = allTasks.filter(
    (t) => t.requires_human_approval && t.status === 'ESPERANDO_APROBACION'
  );

  return {
    config,
    counts,
    agentsStatus,
    agentStatuses,
    recentTasks: allTasks.slice(0, 20),
    pendingApprovals,
  };
}
