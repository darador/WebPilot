export interface AgentMember {
  id: 'lola' | 'tito' | 'vera' | 'bruno' | 'cata' | 'ramon';
  name: string;
  codename: string;
  role: string;
  department: string;
  responsibility: string;
  personality: string;
  quote: string;
  avatar: string;
  status: 'operativo' | 'proximamente';
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  assignedTasks: string[];
  skills: string[];
}

export const TEAM_MEMBERS: AgentMember[] = [
  {
    id: 'lola',
    name: 'Lola',
    codename: 'La cazadora de negocios',
    role: 'Especialista en Prospección',
    department: 'Prospección',
    responsibility: 'Encontrar nuevos negocios y potenciales clientes buscando en fuentes comerciales y analizando su presencia web inicial.',
    personality: 'Curiosa, sociable, inquieta y entusiasta.',
    quote: '¡Encontré otro que nos puede necesitar!',
    avatar: '/agents/lola.svg',
    status: 'operativo',
    color: '#ec4899',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-700/50',
    assignedTasks: [
      'Búsqueda de comercios por rubro y localidad',
      'Verificación preliminar de sitios web activos',
      'Detección de canales de contacto (WhatsApp, formularios)',
      'Preparación de prospectos para validación humana',
    ],
    skills: ['Google Places API (New)', 'Detección Web SSRF-Safe', 'Extracción de Metadatos', 'Deduplicación Comercial'],
  },
  {
    id: 'tito',
    name: 'Tito',
    codename: 'El inspector',
    role: 'Inspector de Auditoría Técnica',
    department: 'Auditoría técnica',
    responsibility: 'Analizar páginas web existentes, rendimiento (Core Web Vitals), optimización SEO, seguridad y experiencia en dispositivos móviles.',
    personality: 'Meticuloso, detallista y un poco gruñón.',
    quote: 'Esta página necesita pasar por el taller.',
    avatar: '/agents/tito.svg',
    status: 'proximamente',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-700/50',
    assignedTasks: [
      'Análisis de velocidad y Core Web Vitals',
      'Diagnóstico de fallas en visualización mobile',
      'Detección de errores SEO técnicos y meta etiquetas',
      'Generación de informes de problemas críticos',
    ],
    skills: ['Lighthouse', 'Análisis SEO', 'Mobile Usability', 'Performance Profiler'],
  },
  {
    id: 'vera',
    name: 'Vera',
    codename: 'La estratega',
    role: 'Estratega de Conversión y Ventas',
    department: 'Análisis comercial',
    responsibility: 'Interpretar los problemas técnicos y traducirlos en argumentos de negocio claros que demuestren las ventas que el cliente está perdiendo.',
    personality: 'Inteligente, analítica y pragmática.',
    quote: 'El problema no es la web, es lo que está dejando de vender.',
    avatar: '/agents/vera.svg',
    status: 'proximamente',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-700/50',
    assignedTasks: [
      'Traducción de diagnósticos a impacto financiero',
      'Segmentación de oportunidades según urgencia',
      'Estimación de retorno de inversión para el cliente',
      'Estrategias de diferenciación competitiva',
    ],
    skills: ['Análisis de Embudo', 'Estrategia Comercial', 'Benchmarking Local', 'Argumentación de Venta'],
  },
  {
    id: 'bruno',
    name: 'Bruno',
    codename: 'El creativo',
    role: 'Arquitecto de Experiencia y Diseño',
    department: 'Diseño y desarrollo',
    responsibility: 'Diseñar y construir sitios web ultrarrápidos, modernos y optimizados para convertir visitantes en clientes.',
    personality: 'Creativo, entusiasta y perfeccionista.',
    quote: 'Dame una idea y te la convierto en una web.',
    avatar: '/agents/bruno.svg',
    status: 'proximamente',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-700/50',
    assignedTasks: [
      'Generación de maquetas y prototipos modernos',
      'Desarrollo web responsive mobile-first',
      'Integración con botones de WhatsApp directo',
      'Estructuras de landing pages de alta conversión',
    ],
    skills: ['Next.js & Tailwind CSS', 'Diseño UI/UX', 'Componentes Modulares', 'Copywriting Visual'],
  },
  {
    id: 'cata',
    name: 'Cata',
    codename: 'La comercial',
    role: 'Ejecutiva de Cierres y Propuestas',
    department: 'Ventas',
    responsibility: 'Preparar propuestas comerciales personalizadas, organizar seguimientos estratégicos y gestionar las negociaciones del pipeline.',
    personality: 'Extrovertida, persuasiva y organizada.',
    quote: 'Bueno, ¿y a este cuándo le presentamos la propuesta?',
    avatar: '/agents/cata.svg',
    status: 'proximamente',
    color: '#06b6d4',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-700/50',
    assignedTasks: [
      'Redacción de propuestas personalizadas con IA',
      'Seguimiento automático de propuestas enviadas',
      'Organización de llamadas y reuniones clave',
      'Cierre de acuerdos y alta de proyectos',
    ],
    skills: ['Negociación Consultiva', 'Propuestas de Alto Impacto', 'Seguimiento Omnicanal', 'Gestión de Objeciones'],
  },
  {
    id: 'ramon',
    name: 'Ramón',
    codename: 'Control de calidad',
    role: 'Auditor General de Entregas',
    department: 'Calidad',
    responsibility: 'Revisar exhaustivamente cada sitio web antes de entregarlo al cliente: formularios funcionando, enlaces válidos, textos sin errores y carga rápida.',
    personality: 'Experimentado, cuidadoso y desconfiado.',
    quote: 'No sale de acá hasta que esté perfecto.',
    avatar: '/agents/ramon.svg',
    status: 'proximamente',
    color: '#38bdf8',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-700/50',
    assignedTasks: [
      'Testing de formularios de contacto y botones de WhatsApp',
      'Validación de enlaces rotos y compatibilidad entre navegadores',
      'Auditoría final de velocidad previa a entrega',
      'Checklist de entrega libre de fallas',
    ],
    skills: ['Quality Assurance (QA)', 'Cross-browser Testing', 'Validación Funcional', 'Criterio de Entrega'],
  },
];
