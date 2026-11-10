# WebPilot AI — Agencia Digital Automatizada

Plataforma interna para gestionar una agencia de desarrollo web automatizada mediante inteligencia artificial.

---

## 1. Stack Tecnológico

- **Framework**: Next.js 14 (App Router con Server Components y Client Components optimizados).
- **Lenguaje**: TypeScript.
- **Estilos**: Tailwind CSS (Tema Dark Navy predeterminado con acentos Electric Cyan y Blue).
- **Componentes**: Arquitectura inspirada en shadcn/ui con Lucide Icons.
- **Base de Datos & Auth**: Supabase (PostgreSQL con Row Level Security y Supabase Auth SSR).
- **Formularios & Validación**: React Hook Form y Zod.
- **Procesamiento de Archivos**: PapaParse para carga y validación de CSV.
- **Despliegue**: Optimizado para Vercel.

---

## 2. Variables de Entorno

Crear el archivo `.env.local` en la raíz del proyecto tomando como plantilla `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-privada # Opcional

# Google Places API (New) Key (para el agente de prospección Lola)
# Si no está configurada, Lola utiliza el motor local de alta fidelidad como fallback automático.
GOOGLE_MAPS_API_KEY=tu-clave-de-google-places
```

> **Importante**: No expongas la clave `SUPABASE_SERVICE_ROLE_KEY` en el cliente. La aplicación utiliza exclusivamente `NEXT_PUBLIC_SUPABASE_ANON_KEY` para clientes browser y SSR bajo políticas de seguridad RLS.

---

## 3. Base de Datos y Migraciones SQL

Los scripts de migración se encuentran en `supabase/migrations/`:
1. `20261110000001_initial_schema.sql` (Esquema relacional base, triggers y RLS inicial).
2. `20261110000002_fix_rls_policies.sql` (Permisos permisivos para acceso de equipo y operaciones de agencia).
3. `20261110000003_lola_agent.sql` (Tablas para el agente Lola: `lola_searches` y `lola_candidates`).

### Para ejecutar las migraciones en Supabase:
1. Dirigirse al panel de Supabase > **SQL Editor**.
2. Copiar y pegar el contenido de los archivos SQL de migración en orden.
3. Hacer clic en **Run**.

---

## 4. Módulos Desarrollados

### 4.1 Nuestro Equipo Digital (`/team`)
Presentación de los 6 asistentes virtuales de WebPilot AI diseñados para el equipo de Daro y Julieta:
- **LOLA** — La cazadora de negocios (Prospección | Operativa).
- **TITO** — El inspector (Auditoría técnica web | Próximamente Fase 2B).
- **VERA** — La estratega (Análisis comercial y oportunidades | Próximamente).
- **BRUNO** — El creativo (Diseño y construcción de sitios | Próximamente).
- **CATA** — La comercial (Seguimiento y propuestas | Próximamente).
- **RAMÓN** — Control de calidad (Revisión antes de entrega | Próximamente).

Avatares 3D ilustrados almacenados localmente en `/public/agents/*.svg`.

### 4.2 Lola — Buscadora de Negocios (`/agents/lola`)
Primer agente real operativo de WebPilot AI:
- **Búsqueda parametrizada**: Rubro, Localidad, Provincia, País, Cantidad máxima de resultados y Filtros web (Todos, Con web, Sin web).
- **Motor de prospección híbrido**: Conexión nativa con **Google Places API (New)** con fallback inteligente para operar de inmediato sin bloquear al usuario.
- **Investigador de sitios web seguro (SSRF-Protected)**: Validador de IPs privadas y metadatos cloud, detección de WhatsApp, formularios de contacto, etiquetas de responsividad móvil y diagnóstico preliminar en español argentino.
- **Tabla de candidatos y aprobación**: Separación entre candidatos de investigación y el directorio central. Incorporación al CRM en un clic con deduplicación por dominio, email o nombre.

### 4.3 Dashboard Operativo (`/`)
- Indicadores en tiempo real conectados a Supabase:
  - Total de negocios (`COUNT(*)`)
  - Negocios nuevos (`COUNT(*) WHERE status = 'NUEVO'`)
  - Negocios auditados (`COUNT(*)`)
  - Oportunidades calificadas (`COUNT(*)`)
  - Clientes ganados (`COUNT(*) WHERE status = 'GANADO'`)
  - Facturación acumulada (`SUM(sales.final_amount)`)
- Muestra cero en indicadores sin registros, sin datos ficticios.
- Sección de actividad comercial reciente en vivo.

### 4.4 Módulo de Negocios (`/prospects`)
- CRUD completo adaptado al español argentino natural.
- Búsqueda textual reactiva y filtros por rubro, localidad y estado comercial.
- Vista de detalle integral por ID (`/prospects/[id]`).

### 4.5 Asistente de Importación CSV (`/prospects/import`)
- Asistente guiado de 8 pasos.
- Detección de duplicados en doble nivel (base de datos y archivo CSV).
- Descarga de plantilla CSV de ejemplo.

### 4.6 Tablero CRM Kanban (`/crm`)
- Tablero visual organizado por las 8 etapas comerciales.
- Registro manual y automático de actividades con historial de trazabilidad.

---

## 5. Comandos de Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Compilación de producción
npm run build

# Iniciar servidor de producción
npm start
```
