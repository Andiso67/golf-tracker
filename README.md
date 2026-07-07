# 18Stats - Golf Tracker

Seguimiento de rondas de golf con estadísticas detalladas, soporte multi-jugador, y verificación de hándicap RFEG.

## Stack

- **Frontend/Backend**: Next.js 16 (Turbopack, App Router)
- **Base de datos**: PostgreSQL 16 — local (Docker) o AWS RDS Free Tier (producción)
- **ORM**: Prisma 7
- **Estilos**: Tailwind CSS 4 + custom design tokens (`ft-*`)
- **Estado**: Zustand (store con slices separados)
- **Idioma**: TypeScript estricto + i18n EN/ES
- **Proxy HTTPS**: Caddy 2 (Let's Encrypt automático) via DuckDNS
- **Contenedores**: Docker + Docker Compose (local development); `docker compose` en EC2 (app + caddy only)

## Desarrollo local

```bash
# Requisitos: Node.js 22+, pnpm, Docker (para PostgreSQL)

git clone https://github.com/Andiso67/golf-tracker.git
cd golf-tracker
cp .env.example .env       # Editar DATABASE_URL
pnpm install
npx prisma migrate dev
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Para poblar datos de prueba:
```bash
npx tsx scripts/seed.ts --force
```
Usuario test: `test@example.com` / `password123`

## Despliegue en AWS EC2 (Free Tier) + RDS

### 1. Crear RDS PostgreSQL

- Motor: PostgreSQL 16
- Clase: `db.t4g.micro` (free tier)
- Storage: 20 GB gp2
- VPC: misma que la EC2
- Public access: No
- Security group `rds-golf`: inbound 5432 desde el SG de la EC2 (no desde 0.0.0.0/0)

### 2. Crear instancia EC2

- AMI: Amazon Linux 2023
- Tipo: t2.micro (free tier)
- Storage: 20 GB gp2
- Security group:
  - SSH (22) desde tu IP
  - HTTP (80) / HTTPS (443) desde 0.0.0.0/0

```bash
# Preparar Docker
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
sudo dnf install -y docker-compose-plugin
# Cerrar sesión y volver a entrar
```

### 3. Clonar y configurar

```bash
git clone https://<TOKEN>@github.com/Andiso67/golf-tracker.git
cd golf-tracker

cat > .env.production << 'EOF'
DATABASE_URL=postgresql://<USUARIO>:<PASSWORD>@<RDS_ENDPOINT>:5432/golf_tracker?schema=public&sslmode=require&uselibpqcompat=true
EOF
```

### 4. Desplegar

```bash
docker compose up -d --build app
docker compose up -d caddy
```

La app se conecta a RDS (no necesita contenedor PostgreSQL local).

### 5. Dominio y HTTPS (DuckDNS + Caddy)

1. [duckdns.org](https://duckdns.org) — añadir dominio (ej: `18stats`) con IP pública EC2
2. Caddy en EC2 obtiene certificados SSL automáticamente vía Let's Encrypt

### 6. Conectarse a RDS desde local (túnel SSH)

```bash
ssh -i ~/golf-tracker.pem -L 5433:<RDS_ENDPOINT>:5432 ec2-user@<EC2_IP>
```
Conectar cliente a `localhost:5433`.

## Estructura del proyecto

```
├── prisma/                 # Schema y migraciones
├── public/                 # Estáticos, manifest, SW
├── scripts/
│   └── seed.ts             # Poblado de datos de prueba
├── src/
│   ├── app/                # Páginas y API (App Router)
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # login, register, session, users
│   │   │   ├── courses/    # CRUD campos
│   │   │   ├── players/    # CRUD jugadores
│   │   │   ├── rfeg/       # Verificación licencia RFEG
│   │   │   └── rounds/     # CRUD rondas, hoyos, completar
│   │   ├── dashboard/      # Estadísticas agregadas
│   │   ├── round/[id]/     # Vista de ronda + stats por ronda
│   │   └── ...
│   ├── components/         # Componentes React
│   │   ├── BottomNav.tsx
│   │   ├── HoleInput.tsx   # Input por hoyo (strokes→putts→fairway→GIR→...)
│   │   ├── ScorecardTable.tsx
│   │   ├── StatSummary.tsx # Resumen de stats por ronda
│   │   └── StatsCard.tsx   # Card reutilizable
│   ├── hooks/
│   ├── i18n/               # EN/ES
│   ├── lib/
│   │   ├── stats.ts        # Cálculo de estadísticas
│   │   └── services/       # API services (auth, rounds, etc.)
│   ├── store/useStore.ts   # Zustand store
│   └── types/              # Interfaces TypeScript
├── Dockerfile
├── docker-compose.yml      # Local (db+app+caddy)
├── Caddyfile
└── .env.production         # EC2 (solo DATABASE_URL con RDS)
```

## API Endpoints

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Inicio de sesión |
| `/api/auth/register` | POST | Registro |
| `/api/auth/logout` | POST | Cerrar sesión |
| `/api/auth/me` | GET | Perfil actual |
| `/api/auth/session` | GET | Validar sesión |
| `/api/auth/users` | GET/POST | Listar/crear usuarios |
| `/api/auth/users/[id]` | PATCH | Editar usuario |
| `/api/auth/forgot-password` | POST | Solicitar reset |
| `/api/auth/reset-password` | POST | Resetear password |
| `/api/auth/verify-email` | GET | Verificar email |
| `/api/players` | GET/POST | Listar/crear jugadores |
| `/api/courses` | GET/POST | Listar/crear campos |
| `/api/courses/[id]` | GET | Detalle campo |
| `/api/courses/import` | POST | Importar campo |
| `/api/rounds` | GET/POST | Listar/crear rondas |
| `/api/rounds/[id]` | GET/PATCH | Obtener/editar ronda |
| `/api/rounds/[id]/hole/[number]` | PATCH | Actualizar hoyo |
| `/api/rounds/[id]/complete` | POST | Finalizar ronda |
| `/api/rfeg/verify` | POST | Verificar licencia RFEG |

## Estadísticas — Metodología

| Stat | Cálculo |
|------|---------|
| **Score** | Suma de golpes en hoyos con score > 0 |
| **To Par** | Score total - Par total |
| **Fairways %** | `Fairway='Yes'` / total hoyos par 4+5 con dato |
| **GIR %** | Golpes - Putts <= Par - 2 (regla oficial) |
| **Scrambling %** | Miss GIR donde score ≤ par |
| **Sand Saves** | Hoyos en bunker donde score ≤ par |
| **Putts avg** | Putts totales / hoyos jugados |
| **3-Putts** | Hoyos con putts ≥ 3 |
| **Par 3/4/5 avg** | Score promedio por tipo de par |
| **Front/Back 9** | Score y putts separados por hoyos 1-9 vs 10-18 |
| **Driving Distance** | Promedio de drivingDistance no nulos |

## Comandos de producción

```bash
# Actualizar y desplegar
git pull
docker compose up -d --build app

# Logs
docker compose logs -f

# Seed (ejecutar dentro del contenedor)
docker compose exec app sh -c "npx tsx scripts/seed.ts --force"
```

## Seguridad

- RDS sin acceso público (solo desde SG de EC2)
- Conexiones SSL obligatorias a RDS (sslmode=require)
- JWT para sesiones
- Contraseñas hasheadas con bcrypt
- Caddy maneja HTTPS automáticamente
- No exponer credenciales reales en documentación — generar con `openssl rand -base64 32`
