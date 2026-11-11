/**
 * WebPilot AI — Configuración Visual y Recursos Fotográficos por Rubro
 * Provee recursos visuales optimizados, paletas armónicas e imágenes temáticas
 * para que cada demo generada por Bruno tenga personalidad propia y composición profesional.
 */

export interface IndustryVisualConfig {
  id: string;
  categoryLabel: string;
  heroImage: {
    url: string;
    alt: string;
    badgeLabel: string;
  };
  aboutImage: {
    url: string;
    alt: string;
    experienceBadge: string;
  };
  serviceFallbackImages: string[];
  theme: {
    primaryColor: 'cyan' | 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber';
    accentText: string;
    accentBg: string;
    badge: string;
    heroGradient: string;
    heroAccentBlob: string;
    btnSecondary: string;
    iconBox: string;
    borderCard: string;
    tagBadge: string;
    dotColor: string;
    ringColor: string;
  };
  trustPills: {
    title: string;
    subtitle: string;
    iconType: 'location' | 'calendar' | 'shield' | 'clock' | 'sparkles';
  }[];
}

export const INDUSTRY_VISUALS: Record<string, IndustryVisualConfig> = {
  odontologia: {
    id: 'odontologia',
    categoryLabel: 'Consultorio Odontológico',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      alt: 'Consultorio odontológico moderno e iluminado con sillón dental de última tecnología',
      badgeLabel: 'Instalaciones Confortables • Tecnología Digital',
    },
    aboutImage: {
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
      alt: 'Atención odontológica personalizada y cercana en consultorio',
      experienceBadge: 'Atención Personalizada y Sin Dolor',
    },
    serviceFallbackImages: [
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    ],
    theme: {
      primaryColor: 'cyan',
      accentText: 'text-sky-700',
      accentBg: 'bg-sky-50 text-sky-800 border-sky-200',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      heroGradient: 'from-sky-50/80 via-white to-sky-50/30',
      heroAccentBlob: 'bg-sky-200/50',
      btnSecondary: 'bg-white hover:bg-sky-50/80 text-sky-800 border-sky-200 shadow-xs',
      iconBox: 'bg-sky-100/90 text-sky-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-sky-50 text-sky-700 border-sky-200',
      dotColor: 'bg-sky-600',
      ringColor: 'ring-sky-100',
    },
    trustPills: [
      {
        title: 'Atención Local',
        subtitle: 'Ubicación céntrica y accesible',
        iconType: 'location',
      },
      {
        title: 'Turnos con Cita Previa',
        subtitle: 'Puntualidad sin demoras',
        iconType: 'calendar',
      },
      {
        title: 'Tecnología y Confort',
        subtitle: 'Atención moderna y sin dolor',
        iconType: 'shield',
      },
    ],
  },
  veterinaria: {
    id: 'veterinaria',
    categoryLabel: 'Clínica Veterinaria',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80',
      alt: 'Médico veterinario atendiendo con calidez a una mascota en consultorio',
      badgeLabel: 'Cuidado Integral • Vocación y Compromiso',
    },
    aboutImage: {
      url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=80',
      alt: 'Instalaciones veterinarias equipadas y ambiente tranquilo',
      experienceBadge: 'Compromiso con el Bienestar Animal',
    },
    serviceFallbackImages: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    ],
    theme: {
      primaryColor: 'emerald',
      accentText: 'text-emerald-700',
      accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      heroGradient: 'from-emerald-50/80 via-white to-emerald-50/30',
      heroAccentBlob: 'bg-emerald-200/50',
      btnSecondary: 'bg-white hover:bg-emerald-50/80 text-emerald-800 border-emerald-200 shadow-xs',
      iconBox: 'bg-emerald-100/90 text-emerald-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-600',
      ringColor: 'ring-emerald-100',
    },
    trustPills: [
      {
        title: 'Atención Médica Veterinaria',
        subtitle: 'Diagnóstico y cuidado preventivo',
        iconType: 'shield',
      },
      {
        title: 'Turnos Coordinados',
        subtitle: 'Atención rápida por WhatsApp',
        iconType: 'calendar',
      },
      {
        title: 'Instalaciones Confortables',
        subtitle: 'Ambiente tranquilo para mascotas',
        iconType: 'sparkles',
      },
    ],
  },
  inmobiliaria: {
    id: 'inmobiliaria',
    categoryLabel: 'Servicios Inmobiliarios',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      alt: 'Propiedad moderna con arquitectura contemporánea y excelente luminosidad',
      badgeLabel: 'Asesoramiento Integral • Propiedades Seleccionadas',
    },
    aboutImage: {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      alt: 'Interiores amplios y luminosos de casas y departamentos',
      experienceBadge: 'Solidez y Trayectoria en la Zona',
    },
    serviceFallbackImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=800&q=80',
    ],
    theme: {
      primaryColor: 'blue',
      accentText: 'text-blue-700',
      accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      heroGradient: 'from-blue-50/80 via-white to-blue-50/30',
      heroAccentBlob: 'bg-blue-200/50',
      btnSecondary: 'bg-white hover:bg-blue-50/80 text-blue-800 border-blue-200 shadow-xs',
      iconBox: 'bg-blue-100/90 text-blue-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-600',
      ringColor: 'ring-blue-100',
    },
    trustPills: [
      {
        title: 'Tasaciones Precisas',
        subtitle: 'Valores reales de mercado',
        iconType: 'shield',
      },
      {
        title: 'Asesoramiento Personalizado',
        subtitle: 'Acompañamiento en cada paso',
        iconType: 'sparkles',
      },
      {
        title: 'Atención Directa',
        subtitle: 'Consultas inmediatas por WhatsApp',
        iconType: 'calendar',
      },
    ],
  },
  gastronomia: {
    id: 'gastronomia',
    categoryLabel: 'Gastronomía y Sabores',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ambiente cálido y acogedor de salón gastronómico',
      badgeLabel: 'Ingredientes Frescos • Experiencia Gastronómica',
    },
    aboutImage: {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      alt: 'Cocina artesanal y dedicación en cada preparación',
      experienceBadge: 'Sabor Auténtico y Tradición',
    },
    serviceFallbackImages: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    ],
    theme: {
      primaryColor: 'amber',
      accentText: 'text-amber-800',
      accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      heroGradient: 'from-amber-50/80 via-white to-amber-50/30',
      heroAccentBlob: 'bg-amber-200/50',
      btnSecondary: 'bg-white hover:bg-amber-50/80 text-amber-900 border-amber-200 shadow-xs',
      iconBox: 'bg-amber-100/90 text-amber-800',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-600',
      ringColor: 'ring-amber-100',
    },
    trustPills: [
      {
        title: 'Materia Prima Seleccionada',
        subtitle: 'Elaboración fresca del día',
        iconType: 'sparkles',
      },
      {
        title: 'Reservas por WhatsApp',
        subtitle: 'Coordinación directa de mesas',
        iconType: 'calendar',
      },
      {
        title: 'Atención Cálida',
        subtitle: 'Ambiente familiar y distendido',
        iconType: 'location',
      },
    ],
  },
  profesional: {
    id: 'profesional',
    categoryLabel: 'Estudio y Servicios Profesionales',
    heroImage: {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      alt: 'Oficina ejecutiva luminosa y moderna para reuniones de trabajo',
      badgeLabel: 'Solidez Técnica • Asesoramiento Estratégico',
    },
    aboutImage: {
      url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
      alt: 'Reunión de asesoramiento profesional y planificación',
      experienceBadge: 'Compromiso y Confidencialidad',
    },
    serviceFallbackImages: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    ],
    theme: {
      primaryColor: 'indigo',
      accentText: 'text-indigo-700',
      accentBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      heroGradient: 'from-indigo-50/80 via-white to-indigo-50/30',
      heroAccentBlob: 'bg-indigo-200/50',
      btnSecondary: 'bg-white hover:bg-indigo-50/80 text-indigo-800 border-indigo-200 shadow-xs',
      iconBox: 'bg-indigo-100/90 text-indigo-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotColor: 'bg-indigo-600',
      ringColor: 'ring-indigo-100',
    },
    trustPills: [
      {
        title: 'Asesoramiento Confiable',
        subtitle: 'Respaldo técnico en cada consulta',
        iconType: 'shield',
      },
      {
        title: 'Atención Personalizada',
        subtitle: 'Reuniones y consultas a medida',
        iconType: 'sparkles',
      },
      {
        title: 'Contacto Directo',
        subtitle: 'Canales ágiles de comunicación',
        iconType: 'calendar',
      },
    ],
  },
};

