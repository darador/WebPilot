import { z } from 'zod';
import { CRM_STAGES_ENUM } from './prospect';

export const csvRowSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  industry: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state_province: z.string().optional().default(''),
  country: z.string().optional().default('Argentina'),
  website: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  source: z.string().optional().default('CSV Import'),
  status: z.enum(CRM_STAGES_ENUM).optional().default('NUEVO'),
  notes: z.string().optional().default(''),
});

export type CsvRowData = z.infer<typeof csvRowSchema>;

export interface ParsedCsvResult {
  validRows: CsvRowData[];
  invalidRows: { row: number; data: Record<string, string>; errors: string[] }[];
  duplicateRows: { row: number; data: CsvRowData; duplicateReason: string }[];
  totalRows: number;
}
