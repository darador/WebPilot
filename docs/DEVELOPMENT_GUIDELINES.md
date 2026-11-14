# WebPilot AI — Guía de Desarrollo y Estándares Web

Este documento resume los principios de ingeniería, arquitectura y control de calidad aplicados en WebPilot AI. Para las directivas operativas del agente, consultar [`AGENTS.md`](file:///c:/Users/ruben/OneDrive/Escritorio/Proyectos/WebPilot/AGENTS.md).

---

## 1. Principios de Diseño y Experiencia de Usuario

* **Calidez y Confianza:** Los sitios generados (en especial rubros de salud, estética y profesionales) deben transmitir calidez humana, higiene y seriedad, evitando estéticas de publicación impresa obsoleta o de diario.
* **Tipografía Precisa:**
  * Tipografía sans-serif contemporánea (`Manrope`, `Plus Jakarta Sans`) para máxima legibilidad digital.
  * Interlineado amplio y cómodo (130%–140% en títulos y 150%–165% en cuerpo).
  * Balanceo tipográfico (`[text-wrap:balance]`) en titulares principales.
* **Paleta de Identidad:**
  * Fondos cálidos (`#FAF9F6`), tonos tierra complementarios y ciruela/malva (`#5B2148` / `#5E2750`) como acentos institucionales.
  * Verde de WhatsApp (`#128C7E`) reservado exclusivamente para canales de chat y contacto directo.

---

## 2. Uso Sostenible de Modern Web Guidance

WebPilot utiliza las recomendaciones del repositorio oficial de Google Chrome (`GoogleChrome/modern-web-guidance`) para:
* Consultar la disponibilidad Baseline de APIs nativas.
* Prevenir trucos JavaScript obsoletos para problemas que hoy resuelve el navegador de forma nativa.
* Proteger la accesibilidad nativa de formularios, controles y diálogos.

**Regla de Sostenibilidad:** No se adoptan APIs experimentales ni se reemplazan librerías consolidadas (React Hook Form, Zod, Supabase) sin una justificación de negocio y arquitectura aprobada.

---

## 3. Protocolo de Quality Gate

Antes del pase a producción de cualquier desarrollo o demo:
1. `npx tsc --noEmit` (0 errores de tipado).
2. Verificación de adaptación mobile a 375px y 390px.
3. Validación de enlaces funcionales de WhatsApp con texto predefinido (`encodeURIComponent`).
4. `npm run build` sin errores de compilación ni problemas de rutas dinámicas.
