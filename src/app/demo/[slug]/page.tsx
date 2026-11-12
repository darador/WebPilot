import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDemoByIdOrSlug } from '@/services/bruno.service';
import { getIndustryVisuals } from '@/lib/constants/industryVisuals';
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
}

export default async function DemoPage({ params }: DemoPageProps) {
  const demo = await getDemoByIdOrSlug(params.slug);

  if (!demo) {
    notFound();
  }

  const { content } = demo;
  const visuals = getIndustryVisuals(content.industry);
  const theme = visuals.theme;

  const ind = (content.industry || '').toLowerCase();
  const isDental = ind.includes('odontol') || ind.includes('dental') || ind.includes('medic') || ind.includes('salud');
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
    isDental && (!content.hero.title || content.hero.title.includes('lo que más te importa'))
      ? 'Cuidamos tu sonrisa con atención personalizada y tecnología de avanzada'
      : content.hero.title;

  const heroSubtitle =
    isDental && (!content.hero.subtitle || content.hero.subtitle.includes('nuestros tratamientos y servicios'))
      ? `Atención odontológica integral en ${content.contact.city || 'Quilmes'}. Tratamientos modernos, confort y turnos puntuales para vos y tu familia.`
      : content.hero.subtitle;

  // Presentación del consultorio / profesional
  const aboutData = {
    heading: content.about?.heading || (isDental ? 'Sobre el Consultorio' : isPet ? 'Sobre la Veterinaria' : 'Sobre Nosotros'),
    title: content.about?.title || (isDental
      ? 'Atención odontológica de confianza, calidez y calidad humana'
      : isPet
      ? 'Dedicación absoluta por el bienestar de los animales'
      : 'Compromiso profesional y atención de excelencia'),
    professionalName,
    role: content.about?.role || (isDental ? 'Especialista en Odontología Integral' : isPet ? 'Médico Veterinario' : 'Equipo Profesional'),
    imageUrl: content.about?.imageUrl || visuals.aboutImage.url,
    description: content.about?.description || (isDental
      ? `En ${content.businessName} nos dedicamos a cuidar tu salud bucal con un trato cercano, empático y libre de dolor. Combinamos tecnología moderna e instalaciones confortables para que te sientas seguro y a gusto en cada consulta.`
      : `En ${content.businessName} priorizamos la cercanía, la excelencia y la confianza para brindarte un servicio transparente y a la altura de tus expectativas.`),
    highlights: content.about?.highlights || (isDental
      ? [
          'Diagnóstico integral y sin dolor con equipamiento moderno',
          'Atención personalizada para niños, jóvenes y adultos',
          'Puntualidad en los turnos para cuidar tu tiempo',
        ]
      : [
          'Atención personalizada orientada a resultados',
          'Tecnología y métodos actualizados',
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
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-[#25D366] selection:text-white">
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
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-[33px] sm:top-[33px] z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${theme.iconBox}`}>
              {isDental ? <Stethoscope className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
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
              Instalaciones y Confort
            </a>
            <a href="#faqs" className="hover:text-slate-900 transition-colors">
              Preguntas Frecuentes
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

      {/* 3. HERO SECTION CON FOTOGRAFÍA PROTAGONISTA Y COMPOSICIÓN EDITORIAL */}
      <section className={`relative overflow-hidden py-12 sm:py-20 lg:py-24 bg-gradient-to-b ${theme.heroGradient} border-b border-slate-100`}>
        {/* Mancha decorativa suave de fondo */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 pointer-events-none ${theme.heroAccentBlob}`} />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Columna Izquierda: Mensaje, Titular y Acciones */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-2xs bg-white text-slate-800 border-slate-200">
                <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} />
                <span>{visuals.categoryLabel} • {content.contact.city || 'Atención Local'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
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
                    className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all border ${theme.btnSecondary}`}
                  >
                    <span>{content.hero.ctaSecondary.label || 'Ver Especialidades'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Píldoras de Confianza Operativa Verídica (Sin datos inventados) */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80">
                {visuals.trustPills.map((pill, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs">
                    {pill.iconType === 'location' ? (
                      <MapPin className="h-4 w-4 text-sky-600 shrink-0" />
                    ) : pill.iconType === 'calendar' ? (
                      <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                    )}
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block leading-tight">{pill.title}</span>
                      <span className="text-[10px] text-slate-500">{content.contact.city ? `${pill.subtitle}` : pill.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Fotografía Protagonista en Marco Moderno */}
            <div className="lg:col-span-5 relative">
              {/* Marco decorativo posterior */}
              <div className={`absolute -inset-2 rounded-3xl opacity-60 blur-xs transform rotate-1 ${theme.heroAccentBlob}`} />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src={content.hero.imageUrl || visuals.heroImage.url}
                  alt={visuals.heroImage.alt}
                  className="w-full h-[380px] sm:h-[440px] object-cover hover:scale-102 transition-transform duration-700"
                  loading="eager"
                  decoding="async"
                />

                {/* Tarjeta flotante inferior sobre la imagen */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
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
            <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-500">
              <Compass className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>{content.benchmarkNotice}</span>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECCIÓN SOBRE NOSOTROS / PRESENTACIÓN PROFESIONAL */}
      <section id="sobre-nosotros" className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Fotografía de la Clínica / Consultorio */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-slate-50 bg-slate-100">
                <img
                  src={aboutData.imageUrl}
                  alt={visuals.aboutImage.alt}
                  className="w-full h-[360px] sm:h-[400px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Badge flotante inferior */}
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-extrabold text-slate-900 block">
                  {aboutData.professionalName}
                </span>
                <span className="text-[11px] font-semibold text-sky-700 block">
                  {aboutData.role}
                </span>
              </div>
            </div>

            {/* Texto de Presentación y Pilares */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
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
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
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
                    <span>Coordinar una primera consulta en el consultorio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. ESPECIALIDADES Y TRATAMIENTOS (TARJETAS CON RECURSOS VISUALES FOTOGRÁFICOS) */}
      <section id="especialidades" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.services.items.map((srv, idx) => {
              const serviceImg = srv.imageUrl || visuals.serviceFallbackImages[idx % visuals.serviceFallbackImages.length];

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xs"
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
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs">
                      0{idx + 1}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                          {srv.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {srv.description}
                      </p>
                    </div>

                    {whatsappLink && (
                      <div className="pt-3 border-t border-slate-100">
                        <a
                          href={`${whatsappLink}&text=${encodeURIComponent(
                            `Hola, me comunico desde la web para consultar por el tratamiento de: ${srv.title}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors group-hover:underline"
                        >
                          <MessageCircle className="h-3.5 w-3.5 fill-emerald-600 text-white" />
                          <span>Consultar por WhatsApp</span>
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

      {/* 6. INSTALACIONES Y CONFORT (VALORES REALES) */}
      <section id="ventajas" className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
              Instalaciones y Confort
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {content.features.heading}
            </h2>
            <p className="text-sm text-slate-600">
              Cuidamos cada detalle de tu experiencia para que te sientas cómodo, seguro y bien atendido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.features.items.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${theme.iconBox}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PREGUNTAS FRECUENTES (FAQS PRÁCTICAS) */}
      <section id="faqs" className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme.accentText}`}>
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
                className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-all space-y-2"
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

      {/* 8. CONTACTO Y UBICACIÓN EN GOOGLE MAPS */}
      <section id="contacto" className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Datos de contacto */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${theme.accentText}`}>
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
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-xs group"
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
