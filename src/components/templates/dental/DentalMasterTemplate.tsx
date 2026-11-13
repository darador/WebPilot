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
} from 'lucide-react';
import { ClientDemo } from '@/types/database.types';

interface DentalMasterTemplateProps {
  demo: ClientDemo;
  currentVariant?: 'a' | 'b';
}

export function DentalMasterTemplate({ demo, currentVariant = 'a' }: DentalMasterTemplateProps) {
  const { content } = demo;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Normalización y extracción de datos
  const rawBusinessName = content.businessName || 'Consultorio Odontológico';
  const matchDr = rawBusinessName.match(/(Dra?\.\s+[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i);
  const professionalName =
    content.about?.professionalName || (matchDr ? matchDr[1].trim() : rawBusinessName);

  // Nombre de marca destacado (ej. "Centro Di Paolo")
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
      image: photos.tratamientos[0],
    },
    {
      title: 'Estética Dental y Armonización',
      description:
        'Procedimientos conservadores orientados a mejorar la luminosidad, forma y armonía natural de tu sonrisa mediante blanqueamiento y carillas.',
      image: photos.tratamientos[1],
    },
    {
      title: 'Ortodoncia y Alineación',
      description:
        'Corrección de la posición dental y de la oclusión mediante técnicas modernas y adaptadas a las necesidades y comodidad de cada paciente.',
      image: photos.tratamientos[2],
    },
    {
      title: 'Implantes y Rehabilitación Oral',
      description:
        'Recuperación funcional y estética de piezas ausentes para devolver la seguridad, confort y eficacia al masticar y sonreír.',
      image: photos.tratamientos[3],
    },
  ];

  // Preguntas frecuentes editoriales
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
    <div className="min-h-screen bg-[#FAF9F5] text-[#2D2128] font-sans antialiased selection:bg-[#5E2750] selection:text-white">
      {/* 1. TOP BAR INSTITUCIONAL DELGADA */}
      <aside aria-label="Aviso de muestra conceptual" className="bg-[#2D2128] text-[#E8DDD7] text-xs py-2 px-4 border-b border-[#3E2E38] sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#C49A8F] text-[#2D2128]">
              Muestra Conceptual
            </span>
            <span className="font-normal text-[#E8DDD7]">
              Propuesta web diseñada por WebPilot AI para {rawBusinessName}
            </span>
          </div>

          {/* SELECTOR COMPARATIVO VERSIÓN A / VERSIÓN B */}
          <div className="flex items-center gap-1.5 bg-[#3E2E38] p-0.5 rounded-lg border border-[#4E3B47] text-[11px]">
            <span className="text-stone-400 px-2 py-0.5 text-[10px] uppercase font-semibold">
              Comparar:
            </span>
            <Link
              href={`/demo/${demo.slug}?v=a`}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                currentVariant === 'a'
                  ? 'bg-[#5E2750] text-white shadow-xs ring-1 ring-[#C49A8F]/40'
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
                  ? 'bg-[#5E2750] text-white shadow-xs ring-1 ring-[#C49A8F]/40'
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
      <div className="bg-[#F3EDE4] text-[#6B5A55] text-xs py-2 px-4 border-b border-[#E8DFD5]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#8C6D68]" />
            <span>{address}</span>
            <span className="hidden sm:inline text-[#C4B2AD]">•</span>
            <span className="hidden sm:inline">{hours}</span>
          </div>

          <div className="flex items-center gap-4">
            {phone && (
              <a href={`tel:${phone}`} className="hover:text-[#2D2128] transition-colors flex items-center gap-1.5 font-medium">
                <Phone className="h-3 w-3 text-[#8C6D68]" />
                <span>{phone}</span>
              </a>
            )}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#128C7E] hover:text-[#0b6358] font-semibold flex items-center gap-1 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-[#128C7E] text-white" />
              <span>WhatsApp de Consulta</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. ENCABEZADO PRINCIPAL EDITORIAL */}
      <header className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADBCE] sticky top-[33px] sm:top-[33px] z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
          {/* Logotipo / Nombre Comercial Tipográfico */}
          <a href="#" className="flex flex-col group">
            <span className="font-serif text-2xl sm:text-3xl tracking-tight text-[#2D2128] font-medium leading-none group-hover:text-[#5E2750] transition-colors">
              {brandName}
            </span>
            <span className="text-[11px] font-sans uppercase tracking-[0.22em] text-[#8C6D68] mt-1 font-semibold">
              {brandSubtitle}
            </span>
          </a>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-[#574B4F]">
            <a href="#filosofia" className="hover:text-[#5E2750] transition-colors">
              Forma de Trabajar
            </a>
            <a href="#tratamientos" className="hover:text-[#5E2750] transition-colors">
              Tratamientos
            </a>
            <a href="#profesional" className="hover:text-[#5E2750] transition-colors">
              Sobre el Consultorio
            </a>
            <a href="#instalaciones" className="hover:text-[#5E2750] transition-colors">
              Instalaciones
            </a>
            <a href="#faqs" className="hover:text-[#5E2750] transition-colors">
              Preguntas
            </a>
            <a href="#contacto" className="hover:text-[#5E2750] transition-colors">
              Ubicación
            </a>
          </nav>

          {/* Botón Principal Solicitar Turno (Ciruela) */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide text-white bg-[#5E2750] hover:bg-[#481B3D] transition-all shadow-sm hover:shadow hover:scale-[1.01]"
            >
              <span>Solicitar Turno</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#574B4F] hover:text-[#2D2128]"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF7F2] border-b border-[#EADBCE] px-4 py-5 space-y-3 animate-in fade-in duration-150">
            <nav className="flex flex-col gap-3 text-sm font-medium text-[#574B4F]">
              <a
                href="#filosofia"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#5E2750]"
              >
                Forma de Trabajar
              </a>
              <a
                href="#tratamientos"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#5E2750]"
              >
                Tratamientos
              </a>
              <a
                href="#profesional"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#5E2750]"
              >
                Sobre el Consultorio
              </a>
              <a
                href="#instalaciones"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#5E2750]"
              >
                Instalaciones
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#5E2750]"
              >
                Preguntas
              </a>
              <a
                href="#contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#5E2750]"
              >
                Ubicación
              </a>
            </nav>
            <div className="pt-3 border-t border-[#EADBCE]">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-semibold tracking-wide text-white bg-[#5E2750] hover:bg-[#481B3D]"
              >
                <span>Solicitar Turno por WhatsApp</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 4. HERO SECTION EDITORIAL (DOS COLUMNAS CON FOTOGRAFÍA PROTAGONISTA) */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Columna Izquierda: Mensaje y Composición Editorial */}
            <div className="lg:col-span-6 space-y-6">
              {/* Frase Destacada con Estilo Manuscrito / Cursiva Itálica y Chip de Confianza */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE4DA] text-[#6E4759] text-[11px] font-semibold border border-[#DFCFC2] shadow-2xs">
                  <span className="text-amber-600 tracking-wider">★★★★★</span>
                  <span>Atención Personalizada • {city}</span>
                </div>
                <span className="font-serif italic text-xl sm:text-2xl text-[#8E446E] block font-normal tracking-wide">
                  Cuidamos cada detalle de tu sonrisa
                </span>
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
                  Consultorio Odontológico en {city}
                </span>
              </div>

              {/* Título Grande y Elegante (Calibrado con mayor respiro y balance visual) */}
              <h1 className="font-serif text-[26px] sm:text-[34px] lg:text-[41px] text-[#241A22] font-medium tracking-tight leading-[1.32] sm:leading-[1.34] lg:leading-[1.36] [text-wrap:balance] max-w-[540px] mb-5">
                Odontología integral con dedicación, respeto y calidez humana
              </h1>

              {/* Párrafo Descriptivo Calmo */}
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light max-w-lg">
                Un espacio pensado para escucharte y cuidar tu salud bucal con un trato cercano. Atención planificada y personalizada para niños, jóvenes y adultos, con turnos coordinados con cita previa.
              </p>

              {/* Acciones de Contacto */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-[#5E2750] hover:bg-[#481B3D] transition-all shadow-md hover:shadow-lg hover:scale-[1.01]"
                >
                  <span>Solicitar Turno</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#tratamientos"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#5E2750] border border-[#CBB8AF] bg-transparent hover:bg-[#F3EBE3] transition-colors"
                >
                  <span>Conocer Tratamientos</span>
                </a>
              </div>

              {/* Garantías Operativas Reales (Separadores Finos) */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#EADBCE]">
                <div className="space-y-0.5">
                  <span className="font-serif text-sm font-semibold text-[#2D2128] block">Ubicación Local</span>
                  <span className="text-[11px] text-[#8C6D68]">Quilmes, Buenos Aires</span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-serif text-sm font-semibold text-[#2D2128] block">Atención Dedicada</span>
                  <span className="text-[11px] text-[#8C6D68]">Turnos con cita previa</span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-serif text-sm font-semibold text-[#2D2128] block">Canal Directo</span>
                  <span className="text-[11px] text-[#8C6D68]">Contacto vía WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Fotografía Protagonista Integrada Suavemente */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-8 border-white bg-white">
                <img
                  src={photos.hero}
                  alt={`Instalaciones del consultorio ${rawBusinessName}`}
                  className="w-full h-[400px] sm:h-[480px] lg:h-[520px] object-cover hover:scale-102 transition-transform duration-700"
                  loading="eager"
                  decoding="async"
                />

                {/* Tarjeta Flotante Sutil con Estética Crema */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#FAF7F2]/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#EADBCE] flex items-center justify-between gap-3">
                  <div>
                    <span className="font-serif text-xs font-bold text-[#2D2128] block">
                      {rawBusinessName}
                    </span>
                    <span className="text-[11px] text-[#8C6D68] block mt-0.5">
                      Atención odontológica integral en {city}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFE4DA] text-[#6E4759] shrink-0">
                    Cita Previa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A. NUESTRA FORMA DE TRABAJAR (FILOSOFÍA DE ATENCIÓN EDITORIAL) */}
      <section id="filosofia" className="py-16 sm:py-20 lg:py-24 bg-[#F5EFE6] border-t border-b border-[#E8DDD7]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Encabezado Editorial con Cita Manuscrita */}
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
              Nuestra Filosofía de Atención
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2D2128] font-normal leading-tight">
              Una atención fundada en la escucha, la honestidad y el respeto por tus tiempos
            </h2>
            <p className="font-serif italic text-base sm:text-lg text-[#8E446E] pt-1">
              “Creemos en la odontología basada en la confianza y en explicar cada paso con absoluta claridad.”
            </p>
          </div>

          {/* 3 Columnas Editoriales con Separadores Finos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 pt-4">
            <div className="space-y-3 bg-[#FAF7F2] p-7 rounded-2xl border border-[#EADBCE] shadow-2xs">
              <span className="font-serif text-2xl text-[#8E446E] font-normal block">01</span>
              <h3 className="font-serif text-lg font-bold text-[#2D2128]">
                Escucha y Diagnóstico Integral
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                Nos tomamos el tiempo para conocer tu historia, responder a tus dudas y evaluar tu salud bucal con una mirada global, sin apresuramientos.
              </p>
            </div>

            <div className="space-y-3 bg-[#FAF7F2] p-7 rounded-2xl border border-[#EADBCE] shadow-2xs">
              <span className="font-serif text-2xl text-[#8E446E] font-normal block">02</span>
              <h3 className="font-serif text-lg font-bold text-[#2D2128]">
                Explicación Clara y Transparente
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                Te explicamos con lenguaje simple cada procedimiento recomendado, las alternativas posibles y el plan de tratamiento antes de iniciar.
              </p>
            </div>

            <div className="space-y-3 bg-[#FAF7F2] p-7 rounded-2xl border border-[#EADBCE] shadow-2xs">
              <span className="font-serif text-2xl text-[#8E446E] font-normal block">03</span>
              <h3 className="font-serif text-lg font-bold text-[#2D2128]">
                Atención con Cita Previa
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                Coordinamos los turnos con suficiente margen para dedicarte toda la atención que tu salud requiere, respetando tu horario y bienestar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* B. TRATAMIENTOS (CUADRÍCULA AMPLIA CON FOTOGRAFÍAS GRANDES) */}
      <section id="tratamientos" className="py-16 sm:py-20 lg:py-24 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Título de la Sección */}
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
              Tratamientos Odontológicos
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2D2128] font-normal">
              Cuidado integral para cada etapa de tu vida
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed font-light">
              Especialidades planificadas con criterio conservador y atención personalizada en Quilmes.
            </p>
          </div>

          {/* Cuadrícula de 4 Especialidades con Fotos Grandes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {treatments.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border border-[#EADBCE] shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Fotografía Grande */}
                <div className="h-64 sm:h-72 w-full overflow-hidden relative bg-[#F5EFE6]">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-4 right-4 bg-[#FAF7F2]/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-serif text-[#2D2128] font-bold shadow-2xs">
                    0{idx + 1}
                  </div>
                </div>

                {/* Contenido de la Especialidad */}
                <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#2D2128] group-hover:text-[#5E2750] transition-colors leading-snug">
                      {t.title}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                      {t.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F2ECE4]">
                    <a
                      href={`${whatsappLink}&text=${encodeURIComponent(
                        `Hola, me comunico desde la web para consultar información sobre el tratamiento de: ${t.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#8E446E] hover:text-[#5E2750] transition-colors"
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

      {/* C. SOBRE LA PROFESIONAL Y EL CONSULTORIO */}
      <section id="profesional" className="py-16 sm:py-20 lg:py-24 bg-[#F5EFE6] border-t border-b border-[#E8DDD7]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Fotografía de las Instalaciones y el Espacio */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden shadow-xl border-8 border-white bg-white">
                <img
                  src={photos.consultorio}
                  alt={`Espacio de atención odontológica en Quilmes`}
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Pie de foto verificable */}
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-center">
                <span className="font-serif text-sm font-bold text-[#2D2128] block">
                  {professionalName}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#8C6D68] block mt-0.5">
                  Consultorio Odontológico en Quilmes
                </span>
              </div>
            </div>

            {/* Texto de Presentación y Vocación */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
                  Sobre el Consultorio
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2D2128] font-normal leading-tight">
                  Atención profesional y cercana a cargo de la {professionalName}
                </h2>
                <p className="font-serif italic text-base sm:text-lg text-[#8E446E] pt-1">
                  “La salud de tu boca influye en tu calidad de vida y en tu bienestar de cada día.”
                </p>
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                En {rawBusinessName} nos dedicamos al cuidado integral de la salud bucal con una mirada humana y sincera. Nuestro objetivo es que te sientas cómodo y acompañado en cada etapa, brindándote información clara para tomar las mejores decisiones sobre tu salud.
              </p>

              {/* Puntos Clave de Compromiso */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <CheckCircle2 className="h-4 w-4 text-[#8E446E] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-stone-700">
                    Atención odontológica integral y personalizada para niños, jóvenes y adultos.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <CheckCircle2 className="h-4 w-4 text-[#8E446E] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-stone-700">
                    Tratamientos planificados a medida con criterio preventivo y conservador.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <CheckCircle2 className="h-4 w-4 text-[#8E446E] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-stone-700">
                    Consultas programadas con cita previa para garantizar puntualidad y dedicación.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-[#5E2750] hover:bg-[#481B3D] transition-colors"
                >
                  <span>Coordinar Consulta con la Profesional</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. INSTALACIONES Y TECNOLOGÍA */}
      <section id="instalaciones" className="py-16 sm:py-20 lg:py-24 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {/* Encabezado */}
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
              Espacio y Confort
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2D2128] font-normal">
              Instalaciones confortables pensadas para tu tranquilidad
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed font-light">
              Cuidamos cada detalle del ambiente para que tu experiencia en el consultorio sea serena, cómoda y ordenada.
            </p>
          </div>

          {/* Dos Fotografías Grandes de las Instalaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="rounded-3xl overflow-hidden shadow-md border-4 border-white bg-white group">
              <img
                src={photos.instalacion1}
                alt="Sillón odontológico moderno y sala de atención luminosa"
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-700"
                loading="lazy"
                decoding="async"
              />
              <div className="p-5 bg-white">
                <span className="font-serif text-base font-semibold text-[#2D2128] block">
                  Sala de Atención Luminosa y Climatizada
                </span>
                <span className="text-xs text-stone-500 font-light block mt-1">
                  Espacio confortable acondicionado para recibir a cada paciente con calma.
                </span>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-md border-4 border-white bg-white group">
              <img
                src={photos.instalacion2}
                alt="Instrumental esterilizado y estrictas normas de higiene"
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-700"
                loading="lazy"
                decoding="async"
              />
              <div className="p-5 bg-white">
                <span className="font-serif text-base font-semibold text-[#2D2128] block">
                  Estrictos Criterios de Bioseguridad
                </span>
                <span className="text-xs text-stone-500 font-light block mt-1">
                  Esterilización rigurosa del instrumental y aplicación de protocolos de higiene en cada consulta.
                </span>
              </div>
            </div>
          </div>

          {/* Pilares Confirmados de las Instalaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#EADBCE]">
            <div className="space-y-1.5 p-4 rounded-xl bg-[#F5EFE6]">
              <span className="font-serif text-sm font-bold text-[#2D2128] block">Ambiente Sereno</span>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Iluminación adecuada y climatización pensadas para disipar la ansiedad de la visita odontológica.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-[#F5EFE6]">
              <span className="font-serif text-sm font-bold text-[#2D2128] block">Equipamiento Cuidado</span>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Sillón odontológico confortable e instrumental preparado bajo rigurosos estándares sanitarios.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-[#F5EFE6]">
              <span className="font-serif text-sm font-bold text-[#2D2128] block">Ubicación Accesible</span>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Consultorio ubicado en {city}, de fácil acceso y con opciones de estacionamiento en la zona.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* E. PREGUNTAS FRECUENTES (FORMATO EDITORIAL ELEGANTE) */}
      <section id="faqs" className="py-16 sm:py-20 lg:py-24 bg-[#F5EFE6] border-t border-b border-[#E8DDD7]">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
              Resolvé tus Dudas
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2D2128] font-normal">
              Preguntas Frecuentes
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Información clara sobre turnos, modalidades de atención y medios de pago.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF7F2] rounded-2xl border border-[#EADBCE] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 group"
                  >
                    <span className="font-serif text-base sm:text-lg font-normal text-[#2D2128] group-hover:text-[#5E2750] transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#8C6D68] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#5E2750]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed font-light border-t border-[#F2ECE4] pt-4 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* G. CONTACTO Y UBICACIÓN */}
      <section id="contacto" className="py-16 sm:py-20 lg:py-24 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Datos de Contacto y Turnos */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#8C6D68] font-bold block">
                  Ubicación y Turnos
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2D2128] font-normal leading-tight">
                  Estamos en {city} para cuidar tu salud bucal
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  Comunicate con nosotros para coordinar tu próxima consulta o despejar cualquier duda antes de visitarnos.
                </p>
              </div>

              {/* Ficha de Canales */}
              <div className="space-y-3 pt-2">
                {/* Botón WhatsApp Principal */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#128C7E] transition-all shadow-xs group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="h-5 w-5 fill-white" />
                  </div>
                  <div>
                    <span className="font-serif text-sm font-bold text-[#2D2128] block group-hover:text-[#128C7E] transition-colors">
                      WhatsApp de Atención Rápida
                    </span>
                    <span className="text-xs text-stone-500 font-light">
                      Click para coordinar turnos y consultas directas
                    </span>
                  </div>
                </a>

                {/* Teléfono */}
                {phone && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EADBCE]">
                    <div className="w-11 h-11 rounded-xl bg-[#F5EFE6] text-[#5E2750] flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D68] block">
                        Teléfono
                      </span>
                      <span className="font-serif text-sm font-bold text-[#2D2128]">
                        {phone}
                      </span>
                    </div>
                  </div>
                )}

                {/* Dirección */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EADBCE]">
                  <div className="w-11 h-11 rounded-xl bg-[#F5EFE6] text-[#5E2750] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D68] block">
                      Dirección del Consultorio
                    </span>
                    <span className="font-serif text-sm font-bold text-[#2D2128]">
                      {address}
                    </span>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EADBCE]">
                  <div className="w-11 h-11 rounded-xl bg-[#F5EFE6] text-[#5E2750] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D68] block">
                      Horarios de Atención
                    </span>
                    <span className="font-serif text-sm font-bold text-[#2D2128]">
                      {hours}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa Interactivo con Estilo Editorial */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-bold text-[#2D2128] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#8E446E]" />
                  <span>Ubicación en Google Maps</span>
                </span>
                <span className="text-xs text-[#8C6D68] font-medium">{city}</span>
              </div>

              <div className="h-64 sm:h-72 rounded-2xl bg-[#F5EFE6] border border-[#EADBCE] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#EADBCE] flex items-center justify-center text-[#8E446E]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#2D2128]">
                    {rawBusinessName}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5 font-light">
                    {address}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    content.contact?.mapQuery || `${rawBusinessName} ${city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#5E2750] hover:bg-[#481B3D] transition-colors shadow-xs"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {content.provisionalFlags && content.provisionalFlags.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#FAF0E6] border border-[#E8D4C4] text-[11px] text-[#7A4B3A] space-y-1">
                  <span className="font-bold text-[10px] uppercase block">
                    Notas de la Propuesta Preliminar
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-600 font-light">
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

      {/* 9. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP (ÚNICO VERDE DE LA PÁGINA) */}
      <aside aria-label="Contacto rápido por WhatsApp" className="fixed bottom-6 right-6 z-50">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#128C7E] hover:bg-[#0b6358] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold text-xs group"
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

      {/* 10. FOOTER EDITORIAL COMPLETO */}
      <footer className="bg-[#2D2128] text-[#E8DDD7] py-14 sm:py-16 text-xs border-t border-[#3E2E38]">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
            {/* Columna Marca */}
            <div className="md:col-span-5 space-y-2">
              <span className="font-serif text-2xl text-white block">
                {brandName}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[#C4B2AD] block">
                {brandSubtitle}
              </span>
              <p className="text-xs text-[#A89895] leading-relaxed font-light pt-2 max-w-sm">
                Propuesta conceptual de presencia web personalizada, desarrollada por el equipo de WebPilot AI tomando como referencia los más altos estándares de calidad odontológica.
              </p>
            </div>

            {/* Enlaces Rápidos */}
            <div className="md:col-span-3 space-y-2.5">
              <span className="font-serif text-sm font-semibold text-white block">
                Navegación
              </span>
              <div className="flex flex-col gap-1.5 text-xs text-[#C4B2AD]">
                <a href="#filosofia" className="hover:text-white transition-colors">
                  Forma de Trabajar
                </a>
                <a href="#tratamientos" className="hover:text-white transition-colors">
                  Tratamientos
                </a>
                <a href="#profesional" className="hover:text-white transition-colors">
                  Sobre el Consultorio
                </a>
                <a href="#instalaciones" className="hover:text-white transition-colors">
                  Instalaciones
                </a>
                <a href="#contacto" className="hover:text-white transition-colors">
                  Ubicación y Turnos
                </a>
              </div>
            </div>

            {/* Contacto y Cita Previa */}
            <div className="md:col-span-4 space-y-2.5">
              <span className="font-serif text-sm font-semibold text-white block">
                Atención en Consultorio
              </span>
              <div className="text-xs text-[#C4B2AD] space-y-1 font-light">
                <p>{address}</p>
                <p>{hours}</p>
                {phone && <p>Teléfono: {phone}</p>}
                <div className="pt-2">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white hover:text-[#C49A8F] font-medium transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 fill-[#128C7E] text-white" />
                    <span>WhatsApp oficial del consultorio</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#3E2E38] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A89895]">
            <span>
              {rawBusinessName} © {new Date().getFullYear()} • Todos los derechos reservados.
            </span>
            <span>
              Diseñada por Agente Bruno • WebPilot AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
