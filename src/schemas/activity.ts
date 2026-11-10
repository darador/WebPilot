import { z } from 'zod';
import { CRM_STAGES_ENUM } from './prospect';

export const activitySchema = z.object({
  business_id: z.string().uuid(),
  type: z.enum(['CAMBIO_ESTADO', 'LLAMADA', 'EMAIL', 'REUNION', 'NOTA', 'IMPORTACION']),
  description: z.string().min(2, 'La descripción es requerida'),
  from_stage: z.enum(CRM_STAGES_ENUM).optional().nullable(),
  to_stage: z.enum(CRM_STAGES_ENUM).optional().nullable(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
