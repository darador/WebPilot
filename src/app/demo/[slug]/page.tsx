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
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Compass,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Propuesta Conceptual Web • WebPilot AI',
  description: 'Muestra preliminar de diseño y presencia web desarrollada por el agente Bruno.',
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

  // Helper classes for themes
  const colorMap = {
    cyan: {
      accent: 'text-cyan-400',
      bgHero: 'from-cyan-950/40 via-[#0a1220] to-[#070b14]',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      btnPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20',
      borderFocus: 'border-cyan-500/40',
      borderCard: 'border-cyan-900/30',
      cardHover: 'hover:border-cyan-500/40',
      bullet: 'bg-cyan-400',
    },
    blue: {
      accent: 'text-blue-400',
      bgHero: 'from-blue-950/40 via-[#0a1220] to-[#070b14]',
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
      borderFocus: 'border-blue-500/40',
      borderCard: 'border-blue-900/30',
      cardHover: 'hover:border-blue-500/40',
      bullet: 'bg-blue-400',
    },
    emerald: {
      accent: 'text-emerald-400',
      bgHero: 'from-emerald-950/40 via-[#0a1220] to-[#070b14]',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
      borderFocus: 'border-emerald-500/40',
      borderCard: 'border-emerald-900/30',
      cardHover: 'hover:border-emerald-500/40',
      bullet: 'bg-emerald-400',
    },
    indigo: {
      accent: 'text-indigo-400',
      bgHero: 'from-indigo-950/40 via-[#0a1220] to-[#070b14]',
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20',
      borderFocus: 'border-indigo-500/40',
      borderCard: 'border-indigo-900/30',
      cardHover: 'hover:border-indigo-500/40',
      bullet: 'bg-indigo-400',
    },
    purple: {
      accent: 'text-purple-400',
      bgHero: 'from-purple-950/40 via-[#0a1220] to-[#070b14]',
      badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      btnPrimary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20',
      borderFocus: 'border-purple-500/40',
      borderCard: 'border-purple-900/30',
      cardHover: 'hover:border-purple-500/40',
      bullet: 'bg-purple-400',
    },
    amber: {
      accent: 'text-amber-400',
      bgHero: 'from-amber-950/40 via-[#0a1220] to-[#070b14]',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      btnPrimary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20',
      borderFocus: 'border-amber-500/40',
      borderCard: 'border-amber-900/30',
      cardHover: 'hover:border-amber-500/40',
      bullet: 'bg-amber-400',
    },
  }[themeColor] || {
    accent: 'text-cyan-400',
    bgHero: 'from-cyan-950/40 via-[#0a1220] to-[#070b14]',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    btnPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20',
    borderFocus: 'border-cyan-500/40',
    borderCard: 'border-cyan-900/30',
    cardHover: 'hover:border-cyan-500/40',
    bullet: 'bg-cyan-400',
  };

  const whatsappLink = content.contact.whatsappPhone
    ? `https://wa.me/${content.contact.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        content.contact.whatsappMessage || 'Hola, me comunico desde la web para solicitar un turno o información.'
      )}`
    : null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. BANNER OBLIGATORIO DE PROPUESTA CONCEPTUAL */}
      <div className="sticky top-0 z-50 bg-[#0f172a] border-b border-amber-500/40 text-amber-200 px-4 py-2.5 text-xs shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Muestra Conceptual
            </span>
            <span className="font-semibold text-white">
              Propuesta no oficial • Preparada por WebPilot AI para {content.businessName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-amber-300/90">
            <span>Diseñada por Bruno</span>
            <span className="hidden md:inline">•</span>
            <span className="text-slate-400">Sin valor contractual</span>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="border-b border-[#162035] bg-[#090e1c]/80 backdrop-blur sticky top-[41px] z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block">
              {content.businessName}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {content.tagline}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${colorMap.btnPrimary}`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp Directo</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            ) : content.contact.phone ? (
              <a
                href={`tel:${content.contact.phone}`}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${colorMap.btnPrimary}`}
              >
                <Phone className="h-4 w-4" />
                <span>{content.contact.phone}</span>
              </a>
            ) : (
              <a
                href="#contacto"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${colorMap.btnPrimary}`}
              >
                <span>Contacto</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className={`relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b ${colorMap.bgHero}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            {content.hero.badgeText && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorMap.badge}`}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{content.hero.badgeText}</span>
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {content.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {content.hero.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02] ${colorMap.btnPrimary}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{content.hero.ctaPrimary.label}</span>
                </a>
              ) : (
                <a
                  href="#contacto"
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-[1.02] ${colorMap.btnPrimary}`}
                >
                  <span>{content.hero.ctaPrimary.label}</span>
                </a>
              )}

              {content.hero.ctaSecondary && (
                <a
                  href={content.hero.ctaSecondary.action}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-[#1e2a42] bg-[#0c1220] hover:bg-[#131d33] text-slate-200 transition-colors"
                >
                  <span>{content.hero.ctaSecondary.label}</span>
                </a>
              )}
            </div>

            {/* Benchmark / Inspiración notice */}
            {content.benchmarkNotice && (
              <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
                <Compass className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>{content.benchmarkNotice}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SERVICIOS */}
      <section id="servicios" className="py-16 sm:py-20 border-t border-[#162035] bg-[#080d18]">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accent}`}>
              Especialidades y Atención
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {content.services.heading}
            </h2>
            {content.services.subheading && (
              <p className="text-sm text-slate-400 leading-relaxed">
                {content.services.subheading}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.services.items.map((srv, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border bg-[#0c1220] transition-all space-y-3 ${colorMap.borderCard} ${colorMap.cardHover}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800 text-slate-200 font-mono text-xs font-bold">
                    0{idx + 1}
                  </span>
                  {srv.isProvisional && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Sugerido
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {srv.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VALORES Y BENEFICIOS */}
      <section className="py-16 sm:py-20 border-t border-[#162035] bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accent}`}>
              Nuestro Compromiso
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {content.features.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.features.items.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[#1a2336] bg-[#0c1220] space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACTO Y UBICACIÓN */}
      <section id="contacto" className="py-16 sm:py-20 border-t border-[#162035] bg-[#080d18]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider block ${colorMap.accent}`}>
                  Coordinación de Turnos y Consultas
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {content.contact.heading}
                </h2>
                <p className="text-sm text-slate-400">
                  Contactanos directamente para despejar dudas, solicitar presupuestos o coordinar tu turno.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-950/40 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">WhatsApp de Atención Rápida</span>
                      <span className="text-[11px] text-emerald-300/80">
                        {content.contact.whatsappPhone} • Click para enviar mensaje directo
                      </span>
                    </div>
                  </a>
                )}

                {content.contact.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0c1220] border border-[#162035]">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Teléfono</span>
                      <span className="text-white font-medium">{content.contact.phone}</span>
                    </div>
                  </div>
                )}

                {content.contact.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0c1220] border border-[#162035]">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Correo Electrónico</span>
                      <span className="text-white font-medium">{content.contact.email}</span>
                    </div>
                  </div>
                )}

                {content.contact.address && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0c1220] border border-[#162035]">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Dirección</span>
                      <span className="text-white font-medium">{content.contact.address}</span>
                      {content.contact.city && (
                        <span className="text-slate-400 text-xs block">{content.contact.city}</span>
                      )}
                    </div>
                  </div>
                )}

                {content.contact.hours && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0c1220] border border-[#162035]">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Horario de Atención</span>
                      <span className="text-white font-medium">{content.contact.hours}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mapa o Búsqueda en Google Maps */}
            <div className="rounded-2xl border border-[#1a2336] bg-[#0c1220] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span>Ubicación en Google Maps</span>
                </span>
                {content.contact.city && (
                  <span className="text-xs text-slate-400">{content.contact.city}</span>
                )}
              </div>

              <div className="h-56 rounded-xl bg-[#080d18] border border-[#162035] flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{content.businessName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {content.contact.address || content.contact.city || 'Atención en la zona'}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    content.contact.mapQuery || content.businessName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline pt-1"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {content.provisionalFlags && content.provisionalFlags.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[10px] uppercase">
                    <AlertCircle className="h-3 w-3" />
                    <span>Notas de la Propuesta</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
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

      {/* 7. FOOTER */}
      <footer className="border-t border-[#162035] bg-[#050810] py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">{content.businessName}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Propuesta conceptual de presencia web • Preparada por el equipo de WebPilot AI
            </p>
          </div>

          <div className="text-[11px] text-slate-600">
            Diseñada por Agente Bruno • WebPilot AI © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
