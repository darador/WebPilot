# Guía de Desarrollo y Protocolo Modern Web en WebPilot AI

Este documento establece el protocolo oficial de desarrollo para WebPilot AI y todos los proyectos web construidos por sus agentes (Lola, Tito, Vera, Bruno, Cata y Patricia).

---

## 1. Stack Tecnológico de Referencia

* **Framework:** Next.js 14 (App Router)
* **Librería UI:** React 18
* **Lenguaje:** TypeScript 5.6 (tipado estricto)
* **Estilos:** Tailwind CSS 3.4
* **Backend y Base de Datos:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
* **Validación y Formularios:** React Hook Form + Zod
* **Iconografía:** Lucide React

> **Regla de Estabilidad:** No reemplazar, migrar ni sobrecargar este stack (React Hook Form, Zod, Supabase, etc.) sin una justificación técnica concreta y aprobación previa del equipo.

---

## 2. Protocolo de Integración con Modern Web Guidance

Modern Web Guidance (`GoogleChrome/modern-web-guidance`) es una referencia técnica obligatoria para elevar la calidad, accesibilidad y rendimiento del código cliente, bajo las siguientes pautas:

### A. Consulta Previa Obligatoria
Antes de implementar o modificar HTML, CSS o JavaScript del lado del cliente:
1. Buscar si existe una guía moderna aplicable:
   ```bash
   npx.cmd -y modern-web-guidance@latest search "<2-5 palabras clave del caso de uso>"
   ```
2. Recuperar el estándar Baseline correspondiente:
   ```bash
   npx.cmd -y modern-web-guidance@latest retrieve "<id-guia>"
   ```

### B. Criterio Pragmático (No Dogmático)
* Las guías son una **referencia técnica de buenas prácticas**, no dogmas absolutos.
* Evaluar siempre la compatibilidad real con el navegador del usuario final, la accesibilidad comprobada y la simplicidad del código.
* **No imponer** el uso forzado de `<dialog>`, Popover API, Container Queries o APIs experimentales cuando una solución accesible existente con Tailwind/React resuelva el problema de forma más limpia y robusta.

### C. Uso Restringido de `legacy-scan`
* **NO ejecutar** `legacy-scan` en cada tarea habitual de desarrollo o corrección de bugs.
* Reservar `legacy-scan` exclusivamente para auditorías generales de modernización de código existente solicitadas explícitamente.

---

## 3. Separación Arquitectónica en Next.js 14

* **Server Components (por defecto):**
  * Toda la lógica de obtención de datos, consultas a Supabase, meta-etiquetas SEO, layout base y renderizado estático/dinámico debe residir en componentes del servidor (`async function Component`).
* **Client Components (`'use client'`):**
  * Reservar la directiva `'use client'` estrictamente para componentes interactivos (hooks de estado, efectos, eventos del DOM, formularios interactivos y selectores de variantes).
  * Cualquier API del navegador (`window`, `document`, IntersectionObserver, observadores de scroll) debe estar encapsulada en Client Components con defensas contra SSR.

---

## 4. Control de Calidad Progresivo (Quality Gate)

Cada cambio de interfaz o desarrollo de plantilla debe superar las siguientes 4 fases antes de darse por completado:

1. **Revisión Técnica:**
   * TypeScript estricto sin errores de compilación (`npx tsc --noEmit`).
   * Componentes modulares, sin duplicación de código ni dependencias superfluas.
2. **Validación Responsive y Funcional:**
   * Experiencia fluida verificada en anchos mobile (360px–390px), tablet (768px) y desktop (≥ 1024px).
   * Blancos táctiles (*touch targets*) de al menos 44×44 px en botones y enlaces interactivos.
   * Sin desbordes horizontales ni palabras huérfanas en titulares (`text-wrap: balance`).
3. **Accesibilidad y Rendimiento (CWV):**
   * Contraste cromático adecuado entre textos y fondos (estándar WCAG 2.1 AA).
   * Estabilidad visual inicial de la página (`CLS = 0`).
   * Optimización de imágenes (`aspect-ratio`, pre-carga de fuentes, dimensiones explícitas).
4. **Verificación de Regresiones:**
   * Compilación completa de producción (`npm run build`) verificando que todas las rutas estáticas y dinámicas se generen sin errores.

---

## 5. Transparencia en los Informes

En cada entrega técnica, el agente debe diferenciar claramente entre:
* **`[✓ Verificado]`**: Pruebas, compilaciones y validaciones efectivamente ejecutadas con éxito.
* **`[Pendiente / Recomendado]`**: Oportunidades de mejora opcionales o verificaciones manuales sugeridas al usuario.
