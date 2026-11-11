import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDemoByIdOrSlug } from '@/services/bruno.service';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Compass,
  Star,
  Award,
  ShieldCheck,
  Calendar,
  HeartHandshake,
  ArrowRight,
  UserCheck,
  Stethoscope,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Propuesta Conceptual Web • WebPilot AI',
  description: 'Muestra preliminar de presencia y diseño web desarrollada por el agente Bruno.',
  robots: {
    index: false,
    follow: false,
  },
};

interface DemoPageProps {
  params: { slug: string };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const demo = await getDemoByIdOrSlug(params.slug);

  if (!demo) {
    notFound();
  }

  const { content } = demo;
  const themeColor = content.theme?.primaryColor || 'cyan';
  const ind = (content.industry || '').toLowerCase();
  const isDental = ind.includes('odontol') || ind.includes('dental') || ind.includes('medic') || ind.includes('salud');
  const isPet = ind.includes('veterinari') || ind.includes('mascot');

  // Sistema de Diseño Luminoso y Profesional por Rubro (Light Theme)
  const colorMap = {
    cyan: {
      accentText: 'text-sky-700',
      accentBg: 'bg-sky-50 text-sky-800 border-sky-200',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      heroGradient: 'from-sky-50/80 via-white to-sky-50/30',
      heroAccentBlob: 'bg-sky-200/40',
      btnSecondary: 'bg-white hover:bg-sky-50/80 text-sky-800 border-sky-200',
      iconBox: 'bg-sky-100/80 text-sky-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-sky-50 text-sky-700 border-sky-200',
      dotColor: 'bg-sky-600',
    },
    blue: {
      accentText: 'text-blue-700',
      accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      heroGradient: 'from-blue-50/80 via-white to-blue-50/30',
      heroAccentBlob: 'bg-blue-200/40',
      btnSecondary: 'bg-white hover:bg-blue-50/80 text-blue-800 border-blue-200',
      iconBox: 'bg-blue-100/80 text-blue-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-600',
    },
    emerald: {
      accentText: 'text-emerald-700',
      accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      heroGradient: 'from-emerald-50/80 via-white to-emerald-50/30',
      heroAccentBlob: 'bg-emerald-200/40',
      btnSecondary: 'bg-white hover:bg-emerald-50/80 text-emerald-800 border-emerald-200',
      iconBox: 'bg-emerald-100/80 text-emerald-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-600',
    },
    indigo: {
      accentText: 'text-indigo-700',
      accentBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      heroGradient: 'from-indigo-50/80 via-white to-indigo-50/30',
      heroAccentBlob: 'bg-indigo-200/40',
      btnSecondary: 'bg-white hover:bg-indigo-50/80 text-indigo-800 border-indigo-200',
      iconBox: 'bg-indigo-100/80 text-indigo-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotColor: 'bg-indigo-600',
    },
    purple: {
      accentText: 'text-purple-700',
      accentBg: 'bg-purple-50 text-purple-800 border-purple-200',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      heroGradient: 'from-purple-50/80 via-white to-purple-50/30',
      heroAccentBlob: 'bg-purple-200/40',
      btnSecondary: 'bg-white hover:bg-purple-50/80 text-purple-800 border-purple-200',
      iconBox: 'bg-purple-100/80 text-purple-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-purple-50 text-purple-700 border-purple-200',
      dotColor: 'bg-purple-600',
    },
    amber: {
      accentText: 'text-amber-800',
      accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      heroGradient: 'from-amber-50/80 via-white to-amber-50/30',
      heroAccentBlob: 'bg-amber-200/40',
      btnSecondary: 'bg-white hover:bg-amber-50/80 text-amber-900 border-amber-200',
      iconBox: 'bg-amber-100/80 text-amber-800',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-600',
    },
    teal: {
      accentText: 'text-teal-700',
      accentBg: 'bg-teal-50 text-teal-800 border-teal-200',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      heroGradient: 'from-teal-50/80 via-white to-teal-50/30',
      heroAccentBlob: 'bg-teal-200/40',
      btnSecondary: 'bg-white hover:bg-teal-50/80 text-teal-800 border-teal-200',
      iconBox: 'bg-teal-100/80 text-teal-700',
      borderCard: 'border-slate-200/90',
      tagBadge: 'bg-teal-50 text-teal-700 border-teal-200',
      dotColor: 'bg-teal-600',
    },
  }[themeColor] || {
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-50 text-sky-800 border-sky-200',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    heroGradient: 'from-sky-50/80 via-white to-sky-50/30',
    heroAccentBlob: 'bg-sky-200/40',
    btnSecondary: 'bg-white hover:bg-sky-50/80 text-sky-800 border-sky-200',
    iconBox: 'bg-sky-100/80 text-sky-700',
    borderCard: 'border-slate-200/90',
    tagBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    dotColor: 'bg-sky-600',
  };

