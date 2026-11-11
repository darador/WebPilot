export interface ServiceItem {
  id: string;
  name: string;
  category: 'DESARROLLO' | 'OPTIMIZACION' | 'SEO' | 'CONVERSION' | 'MANTENIMIENTO';
  description: string;
  suggestedPriceARS: number; // Precio de desarrollo inicial (pago único)
  suggestedPriceUSD: number;
  associatedMaintenanceARS?: number; // Cuota mensual de mantenimiento
  associatedMaintenanceUSD?: number;
  deliveryDays: string;
  isMonthly?: boolean;
  commitmentMonths?: number; // Por defecto 12 meses para planes con abono
  conditions: string;
}

export const DEFAULT_SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'landing-express',
    name: 'Landing Express (Volumen Comercial)',
    category: 'DESARROLLO',
    description: 'Landing page de una sola página de hasta 5 secciones. Diseño profesional responsive, botón directo a WhatsApp, Google Maps, datos de contacto, formulario básico de consultas y SEO básico.',
    suggestedPriceARS: 69000,
    suggestedPriceUSD: 60,
    associatedMaintenanceARS: 19000,
    associatedMaintenanceUSD: 16,
    deliveryDays: '3 a 5 días hábiles',
    commitmentMonths: 12,
    conditions: 'Una ronda de modificaciones. Contratación conjunta con abono de mantenimiento mensual ($19.000/mes, compromiso inicial 12 meses). Dominio se cotiza por separado.',
  },
  {
    id: 'landing-profesional',
    name: 'Landing Profesional Personalizada',
    category: 'DESARROLLO',
    description: 'Landing page personalizada de hasta 7 secciones. Diseño visual más elaborado, formulario de consultas, integración con WhatsApp y Google Maps, presentación detallada de servicios y SEO inicial.',
    suggestedPriceARS: 109000,
    suggestedPriceUSD: 95,
    associatedMaintenanceARS: 24000,
    associatedMaintenanceUSD: 20,
    deliveryDays: '5 a 7 días hábiles',
    commitmentMonths: 12,
    conditions: 'Dos rondas de modificaciones. Contratación conjunta con abono de mantenimiento mensual ($24.000/mes, compromiso inicial 12 meses).',
  },
  {
    id: 'sitio-institucional',
    name: 'Sitio Web Institucional Multipágina',
    category: 'DESARROLLO',
    description: 'Sitio web multipágina de hasta 5 páginas (Inicio, Servicios/Tratamientos, Nosotros/Equipo, Instalaciones y Contacto). Diseño responsive, formularios de contacto, integración con WhatsApp y SEO inicial.',
    suggestedPriceARS: 179000,
    suggestedPriceUSD: 150,
    associatedMaintenanceARS: 29000,
    associatedMaintenanceUSD: 25,
    deliveryDays: '7 a 12 días hábiles',
    commitmentMonths: 12,
    conditions: 'Para clínicas con múltiples profesionales o sedes. Contratación conjunta con abono de mantenimiento mensual ($29.000/mes, compromiso inicial 12 meses).',
  },
  {
    id: 'mantenimiento-express',
    name: 'Mantenimiento Mensual — Landing Express',
    category: 'MANTENIMIENTO',
    description: 'Hosting y publicación de la web, certificado SSL, supervisión de disponibilidad, copias de seguridad, actualizaciones técnicas, soporte ante fallas y hasta 30 minutos mensuales de cambios menores de contenido.',
    suggestedPriceARS: 19000,
    suggestedPriceUSD: 16,
    deliveryDays: 'Abono mensual continuo',
    isMonthly: true,
    commitmentMonths: 12,
    conditions: 'Compromiso inicial de 12 meses, luego renovación mensual. No incluye nuevas secciones, rediseños ni campañas.',
  },
  {
    id: 'mantenimiento-profesional',
    name: 'Mantenimiento Mensual — Landing Profesional',
    category: 'MANTENIMIENTO',
    description: 'Hosting optimizado, certificado SSL, backups semanales, monitorización continua, soporte prioritario ante incidentes y hasta 30 minutos mensuales de cambios menores de contenido.',
    suggestedPriceARS: 24000,
    suggestedPriceUSD: 20,
    deliveryDays: 'Abono mensual continuo',
    isMonthly: true,
    commitmentMonths: 12,
    conditions: 'Compromiso inicial de 12 meses, luego renovación mensual.',
  },
  {
    id: 'mantenimiento-institucional',
    name: 'Mantenimiento Mensual — Sitio Institucional',
    category: 'MANTENIMIENTO',
    description: 'Hosting multipágina de alta disponibilidad, certificado SSL, copias de seguridad continuas, soporte técnico y hasta 30 minutos mensuales de cambios menores de contenido.',
    suggestedPriceARS: 29000,
    suggestedPriceUSD: 25,
    deliveryDays: 'Abono mensual continuo',
    isMonthly: true,
    commitmentMonths: 12,
    conditions: 'Compromiso inicial de 12 meses, luego renovación mensual.',
  },
  {
    id: 'mantenimiento-mensual',
    name: 'Mantenimiento Mensual, Seguridad y Soporte Web',
    category: 'MANTENIMIENTO',
    description: 'Servicio continuo de tranquilidad: alojamiento de alta velocidad, renovación de certificado SSL, backups semanales y modificaciones menores de contenido.',
    suggestedPriceARS: 19000,
    suggestedPriceUSD: 16,
    deliveryDays: 'Mensual continuo',
    isMonthly: true,
    commitmentMonths: 12,
    conditions: 'Soporte prioritario por WhatsApp, monitorización 24/7 y hasta 30 minutos mensuales de modificaciones.',
  },
  {
    id: 'rediseno-web',
    name: 'Rediseño Web Responsive Mobile-First',
    category: 'DESARROLLO',
    description: 'Modernización total de un sitio web existente que quedó visualmente desactualizado o no se visualiza bien desde celulares.',
    suggestedPriceARS: 119000,
    suggestedPriceUSD: 100,
    associatedMaintenanceARS: 19000,
    associatedMaintenanceUSD: 16,
    deliveryDays: '5 a 7 días hábiles',
    commitmentMonths: 12,
    conditions: 'Conservación del contenido y dominio actual, migración a stack moderno, botón de WhatsApp directo y optimización mobile.',
  },
  {
    id: 'optimizacion-velocidad',
    name: 'Optimización de Velocidad y Carga (WPO)',
    category: 'OPTIMIZACION',
    description: 'Mejora integral del rendimiento técnico: compresión de código (Gzip/Brotli), optimización de imágenes, caché de servidor y CDN Cloudflare para respuesta inmediata.',
    suggestedPriceARS: 59000,
    suggestedPriceUSD: 50,
    deliveryDays: '2 a 4 días hábiles',
    conditions: 'Reducción comprobable en tiempos de carga y respuesta de servidor (TTFB) para evitar el rebote de visitantes móviles.',
  },
  {
    id: 'seo-local-maps',
    name: 'Posicionamiento SEO Local y Google Maps',
    category: 'SEO',
    description: 'Optimización de etiquetas clave (<title>, <meta description>, H1, textos alt) e integración con la ficha de Google Business Profile para liderar búsquedas locales.',
    suggestedPriceARS: 69000,
    suggestedPriceUSD: 60,
    deliveryDays: '3 a 5 días hábiles',
    conditions: 'Enfoque en búsquedas geográficas de la zona (ej: "odontólogos en Quilmes"), auditoría de palabras clave y optimización de indexación.',
  },
  {
    id: 'integracion-whatsapp',
    name: 'Canal Directo de WhatsApp y Botón Flotante',
    category: 'CONVERSION',
    description: 'Instalación de botón flotante animado de WhatsApp con mensajes preconfigurados de consulta y enlaces interactivos click-to-call para celulares.',
    suggestedPriceARS: 29000,
    suggestedPriceUSD: 25,
    deliveryDays: '1 a 2 días hábiles',
    conditions: 'Permite a los visitantes consultar con un solo toque desde su celular sin agendar el número manualmente.',
  },
  {
    id: 'formularios-turnos',
    name: 'Formulario Inteligente de Captación de Turnos / Consultas',
    category: 'CONVERSION',
    description: 'Formulario optimizado de 3 a 4 campos con validación en tiempo real y reenvío automático de avisos por email o WhatsApp.',
    suggestedPriceARS: 39000,
    suggestedPriceUSD: 35,
    deliveryDays: '2 a 3 días hábiles',
    conditions: 'Permite que el negocio no pierda pacientes fuera de su horario de atención comercial.',
  },
];

/**
 * Calcula la inversión total del primer año sumando el desarrollo inicial
 * más los 12 meses de abono de mantenimiento recurrente.
 */
export function calculateFirstYearTotal(devPriceARS: number, monthlyMaintenanceARS: number, months: number = 12): number {
  return devPriceARS + monthlyMaintenanceARS * months;
}
