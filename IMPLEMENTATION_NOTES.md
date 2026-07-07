# Notas de Implementación

## Infraestructura — Migración a AWS RDS (2026-07-07)

### Cambio
PostgreSQL Docker local → AWS RDS Free Tier (`db.t4g.micro`, 20GB gp2).

### Motivación
- Base de datos persistente y gestionada
- No depender del volumen Docker en la EC2
- Backup automático, multi-AZ ready

### Configuración RDS
- Endpoint: `golf-tracker-db.cudgqqkmkxp1.us-east-1.rds.amazonaws.com:5432`
- Security group `rds-golf`: inbound 5432 desde SG de EC2 solamente
- SSL requerido → `sslmode=require&uselibpqcompat=true` en DATABASE_URL
- `uselibpqcompat=true` necesario porque el driver `pg` por defecto usa `verify-full` que rechaza el certificado auto-firmado de RDS

### docker-compose.yml en producción
Versión EC2 (sin db, usa RDS):
```yaml
services:
  app:
    build: .
    container_name: golf-tracker-app
    restart: unless-stopped
    env_file:
      - .env.production
  caddy:
    image: caddy:2
    container_name: golf-tracker-caddy
    restart: unless-stopped
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
volumes:
  caddy_data:
  caddy_config:
```

### Comandos de deploy
```bash
git pull
docker compose up -d --build app
docker compose up -d caddy
```

---

## Dockerfile Fix (2026-07-07)

### Problema
El runner stage no tenía `src/generated/` (Prisma Client), causando error al ejecutar seed.

### Solución
Añadido en `Dockerfile` línea 26:
```dockerfile
COPY --from=builder /app/src/generated ./src/generated
```

---

## GIR Formula Fix (2026-07-07)

### Problema
El seed y frontend usaban `score <= par && putts <= 2`, incorrecto según la definición oficial de GIR.

### Solución correcta
```
GIR = strokes - putts <= par - 2
```
Actualizado en: `scripts/seed.ts` (3 ocurrencias), `src/app/round/[id]/page.tsx` (3 ocurrencias).

---

## Stats Bugs Fix (2026-07-07)

### Bug 1: sandSavePercentage siempre 0%
**Causa:** El campo `sandSavePercentage` estaba hardcodeado a `0` en el return de `calculatePlayerStats()`.

### Bug 2: sandSaves / sandSavesTotal idénticos
**Causa:** Ambos se calculaban como `sum(h.sandSave)` (suma de 0s y 1s). Un hoyo con `sandSave=2` (múltiples golpes en bunker) contaba como 2 saves.

**Solución (ambos):**
```typescript
const sandSavesTotal = played.filter((h) => h.sandSave > 0).length;
const sandSaves = played.filter((h) => h.sandSave > 0 && h.score <= h.par).length;
```

### Bug 3: drivingDistance no usado
**Causa:** `drivingDistance` existía en DB y se recolectaba en el input, pero `PlayerStats` no tenía campo y `calculatePlayerStats` no lo agregaba.

**Solución:** Nuevo stat `avgDrivingDistance` agregado a tipo, cálculo, y card en dashboard.

---

## Seed Fix (2026-07-07)

### Problema
`putts` se calculaba después de usarse en la fórmula GIR. En TypeScript no daba error por hoisting, pero el valor era incorrecto.

### Solución
Mover cálculo de `putts` antes de la condición GIR.

---

## Score Distribution + Front/Back 9 (2026-07-07)

### Nuevos stats agregados
- `par3Count`, `par3Avg`, `par3ToPar` — promedio y toPar en pares 3
- `par4Count`, `par4Avg`, `par4ToPar` — idem para pares 4
- `par5Count`, `par5Avg`, `par5ToPar` — idem para pares 5
- `front9Score`, `front9ToPar`, `front9Putts` — stats primeros 9 hoyos
- `back9Score`, `back9ToPar`, `back9Putts` — stats segundos 9 hoyos

### UI
- **StatSummary**: 3 cards Par3/4/5 en grid, 2 cards Front9/Back9
- **Dashboard**: secciones "Score by Par" y "Front 9 vs Back 9" con agregados acumulados

---

## Bugs Anteriores (2026-06-29)

### 1. Cartel "Actualizando handicap" atascado
**Archivos:** `src/hooks/useRfegHandicapSync.ts`

**Problema:** Cuando el componente se rerenderizaba mientras el fetch de RFEG estaba pendiente, el status se quedaba en `'checking'` para siempre porque el efecto detectaba que ya se había sincronizado (`syncedRef.current === player.id`) y retornaba sin limpiar el status.

**Solución:** Resetear status a `'idle'` al saltar verificación.

### 2. Login roto tras editar perfil
**Archivos:** `src/app/settings/page.tsx`, `src/app/profile/page.tsx`

**Problema:** `handleSaveProfile` enviaba `email` y `homeCourse` al User API, sobrescribiendo el email del usuario con cadena vacía si no había Player seleccionado.

**Solución:** User API solo recibe campos User: `firstName`, `lastName1`, `lastName2`. Nunca enviar `email` o `homeCourse`.

---

## Decisiones de Arquitectura

### Separación User vs Player
- **User:** Autenticación, email, nombre completo.
- **Player:** Datos del golfista (handicap, licenseNumber, homeCourse).
- User API nunca debe recibir campos Player.

### Cálculo de Fairways
Golf GameBook y la mayoría de apps solo cuentan fairways en par 4 y par 5. En golf-tracker contamos todos los hoyos donde `fairwayHit` no es null (incluye par 3). El dashboard usa este criterio.

### Sincronización RFEG
- Asíncrona, estados: `idle` → `checking` → `updated`/`error`/`nolicense`
- Limpiar estados al cambiar de player

---

## Comandos Útiles

```bash
# TypeScript check
npx tsc --noEmit

# Build Next.js
npx next build

# Seed (local)
npx tsx scripts/seed.ts --force

# Deploy a EC2
git push
ssh -i golf-tracker.pem ec2-user@<IP> "cd ~/golf-tracker && git pull && docker compose up -d --build app"

# Conectar a RDS por túnel
ssh -i golf-tracker.pem -L 5433:<RDS_ENDPOINT>:5432 ec2-user@<IP>
```
