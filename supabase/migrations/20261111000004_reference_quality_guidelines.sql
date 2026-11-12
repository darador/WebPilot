-- ==============================================================================
-- WebPilot AI — Migración: Guía de Calidad y Benchmark en Biblioteca de Referencias
-- Fecha: 11 de Noviembre de 2026
-- Objetivo: Incorporar los 10 criterios de calidad observables de la web de referencia
--           (https://draanalaurabatalles.com.ar/) para que el agente Bruno diseñe
--           demos de odontología y otros rubros con estándares comerciales de excelencia.
-- ==============================================================================

-- 1. Agregar columna quality_guidelines a industry_references si no existe
ALTER TABLE IF EXISTS industry_references
ADD COLUMN IF NOT EXISTS quality_guidelines JSONB DEFAULT '{}'::jsonb;

-- 2. Actualizar la referencia oficial de la Dra. Ana Laura Batalles con los 10 puntos de benchmark
UPDATE industry_references
SET quality_guidelines = '{
  "section_order": [
    {"section": "Header", "purpose": "Identidad profesional inmediata, teléfono de contacto y botón directo a WhatsApp."},
    {"section": "Hero", "purpose": "Propuesta de valor humana centrada en el paciente, fotografía del consultorio, doble CTA y pilares de confianza local."},
    {"section": "Sobre la Profesional", "purpose": "Presentación personal, matrícula, vocación, trato sin dolor y enfoque en odontología biológica e integral."},
    {"section": "Tratamientos y Especialidades", "purpose": "Catálogo estructurado con recursos visuales, beneficios comprensibles y consulta por tratamiento."},
    {"section": "Instalaciones y Confort", "purpose": "Muestra del espacio, tecnología de precisión, higiene rigurosa y ambiente relajante para reducir la ansiedad."},
    {"section": "Preguntas Frecuentes", "purpose": "Resolución de dudas habituales (cómo solicitar turno, urgencias, medios de pago) eliminando fricción."},
    {"section": "Ubicación y Contacto", "purpose": "Dirección física exacta en Quilmes, mapa interactivo, horarios y WhatsApp directo."},
    {"section": "Botón Flotante de WhatsApp", "purpose": "Canal de conversión permanente y accesible en todo el recorrido de la página."},
    {"section": "Pie de Página", "purpose": "Enlaces de navegación, canales institucionales y datos legales."}
  ],
  "visual_style": {
    "palette_description": "Paleta luminosa y serena: blanco puro como base, neutros suaves (slate-50), azul médico/celeste sereno (sky-600/700) y verde WhatsApp oficial (#25D366).",
    "primary_colors": ["#0284c7", "#0369a1", "#25D366", "#0f172a"],
    "background_tones": ["#ffffff", "#f8fafc", "#f0f9ff"],
    "typography_family": "Sans-serif geométrica moderna y limpia (Inter / Montserrat / Poppins) con pesos contrastados.",
    "spacing_rhythm": "Espaciado generoso (padding vertical de 80px a 100px entre bloques) que transmite orden, pulcritud y tranquilidad clínica."
  },
  "photography_composition": {
    "style": "Fotografía luminosa, real y cercana con luz natural y colores fidedignos, evitando imágenes de stock artificiales.",
    "framing": "Encuadres asimétricos con esquinas redondeadas (rounded-3xl), sombras suaves y tarjetas flotantes de contexto.",
    "atmosphere": "Ambiente de consultorio ordenado, moderno y cálido que disipa el miedo al dentista."
  },
  "typography_hierarchy": {
    "hero_headline_formula": "Verbo de cuidado/bienestar + beneficio del paciente + diferenciador de atención (ej. Cuidamos tu sonrisa con atención personalizada y tecnología de avanzada).",
    "section_eyebrow_formula": "Etiqueta superior en mayúsculas pequeñas con espaciado amplio (ej. ESPECIALIDADES Y ATENCIÓN, SOBRE EL CONSULTORIO).",
    "body_readability": "Párrafos breves de 2 a 3 líneas con tamaño legible (text-sm/base) y color gris neutro suave (text-slate-600)."
  },
  "cta_design": {
    "primary_channel": "WhatsApp como canal principal de respuesta rápida.",
    "button_styling": "Botón pill o redondeado en verde WhatsApp (#25D366) con icono visible, texto en negrita y efecto hover.",
    "microcopy": "Llamados específicos y no invasivos: Consultar por WhatsApp, Coordinar turno, Consultar tratamiento.",
    "frequency_and_placement": "Header fijo, Hero principal, pie de cada tratamiento individual, sección de contacto y botón flotante en esquina inferior derecha."
  },
  "treatments_presentation": {
    "layout": "Cuadrícula organizada de tarjetas elevadas con cabecera fotográfica, numeración sutil y borde suave.",
    "card_elements": ["Fotografía representativa", "Título de la especialidad", "Descripción explicativa de beneficios", "Enlace directo con mensaje prellenado a WhatsApp"],
    "patient_orientation": "Enfocado en resolver la necesidad del paciente (prevención, estética, alivio de dolor, alineación) y no en jerga médica incomprensible."
  },
  "professional_presentation": {
    "focus": "Humanización de la figura médica: se muestra a la profesional de forma accesible, sonriente y cercana.",
    "tone": "Empatía, vocación y rigor profesional.",
    "reassurance_pillars": ["Atención personalizada y sin dolor", "Diagnóstico integral con tecnología de precisión", "Puntualidad en los turnos para cuidar el tiempo del paciente"]
  },
  "trust_elements": [
    "Ubicación física tangible y verificable en Quilmes",
    "Nombre y especialidad de la profesional a cargo",
    "Turnos coordinados con cita previa sin esperas en sala",
    "Canal de WhatsApp directo atendido por personas",
    "Sección de preguntas frecuentes que transparenta el proceso y los pagos",
    "Certificado de navegación segura HTTPS"
  ],
  "responsive_experience": {
    "desktop": "Composición editorial en 2 columnas con fotografía protagonista y respiración visual.",
    "mobile": "Apilamiento vertical natural con tipografía ajustada, botones táctiles de 44px mínimo y WhatsApp siempre accesible en la zona del pulgar.",
    "thumb_zone_cta": "Botón flotante de WhatsApp accesible permanentemente sin obstaculizar la lectura."
  },
  "differentiating_factors": [
    "No parece una plantilla genérica oscura ni un sitio de software",
    "Diseño 100% orientado a convertir visitas en consultas por WhatsApp",
    "Equilibrio exacto entre rigor clínico y calidez humana",
    "Jerarquía visual que guía la mirada naturalmente desde el Hero hasta el botón de contacto"
  ]
}'::jsonb
WHERE website_url = 'https://draanalaurabatalles.com.ar/'
   OR name ILIKE '%Batalles%';
