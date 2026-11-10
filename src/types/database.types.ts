export type CRMStage =
  | 'NUEVO'
  | 'AUDITADO'
  | 'SELECCIONADO'
  | 'CONTACTADO'
  | 'RESPONDIÓ'
  | 'NEGOCIACIÓN'
  | 'GANADO'
  | 'PERDIDO';

export type ActivityType =
  | 'CAMBIO_ESTADO'
  | 'LLAMADA'
  | 'EMAIL'
  | 'REUNION'
  | 'NOTA'
  | 'IMPORTACION';

export type AuditStatus = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO';
export type IssueSeverity = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' | 'INFO';
export type ProposalStatus = 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
export type ProjectStatus = 'PLANIFICACION' | 'EN_DESARROLLO' | 'REVISION' | 'ENTREGADO' | 'CANCELADO';

export interface Business {
  id: string;
  user_id: string | null;
  name: string;
  industry: string | null;
  city: string | null;
  state_province: string | null;
  country: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  status: CRMStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Audit {
  id: string;
  business_id: string;
  score: number | null;
  performance_data: Record<string, any>;
  seo_data: Record<string, any>;
  ai_insights: Record<string, any>;
  status: AuditStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditIssue {
  id: string;
  audit_id: string;
  business_id: string;
  category: string;
  title: string;
  description: string | null;
  severity: IssueSeverity;
  recommendation: string | null;
  created_at: string;
}

export interface Opportunity {
  id: string;
  business_id: string;
  user_id: string | null;
  title: string;
  estimated_value: number;
  stage: CRMStage;
  probability: number;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  opportunity_id: string;
  business_id: string;
  title: string;
  amount: number;
  status: ProposalStatus;
  document_url: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  proposal_id: string | null;
  final_amount: number;
  payment_terms: string | null;
  closed_at: string;
  created_at: string;
}

export interface Project {
  id: string;
  business_id: string;
  sale_id: string | null;
  name: string;
  status: ProjectStatus;
  start_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  business_id: string;
  user_id: string | null;
  type: ActivityType;
  description: string;
  from_stage: CRMStage | null;
  to_stage: CRMStage | null;
  created_at: string;
}

export interface DashboardMetrics {
  totalProspects: number;
  newProspects: number;
  auditedBusinesses: number;
  qualifiedOpportunities: number;
  wonClients: number;
  totalRevenue: number;
}
