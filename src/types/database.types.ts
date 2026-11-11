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
  google_place_id?: string | null;
  address?: string | null;
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

export interface LolaSearch {
  id: string;
  user_id: string | null;
  industry: string;
  city: string;
  state_province: string | null;
  country: string;
  max_results: number;
  web_filter: 'ALL' | 'WITH_WEB' | 'WITHOUT_WEB';
  status: 'EN_PROCESO' | 'COMPLETADO' | 'ERROR';
  total_found: number;
  with_website: number;
  without_website: number;
  investigated_count: number;
  approved_count: number;
  api_calls_count?: number;
  source_used: string;
  duration_ms: number;
  error_message: string | null;
  created_at: string;
}

export type LolaCandidateStatus = 'DESCUBIERTO' | 'INVESTIGADO' | 'APROBADO' | 'DESCARTADO' | 'PENDIENTE';

export interface LolaCandidate {
  id: string;
  search_id: string;
  place_id: string | null;
  name: string;
  industry: string | null;
  city: string | null;
  state_province: string | null;
  country: string;
  address?: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  url_origin: string | null;
  has_website: boolean;
  has_whatsapp: boolean;
  has_forms: boolean;
  is_mobile_friendly: boolean;
  site_title: string | null;
  site_description: string | null;
  services_detected: string[];
  notes: string | null;
  verified_status: string;
  import_status: LolaCandidateStatus;
  manually_edited?: boolean;
  investigated_at?: string | null;
  business_id: string | null;
  created_at: string;
}

export type ReferenceStatus = 'PENDIENTE' | 'APROBADA' | 'DESCARTADA';

export interface IndustryReference {
  id: string;
  user_id?: string | null;
  name: string;
  industry: string;
  subindustry?: string | null;
  website_url: string;
  city?: string | null;
  country: string;
  description: string;
  image_url?: string | null;
  strengths: string[];
  structure: string[];
  features: string[];
  design_aspects: string[];
  selection_reason: string;
  notes?: string | null;
  status: ReferenceStatus;
  created_at: string;
  updated_at: string;
}

export type DemoStatus =
  | 'EN_PREPARACION'
  | 'PENDIENTE_REVISION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'ENVIADA';

export interface DemoServiceItem {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  isProvisional?: boolean;
}

export interface DemoContent {
  businessName: string;
  tagline: string;
  industry: string;
  subindustry?: string | null;
  hero: {
    title: string;
    subtitle: string;
    badgeText?: string;
    imageUrl?: string;
    ctaPrimary: {
      label: string;
      action: 'whatsapp' | 'call' | 'contact_form';
    };
    ctaSecondary?: {
      label: string;
      action: string;
    };
  };
  about?: {
    heading?: string;
    title: string;
    description: string;
    professionalName?: string;
    role?: string;
    imageUrl?: string;
    highlights?: string[];
  };
  services: {
    heading: string;
    subheading?: string;
    items: DemoServiceItem[];
  };
  features: {
    heading: string;
    items: { title: string; description: string; icon?: string }[];
  };
  testimonials?: {
    patientName: string;
    comment: string;
    stars: number;
    treatment?: string;
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  contact: {
    heading: string;
    phone?: string | null;
    whatsappPhone?: string | null;
    whatsappMessage?: string;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    mapQuery?: string | null;
    hours?: string | null;
  };
  theme: {
    primaryColor: 'cyan' | 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber' | 'teal';
    style: 'clean-medical' | 'modern-business' | 'warm-service' | 'minimalist' | 'warm-pet' | 'corporate-trust' | 'beauty-wellness';
    mode?: 'light' | 'dark';
  };
  provisionalFlags: string[];
  benchmarkNotice?: string;
  generatedBy: string;
}

export interface ClientDemo {
  id: string;
  business_id: string;
  title: string;
  slug: string;
  status: DemoStatus;
  product_type: string;
  reference_id?: string | null;
  reference_name?: string | null;
  content: DemoContent;
  feedback_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined field for convenience
  business?: Business;
}

