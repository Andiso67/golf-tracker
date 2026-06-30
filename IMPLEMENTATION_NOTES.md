# Notas de Implementación

## Bugs Corregidos (2026-06-29)

### 1. Cartel "Actualizando handicap" atascado
**Archivos:** `src/hooks/useRfegHandicapSync.ts`

**Problema:**
- Cuando el componente se rerenderizaba mientras el fetch de RFEG estaba pendiente, el status se quedaba en `'checking'` para siempre.
- La causa: el efecto detectaba que ya se había sincronizado ese player (`syncedRef.current === player.id`) y retornaba sin limpiar el status.

**Solución:**
- Al saltar la verificación (porque ya está sincronizado), ahora se resetea el status a `'idle'`.
- Esto evita que el banner de "actualizando" se quede visible indefinidamente.

---

### 2. Login roto tras editar perfil de jugador
**Archivos:** `src/app/settings/page.tsx`, `src/app/profile/page.tsx`

**Problema:**
- `handleSaveProfile` enviaba `email: player?.email || ''` al User API (`/api/auth/users/${currentUserId}`).
- Si no había Player seleccionado o el email estaba vacío, se sobrescribía el email del usuario con `''`.
- Resultado: imposible volver a hacer login porque el email del usuario estaba vacío.

**Solución:**
- El User API ahora solo recibe campos de usuario: `firstName`, `lastName1`, `lastName2`.
- El email y `homeCourse` son específicos del Player, no del User.
- Se eliminó el envío de `email` y `homeCourse` al User API en ambos archivos.

**Nota:** El User API (`/api/auth/users/[id]`) tiene un campo `homeCourse` que no existe en el modelo User. Esto causaba errores silenciosos.

---

## Decisiones de Arquitectura

### Separación User vs Player
- **User:** Autenticación, email, nombre completo.
- **Player:** Datos del golfista (handicap, licenseNumber, homeCourse, etc.).
- El User API solo debe manejar campos del modelo User.
- El Player API maneja todos los campos del modelo Player.

### Sincronización RFEG
- La sincronización de handicap con RFEG es asíncrona y puede tardar.
- El UI debe mostrar estados claros: `idle` → `checking` → `updated`/`error`/`nolicense`.
- Los estados deben limpiarse correctamente al cambiar de player o rerenderizar.

---

## Pendientes / Mejoras Potenciales

- [ ] Validar que `player` no sea null antes de permitir guardar en el perfil.
- [ ] Añadir loading states más explícitos en los formularios.
- [ ] Tests de integración para el flujo de login y edición de perfil.
- [ ] Manejo de errores más detallado (mostrar mensajes al usuario).

---

## Comandos Útiles

```bash
# TypeScript check
npx tsc --noEmit

# Restart dev server
lsof -ti:3000 | xargs kill -9 2>/dev/null
pnpm dev

# Commit changes
git add .
git commit -m "fix: descripción del cambio"
```