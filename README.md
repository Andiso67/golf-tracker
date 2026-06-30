# 18Stats - Golf Tracker

Seguimiento de rondas de golf con verificación de hándicap RFEG.

## Stack

- **Frontend/Backend**: Next.js 16 (Turbopack)
- **Base de datos**: PostgreSQL 16
- **ORM**: Prisma 7
- **Estilos**: Tailwind CSS 4
- **Estado**: Zustand
- **Proxy HTTPS**: Caddy 2 (Let's Encrypt automático)
- **Contenedores**: Docker + Docker Compose

## Requisitos locales

- Node.js 22+
- pnpm
- PostgreSQL 16 (local o Docker)

## Desarrollo local

```bash
# Clonar
git clone https://github.com/Andiso67/golf-tracker.git
cd golf-tracker

# Variables de entorno
cp .env.example .env
# Editar DATABASE_URL en .env

# Instalar dependencias
pnpm install

# Preparar base de datos
npx prisma migrate dev

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Despliegue en AWS EC2 (Free Tier)

### 1. Crear instancia EC2

- AMI: Amazon Linux 2023
- Tipo: t2.micro (free tier)
- Storage: 20 GB gp2
- Security Group:
  - SSH (22) desde tu IP
  - HTTP (80) desde 0.0.0.0/0
  - HTTPS (443) desde 0.0.0.0/0
- Key pair: crear o usar existente

### 2. Conectar y preparar

```bash
chmod 400 ~/Downloads/tu-clave.pem
ssh -i ~/Downloads/tu-clave.pem ec2-user@<IP_PUBLICA>

# Docker
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# Docker Compose plugin
sudo dnf install -y docker-compose-plugin

# Cerrar sesión y volver a entrar
exit
ssh -i ~/Downloads/tu-clave.pem ec2-user@<IP_PUBLICA>
```

### 3. Clonar y desplegar

```bash
# Clonar (usando token de GitHub)
git clone https://<TOKEN>@github.com/Andiso67/golf-tracker.git
cd golf-tracker

# Variables de producción
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://golf:golf_dev@db:5432/golf_tracker?schema=public
POSTGRES_USER=golf
POSTGRES_PASSWORD=golf_dev
POSTGRES_DB=golf_tracker
EOF

# Construir y arrancar
sudo docker build --no-cache -t golf-tracker-app .
sudo docker compose up -d
```

### 4. Dominio y HTTPS (DuckDNS + Caddy)

1. Ir a https://duckdns.org
2. Iniciar sesión con GitHub/Google
3. Añadir dominio (ej: `18stats`)
4. Introducir IP pública de la EC2 y hacer **Update IPv4**

5. En la EC2, actualizar y desplegar:

```bash
cd ~/golf-tracker
git pull
sudo docker build --no-cache -t golf-tracker-app .
sudo docker compose down
sudo docker compose up -d
```

### 5. Comandos útiles

```bash
# Ver logs
sudo docker compose logs -f

# Ver estado
sudo docker ps

# Reiniciar Caddy
sudo docker compose restart caddy

# Reconstruir app
sudo docker build --no-cache -t golf-tracker-app .
sudo docker compose up -d
```

### 6. Conectarse a la base de datos desde local

El contenedor de PostgreSQL **no está expuesto a internet** (solo escucha en `127.0.0.1` dentro de la EC2).

#### Opción A — psql directo por SSH

```bash
ssh -i ~/Downloads/tu-clave.pem ec2-user@<IP_PUBLICA>
docker exec -it golf-tracker-db psql -U golf golf_tracker
```

#### Opción B — Túnel SSH + pgAdmin/DBeaver

```bash
# En una terminal, abre el túnel (déjalo corriendo):
ssh -i ~/Downloads/tu-clave.pem -L 5433:localhost:5432 ec2-user@<IP_PUBLICA>
```

Luego conecta tu cliente gráfico a:

| Campo       | Valor        |
|-------------|-------------|
| Host        | `localhost` |
| Port        | `5433`      |
| Username    | `golf`      |
| Password    | `golf_dev`  |
| Database    | `golf_tracker` |

**Recomendación**: [pgAdmin](https://www.pgadmin.org/download/) (gratuito, multiplataforma). Alternativas: DBeaver, TablePlus.

## Estructura del proyecto

```
├── prisma/              # Schema y migraciones
├── public/              # Estáticos, manifest, SW
├── src/
│   ├── app/             # Páginas y API routes (Next.js App Router)
│   │   ├── api/         # API routes (auth, rounds, courses, rfeg)
│   │   └── round/[id]/  # Vista de ronda
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── i18n/            # Traducciones EN/ES
│   ├── lib/             # Lógica de negocio, servicios, stats
│   ├── store/           # Zustand store
│   └── types/           # Tipos TypeScript
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
└── .env.production      # Variables de producción
```

## API endpoints

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Inicio de sesión |
| `/api/auth/register` | POST | Registro |
| `/api/auth/me` | GET | Perfil actual |
| `/api/rounds` | GET/POST | Listar/crear rondas |
| `/api/rounds/[id]/hole/[number]` | PATCH | Actualizar hoyo |
| `/api/rounds/[id]/complete` | POST | Finalizar ronda |
| `/api/rfeg/verify` | POST | Verificar licencia RFEG |
| `/api/courses` | GET/POST | Listar/crear campos |
