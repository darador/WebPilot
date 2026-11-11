export interface ServiceItem {
  id: string;
  name: string;
  category: 'DESARROLLO' | 'OPTIMIZACION' | 'SEO' | 'CONVERSION' | 'MANTENIMIENTO';
  description: string;
  suggestedPriceARS: number;
  suggestedPriceUSD: number;
  deliveryDays: string;
  isMonthly?: boolean;
  conditions: string;
}

export const DEFAULT_SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'landing-express',
    name: 'Landing Express (Volumen Comercial)',
    category: 'DESARROLLO',
    description: 'Landing page de una sola página de hasta 5 secciones. Diseño profesional y adaptable a celulares, botón directo a WhatsApp, datos de contacto, ubicación e integración con Google Maps, y SEO básico.',
    suggestedPriceARS: 99000,
    suggestedPriceUSD: 85,
    deliveryDays: '3 a 5 días hábiles',
    conditions: 'Incluye 1 ronda de modificaciones. Orientado a consultorios, profesionales y pequeños comercios para rápida captación de clientes.',
  },
  {
    id: 'landing-profesional',
    name: 'Landing Profesional Personalizada',
    category: 'DESARROLLO',
    description: 'Landing page personalizada de hasta 7 secciones. Diseño visual más elaborado, formulario de consultas, integración con Google Maps y WhatsApp, presentación detallada de servicios y SEO inicial.',
    suggestedPriceARS: 149000,
    suggestedPriceUSD: 125,
    deliveryDays: '5 a 7 días hábiles',
    conditions: 'Incluye 2 rondas de modificaciones. Ideal para consultorios o comercios que necesitan presentar especialidades y equipo médico en detalle.',
  },
  {
    id: 'sitio-institucional',
    name: 'Sitio Web Institucional Multipágina',
    category: 'DESARROLLO',
    description: 'Sitio web multipágina de hasta 5 páginas (Inicio, Servicios/Tratamientos, Nosotros/Equipo y Contacto). Diseño responsive, formularios de contacto, integración con WhatsApp y SEO inicial.',
    suggestedPriceARS: 249000,
    suggestedPriceUSD: 210,
    deliveryDays: '7 a 12 días hábiles',
    conditions: 'Para clínicas con múltiples profesionales, policonsultorios o áreas que requieran páginas independientes estructuradas.',
  },
  {
    id: 'rediseno-web',
    name: 'Rediseño Web Responsive Mobile-First',
    category: 'DESARROLLO',
    description: 'Modernización total de un sitio web existente que quedó visualmente desactualizado o no se visualiza bien desde celulares.',
    suggestedPriceARS: 139000,
    suggestedPriceUSD: 115,
    deliveryDays: '5 a 7 días hábiles',
    conditions: 'Conservación del contenido y dominio actual, migración a stack moderno, botón de WhatsApp directo y optimización mobile.',
  },
  {
    id: 'optimizacion-velocidad',
    name: 'Optimización de Velocidad y Carga (WPO)',
    category: 'OPTIMIZACION',
    description: 'Mejora integral del rendimiento técnico: compresión de código (Gzip/Brotli), optimización de imágenes, caché de servidor y CDN Cloudflare para respuesta inmediata.',
    suggestedPriceARS: 79000,
    suggestedPriceUSD: 65,
    deliveryDays: '2 a 4 días hábiles',
    conditions: 'Reducción comprobable en tiempos de carga y respuesta de servidor (TTFB) para evitar el rebote de visitantes móviles.',
  },
  {
    id: 'seo-local-maps',
    name: 'Posicionamiento SEO Local y Google Maps',
    category: 'SEO',
    description: 'Optimización de etiquetas clave (<title>, <meta description>, H1, textos alt) e integración con la ficha de Google Business Profile para liderar búsquedas locales.',
    suggestedPriceARS: 89000,
    suggestedPriceUSD: 75,
    deliveryDays: '3 a 5 días hábiles',
    conditions: 'Enfoque en búsquedas geográficas de la zona (ej: "odontólogos en Quilmes"), auditoría de palabras clave y optimización de indexación.',
  },
  {
    id: 'integracion-whatsapp',
    name: 'Canal Directo de WhatsApp y Botón Flotante',
    category: 'CONVERSION',
    description: 'Instalación de botón flotante animado de WhatsApp con mensajes preconfigurados de consulta y enlaces interactivos click-to-call para celulares.',
    suggestedPriceARS: 39000,
    suggestedPriceUSD: 35,
    deliveryDays: '1 a 2 días hábiles',
    conditions: 'Permite a los visitantes consultar con un solo toque desde su celular sin agendar el número manualmente.',
  },
  {
    id: 'formularios-turnos',
    name: 'Formulario Inteligente de Captación de Turnos / Consultas',
    category: 'CONVERSION',
    description: 'Formulario optimizado de 3 a 4 campos con validación en tiempo real y reenvío automático de avisos por email o WhatsApp.',
    suggestedPriceARS: 49000,
    suggestedPriceUSD: 40,
    deliveryDays: '2 a 3 días hábiles',
    conditions: 'Permite que el negocio no pierda pacientes fuera de su horario de atención comercial.',
  },
  {
    id: 'mantenimiento-mensual',
    name: 'Mantenimiento Mensual, Seguridad y Soporte Web',
    category: 'MANTENIMIENTO',
    description: 'Servicio continuo de tranquilidad: alojamiento de alta velocidad, renovación de certificado SSL, backups semanales y modificaciones menores de contenido.',
    suggestedPriceARS: 29000,
    suggestedPriceUSD: 25,
    deliveryDays: 'Mensual continuo',
    isMonthly: true,
    conditions: 'Soporte prioritario por WhatsApp, monitorización 24/7 y hasta 2 horas mensuales de modificaciones de texto/imágenes.',
  },
];
