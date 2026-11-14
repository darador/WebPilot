'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Stethoscope,
  CheckCircle2,
  Check,
  Star,
  Compass,
} from 'lucide-react';
import { ClientDemo } from '@/types/database.types';

interface DentalModernTemplateProps {
  demo: ClientDemo;
  currentVariant?: 'a' | 'b';
}

/**
 * VERSIÓN B — Plantilla Maestra Odontología Contemporánea (Optimizada con Modern Web Guidance)
 * Tipografía principal: Manrope (limpia, moderna, excelente legibilidad)
 * Estética: Clínica dental contemporánea, profesional, cálida e higiénica
 * Paleta: Fondo crema cálido (#FAF9F6), Ciruela/Malva (#5B2148), tonos tierra suaves (#4A3B36 / #6E5D57)
 * Estándares Modern Web Guidance aplicados:
 *  - optimize-image-priority: Hero LCP fetchpriority="high", dimensiones intrínsecas (width/height), aspect-ratio explícito y loading="lazy" below-the-fold.
 *  - card: Elementos semánticos <article>, container queries (@container), hit areas protegidas y targets táctiles de mínimo 44×44px.
 *  - navbar: Navegación accesible (<nav aria-label>), toggle móvil con aria-expanded/aria-controls, blancos táctiles accesibles.
 *  - accessibility: WCAG 2.1 AA (contraste > 4.5:1), focus-visible ring en todos los elementos interactivos.
 *  - performance: [text-wrap:balance] en titulares y [text-wrap:pretty] en párrafos para evitar líneas huérfanas.
 */
