# WebPilot AI — Fase 1: Fundación del Sistema

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
```

> **Importante**: No expongas la clave `SUPABASE_SERVICE_ROLE_KEY` en el cliente. La aplicación utiliza exclusivamente `NEXT_PUBLIC_SUPABASE_ANON_KEY` para clientes browser y SSR bajo políticas de seguridad RLS.

---

## 3. Base de Datos y Migraciones SQL

El script de migración se encuentra en:
`supabase/migrations/20261110000001_initial_schema.sql`

Contiene:
1. **Tipos Enumerados**:
   - `crm_stage`: `NUEVO`, `AUDITADO`, `SELECCIONADO`, `CONTACTADO`, `RESPONDIÓ`, `NEGOCIACIÓN`, `GANADO`, `PERDIDO`.
   - `activity_type`: `CAMBIO_ESTADO`, `LLAMADA`, `EMAIL`, `REUNION`, `NOTA`, `IMPORTACION`.
   - `audit_status`: `PENDIENTE`, `EN_PROCESO`, `COMPLETADO`, `FALLIDO`.
   - `issue_severity`: `CRITICO`, `ALTO`, `MEDIO`, `BAJO`, `INFO`.
   - `proposal_status`: `BORRADOR`, `ENVIADO`, `ACEPTADO`, `RECHAZADO`.
   - `project_status`: `PLANIFICACION`, `EN_DESARROLLO`, `REVISION`, `ENTREGADO`, `CANCELADO`.
2. **Tablas Relacionales**:
   - `businesses`
   - `contacts`
   - `audits`
   - `audit_issues`
   - `opportunities`
   - `proposals`
   - `sales`
   - `projects`
   - `activities`
3. **Triggers Automáticos**:
   - `trigger_businesses_updated_at`: actualiza la columna `updated_at` en cada modificación.
   - `trigger_business_stage_change`: audita de forma nativa en la tabla `activities` cada cambio de estado comercial en `businesses` con el estado anterior y el nuevo.
4. **Políticas RLS**:
   - Acceso autenticado protegido para todas las operaciones.

Para ejecutar la migración en Supabase:
1. Dirigirse al panel de Supabase > **SQL Editor**.
2. Copiar y pegar el contenido de `supabase/migrations/20261110000001_initial_schema.sql`.
3. Hacer clic en **Run**.

---

## 4. Módulos Desarrollados en Fase 1

### 4.1 Dashboard Operativo
- Indicadores en tiempo real conectados a Supabase:
  - Total de negocios (`COUNT(*)`)
  - Negocios nuevos (`COUNT(*) WHERE status = 'NUEVO'`)
  - Negocios auditados (`COUNT(*)`)
  - Oportunidades calificadas (`COUNT(*)`)
  - Clientes ganados (`COUNT(*) WHERE status = 'GANADO'`)
  - Facturación acumulada (`SUM(sales.final_amount)`)
- Muestra cero en indicadores sin registros, sin datos ficticios.
- Sección de actividad comercial reciente en vivo.

### 4.2 Módulo de Negocios (CRUD Completo)
- **Campos**: Nombre del negocio, rubro, localidad, provincia, país, sitio web, teléfono, email, fuente, estado comercial, observaciones y fecha de creación.
- **Búsqueda y Filtros**: Búsqueda textual reactiva, filtro por rubro, localidad y estado comercial.
- **Paginación y Ordenamiento**: Navegación por páginas y ordenamiento por fecha.
- **Operaciones**: Modal para agregar negocio, modal de edición, eliminación con confirmación destructiva y vista de detalle integral por ID (`/prospects/[id]`).

### 4.3 Asistente de Importación CSV
- Mapeo inteligente y flexible de columnas (español e inglés).
- Detección de duplicados en doble nivel:
  1. Contra la base de datos Supabase existente por email y por dominio web normalizado.
  2. Dentro del propio archivo CSV.
- Pestañas de previsualización: válidos, duplicados omitidos y errores de estructura.
- **Confirmación explícita obligatoria** antes de insertar en base de datos.
- Generador y descarga directa de plantilla CSV de ejemplo (`webpilot_negocios_ejemplo.csv`).

### 4.4 Tablero CRM y Actividades
- Tablero visual organizado por las 8 etapas comerciales.
- Cambio ágil de estados con flechas de avance/retroceso o selector rápido.
- Modal para registro manual de actividades: **Llamadas telefónicas**, **Emails**, **Reuniones** y **Notas internas**.
- Generación automática de actividad en cada cambio de etapa con trazabilidad completa.

### 4.5 Seguridad & Autenticación
- Supabase Auth integrado con pantalla de Login y Registro interno (`/login`).
- Middleware de sesión para proteger todas las rutas privadas del dashboard.
- Redirección automática de usuarios no autenticados.

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
