# Contexto del Proyecto

## Resumen
Aplicación Next.js para gestión de jugadores de golf con sincronización de handicap desde la RFEG (Real Federación Española de Golf).

## Stack Tecnológico
- **Frontend:** Next.js 15+ con App Router, React 19, TailwindCSS
- **Backend:** Next.js API Routes (Serverless)
- **Base de datos:** PostgreSQL con Prisma ORM
- **Autenticación:** JWT con session tokens
- **Estado:** Zustand store (useStore.ts)
- **Idioma:** TypeScript estricto

## Estructura de Datos

### User (Modelo de autenticación)
- `id`: string (UUID)
- `email`: string (único, requerido)
- `password`: string (hash)
- `firstName`, `lastName1`, `lastName2`: string
- `emailVerified`: boolean | null
- `role`: 'admin' | 'user'
- `createdAt`, `updatedAt`: Date

### Player (Perfil de golfista)
- `id`: string (UUID)
- `userId`: string (FK a User)
- `email`: string (puede ser vacío)
- `firstName`, `lastName1`, `lastName2`: string
- `handicap`: number
- `homeCourse`: string
- `licenseNumber`: string (para sincronización RFEG)
- `createdAt`, `updatedAt`: Date

## Flujo de Autenticación

1. **Login:** `/api/auth/login` → devuelve `sessionToken`, `userId`, `email`
2. **Store:** `useStore` guarda el token y crea sesión
3. **Auto-creación de Player:** Si no existe Player al hacer login, se crea automáticamente
4. **Sync RFEG:** `useRfegHandicapSync` verifica handicap desde la API de RFEG si hay `licenseNumber`

## Archivos Clave

### Estado Global
- `src/store/useStore.ts`: Zustand store con auth, players, sesiones

### Hooks
- `src/hooks/useRfegHandicapSync.ts`: Sincronización asíncrona con RFEG

### Páginas
- `src/app/page.tsx`: Home con lista de jugadores y banner de sync
- `src/app/profile/page.tsx`: Perfil del jugador actual
- `src/app/settings/page.tsx`: Configuración y administración de usuarios
- `src/app/players/page.tsx`: Gestión de todos los jugadores

### API Routes
- `/api/auth/*`: Autenticación (login, register, sessions)
- `/api/players`: CRUD de jugadores
- `/api/auth/users/*`: CRUD de usuarios (admin)

## Bugs Conocidos y Soluciones

### Ver 2026-06-29
1. **Cartel "actualizando handicap" atascado** → SOLUCIONADO
   - Ver `IMPLEMENTATION_NOTES.md`

2. **Login roto tras editar perfil** → SOLUCIONADO
   - Ver `IMPLEMENTATION_NOTES.md`

## Convenciones

### Nombres de funciones
- `handleSave*`: Manejadores de guardado
- `use*`: Custom hooks
- `fetch*`: Operaciones de API

### Estados asíncronos
- `idle` → `checking`/`loading` → `updated`/`error`/`nolicense`

### Errores
- Silenciosos en operaciones no críticas (auto-creación de player)
- Mostrados al usuario en operaciones críticas (login, registro)

## Próximos Pasos (Roadmap)
- [ ] Tests unitarios y de integración
- [ ] Mejora de UX con loading states explícitos
- [ ] Validación de formularios más robusta
- [ ] Soporte para múltiples jugadores por usuario
- [ ] Dashboard con estadísticas de handicap