import { z } from 'zod';

export const CRM_STAGES_ENUM = [
  'NUEVO',
  'AUDITADO',
  'SELECCIONADO',
  'CONTACTADO',
  'RESPONDIÓ',
  'NEGOCIACIÓN',
  'GANADO',
  'PERDIDO',
] as const;

export const prospectSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  industry: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state_province: z.string().optional().nullable(),
  country: z.string().default('Argentina'),
  website: z
    .string()
    .url('Debe ser una URL válida (ej. https://ejemplo.com)')
    .or(z.literal(''))
    .optional()
    .nullable(),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .email('Debe ser un email válido')
    .or(z.literal(''))
    .optional()
    .nullable(),
  source: z.string().default('Manual'),
  status: z.enum(CRM_STAGES_ENUM).default('NUEVO'),
  notes: z.string().optional().nullable(),
});

export type ProspectFormValues = z.infer<typeof prospectSchema>;