/**
 * Resuelve la configuración visual óptima según el rubro
 */
export function getIndustryVisuals(industry: string | null | undefined): IndustryVisualConfig {
  const ind = (industry || '').toLowerCase().trim();

  if (ind.includes('odontol') || ind.includes('dental') || ind.includes('diente') || ind.includes('sonrisa') || ind.includes('medic') || ind.includes('salud') || ind.includes('doctor')) {
    return INDUSTRY_VISUALS.odontologia;
  }
  if (ind.includes('veterinari') || ind.includes('mascot') || ind.includes('perro') || ind.includes('gato')) {
    return INDUSTRY_VISUALS.veterinaria;
  }
  if (ind.includes('inmobiliari') || ind.includes('propied') || ind.includes('inmueble') || ind.includes('real estate')) {
    return INDUSTRY_VISUALS.inmobiliaria;
  }
  if (ind.includes('gastronom') || ind.includes('restauran') || ind.includes('cafe') || ind.includes('bar') || ind.includes('comida') || ind.includes('pizzer')) {
    return INDUSTRY_VISUALS.gastronomia;
  }
  if (ind.includes('contab') || ind.includes('abogad') || ind.includes('estudio') || ind.includes('profesional') || ind.includes('legal') || ind.includes('escriban')) {
    return INDUSTRY_VISUALS.profesional;
  }

  // Por defecto utiliza la configuración profesional
  return INDUSTRY_VISUALS.odontologia;
}
