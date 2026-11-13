import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDemoByIdOrSlug } from '@/services/bruno.service';
import { getIndustryVisuals } from '@/lib/constants/industryVisuals';
import { DentalMasterTemplate } from '@/components/templates/dental/DentalMasterTemplate';
import { DentalModernTemplate } from '@/components/templates/dental/DentalModernTemplate';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Compass,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  Check,
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
  searchParams?: { v?: string; variant?: string };
}

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const demo = await getDemoByIdOrSlug(params.slug);

  if (!demo) {
    notFound();
  }

  const { content } = demo;
  const visuals = getIndustryVisuals(content.industry);
  const theme = visuals.theme;

  const ind = (content.industry || '').toLowerCase();
  const isDental =
    ind.includes('odontol') ||
    ind.includes('dental') ||
    ind.includes('diente') ||
    ind.includes('sonrisa') ||
    (content.businessName || '').toLowerCase().includes('di paolo');

  // Si es rubro odontológico, soportar Versión A (Editorial) y Versión B (Moderna con Manrope)
  if (isDental) {
    const isVariantB = searchParams?.v === 'b' || searchParams?.variant === 'b';
    if (isVariantB) {
      return <DentalModernTemplate demo={demo} currentVariant="b" />;
    }
    return <DentalMasterTemplate demo={demo} currentVariant="a" />;
  }

  const isPet = ind.includes('veterinari') || ind.includes('mascot');

  // WhatsApp Link oficial y verificado
  const whatsappPhone = content.contact.whatsappPhone || content.contact.phone || null;
  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        content.contact.whatsappMessage || `¡Hola! Me comunico desde la web de ${content.businessName} para consultar por turnos e información.`
      )}`
    : null;

  // Detección del nombre profesional para humanizar la presentación
  const matchDr = content.businessName.match(/(Dra?\.\s+[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i);
  const professionalName = content.about?.professionalName || (matchDr ? matchDr[1].trim() : content.businessName);

  // Titular y subtítulo adaptados con la fórmula del benchmark
  const heroTitle =
    isDental && (!content.hero.title || content.hero.title.includes('lo que más te importa') || content.hero.title.includes('tecnología'))
      ? 'Atención odontológica integral y cuidado de tu salud bucal'
      : content.hero.title;

  const heroSubtitle =
    isDental && (!content.hero.subtitle || content.hero.subtitle.includes('nuestros tratamientos y servicios') || content.hero.subtitle.includes('turnos puntuales'))
      ? `Consultorio odontológico en ${content.contact.city || 'Quilmes'}. Atención personalizada para niños, jóvenes y adultos con turnos programados y contacto directo por WhatsApp.`
      : content.hero.subtitle;

  // Presentación del consultorio / profesional
  const aboutData = {
    heading: content.about?.heading || (isDental ? 'Sobre el Consultorio' : isPet ? 'Sobre la Veterinaria' : 'Sobre Nosotros'),
    title: content.about?.title || (isDental
      ? 'Atención odontológica cercana y profesional en Quilmes'
      : isPet
      ? 'Dedicación absoluta por el bienestar de los animales'
      : 'Compromiso profesional y atención de excelencia'),
    professionalName,
    role: content.about?.role || (isDental ? 'Especialista en Odontología Integral' : isPet ? 'Médico Veterinario' : 'Equipo Profesional'),
    imageUrl: visuals.aboutImage.url,
    description: (isDental || content.about?.description?.includes('libre de dolor') || content.about?.description?.includes('tecnología de última generación'))
      ? `En ${content.businessName} nos dedicamos al cuidado integral de la salud bucal. Nos enfocamos en ofrecer un trato cercano, explicaciones claras sobre cada tratamiento y un ambiente confortable en cada consulta.`
      : content.about?.description || `En ${content.businessName} priorizamos la cercanía, la excelencia y la confianza para brindarte un servicio transparente y a la altura de tus expectativas.`,
    highlights: isDental
      ? [
          'Atención odontológica para niños, jóvenes y adultos',
          'Consultas y tratamientos planificados según cada necesidad',
          'Atención con cita previa para organizar mejor tu visita',
        ]
      : (content.about?.highlights || [
          'Atención personalizada orientada a resultados',
          'Métodos de atención actualizados',
          'Canales ágiles de contacto directo vía WhatsApp',
        ]),
  };

  // Preguntas frecuentes operativas y verídicas
  const faqsData = content.faqs && content.faqs.length > 0 ? content.faqs : (isDental
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
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 font-sans antialiased selection:bg-[#128C7E] selection:text-white">
      {/* 1. BANNER OBLIGATORIO DE PROPUESTA CONCEPTUAL (DISCRETO Y PROFESIONAL) */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-300 px-4 py-2 text-xs shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Muestra Conceptual
            </span>
            <span className="font-medium text-white">
              Propuesta no oficial • Preparada por WebPilot AI para {content.businessName}
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
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-[33px] sm:top-[33px] z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${theme.iconBox}`}>
              {isDental ? <Stethoscope className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[#0c2340] block leading-tight">
                {content.businessName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                {content.tagline}
              </span>
            </div>
          </div>

          {/* Menú de Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#especialidades" className="hover:text-[#0c2340] transition-colors">
              Especialidades
            </a>
            <a href="#sobre-nosotros" className="hover:text-[#0c2340] transition-colors">
              Sobre Nosotros
            </a>
            <a href="#ventajas" className="hover:text-[#0c2340] transition-colors">
              Instalaciones y Confort
            </a>
            <a href="#faqs" className="hover:text-[#0c2340] transition-colors">
              Preguntas Frecuentes
            </a>
            <a href="#contacto" className="hover:text-[#0c2340] transition-colors">
              Ubicación
            </a>
          </nav>

          {/* Botón WhatsApp Destacado (Verde Business Maduro, No Chillón) */}
          <div className="flex items-center gap-2.5">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#128C7E] hover:bg-[#0e7064] transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#0c2340] hover:bg-[#123156] transition-all shadow-sm"
              >
                <span>Contacto</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (RECUADRO EDITORIAL LUMINOSO) */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-3 sm:pt-8 sm:pb-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Mancha decorativa suave de fondo dentro del recuadro */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full blur-3xl opacity-20 pointer-events-none bg-sky-100" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Columna Izquierda: Mensaje, Titular y Acciones */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-2xs bg-sky-50 text-[#0c2340] border-sky-200/80">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                <span>{visuals.categoryLabel} • {content.contact.city || 'Atención Local'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0c2340] tracking-tight leading-[1.14]">
                {heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                {heroSubtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#128C7E] hover:bg-[#0e7064] transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5 fill-white" />
                    <span>{content.hero.ctaPrimary.label || 'Consultar por WhatsApp'}</span>
                  </a>
                ) : (
                  <a
                    href="#contacto"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0c2340] hover:bg-[#123156] transition-all shadow-sm"
                  >
                    <span>{content.hero.ctaPrimary.label || 'Contactar ahora'}</span>
                  </a>
                )}

                {content.hero.ctaSecondary && (
                  <a
                    href={content.hero.ctaSecondary.action || '#especialidades'}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all bg-white hover:bg-slate-50 text-[#0c2340] border border-slate-300 shadow-2xs"
                  >
                    <span>{content.hero.ctaSecondary.label || 'Ver Especialidades'}</span>
                    <ArrowRight className="h-4 w-4 text-sky-700" />
                  </a>
                )}
              </div>

              {/* Píldoras de Confianza Operativa Verídica */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80">
                {visuals.trustPills.map((pill, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc] border border-slate-200/80 shadow-2xs">
                    {pill.iconType === 'location' ? (
                      <MapPin className="h-4 w-4 text-sky-700 shrink-0" />
                    ) : pill.iconType === 'calendar' ? (
                      <Calendar className="h-4 w-4 text-sky-700 shrink-0" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-sky-700 shrink-0" />
                    )}
                    <div className="text-xs">
                      <span className="font-bold text-[#0c2340] block leading-tight">{pill.title}</span>
                      <span className="text-[10px] text-slate-500">{content.contact.city ? `${pill.subtitle}` : pill.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Fotografía Protagonista en Marco Moderno */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-slate-50 bg-slate-100">
                <img
                  src={content.hero.imageUrl || visuals.heroImage.url}
                  alt={visuals.heroImage.alt}
                  className="w-full h-[360px] sm:h-[420px] object-cover hover:scale-102 transition-transform duration-700"
                  loading="eager"
                  decoding="async"
                />

                {/* Tarjeta flotante inferior sobre la imagen (Refinada y clínica) */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0 border border-sky-200/70">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0c2340] block">
                      {visuals.heroImage.badgeLabel}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Atención con cita previa en {content.contact.city || 'Quilmes'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark notice */}
          {content.benchmarkNotice && (
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <Compass className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>{content.benchmarkNotice}</span>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECCIÓN SOBRE NOSOTROS / PRESENTACIÓN PROFESIONAL (RECUADRO EDITORIAL) */}
      <section id="sobre-nosotros" className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Fotografía de las Instalaciones del Consultorio (Sin personas ficticias) */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-slate-50 bg-slate-100">
                <img
                  src={aboutData.imageUrl}
                  alt={visuals.aboutImage.alt}
                  className="w-full h-[340px] sm:h-[380px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Pie de foto institucional */}
              <div className="mt-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 text-center">
                <span className="text-xs font-bold text-[#0c2340] block">
                  {aboutData.professionalName}
                </span>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Atención profesional en consultorio • Quilmes
                </span>
              </div>
            </div>

            {/* Texto de Presentación y Pilares */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
                  {aboutData.heading}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
                  {aboutData.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {aboutData.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {aboutData.highlights?.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-slate-200/70">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
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
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#128C7E] hover:text-[#0e7064] group transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-[#128C7E] fill-[#128C7E]" />
                    <span className="group-hover:underline">Coordinar una primera consulta en el consultorio</span>
                    <ArrowRight className="h-3.5 w-3.5 text-sky-700 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. ESPECIALIDADES Y TRATAMIENTOS (RECUADRO EDITORIAL) */}
      <section id="especialidades" className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
              Especialidades Odontológicas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              {content.services.heading}
            </h2>
            {content.services.subheading && (
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {content.services.subheading}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.services.items.map((srv, idx) => {
              const serviceImg = srv.imageUrl || visuals.serviceFallbackImages[idx % visuals.serviceFallbackImages.length];

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-white hover:border-sky-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-2xs"
                >
                  {/* Fotografía temática del servicio */}
                  <div className="h-44 w-full overflow-hidden relative bg-slate-100">
                    <img
                      src={serviceImg}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/70 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-xs">
                      0{idx + 1}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-[#0c2340] leading-snug group-hover:text-sky-700 transition-colors">
                          {srv.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {srv.description}
                      </p>
                    </div>

                    {whatsappLink && (
                      <div className="pt-3 border-t border-slate-200/70">
                        <a
                          href={`${whatsappLink}&text=${encodeURIComponent(
                            `Hola, me comunico desde la web para consultar por el tratamiento de: ${srv.title}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#128C7E] transition-colors group-hover:underline"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-[#128C7E] fill-[#128C7E]" />
                          <span>Consultar por este tratamiento</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. INSTALACIONES Y CONFORT (RECUADRO EDITORIAL) */}
      <section id="ventajas" className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
              Criterio de Atención y Espacio
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Instalaciones y Cuidado del Paciente
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cuidamos cada detalle para que tu experiencia en el consultorio sea clara, ordenada y confortable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {content.features.items.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:bg-white hover:shadow-md transition-all space-y-3.5 shadow-2xs"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold bg-sky-50 text-sky-800 border border-sky-200/70">
                  {idx === 0 ? <ShieldCheck className="h-5 w-5" /> : idx === 1 ? <Sparkles className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                </div>
                <h3 className="text-base font-bold text-[#0c2340]">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PREGUNTAS FRECUENTES (RECUADRO EDITORIAL) */}
      <section id="faqs" className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme.accentText}`}>
              Resolvé tus Dudas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqsData.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] shadow-2xs hover:border-sky-200 transition-all space-y-2"
              >
                <h4 className="text-sm sm:text-base font-bold text-[#0c2340]">
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

      {/* 8. CONTACTO Y UBICACIÓN EN GOOGLE MAPS (RECUADRO EDITORIAL) */}
      <section id="contacto" className="max-w-6xl mx-auto px-4 pt-3 pb-12 sm:pt-4 sm:pb-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Datos de contacto */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
                  Coordinación de Turnos y Consultas
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
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
                    className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/90 text-slate-900 hover:border-[#128C7E] hover:shadow-xs transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MessageCircle className="h-5 w-5 fill-white" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-[#0c2340] block">WhatsApp de Atención Rápida</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {content.contact.whatsappPhone || content.contact.phone} • Click para enviar mensaje directo
                      </span>
                    </div>
                  </a>
                )}

                {content.contact.phone && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                    <div className="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Teléfono</span>
                      <span className="text-slate-900 font-bold text-sm">{content.contact.phone}</span>
                    </div>
                  </div>
                )}

                {content.contact.email && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                    <div className="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Correo Electrónico</span>
                      <span className="text-slate-900 font-bold text-sm">{content.contact.email}</span>
                    </div>
                  </div>
                )}

                {content.contact.address && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                    <div className="w-9 h-9 rounded-xl bg-white text-sky-600 flex items-center justify-center shrink-0 border border-slate-200">
                      <MapPin className="h-4 w-4" />
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
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                    <div className="w-9 h-9 rounded-xl bg-white text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                      <Clock className="h-4 w-4" />
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
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>Ubicación en Google Maps</span>
                </span>
                {content.contact.city && (
                  <span className="text-xs font-bold text-slate-700">{content.contact.city}</span>
                )}
              </div>

              <div className="h-60 rounded-2xl bg-gradient-to-br from-white via-sky-50 to-slate-100 border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden shadow-2xs">
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

      {/* 9. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP */}
      {whatsappLink && (
        <aside aria-label="Contacto rápido" className="fixed bottom-6 right-6 z-50">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#128C7E] hover:bg-[#0e7064] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-xs group"
            title="Consultar directamente por WhatsApp"
          >
            <MessageCircle className="h-5 w-5 fill-white" />
            <span className="hidden sm:inline">¿Tenés dudas? Escribinos</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </aside>
      )}

      {/* 10. FOOTER ELEGANTE */}
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
