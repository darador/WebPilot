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
 * VERSIÓN B — Plantilla Maestra Odontología Contemporánea
 * Tipografía principal: Manrope (limpia, moderna, excelente legibilidad)
 * Estética: Clínica dental contemporánea, profesional, cálida e higiénica
 * Paleta: Fondo crema cálido (#FAF9F6), Ciruela/Malva (#5B2148), tonos tierra suaves (#8D7B75)
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
      <div className="bg-[#F4EFEB] text-[#6E5D57] text-xs py-2 px-4 border-b border-[#E8DFD7]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#8D7B75]" />
              <span>{address}</span>
            </div>
            <span className="hidden sm:inline text-stone-300">•</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#8D7B75]" />
              <span>{hours}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {phone && (
              <a href={`tel:${phone}`} className="hover:text-[#241C22] transition-colors flex items-center gap-1.5 font-medium">
                <Phone className="h-3 w-3 text-[#8D7B75]" />
                <span>{phone}</span>
              </a>
            )}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#128C7E] hover:text-[#0b6358] font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-[#128C7E] text-white" />
              <span>WhatsApp de Consulta</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. ENCABEZADO PRINCIPAL (NAVBAR CONTEMPORÁNEA) */}
      <header className="bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 sticky top-[37px] sm:top-[33px] z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-4.5 flex items-center justify-between gap-4">
          {/* Logotipo / Nombre Comercial Tipográfico en Manrope */}
          <a href="#" className="flex flex-col group">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#241C22] group-hover:text-[#5B2148] transition-colors leading-tight">
              {brandName}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8D7B75] mt-0.5">
              {brandSubtitle}
            </span>
          </a>

          {/* Navegación Desktop Limpia */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-stone-600">
            <a href="#filosofia" className="hover:text-[#5B2148] transition-colors">
              Nuestra Atención
            </a>
            <a href="#tratamientos" className="hover:text-[#5B2148] transition-colors">
              Tratamientos
            </a>
            <a href="#profesional" className="hover:text-[#5B2148] transition-colors">
              El Consultorio
            </a>
            <a href="#instalaciones" className="hover:text-[#5B2148] transition-colors">
              Instalaciones
            </a>
            <a href="#faqs" className="hover:text-[#5B2148] transition-colors">
              Preguntas
            </a>
            <a href="#contacto" className="hover:text-[#5B2148] transition-colors">
              Ubicación
            </a>
          </nav>

          {/* Botón Principal Solicitar Turno */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide text-white bg-[#5B2148] hover:bg-[#471838] transition-all shadow-sm hover:shadow hover:scale-[1.01]"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Solicitar Turno</span>
            </a>
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:text-[#5B2148] hover:bg-stone-100 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF9F6] border-b border-stone-200 px-4 py-5 shadow-lg space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-3 text-sm font-semibold text-stone-700">
              <a
                href="#filosofia"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#5B2148] transition-colors"
              >
                Nuestra Atención
              </a>
              <a
                href="#tratamientos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#5B2148] transition-colors"
              >
                Tratamientos
              </a>
              <a
                href="#profesional"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#5B2148] transition-colors"
              >
                El Consultorio
              </a>
              <a
                href="#instalaciones"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#5B2148] transition-colors"
              >
                Instalaciones y Confort
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#5B2148] transition-colors"
              >
                Preguntas Frecuentes
              </a>
              <a
                href="#contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#5B2148] transition-colors"
              >
                Ubicación y Contacto
              </a>
            </nav>

            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2.5">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-white bg-[#5B2148]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Solicitar Turno por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 4. HERO SECTION CONTEMPORÁNEO (MANROPE + CLÍNICA MODERNA) */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Halo de luz sutil en fondo */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#EAE0D7]/40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-[#EADBD0]/30 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Columna Izquierda: Mensaje y Acciones */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge de Confianza Moderno */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3ECE6] border border-[#E4D7CE] text-xs font-bold text-[#5B2148] shadow-2xs">
                <span className="flex items-center text-amber-600 text-xs tracking-tighter">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                </span>
                <span className="text-stone-400">•</span>
                <span>Atención Odontológica en {city}</span>
              </div>

              {/* Título Principal en Manrope: Fuerte, Confiable y Contemporáneo */}
              <h1 className="font-manrope text-[26px] sm:text-[34px] lg:text-[41px] font-bold text-[#241C22] tracking-tight leading-[1.32] sm:leading-[1.34] lg:leading-[1.36] [text-wrap:balance] max-w-[540px] mb-5">
                Odontología integral con dedicación, respeto y calidez humana
              </h1>

              {/* Subtítulo Descriptivo Calmo */}
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal max-w-lg">
                Un espacio pensado para escucharte y cuidar tu salud bucal con trato cercano. Atención personalizada para niños, jóvenes y adultos con turnos programados con cita previa.
              </p>

              {/* Acciones de Contacto */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#5B2148] hover:bg-[#471838] transition-all shadow-sm hover:shadow-md hover:scale-[1.01]"
                >
                  <span>Solicitar Turno</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#tratamientos"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#5B2148] border border-stone-300 hover:border-[#5B2148]/50 bg-white hover:bg-[#FAF4F0] transition-colors shadow-2xs"
                >
                  <span>Conocer Tratamientos</span>
                </a>
              </div>

              {/* Garantías Operativas Reales en Tarjetas Minimalistas */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-200">
                <div className="p-3 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-[#5B2148]" />
                    <span className="text-xs font-bold text-[#241C22]">Ubicación Local</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium block">{city}, Buenos Aires</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-[#5B2148]" />
                    <span className="text-xs font-bold text-[#241C22]">Atención Dedicada</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium block">Turnos con cita previa</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="h-3.5 w-3.5 text-[#128C7E]" />
                    <span className="text-xs font-bold text-[#241C22]">Canal Directo</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium block">Respuesta vía WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Fotografía Protagonista Integrada */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-stone-200 bg-white">
                <img
                  src={photos.hero}
                  alt={`Instalaciones del consultorio ${rawBusinessName}`}
                  className="w-full h-[380px] sm:h-[460px] lg:h-[500px] object-cover hover:scale-102 transition-transform duration-700"
                  loading="eager"
                  decoding="async"
                />

                {/* Tarjeta Flotante Contemporánea */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-md border border-stone-200/90 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#241C22] block">
                      {rawBusinessName}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">
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
          {/* Encabezado */}
          <div className="max-w-3xl space-y-2.5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D7B75] font-bold block">
              Forma de Trabajar
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight leading-tight">
              Una atención fundada en la escucha, la honestidad y el respeto por tus tiempos
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-normal pt-1">
              Creemos en la odontología basada en la confianza y en explicar cada procedimiento con absoluta claridad antes de comenzar.
            </p>
          </div>

          {/* 3 Columnas Modernas con Iconografía Limpia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-2">
            <div className="space-y-3 bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] font-bold text-sm flex items-center justify-center">
                01
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#241C22]">
                Escucha y Diagnóstico Integral
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                Nos tomamos el tiempo para conocer tu historia, responder a tus inquietudes y evaluar tu salud bucal con una mirada preventiva y global.
              </p>
            </div>

            <div className="space-y-3 bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] font-bold text-sm flex items-center justify-center">
                02
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#241C22]">
                Tratamientos Claros y Sin Dolor
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                Priorizamos tu confort y bienestar en cada consulta, utilizando técnicas cuidadosas y consensuando cada etapa del plan de tratamiento.
              </p>
            </div>

            <div className="space-y-3 bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] font-bold text-sm flex items-center justify-center">
                03
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#241C22]">
                Turnos Puntuales y Cita Previa
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                Organizamos la agenda con tiempo exclusivo para cada paciente, minimizando tiempos de espera en la sala y respetando tu día.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRATAMIENTOS (CUADRÍCULA CONTEMPORÁNEA) */}
      <section id="tratamientos" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Título de la Sección */}
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D7B75] font-bold block">
              Especialidades
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight">
              Cuidado integral para cada etapa de tu vida
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed font-normal">
              Tratamientos planificados con criterio conservador, materiales certificados y atención personalizada en {city}.
            </p>
          </div>

          {/* Cuadrícula de 4 Especialidades con Estética Limpia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {treatments.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Fotografía de la especialidad */}
                <div className="h-60 sm:h-64 w-full overflow-hidden relative bg-stone-100">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-[#5B2148] shadow-2xs border border-stone-200/80 uppercase tracking-wider">
                    {t.badge}
                  </div>
                </div>

                {/* Contenido de la Especialidad */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#241C22] group-hover:text-[#5B2148] transition-colors leading-snug">
                      {t.title}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
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
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#5B2148] hover:text-[#3E1430] transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#128C7E] fill-[#128C7E]" />
                      <span>Consultar por este tratamiento</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
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
              <div className="rounded-3xl overflow-hidden shadow-md border border-stone-200 bg-white">
                <img
                  src={photos.consultorio}
                  alt={`Espacio de atención odontológica en Quilmes`}
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Pie de foto verificable */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-white border border-stone-200 text-center shadow-2xs">
                <span className="text-xs font-bold text-[#241C22] block">
                  {professionalName}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#8D7B75] font-semibold block mt-0.5">
                  Consultorio Odontológico en {city}
                </span>
              </div>
            </div>

            {/* Texto de Presentación y Vocación */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D7B75] font-bold block">
                  Sobre el Consultorio
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight leading-tight">
                  Atención profesional y cercana a cargo de la {professionalName}
                </h2>
                <p className="text-stone-600 text-sm sm:text-base font-medium text-[#5B2148] pt-1">
                  «La salud de tu boca influye en tu calidad de vida y en tu bienestar de cada día.»
                </p>
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal">
                En {rawBusinessName} nos dedicamos al cuidado integral de la salud bucal con una mirada humana y sincera. Nuestro objetivo es que te sientas cómodo y acompañado en cada etapa, brindándote información clara para tomar las mejores decisiones sobre tu salud.
              </p>

              {/* Puntos Clave de Compromiso */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#5B2148] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700">
                    Atención odontológica integral y personalizada para niños, jóvenes y adultos.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#5B2148] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-700">
                    Tratamientos planificados a medida con criterio preventivo y conservador.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#5B2148] shrink-0 mt-0.5" />
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
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#5B2148] hover:bg-[#471838] transition-colors shadow-sm"
                >
                  <span>Coordinar Consulta con la Profesional</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D7B75] font-bold block">
              Espacio y Confort
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight">
              Instalaciones confortables pensadas para tu tranquilidad
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed font-normal">
              Cuidamos cada detalle del ambiente para que tu experiencia en el consultorio sea serena, cómoda y ordenada.
            </p>
          </div>

          {/* Dos Fotografías Grandes de las Instalaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white group">
              <img
                src={photos.instalacion1}
                alt="Sillón odontológico moderno y sala de atención luminosa"
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-700"
                loading="lazy"
                decoding="async"
              />
              <div className="p-5 bg-white">
                <span className="text-base font-bold text-[#241C22] block">
                  Sala de Atención Luminosa y Climatizada
                </span>
                <span className="text-xs text-stone-500 font-normal block mt-1">
                  Espacio confortable acondicionado para recibir a cada paciente con calma.
                </span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white group">
              <img
                src={photos.instalacion2}
                alt="Instrumental esterilizado y estrictas normas de higiene"
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-700"
                loading="lazy"
                decoding="async"
              />
              <div className="p-5 bg-white">
                <span className="text-base font-bold text-[#241C22] block">
                  Higiene Rigurosa y Equipamiento Moderno
                </span>
                <span className="text-xs text-stone-500 font-normal block mt-1">
                  Protocolos estrictos de esterilización y bioseguridad en cada consulta.
                </span>
              </div>
            </div>
          </div>

          {/* 3 Valores de Infraestructura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241C22] block">Ambiente Sereno</span>
                <span className="text-[11px] text-stone-500 font-medium">Climatizado y silencioso</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241C22] block">Equipamiento Cuidado</span>
                <span className="text-[11px] text-stone-500 font-medium">Bioseguridad permanente</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#241C22] block">Ubicación Accesible</span>
                <span className="text-[11px] text-stone-500 font-medium">Fácil acceso en {city}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PREGUNTAS FRECUENTES (ACORDEÓN CONTEMPORÁNEO) */}
      <section id="faqs" className="py-16 sm:py-20 lg:py-24 bg-[#F4EFEB] border-t border-b border-[#E8DFD7]">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D7B75] font-bold block">
              Preguntas Frecuentes
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight">
              Información útil antes de tu consulta
            </h2>
            <p className="text-stone-600 text-sm font-normal">
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
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 group"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="text-sm sm:text-base font-bold text-[#241C22] group-hover:text-[#5B2148] transition-colors">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      activeFaq === idx
                        ? 'bg-[#5B2148] text-white rotate-180'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {activeFaq === idx && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal border-t border-stone-100 pt-4 animate-in fade-in duration-200">
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
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D7B75] font-bold block">
                  Visitanos
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241C22] tracking-tight leading-tight">
                  Coordiná tu visita al consultorio
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed font-normal">
                  Estamos a tu disposición para responder cualquier inquietud antes de tu turno. Escribinos con tranquilidad.
                </p>
              </div>

              {/* Tarjetas de Datos de Contacto */}
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-[#128C7E] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#128C7E] flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 fill-[#128C7E]" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#8D7B75] block">
                      WhatsApp Oficial (Cita Previa)
                    </span>
                    <span className="text-sm font-bold text-[#241C22] block group-hover:text-[#128C7E] transition-colors">
                      Enviar mensaje de WhatsApp
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Atención ágil de consultas y turnos
                    </span>
                  </div>
                </a>

                {phone && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8D7B75] block">
                        Teléfono del Consultorio
                      </span>
                      <a href={`tel:${phone}`} className="text-sm font-bold text-[#241C22] hover:text-[#5B2148] transition-colors">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8D7B75] block">
                      Días y Horarios
                    </span>
                    <span className="text-sm font-bold text-[#241C22]">
                      {hours}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#F3ECE6] text-[#5B2148] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8D7B75] block">
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
                  <MapPin className="h-4 w-4 text-[#5B2148]" />
                  <span>Ubicación del Consultorio</span>
                </span>
                <span className="text-xs text-[#8D7B75] font-semibold">{city}</span>
              </div>

              {/* Recuadro de Plano / Mapa Estilizado */}
              <div className="h-56 w-full rounded-xl bg-[#F4EFEB] border border-stone-200 flex flex-col items-center justify-center p-6 text-center space-y-2 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#5B2148]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-[#241C22]">
                  {address}
                </h4>
                <p className="text-xs text-stone-500 font-normal max-w-xs">
                  Zona céntrica de {city}, con líneas de colectivo y accesos principales cercanos.
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rawBusinessName} ${address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#5B2148] hover:bg-[#471838] transition-colors shadow-2xs mt-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>

              {/* Indicaciones Prácticas */}
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-xs text-stone-600 space-y-1">
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

      {/* 11. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP */}
      <aside aria-label="Contacto rápido por WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#128C7E] hover:bg-[#0b6358] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold text-xs group"
          title="Consultar directamente por WhatsApp"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <MessageCircle className="h-5 w-5 fill-white" />
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
              <p className="text-xs text-stone-400 leading-relaxed font-normal pt-1 max-w-sm">
                Odontología integral con criterio preventivo y atención personalizada para toda la familia en {city}, Buenos Aires.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Navegación
              </span>
              <div className="flex flex-col space-y-1.5 text-stone-300">
                <a href="#filosofia" className="hover:text-[#C49A8F] transition-colors">
                  Nuestra Atención
                </a>
                <a href="#tratamientos" className="hover:text-[#C49A8F] transition-colors">
                  Tratamientos
                </a>
                <a href="#profesional" className="hover:text-[#C49A8F] transition-colors">
                  El Consultorio
                </a>
                <a href="#instalaciones" className="hover:text-[#C49A8F] transition-colors">
                  Instalaciones
                </a>
                <a href="#faqs" className="hover:text-[#C49A8F] transition-colors">
                  Preguntas Frecuentes
                </a>
                <a href="#contacto" className="hover:text-[#C49A8F] transition-colors">
                  Ubicación y Turnos
                </a>
              </div>
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
                    className="inline-flex items-center gap-1.5 text-white hover:text-[#C49A8F] font-bold transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-[#128C7E] text-white" />
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
              <span>•</span>
              <Link href={`/demo/${demo.slug}?v=a`} className="text-[#C49A8F] hover:underline font-semibold">
                Ver Versión A (Editorial)
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
