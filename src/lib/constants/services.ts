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
    id: 'landing-page',
    name: 'Landing Page Profesional de Alta Conversión',
    category: 'DESARROLLO',
    description: 'Página web única moderna, ultra rápida y 100% responsive. Diseñada específicamente para captar pacientes o clientes y derivarlos a WhatsApp.',
    suggestedPriceARS: 180000,
    suggestedPriceUSD: 150,
    deliveryDays: '5 a 7 días',
    conditions: 'Incluye hosting base por 1 año, botón flotante de WhatsApp, formulario de contacto y certificado SSL.',
  },
  {
    id: 'sitio-institucional',
    name: 'Sitio Web Institucional Completo',
    category: 'DESARROLLO',
    description: 'Sitio web multipágina (Inicio, Especialidades/Servicios, Equipo Médico/Profesional, Instalaciones, Turnos y Contacto). Ideal para consultorios consolidados.',
    suggestedPriceARS: 320000,
    suggestedPriceUSD: 280,
    deliveryDays: '10 a 15 días',
    conditions: 'Hasta 6 secciones/páginas, optimización SEO on-page, mapas interactivos, integración de WhatsApp y formularios.',
  },
  {
    id: 'rediseno-web',
    name: 'Rediseño Web Responsive Mobile-First',
    category: 'DESARROLLO',
    description: 'Modernización total de un sitio web existente que quedó visualmente desactualizado o no se visualiza bien desde celulares.',
    suggestedPriceARS: 220000,
    suggestedPriceUSD: 190,
    deliveryDays: '7 a 10 días',
    conditions: 'Conservación del contenido y dominio actual, migración a stack moderno y optimización completa para dispositivos móviles.',
  },
  {
    id: 'optimizacion-velocidad',
    name: 'Optimización de Velocidad y Carga (WPO)',
    category: 'OPTIMIZACION',
    description: 'Mejora integral del rendimiento técnico: compresión de código (Gzip/Brotli), optimización de imágenes, caché de servidor y configuración de CDN Cloudflare.',
    suggestedPriceARS: 120000,
    suggestedPriceUSD: 100,
    deliveryDays: '3 a 5 días',
    conditions: 'Reducción comprobable en tiempos de carga y respuesta de servidor (TTFB) para evitar que los visitantes abandonen.',
  },
  {
    id: 'seo-local-maps',
    name: 'Posicionamiento SEO Local y Google Maps',
    category: 'SEO',
    description: 'Optimización de etiquetas clave (<title>, <meta description>, H1, textos alt) e integración con la ficha de Google Business Profile para liderar búsquedas locales.',
    suggestedPriceARS: 140000,
    suggestedPriceUSD: 120,
    deliveryDays: '5 días',
    conditions: 'Enfoque en búsquedas de zona geográfica (ej: "odontólogos en Quilmes"), auditoría de palabras clave locales y optimización de indexación.',
  },
  {
    id: 'integracion-whatsapp',
    name: 'Canal Directo de WhatsApp y Botón Flotante',
    category: 'CONVERSION',
    description: 'Instalación de botón flotante de WhatsApp animado en la web con mensajes preconfigurados de consulta y enlaces interactivos click-to-call para celulares.',
    suggestedPriceARS: 60000,
    suggestedPriceUSD: 50,
    deliveryDays: '1 a 2 días',
    conditions: 'Asegura que cualquier visitante móvil pueda consultar con un solo toque sin tener que agendar el número manualmente.',
  },
  {
    id: 'formularios-turnos',
    name: 'Formulario Inteligente de Captación de Turnos / Consultas',
    category: 'CONVERSION',
    description: 'Formulario optimizado de 3 a 4 campos con validación en tiempo real y reenvío automático de avisos por email o WhatsApp.',
    suggestedPriceARS: 80000,
    suggestedPriceUSD: 70,
    deliveryDays: '2 a 3 días',
    conditions: 'Permite que el negocio no pierda pacientes fuera de su horario de atención comercial.',
  },
  {
    id: 'mantenimiento-mensual',
    name: 'Mantenimiento Mensual, Seguridad y Soporte Web',
    category: 'MANTENIMIENTO',
    description: 'Servicio continuo de tranquilidad: alojamiento de alta velocidad, renovación de certificado SSL, backups semanales y cambios menores de contenido.',
    suggestedPriceARS: 45000,
    suggestedPriceUSD: 40,
    deliveryDays: 'Mensual continuo',
    isMonthly: true,
    conditions: 'Soporte prioritario por WhatsApp, monitorización 24/7 y hasta 2 horas mensuales de modificaciones de texto/imágenes.',
  },
];
