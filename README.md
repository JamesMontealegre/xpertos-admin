# Xpertos · Panel de operación (admin)

Panel web del **operador de Xpertos**. Desde aquí se revisan las postulaciones de expertos, se asignan servicios, se definen las etapas de pago, se verifican comprobantes y se generan los contratos. Solo pueden entrar cuentas con `profiles.role = 'admin'`.

Stack: Next.js 16 (App Router, Server Components + Server Actions, `proxy.ts`), TypeScript, Tailwind 4 y Supabase (`@supabase/ssr`).

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/login` | Inicio de sesión con correo y contraseña. Si la cuenta no es admin se cierra la sesión. |
| `/` | Dashboard: métricas de `admin_dashboard()`, servicios por estado, últimas solicitudes y servicios. |
| `/solicitudes` | Postulaciones con filtro por estado y búsqueda por nombre/email. |
| `/solicitudes/[id]` | Detalle, documentos con URL firmada, notas y acciones (en revisión, pedir información, rechazar, aprobar). |
| `/servicios` | Servicios con filtro por estado y progreso de etapas pagadas. |
| `/servicios/[id]` | Detalle, cliente, fotos, línea de tiempo, asignación de experto con editor de etapas, contrato (generar / regenerar), etapas y pagos (verificar / rechazar, abrir siguiente etapa), reseñas. |
| `/expertos` | Expertos aprobados: categorías, rating, disponibilidad y servicios activos. |
| `/expertos/[id]` | Perfil, disponibilidad semanal y servicios asignados. |

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la API de Supabase (local: `http://127.0.0.1:55321`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima del proyecto. El panel usa solo la sesión del admin; las operaciones privilegiadas son RPC `security definer` protegidas con `is_admin()`. |

## Cómo correr

Requiere Node 24 (`nvm use 24`) y el backend local corriendo (`cd ../xpertos-backend && supabase start`).

```bash
npm install
npm run dev        # http://localhost:3001
```

Otros comandos:

```bash
npx tsc --noEmit   # typecheck
npm run lint       # eslint
npm run build      # build de producción
npm run start      # servir el build en el puerto 3001
```

## Usuario de prueba

El operador demo (`admin@xpertos.local`) y su contraseña están en `../xpertos-backend/supabase/seed.sql`, junto con un cliente, un experto aprobado, una postulación pendiente y un servicio de ejemplo.

## Estructura

```
src/
  proxy.ts                 # refresca la sesión y protege todas las rutas salvo /login
  lib/supabase/            # clientes browser / server / proxy tipados con database.types.ts
  lib/labels.ts            # etiquetas y colores de estados en español
  lib/format.ts            # COP y fechas es-CO
  components/ui/           # Badge, Button, Card, Input, Table, Dialog, ActionForm…
  app/login/               # pantalla y acciones de autenticación
  app/(panel)/             # layout con sidebar + pantallas del operador
```