export function DentalModernTemplate({ demo, currentVariant = 'b' }: DentalModernTemplateProps) {
  const { content } = demo;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Normalización y extracción de datos
  const rawBusinessName = content.businessName || 'Consultorio Odontológico';
  const matchDr = rawBusinessName.match(/(Dra?\.\s+[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i);
  const professionalName =
    content.about?.professionalName || (matchDr ? matchDr[1].trim() : rawBusinessName);

  // Nombre de marca destacado
  const brandName = rawBusinessName.replace(/(Dra?\.\s+[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i, '').trim() || rawBusinessName;
  const brandSubtitle = matchDr ? matchDr[1].trim() : 'Odontología Integral';

  const city = content.contact?.city || 'Quilmes';
  const address = content.contact?.address || `${city}, Buenos Aires`;
  const hours = content.contact?.hours || 'Lunes a Viernes de 09:00 a 19:00 hs (Con cita previa)';
  const phone = content.contact?.phone || null;

  // WhatsApp verificado
  const whatsappPhone = content.contact?.whatsappPhone || phone || '5491112345678';
  const whatsappClean = whatsappPhone.replace(/[^0-9]/g, '');
  const whatsappMessage =
    content.contact?.whatsappMessage ||
    `¡Hola! Me comunico desde el sitio web de ${rawBusinessName} para consultar por turnos y tratamientos odontológicos.`;
  const whatsappLink = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappMessage)}`;

  // Fotografías de alta resolución seleccionadas específicamente para odontología
  const photos = {
    hero:
      content.hero?.imageUrl ||
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85',
    consultorio:
      'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=85',
    instalacion1:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=85',
    instalacion2:
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1000&q=85',
    tratamientos: [
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=85', // Prevención y diagnóstico
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85', // Estética y blanqueamiento
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=900&q=85', // Ortodoncia y alineación
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85', // Implantes y prótesis
    ],
  };

  // Especialidades con textos odontológicos verificados
  const treatments = [
    {
      title: 'Odontología General y Prevención',
      description:
        'Diagnóstico integral, limpiezas profundas y control periódico para preservar la salud de piezas dentales y encías en niños, jóvenes y adultos.',
      badge: 'Cuidado Integral',
      image: photos.tratamientos[0],
    },
    {
      title: 'Estética Dental y Armonización',
      description:
        'Procedimientos conservadores orientados a mejorar la luminosidad, forma y armonía natural de tu sonrisa mediante blanqueamiento y carillas.',
      badge: 'Estética',
      image: photos.tratamientos[1],
    },
    {
      title: 'Ortodoncia y Alineación',
      description:
        'Corrección de la posición dental y de la oclusión mediante técnicas modernas y adaptadas a las necesidades y comodidad de cada paciente.',
      badge: 'Alineación',
      image: photos.tratamientos[2],
    },
    {
      title: 'Implantes y Rehabilitación Oral',
      description:
        'Recuperación funcional y estética de piezas ausentes para devolver la seguridad, confort y eficacia al masticar y sonreír.',
      badge: 'Rehabilitación',
      image: photos.tratamientos[3],
    },
  ];

  // Preguntas frecuentes
  const faqs = [
    {
      question: '¿Cómo coordino mi primera consulta o turno?',
      answer:
        'Podés hacer clic en el botón "Solicitar Turno" o escribirnos directamente a nuestro WhatsApp oficial. Te responderemos a la brevedad con los días y horarios disponibles para atenderte con dedicación.',
    },
    {
      question: '¿Atienden situaciones de urgencia o dolor agudo?',
      answer:
        'Sí. Si presentás una molestia o dolor imprevisto, envianos un mensaje detallando tu situación para evaluar la disponibilidad de atención prioritaria en el consultorio.',
    },
    {
      question: '¿Qué medios de pago están disponibles?',
      answer:
        'Aceptamos transferencias bancarias, tarjetas de débito/crédito y pagos en efectivo. Para tratamientos integrales, coordinamos planes adaptados a cada paciente.',
    },
    {
      question: '¿Atienden a niños y adolescentes?',
      answer:
        'Sí, brindamos atención para toda la familia, promoviendo el cuidado preventivo y una relación cercana con el consultorio desde las primeras etapas.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#241C22] font-manrope antialiased selection:bg-[#5B2148] selection:text-white">
      {/* 1. TOP BAR INSTITUCIONAL CON SELECTOR DE VARIANTE A / B */}
      <aside aria-label="Aviso de muestra conceptual" className="bg-[#1C151B] text-[#E8DDD7] text-xs py-2 px-4 border-b border-[#2C212B] sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#C49A8F] text-[#241C22]">
              Muestra Conceptual
            </span>
            <span className="font-medium text-[#E8DDD7] text-xs">
              Propuesta web diseñada para {rawBusinessName}
            </span>
          </div>

          {/* SELECTOR COMPARATIVO VERSIÓN A / VERSIÓN B */}
          <div className="flex items-center gap-1.5 bg-[#2C212B] p-0.5 rounded-lg border border-[#3E2E3C] text-[11px]">
            <span className="text-stone-400 px-2 py-0.5 text-[10px] uppercase font-semibold">
              Comparar:
            </span>
            <Link
              href={`/demo/${demo.slug}?v=a`}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                currentVariant === 'a'
                  ? 'bg-[#5B2148] text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
              title="Versión A: Estilo editorial clásico con tipografía serif"
            >
              Versión A (Editorial)
            </Link>
            <Link
              href={`/demo/${demo.slug}?v=b`}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                currentVariant === 'b'
                  ? 'bg-[#5B2148] text-white shadow-xs ring-1 ring-[#C49A8F]/40'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
              title="Versión B: Estilo contemporáneo con Manrope"
            >
              Versión B (Moderna)
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. SUB-BARRA DE CONTACTO RÁPIDO */}
      <div className="bg-[#F4EFEB] text-[#4A3B36] text-xs py-2 px-4 border-b border-[#E8DFD7]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 min-h-[36px]">
              <MapPin className="h-3.5 w-3.5 text-[#5B2148] shrink-0" aria-hidden="true" />
              <span className="font-medium text-[#4A3B36]">{address}</span>
            </div>
            <span className="hidden sm:inline text-stone-300" aria-hidden="true">•</span>
            <div className="hidden sm:flex items-center gap-1.5 min-h-[36px]">
              <Clock className="h-3.5 w-3.5 text-[#5B2148] shrink-0" aria-hidden="true" />
              <span className="font-medium text-[#4A3B36]">{hours}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="hover:text-[#241C22] transition-colors flex items-center gap-1.5 font-medium min-h-[44px] px-1.5 rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
                aria-label={`Llamar al consultorio: ${phone}`}
              >
                <Phone className="h-3.5 w-3.5 text-[#5B2148]" aria-hidden="true" />
                <span>{phone}</span>
              </a>
            )}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0e6f64] hover:text-[#094d45] font-bold flex items-center gap-1.5 transition-colors min-h-[44px] px-1.5 rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0e6f64]"
              aria-label="Abrir chat de WhatsApp para consulta de turnos"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-[#0e6f64] text-white" aria-hidden="true" />
              <span>WhatsApp de Consulta</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. ENCABEZADO PRINCIPAL (NAVBAR CONTEMPORÁNEA ACCESIBLE) */}
      <header className="bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 sticky top-[37px] sm:top-[33px] z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          {/* Logotipo / Nombre Comercial Tipográfico en Manrope */}
          <a
            href="#"
            className="flex flex-col group rounded-lg p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            aria-label={`${brandName} - ${brandSubtitle}`}
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#241C22] group-hover:text-[#5B2148] transition-colors leading-tight">
              {brandName}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6E5D57] mt-0.5">
              {brandSubtitle}
            </span>
          </a>

          {/* Navegación Desktop Limpia con Landmark Semántico y Focus Visible */}
          <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1 text-[13px] font-semibold text-stone-700">
            <a
              href="#filosofia"
              className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:text-[#5B2148] hover:bg-stone-100/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            >
              Nuestra Atención
            </a>
            <a
              href="#tratamientos"
              className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:text-[#5B2148] hover:bg-stone-100/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            >
              Tratamientos
            </a>
            <a
              href="#profesional"
              className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:text-[#5B2148] hover:bg-stone-100/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            >
              El Consultorio
            </a>
            <a
              href="#instalaciones"
              className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:text-[#5B2148] hover:bg-stone-100/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            >
              Instalaciones
            </a>
            <a
              href="#faqs"
              className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:text-[#5B2148] hover:bg-stone-100/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            >
              Preguntas
            </a>
            <a
              href="#contacto"
              className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:text-[#5B2148] hover:bg-stone-100/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            >
              Ubicación
            </a>
          </nav>

          {/* Botón Principal Solicitar Turno con Blanco Táctil Adecuado */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide text-white bg-[#5B2148] hover:bg-[#471838] transition-all shadow-sm hover:shadow hover:scale-[1.01] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148] focus-visible:ring-offset-2"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Solicitar Turno</span>
            </a>
          </div>

          {/* Botón Menú Móvil Accesible (Min 44x44px con ARIA completo) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-xl text-stone-700 hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación principal' : 'Abrir menú de navegación principal'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Menú Móvil Desplegable Accesible con Touch Targets >= 44px */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            className="lg:hidden bg-[#FAF9F6] border-b border-stone-200 px-4 py-5 shadow-lg space-y-4 animate-in slide-in-from-top duration-200"
          >
            <nav aria-label="Navegación móvil" className="flex flex-col gap-1 text-sm font-semibold text-stone-700">
              <a
                href="#filosofia"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-3 py-2 rounded-lg hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
              >
                Nuestra Atención
              </a>
              <a
                href="#tratamientos"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-3 py-2 rounded-lg hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
              >
                Tratamientos
              </a>
              <a
                href="#profesional"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-3 py-2 rounded-lg hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
              >
                El Consultorio
              </a>
              <a
                href="#instalaciones"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-3 py-2 rounded-lg hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
              >
                Instalaciones y Confort
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-3 py-2 rounded-lg hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
              >
                Preguntas Frecuentes
              </a>
              <a
                href="#contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center px-3 py-2 rounded-lg hover:text-[#5B2148] hover:bg-stone-100 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
              >
                Ubicación y Contacto
              </a>
            </nav>

            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2.5">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-white bg-[#5B2148] hover:bg-[#471838] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148] focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Solicitar Turno por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 4. HERO SECTION CONTEMPORÁNEO (MANROPE + CLÍNICA MODERNA - OPTIMIZADO LCP) */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Halo de luz sutil en fondo */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#EAE0D7]/40 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-[#EADBD0]/30 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Columna Izquierda: Mensaje y Acciones */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge de Confianza Moderno con Contraste WCAG AA */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3ECE6] border border-[#E4D7CE] text-xs font-bold text-[#5B2148] shadow-2xs">
                <span className="flex items-center text-amber-700 text-xs tracking-tighter" aria-label="Calificación 5 estrellas">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" aria-hidden="true" />
                </span>
                <span className="text-stone-400" aria-hidden="true">•</span>
                <span className="font-semibold text-[#4A3B36]">Atención Odontológica en {city}</span>
              </div>

              {/* Título Principal en Manrope con [text-wrap:balance] para evitar palabras huérfanas */}
              <h1 className="font-manrope text-[26px] sm:text-[34px] lg:text-[41px] font-bold text-[#241C22] tracking-tight leading-[1.32] sm:leading-[1.34] lg:leading-[1.36] [text-wrap:balance] max-w-[540px] mb-5">
                Odontología integral con dedicación, respeto y calidez humana
              </h1>

              {/* Subtítulo Descriptivo con [text-wrap:pretty] y Contraste Optimizado */}
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal max-w-lg [text-wrap:pretty]">
                Un espacio pensado para escucharte y cuidar tu salud bucal con trato cercano. Atención personalizada para niños, jóvenes y adultos con turnos programados con cita previa.
              </p>

              {/* Acciones de Contacto con Blancos Táctiles Accesibles (Min 44x44px) */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#5B2148] hover:bg-[#471838] transition-all shadow-sm hover:shadow-md hover:scale-[1.01] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148] focus-visible:ring-offset-2"
                >
                  <span>Solicitar Turno</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <a
                  href="#tratamientos"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#5B2148] border border-stone-300 hover:border-[#5B2148]/50 bg-white hover:bg-[#FAF4F0] transition-colors shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148] focus-visible:ring-offset-2"
                >
                  <span>Conocer Tratamientos</span>
                </a>
              </div>

              {/* Garantías Operativas Reales en Artículos Semánticos */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-200">
                <article className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-[#5B2148]" aria-hidden="true" />
                    <h3 className="text-xs font-bold text-[#241C22]">Ubicación Local</h3>
                  </div>
                  <p className="text-[11px] text-[#4A3B36] font-medium">{city}, Buenos Aires</p>
                </article>

                <article className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-[#5B2148]" aria-hidden="true" />
                    <h3 className="text-xs font-bold text-[#241C22]">Atención Dedicada</h3>
                  </div>
                  <p className="text-[11px] text-[#4A3B36] font-medium">Turnos con cita previa</p>
                </article>

                <article className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="h-3.5 w-3.5 text-[#0e6f64]" aria-hidden="true" />
                    <h3 className="text-xs font-bold text-[#241C22]">Canal Directo</h3>
                  </div>
                  <p className="text-[11px] text-[#4A3B36] font-medium">Respuesta vía WhatsApp</p>
                </article>
              </div>
            </div>

            {/* Columna Derecha: Imagen Protagonista LCP con Prioridad Alta y Dimensiones Explícitas */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-stone-200 bg-white aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src={photos.hero}
                  alt={`Instalaciones del consultorio odontológico ${rawBusinessName}`}
                  width={1400}
                  height={960}
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-700"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />

                {/* Tarjeta Flotante Contemporánea */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-md border border-stone-200/90 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#241C22] block">
                      {rawBusinessName}
                    </span>
                    <span className="text-[11px] text-[#4A3B36] block mt-0.5 font-medium">
                      Atención odontológica integral en {city}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F3ECE6] text-[#5B2148] shrink-0 border border-[#E4D7CE]">
                    Cita Previa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NUESTRA ATENCIÓN (FORMA DE TRABAJAR) */}
      <section id="filosofia" className="py-16 sm:py-20 bg-[#F4EFEB] border-t border-b border-[#E8DFD7]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Encabezado con Balance Tipográfico */}
          <div className="max-w-3xl space-y-2.5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5B2148] font-bold block">
              Forma de Trabajar
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight leading-tight [text-wrap:balance]">
              Una atención fundada en la escucha, la honestidad y el respeto por tus tiempos
            </h2>
            <p className="text-stone-700 text-sm sm:text-base font-normal pt-1 [text-wrap:pretty]">
              Creemos en la odontología basada en la confianza y en explicar cada procedimiento con absoluta claridad antes de comenzar.
            </p>
          </div>

          {/* 3 Columnas Modernas con Iconografía Limpia y Artículos Semánticos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-2">
            <article className="space-y-3 bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] font-bold text-sm flex items-center justify-center" aria-hidden="true">
                01
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#241C22] [text-wrap:balance]">
                Escucha y Diagnóstico Integral
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal [text-wrap:pretty]">
                Nos tomamos el tiempo para conocer tu historia, responder a tus inquietudes y evaluar tu salud bucal con una mirada preventiva y global.
              </p>
            </article>

            <article className="space-y-3 bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] font-bold text-sm flex items-center justify-center" aria-hidden="true">
                02
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#241C22] [text-wrap:balance]">
                Tratamientos Claros y Sin Dolor
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal [text-wrap:pretty]">
                Priorizamos tu confort y bienestar en cada consulta, utilizando técnicas cuidadosas y consensuando cada etapa del plan de tratamiento.
              </p>
            </article>

            <article className="space-y-3 bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] font-bold text-sm flex items-center justify-center" aria-hidden="true">
                03
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#241C22] [text-wrap:balance]">
                Turnos Puntuales y Cita Previa
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal [text-wrap:pretty]">
                Organizamos la agenda con tiempo exclusivo para cada paciente, minimizando tiempos de espera en la sala y respetando tu día.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 6. TRATAMIENTOS (CUADRÍCULA CONTEMPORÁNEA - ESTÁNDAR CARD MODERN WEB GUIDANCE) */}
      <section id="tratamientos" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Título de la Sección */}
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5B2148] font-bold block">
              Especialidades
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight [text-wrap:balance]">
              Cuidado integral para cada etapa de tu vida
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed font-normal [text-wrap:pretty]">
              Tratamientos planificados con criterio conservador, materiales certificados y atención personalizada en {city}.
            </p>
          </div>

          {/* Cuadrícula de 4 Especialidades con Tarjetas Semánticas <article> y Container Queries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {treatments.map((t, idx) => (
              <article
                key={idx}
                className="@container bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-[#5B2148]/30 transition-all flex flex-col group focus-within:ring-2 focus-within:ring-[#5B2148]"
              >
                {/* Fotografía de la especialidad con dimensiones explícitas para evitar CLS */}
                <div className="h-60 sm:h-64 w-full overflow-hidden relative bg-stone-100 aspect-[16/10]">
                  <img
                    src={t.image}
                    alt={t.title}
                    width={900}
                    height={560}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                  />
                  <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-[#5B2148] shadow-2xs border border-stone-200/80 uppercase tracking-wider">
                    {t.badge}
                  </div>
                </div>

                {/* Contenido de la Especialidad */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#241C22] group-hover:text-[#5B2148] transition-colors leading-snug [text-wrap:balance]">
                      {t.title}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal [text-wrap:pretty]">
                      {t.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <a
                      href={`${whatsappLink}&text=${encodeURIComponent(
                        `Hola, me comunico desde la web para consultar información sobre el tratamiento de: ${t.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold text-[#5B2148] hover:text-[#3E1430] transition-colors p-1 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
                      aria-label={`Consultar por WhatsApp sobre tratamiento: ${t.title}`}
                    >
                      <MessageCircle className="h-4 w-4 text-[#0e6f64] fill-[#0e6f64] shrink-0" aria-hidden="true" />
                      <span>Consultar por este tratamiento</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SOBRE LA PROFESIONAL Y EL CONSULTORIO */}
      <section id="profesional" className="py-16 sm:py-20 lg:py-24 bg-[#F4EFEB] border-t border-b border-[#E8DFD7]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Fotografía de las Instalaciones y el Espacio */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-md border border-stone-200 bg-white aspect-[4/3] sm:aspect-[16/12]">
                <img
                  src={photos.consultorio}
                  alt={`Espacio de atención odontológica en Quilmes a cargo de ${professionalName}`}
                  width={1000}
                  height={750}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                />
              </div>

              {/* Pie de foto verificable */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-white border border-stone-200 text-center shadow-2xs">
                <span className="text-xs font-bold text-[#241C22] block">
                  {professionalName}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#5B2148] font-bold block mt-0.5">
                  Consultorio Odontológico en {city}
                </span>
              </div>
            </div>

            {/* Texto de Presentación y Vocación */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#5B2148] font-bold block">
                  Sobre el Consultorio
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight leading-tight [text-wrap:balance]">
                  Atención profesional y cercana a cargo de la {professionalName}
                </h2>
                <p className="text-stone-700 text-sm sm:text-base font-semibold text-[#5B2148] pt-1 [text-wrap:pretty]">
                  «La salud de tu boca influye en tu calidad de vida y en tu bienestar de cada día.»
                </p>
              </div>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal [text-wrap:pretty]">
                En {rawBusinessName} nos dedicamos al cuidado integral de la salud bucal con una mirada humana y sincera. Nuestro objetivo es que te sientas cómodo y acompañado en cada etapa, brindándote información clara para tomar las mejores decisiones sobre tu salud.
              </p>

              {/* Puntos Clave de Compromiso */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#5B2148] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700">
                    Atención odontológica integral y personalizada para niños, jóvenes y adultos.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#5B2148] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700">
                    Tratamientos planificados a medida con criterio preventivo y conservador.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#5B2148] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700">
                    Consultas programadas con cita previa para garantizar puntualidad y dedicación.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#5B2148] hover:bg-[#471838] transition-colors shadow-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148] focus-visible:ring-offset-2"
                >
                  <span>Coordinar Consulta con la Profesional</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INSTALACIONES Y CONFORT */}
      <section id="instalaciones" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Encabezado */}
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5B2148] font-bold block">
              Espacio y Confort
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight [text-wrap:balance]">
              Instalaciones confortables pensadas para tu tranquilidad
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed font-normal [text-wrap:pretty]">
              Cuidamos cada detalle del ambiente para que tu experiencia en el consultorio sea serena, cómoda y ordenada.
            </p>
          </div>

          {/* Dos Fotografías Grandes de las Instalaciones con Aspect-Ratio Fijo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <article className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white group">
              <div className="w-full h-72 sm:h-80 overflow-hidden bg-stone-100 aspect-[16/10]">
                <img
                  src={photos.instalacion1}
                  alt="Sillón odontológico moderno y sala de atención luminosa"
                  width={1000}
                  height={625}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                />
              </div>
              <div className="p-5 bg-white">
                <h3 className="text-base font-bold text-[#241C22] block [text-wrap:balance]">
                  Sala de Atención Luminosa y Climatizada
                </h3>
                <p className="text-xs text-stone-600 font-normal block mt-1 [text-wrap:pretty]">
                  Espacio confortable acondicionado para recibir a cada paciente con calma.
                </p>
              </div>
            </article>

            <article className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white group">
              <div className="w-full h-72 sm:h-80 overflow-hidden bg-stone-100 aspect-[16/10]">
                <img
                  src={photos.instalacion2}
                  alt="Instrumental esterilizado y estrictas normas de higiene"
                  width={1000}
                  height={625}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                />
              </div>
              <div className="p-5 bg-white">
                <h3 className="text-base font-bold text-[#241C22] block [text-wrap:balance]">
                  Higiene Rigurosa y Equipamiento Moderno
                </h3>
                <p className="text-xs text-stone-600 font-normal block mt-1 [text-wrap:pretty]">
                  Protocolos estrictos de esterilización y bioseguridad en cada consulta.
                </p>
              </div>
            </article>
          </div>

          {/* 3 Valores de Infraestructura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
            <article className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0" aria-hidden="true">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#241C22] block">Ambiente Sereno</h3>
                <p className="text-[11px] text-stone-600 font-medium">Climatizado y silencioso</p>
              </div>
            </article>

            <article className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0" aria-hidden="true">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#241C22] block">Equipamiento Cuidado</h3>
                <p className="text-[11px] text-stone-600 font-medium">Bioseguridad permanente</p>
              </div>
            </article>

            <article className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0" aria-hidden="true">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#241C22] block">Ubicación Accesible</h3>
                <p className="text-[11px] text-stone-600 font-medium">Fácil acceso en {city}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 9. PREGUNTAS FRECUENTES (ACORDEÓN CONTEMPORÁNEO ACCESIBLE CON ARIA) */}
      <section id="faqs" className="py-16 sm:py-20 lg:py-24 bg-[#F4EFEB] border-t border-b border-[#E8DFD7]">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5B2148] font-bold block">
              Preguntas Frecuentes
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight [text-wrap:balance]">
              Información útil antes de tu consulta
            </h2>
            <p className="text-stone-700 text-sm font-normal [text-wrap:pretty]">
              Respuestas directas a las dudas habituales de nuestros pacientes.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  id={`faq-btn-${idx}`}
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full min-h-[56px] p-5 sm:p-6 text-left flex items-center justify-between gap-4 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
                  aria-expanded={activeFaq === idx}
                  aria-controls={`faq-panel-${idx}`}
                >
                  <span className="text-sm sm:text-base font-bold text-[#241C22] group-hover:text-[#5B2148] transition-colors [text-wrap:balance]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      activeFaq === idx
                        ? 'bg-[#5B2148] text-white rotate-180'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {activeFaq === idx && (
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-normal border-t border-stone-100 pt-4 animate-in fade-in duration-200 [text-wrap:pretty]"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. UBICACIÓN, HORARIOS Y CONTACTO DIRECTO */}
      <section id="contacto" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Columna Izquierda: Información de Contacto */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#5B2148] font-bold block">
                  Visitanos
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight leading-tight [text-wrap:balance]">
                  Coordiná tu visita al consultorio
                </h2>
                <p className="text-stone-700 text-sm leading-relaxed font-normal [text-wrap:pretty]">
                  Estamos a tu disposición para responder cualquier inquietud antes de tu turno. Escribinos con tranquilidad.
                </p>
              </div>

              {/* Tarjetas de Datos de Contacto con Blancos Táctiles Adecuados */}
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-[#0e6f64] transition-all group min-h-[56px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0e6f64]"
                  aria-label="Contactar por WhatsApp oficial para cita previa"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#0e6f64] flex items-center justify-center shrink-0" aria-hidden="true">
                    <MessageCircle className="h-5 w-5 fill-[#0e6f64]" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#5B2148] block">
                      WhatsApp Oficial (Cita Previa)
                    </span>
                    <span className="text-sm font-bold text-[#241C22] block group-hover:text-[#0e6f64] transition-colors">
                      Enviar mensaje de WhatsApp
                    </span>
                    <span className="text-xs text-stone-600 font-medium">
                      Atención ágil de consultas y turnos
                    </span>
                  </div>
                </a>

                {phone && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs min-h-[56px]">
                    <div className="w-10 h-10 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0" aria-hidden="true">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B2148] block">
                        Teléfono del Consultorio
                      </span>
                      <a
                        href={`tel:${phone}`}
                        className="text-sm font-bold text-[#241C22] hover:text-[#5B2148] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148]"
                        aria-label={`Llamar al teléfono: ${phone}`}
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs min-h-[56px]">
                  <div className="w-10 h-10 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0" aria-hidden="true">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B2148] block">
                      Días y Horarios
                    </span>
                    <span className="text-sm font-bold text-[#241C22]">
                      {hours}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs min-h-[56px]">
                  <div className="w-10 h-10 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0" aria-hidden="true">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B2148] block">
                      Dirección
                    </span>
                    <span className="text-sm font-bold text-[#241C22]">
                      {address}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Mapa / Localización */}
            <div className="lg:col-span-6 bg-white p-7 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <span className="text-sm font-bold text-[#241C22] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#5B2148]" aria-hidden="true" />
                  <span>Ubicación del Consultorio</span>
                </span>
                <span className="text-xs text-[#5B2148] font-bold">{city}</span>
              </div>

              {/* Recuadro de Plano / Mapa Estilizado */}
              <div className="h-56 w-full rounded-xl bg-[#F4EFEB] border border-stone-200 flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#5B2148]" aria-hidden="true">
                  <MapPin className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-[#241C22] [text-wrap:balance]">
                  {address}
                </h4>
                <p className="text-xs text-stone-600 font-normal max-w-xs [text-wrap:pretty]">
                  Zona céntrica de {city}, con líneas de colectivo y accesos principales cercanos.
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rawBusinessName} ${address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#5B2148] hover:bg-[#471838] transition-colors shadow-2xs mt-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B2148] focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>

              {/* Indicaciones Prácticas */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-[#241C22] text-[11px] uppercase block">
                  Recomendaciones para tu turno:
                </span>
                <ul className="list-disc list-inside space-y-0.5 font-normal text-stone-600">
                  <li>Llegar con 5 a 10 minutos de anticipación para ingresar con calma.</li>
                  <li>Si tenés estudios o radiografías previas, podés traerlos en tu primera visita.</li>
                  <li>Atención con cita previa confirmada por WhatsApp o teléfono.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP (ACCESIBLE) */}
      <aside aria-label="Contacto rápido por WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0e6f64] hover:bg-[#094d45] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold text-xs group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0e6f64] focus-visible:ring-offset-2"
          title="Consultar directamente por WhatsApp"
          aria-label="Abrir chat de WhatsApp para consultas"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <MessageCircle className="h-5 w-5 fill-white" aria-hidden="true" />
          <span className="hidden sm:inline">¿Tenés dudas? Escribinos por WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </aside>

      {/* 12. FOOTER CONTEMPORÁNEO COMPLETO */}
      <footer className="bg-[#1C151B] text-[#E8DDD7] py-14 sm:py-16 text-xs border-t border-[#2C212B]">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <span className="text-xl font-bold text-white block">
                {rawBusinessName}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[#C49A8F] font-bold block">
                Consultorio Odontológico • {city}
              </span>
              <p className="text-xs text-stone-300 leading-relaxed font-normal pt-1 max-w-sm [text-wrap:pretty]">
                Odontología integral con criterio preventivo y atención personalizada para toda la familia en {city}, Buenos Aires.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Navegación
              </span>
              <nav aria-label="Navegación del pie de página" className="flex flex-col space-y-1 text-stone-300">
                <a href="#filosofia" className="min-h-[32px] inline-flex items-center hover:text-[#C49A8F] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                  Nuestra Atención
                </a>
                <a href="#tratamientos" className="min-h-[32px] inline-flex items-center hover:text-[#C49A8F] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                  Tratamientos
                </a>
                <a href="#profesional" className="min-h-[32px] inline-flex items-center hover:text-[#C49A8F] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                  El Consultorio
                </a>
                <a href="#instalaciones" className="min-h-[32px] inline-flex items-center hover:text-[#C49A8F] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                  Instalaciones
                </a>
                <a href="#faqs" className="min-h-[32px] inline-flex items-center hover:text-[#C49A8F] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                  Preguntas Frecuentes
                </a>
                <a href="#contacto" className="min-h-[32px] inline-flex items-center hover:text-[#C49A8F] transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                  Ubicación y Turnos
                </a>
              </nav>
            </div>

            <div className="md:col-span-4 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Contacto y Turnos
              </span>
              <div className="text-xs text-stone-300 space-y-1.5 font-normal">
                <p>{address}</p>
                <p>{hours}</p>
                <p className="pt-1">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[36px] inline-flex items-center gap-1.5 text-white hover:text-[#C49A8F] font-bold transition-colors rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]"
                    aria-label={`Contactar por WhatsApp: ${whatsappPhone}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-[#128C7E] text-white" aria-hidden="true" />
                    <span>WhatsApp: {whatsappPhone}</span>
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2C212B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
            <div>
              © {new Date().getFullYear()} {rawBusinessName}. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <span>Propuesta Conceptual WebPilot AI</span>
              <span aria-hidden="true">•</span>
              <Link href={`/demo/${demo.slug}?v=a`} className="text-[#C49A8F] hover:underline font-semibold rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C49A8F]">
                Ver Versión A (Editorial)
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
