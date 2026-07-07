# Contexto del Proyecto — 18Stats Golf Tracker

## Resumen
Aplicación Next.js 16 para seguimiento de rondas de golf con estadísticas detalladas, soporte multi-jugador, verificación de hándicap RFEG y despliegue en AWS (EC2 + RDS Free Tier).

## Stack Tecnológico
- **Frontend/Backend:** Next.js 16 con App Router, React 19, Tailwind CSS 4
- **Base de datos:** PostgreSQL 16 — local (Docker) o AWS RDS Free Tier (producción)
- **ORM:** Prisma 7 (generador en `src/generated/prisma/`)
- **Autenticación:** JWT con session tokens + bcrypt
- **Estado:** Zustand (store en `src/store/useStore.ts`)
- **Idioma:** i18n EN/ES
- **Infra producción:** EC2 t2.micro (Amazon Linux 2023) + RDS db.t4g.micro + Caddy + DuckDNS
- **Contenedores:** Docker + Docker Compose

## Estructura de Datos (Prisma)

### User (autenticación)
- `id`, `email` (único), `passwordHash`, `firstName`, `lastName1`, `lastName2`
- `emailVerified`, `role` (admin/user), `sessionToken`

### Player (perfil de golfista)
- `id`, `email`, `firstName`, `lastName1`, `lastName2`
- `handicap`, `homeCourse`, `licenseNumber` (para RFEG)
- Relación: `rounds Round[]`, `handicapHistory HandicapEntry[]`

### Round (ronda)
- `id`, `playerId`, `courseId?`, `courseName`, `teeColor`
- `gameMode` (stroke-play | stableford | match-play)
- `date`, `totalHoles` (9/18), `completed`
- Relación: `holes Hole[]`

### Hole (hoyo)
- `id`, `roundId`, `number`, `par`, `score`
- `fairwayHit` (Yes/No/Left/Right/null), `gir` (bool?), `girDirection` (Long/Short/Left/Right?)
- `putts`, `puttDistance` (<1/1-2/2-4/4-8/+8), `penalties`
- `sandSave` (int, 0/1), `approach` (int), `drivingDistance` (int?)

### HandicapEntry (histórico)
- `id`, `playerId`, `date`, `handicap`

## Flujo de Datos — Estadísticas

```
Zustand store (useStore.ts)
  └─ rounds: Round[] (cada Round tiene players[], cada player tiene holes[])
       │
       ├─ Dashboard: completedRounds → calculateRoundStats() → avgStats + charts
       │
       └─ Round [id]: getRoundStats() → calculateRoundStats() → StatSummary
```

`calculateRoundStats()` en `src/lib/stats.ts` recibe `HoleData[]` y devuelve `PlayerStats` con:
- Score, To Par, Stableford
- Fairways (par 4/5), GIR, Scrambling, Sand Saves, Penalties
- Putts total/avg, Putts by distance, 3-putts
- Driving Distance avg
- Score distribution: Par3/Par4/Par5 avg + toPar
- Front 9 / Back 9: score, toPar, putts

## Reglas de Cálculo Clave

| Regla | Fórmula |
|-------|---------|
| **GIR** | `score - putts <= par - 2` (no `score <= par && putts <= 2`) |
| **Fairways** | Solo par 4+5 donde `fairwayHit` no es null |
| **Sand Saves** | `sandSave > 0 && score <= par` — cuentan hoyos, no suma de golpes |
| **Sand Save %** | `sandSaves / sandSavesTotal * 100` |
| **Scrambling** | GIR=false donde score ≤ par |
| **Driving Distance** | Promedio de `drivingDistance` donde > 0 |

## Bugs Corregidos

### 2026-06-29
1. **Cartel "actualizando handicap" atascado** — status stuck en `checking` por rerender. Fix: resetear a `idle` al saltar verificación.
2. **Login roto tras editar perfil** — se enviaba `email` y `homeCourse` al User API. Fix: solo enviar campos User.

### 2026-07-07 (sesión actual)
3. **sandSavePercentage siempre 0%** — no se calculaba. Fix: `sandSaves / sandSavesTotal * 100`.
4. **sandSaves / sandSavesTotal idénticos** — ambos sumaban golpes bunker. Fix: cuentan hoyos con `sandSave > 0`.
5. **drivingDistance no usado** — existía en DB pero no se agregaba. Fix: nuevo stat `avgDrivingDistance`.
6. **GIR fórmula incorrecta** en seed y frontend. Fix: `strokes - putts <= par - 2`.
7. **Seed: variable ordering** — `putts` se usaba antes de calcularse. Fix: orden correcto.
8. **Dockerfile** faltaba `COPY src/generated`. Fix: copiar Prisma client al runner stage.

## Cambios de Infraestructura

- **2026-07-07**: Migración de PostgreSQL Docker local → AWS RDS Free Tier
  - RDS: `db.t4g.micro`, 20GB gp2, mismo VPC que EC2, sin acceso público
  - SSL obligatorio: `sslmode=require&uselibpqcompat=true` en DATABASE_URL
  - `docker-compose.yml` en EC2 simplificado (solo app + caddy, sin db)
  - Volumen `pgdata` y contenedor `golf-tracker-db` eliminados

## Convenciones de Código

- **Estados asíncronos**: `idle` → `loading`/`checking` → `success`/`error`/`nolicense`
- **Design tokens**: `ft-card`, `ft-border`, `ft-text`, `ft-green-bright`, `ft-label`, `ft-muted`, `ft-surface`
- **Hole input order**: strokes → putts → fairway → GIR (toggle) → girDirection (cuando GIR=No) → bunker → approach → putt distance
- **Responsive**: mobile `max-w-lg`, desktop `lg:max-w-5xl` con grid 2-column (scorecard left, input sticky right)
- **No comentarios en código**.

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/stats.ts` | Cálculo de todas las estadísticas |
| `src/types/index.ts` | Interfaces PlayerStats, RoundStats, Round, HoleData |
| `src/components/StatSummary.tsx` | Cards de stats por ronda |
| `src/app/dashboard/page.tsx` | Dashboard con promedios, charts, score distribution |
| `src/app/round/[id]/page.tsx` | Scorecard + input hoyos + stats |
| `src/components/HoleInput.tsx` | Input secuencial por hoyo |
| `src/store/useStore.ts` | Estado global Zustand |
| `src/i18n/index.ts` | Traducciones EN/ES |
| `prisma/schema.prisma` | Esquema de base de datos |
| `Dockerfile` | Build multi-stage (deps → builder → runner) |
| `docker-compose.yml` | Servicios (local: db+app+caddy; prod: app+caddy) |
| `scripts/seed.ts` | Datos de prueba |

## Próximos Pasos (Roadmap)

- [ ] Score distribution charts (bar chart par-3/4/5)
- [ ] Scorecard ecléctico por campo
- [ ] Filtro de stats por campo
- [ ] Comparación social (multi-player rankings)
- [ ] Tests unitarios e integración
- [ ] PWA offline support
- [ ] Exportar stats (PDF/CSV)