  // WhatsApp Link oficial
  const whatsappPhone = content.contact.whatsappPhone || content.contact.phone || null;
  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        content.contact.whatsappMessage || `¡Hola! Me comunico desde la web de ${content.businessName} para consultar por turnos e información.`
      )}`
    : null;

  // Detección del nombre profesional para humanizar la presentación
  const matchDr = content.businessName.match(/(Dra?\.\s+[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i);
  const professionalName = content.about?.professionalName || (matchDr ? matchDr[1].trim() : content.businessName);

  // Fallbacks de About si es una demo generada anteriormente
  const aboutData = content.about || {
    heading: isDental ? 'Sobre el Consultorio' : isPet ? 'Sobre la Veterinaria' : 'Sobre Nosotros',
    title: isDental
      ? 'Atención odontológica de confianza, calidez y calidad humana'
      : isPet
      ? 'Dedicación absoluta por el bienestar de los animales'
      : 'Compromiso profesional y atención de excelencia',
    professionalName,
    role: isDental ? 'Especialista en Odontología Integral' : isPet ? 'Médico Veterinario' : 'Equipo Profesional',
    description: isDental
      ? `En ${content.businessName} nos dedicamos a cuidar tu salud bucal con un trato cercano, empático y libre de dolor. Combinamos tecnología moderna e instalaciones confortables para que te sientas seguro y a gusto en cada consulta.`
      : `En ${content.businessName} priorizamos la cercanía, la excelencia y la confianza para brindarte un servicio transparente y a la altura de tus expectativas.`,
    highlights: isDental
      ? [
          'Diagnóstico integral y sin dolor con equipamiento moderno',
          'Atención personalizada para niños, jóvenes y adultos',
          'Puntualidad en los turnos para cuidar tu tiempo',
        ]
      : [
          'Atención personalizada orientada a resultados',
          'Tecnología y métodos actualizados',
          'Canales ágiles de contacto directo vía WhatsApp',
        ],
  };

  // Fallbacks de Testimonios
  const testimonialsData = content.testimonials || (isDental
    ? [
        {
          patientName: 'Mariana G.',
          comment: `Excelente atención de ${professionalName}. Me explicó todo el tratamiento con muchísima paciencia y no sentí ningún dolor. ¡Súper recomendable en ${content.contact.city || 'Quilmes'}!`,
          stars: 5,
          treatment: 'Odontología Integral',
        },
        {
          patientName: 'Lucas B.',
          comment: 'El consultorio es súper limpio, luminoso y moderno. Puntualidad en los turnos y excelente predisposición por WhatsApp.',
          stars: 5,
          treatment: 'Estética y Limpieza',
        },
        {
          patientName: 'Florencia R.',
          comment: 'Muy conforme con la calidez del equipo. Te transmiten tranquilidad desde el momento en que entrás.',
          stars: 5,
          treatment: 'Atención Personalizada',
        },
      ]
    : [
        {
          patientName: 'Carlos M.',
          comment: 'Gran profesionalismo y calidez. Destaco la rapidez para responder y la claridad en todo momento.',
          stars: 5,
          treatment: 'Atención General',
        },
        {
          patientName: 'Valeria S.',
          comment: 'Muy recomendable. El servicio superó mis expectativas y los canales de comunicación son impecables.',
          stars: 5,
          treatment: 'Servicio Personalizado',
        },
        {
          patientName: 'Martín P.',
          comment: 'Excelente experiencia. Cumplieron con los tiempos y el trato fue de primer nivel.',
          stars: 5,
          treatment: 'Atención Profesional',
        },
      ]);

  // Fallbacks de Preguntas Frecuentes
  const faqsData = content.faqs || (isDental
    ? [
        {
          question: '¿Cómo solicito un turno o primera consulta?',
          answer: 'Podés hacer clic en cualquiera de los botones de WhatsApp de la página o llamarnos. Te responderemos a la brevedad con los días y horarios disponibles.',
        },
        {
          question: '¿Atienden urgencias o dolores agudos?',
          answer: 'Sí. Si tenés una urgencia o dolor imprevisto, envianos un mensaje por WhatsApp detallando tu molestia para darte prioridad de atención en el día.',
        },
        {
          question: '¿Qué medios de pago aceptan?',
          answer: 'Aceptamos transferencias bancarias, tarjetas de débito/crédito y efectivo. Consultanos por opciones de financiación para tratamientos integrales.',
        },
      ]
    : [
        {
          question: '¿Cómo puedo coordinar una consulta?',
          answer: 'Escribinos directamente por WhatsApp o comunicate a nuestros teléfonos de contacto para agendar tu cita.',
        },
        {
          question: '¿Cuáles son los horarios de atención?',
          answer: `Atendemos de lunes a viernes en horarios comerciales y coordinamos turnos con cita previa en ${content.contact.city || 'nuestra sede'}.`,
        },
        {
          question: '¿Qué formas de pago reciben?',
          answer: 'Recibimos transferencias bancarias, tarjetas de débito/crédito y efectivo.',
        },
      ]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. BANNER OBLIGATORIO DE PROPUESTA CONCEPTUAL (DISCRETO Y PROFESIONAL) */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-300 px-4 py-2 text-xs shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Muestra Conceptual
            </span>
            <span className="font-medium text-white">
              Propuesta no oficial • Diseñada por WebPilot AI para {content.businessName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Diseñada por Bruno</span>
            <span className="hidden md:inline">•</span>
            <span>Sin valor contractual</span>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR MODERNA Y LUMINOSA */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-[33px] sm:top-[33px] z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${colorMap.iconBox}`}>
              {isDental ? <Stethoscope className="h-5 w-5" /> : <Award className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 block leading-tight">
                {content.businessName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                {content.tagline}
              </span>
            </div>
          </div>

          {/* Menú de Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#especialidades" className="hover:text-slate-900 transition-colors">
              Especialidades
            </a>
            <a href="#sobre-nosotros" className="hover:text-slate-900 transition-colors">
              Sobre Nosotros
            </a>
            <a href="#ventajas" className="hover:text-slate-900 transition-colors">
              Por Qué Elegirnos
            </a>
            <a href="#testimonios" className="hover:text-slate-900 transition-colors">
              Opiniones
            </a>
            <a href="#contacto" className="hover:text-slate-900 transition-colors">
              Ubicación
            </a>
          </nav>

          {/* Botón WhatsApp Destacado */}
          <div className="flex items-center gap-2.5">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span className="hidden sm:inline">WhatsApp Directo</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            ) : content.contact.phone ? (
              <a
                href={`tel:${content.contact.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
              >
                <Phone className="h-4 w-4" />
                <span>{content.contact.phone}</span>
              </a>
            ) : (
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
              >
                <span>Contacto</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (LUMINOSO, ACOGEDOR Y PROFESIONAL) */}
      <section className={`relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b ${colorMap.heroGradient} border-b border-slate-100`}>
        {/* Mancha decorativa suave de fondo */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 pointer-events-none ${colorMap.heroAccentBlob}`} />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-6">
            {content.hero.badgeText && (
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${colorMap.badge}`}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{content.hero.badgeText}</span>
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              {content.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              {content.hero.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                >
                  <MessageCircle className="h-5 w-5 fill-white" />
                  <span>{content.hero.ctaPrimary.label || 'Consultar por WhatsApp'}</span>
                </a>
              ) : (
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md"
                >
                  <span>{content.hero.ctaPrimary.label || 'Contactar ahora'}</span>
                </a>
              )}

              {content.hero.ctaSecondary && (
                <a
                  href={content.hero.ctaSecondary.action || '#especialidades'}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all border shadow-xs ${colorMap.btnSecondary}`}
                >
                  <span>{content.hero.ctaSecondary.label || 'Ver Especialidades'}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Píldoras de Confianza Inmediata */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/70">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs">
                <div className="flex text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 block leading-tight">4.9 / 5.0</span>
                  <span className="text-[10px] text-slate-500">Google Reviews</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block leading-tight">Turnos Puntuales</span>
                  <span className="text-[10px] text-slate-500">Sin demoras en sala</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs">
                <HeartHandshake className="h-4 w-4 text-sky-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block leading-tight">Atención Cálida</span>
                  <span className="text-[10px] text-slate-500">En {content.contact.city || 'Quilmes'}</span>
                </div>
              </div>
            </div>

            {/* Benchmark notice */}
            {content.benchmarkNotice && (
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                <Compass className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                <span>{content.benchmarkNotice}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN SOBRE NOSOTROS / PROFESIONAL (HUMANIZA LA ATENCIÓN) */}
      <section id="sobre-nosotros" className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Tarjeta Visual de Presentación */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-8 bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200/80 shadow-md text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-md border-2 border-sky-200 flex items-center justify-center text-sky-700">
                  <UserCheck className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {aboutData.professionalName}
                  </h3>
                  <p className="text-xs font-bold text-sky-700 mt-0.5">
                    {aboutData.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Atención dedicada en {content.contact.city || 'Quilmes'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-around text-xs text-slate-600">
                  <div>
                    <span className="font-extrabold text-slate-900 block text-sm">+10</span>
                    <span className="text-[10px] text-slate-500">Años de Exp.</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="font-extrabold text-slate-900 block text-sm">100%</span>
                    <span className="text-[10px] text-slate-500">Dedicación</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="font-extrabold text-slate-900 block text-sm">5 ★</span>
                    <span className="text-[10px] text-slate-500">Opiniones</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto y Valores */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accentText}`}>
                  {aboutData.heading}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {aboutData.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {aboutData.description}
              </p>

              <div className="space-y-3 pt-2">
                {aboutData.highlights?.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">{h}</span>
                  </div>
                ))}
              </div>

              {whatsappLink && (
                <div className="pt-2">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <span>Coordinar una primera consulta con {aboutData.professionalName}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. ESPECIALIDADES Y TRATAMIENTOS (TARJETAS BLANCAS LUMINOSAS) */}
      <section id="especialidades" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accentText}`}>
              Especialidades y Atención
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {content.services.heading}
            </h2>
            {content.services.subheading && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {content.services.subheading}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.services.items.map((srv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-mono text-xs font-bold ${colorMap.iconBox}`}>
                      0{idx + 1}
                    </span>
                    {srv.isProvisional && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Sugerido
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {whatsappLink && (
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={`${whatsappLink}&text=${encodeURIComponent(
                        `Hola, me comunico desde la web para consultar por el servicio de: ${srv.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 transition-colors group-hover:underline"
                    >
                      <span>Consultar tratamiento</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VALORES Y BENEFICIOS (POR QUÉ ELEGIRNOS) */}
      <section id="ventajas" className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accentText}`}>
              Nuestro Compromiso
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {content.features.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.features.items.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. OPINIONES DE PACIENTES / CLIENTES (SOCIAL PROOF) */}
      <section id="testimonios" className="py-16 sm:py-20 bg-gradient-to-b from-sky-50/40 via-white to-slate-50/40 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accentText}`}>
              Experiencias Reales
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Lo que destacan quienes nos eligen
            </h2>
            <p className="text-sm text-slate-600">
              La opinión y tranquilidad de nuestros pacientes es nuestro principal compromiso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.stars || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{t.patientName}</span>
                    {t.treatment && (
                      <span className="text-[10px] text-slate-500 block">{t.treatment}</span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PREGUNTAS FRECUENTES (FAQS) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${colorMap.accentText}`}>
              Resolvé tus Dudas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqsData.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-all space-y-2"
              >
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {faq.question}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACTO Y UBICACIÓN EN GOOGLE MAPS */}
      <section id="contacto" className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Datos de contacto */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accentText}`}>
                  Coordinación de Turnos y Consultas
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {content.contact.heading}
                </h2>
                <p className="text-sm text-slate-600">
                  Escribinos directamente para consultar disponibilidad de horarios o despejar cualquier duda antes de tu visita.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 hover:bg-emerald-100/70 transition-all shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MessageCircle className="h-5 w-5 fill-white" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 block">WhatsApp de Atención Rápida</span>
                      <span className="text-xs text-emerald-800 font-medium">
                        {content.contact.whatsappPhone || content.contact.phone} • Click para enviar mensaje directo
                      </span>
                    </div>
                  </a>
                )}

                {content.contact.phone && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Teléfono</span>
                      <span className="text-slate-900 font-bold text-sm">{content.contact.phone}</span>
                    </div>
                  </div>
                )}

                {content.contact.email && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Correo Electrónico</span>
                      <span className="text-slate-900 font-bold text-sm">{content.contact.email}</span>
                    </div>
                  </div>
                )}

                {content.contact.address && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Dirección</span>
                      <span className="text-slate-900 font-bold text-sm">{content.contact.address}</span>
                      {content.contact.city && (
                        <span className="text-slate-500 text-xs block">{content.contact.city}</span>
                      )}
                    </div>
                  </div>
                )}

                {content.contact.hours && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Horario de Atención</span>
                      <span className="text-slate-900 font-bold text-sm">{content.contact.hours}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mockup de Google Maps Visual */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>Ubicación en Google Maps</span>
                </span>
                {content.contact.city && (
                  <span className="text-xs font-bold text-slate-700">{content.contact.city}</span>
                )}
              </div>

              <div className="h-56 rounded-2xl bg-gradient-to-br from-slate-100 via-sky-50/50 to-slate-200/70 border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-red-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{content.businessName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {content.contact.address || content.contact.city || 'Atención en la zona'}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    content.contact.mapQuery || content.businessName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {content.provisionalFlags && content.provisionalFlags.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[10px] uppercase">
                    <AlertCircle className="h-3 w-3" />
                    <span>Notas de la Propuesta</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-900/90">
                    {content.provisionalFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP */}
      {whatsappLink && (
        <aside aria-label="Contacto rápido" className="fixed bottom-6 right-6 z-50">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-xs group"
            title="Consultar directamente por WhatsApp"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            <span className="hidden sm:inline">¿Tenés dudas? Escribinos</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </aside>
      )}

      {/* 11. FOOTER ELEGANTE */}
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <span className="font-extrabold text-base text-white block">{content.businessName}</span>
            <p className="text-[11px] text-slate-400">
              Propuesta conceptual de presencia web • Preparada por el equipo de WebPilot AI
            </p>
          </div>

          <div className="text-[11px] text-slate-500">
            Diseñada por Agente Bruno • WebPilot AI © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
