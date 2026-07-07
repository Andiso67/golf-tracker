# 18Stats - OpenCode Rules

## CRITICAL: Next.js 16 & React 19
- This project uses Next.js 16. DO NOT use Next.js 14/15 patterns (e.g., old `getServerSideProps`, Pages router).
- BEFORE writing any new Route, Server Action, or API, you MUST read the local documentation in `node_modules/next/dist/docs/` to check for breaking changes.
- Always use the App Router (`src/app/`). 

## Prisma 7 & PostgreSQL Workflows
- Schema is in `prisma/schema.prisma`.
- When modifying the schema, you MUST run `npx prisma generate` followed by `npx prisma db push`.
- Never write raw SQL. Use Prisma Client.
- If a query is slow, suggest adding an index in the Prisma schema.

## Production: AWS RDS + EC2 + Docker
- **RDS endpoint**: `golf-tracker-db.cudgqqkmkxp1.us-east-1.rds.amazonaws.com:5432`
- **DATABASE_URL** must include `sslmode=require&uselibpqcompat=true` (RDS requires SSL, `pg` driver default `verify-full` rejects RDS certs)
- **EC2**: `ec2-user@34.228.142.148`, key `golf-tracker.pem` in project root
- **Docker on EC2**: `docker-compose.yml` has ONLY `app` + `caddy` (no `db` service — uses RDS)
- **Deploy**: `git push` → `ssh` → `cd ~/golf-tracker && git pull && docker compose up -d --build app`
- **Caddy**: reverse-proxy `18stats.duckdns.org` → `app:3000` with auto HTTPS

## Architecture: User vs Player Separation
- **User Model**: STRICTLY for Auth (email, password, role). 
- **Player Model**: STRICTLY for Golf data (handicap, licenseNumber, homeCourse).
- NEVER send Player fields (like `homeCourse`) to User API endpoints (`/api/auth/users/*`).

## Stats Calculation Rules
- **GIR**: `strokes - putts <= par - 2` (NOT `score <= par && putts <= 2`)
- **Fairways**: count all holes where `fairwayHit` is not null (includes par 3s)
- **Sand Saves**: count holes with `sandSave > 0` where `score <= par` (counts holes, not sum of values)
- **Sand Save %**: `sandSaves / sandSavesTotal * 100`
- **Scrambling**: holes with `gir = false` where `score <= par`
- **Driving Distance**: average of `drivingDistance` where value > 0 and not null
- **Par 3/4/5**: group holes by `par`, compute avg score and total to-par
- **Front/Back 9**: split by `hole.number <= 9` / `hole.number > 9`

## State Management (Zustand)
- Global state is in `src/store/useStore.ts`.
- Keep slices separated (auth, players, ui).
- Never mutate state directly. Use the `set` function.
- When adding a new async operation, ensure you handle the `idle -> loading -> success/error` states explicitly to avoid UI bugs (like the stuck RFEG banner).

## Bug Fixing Protocol
1. Read `IMPLEMENTATION_NOTES.md` and `CONTEXT.md` first.
2. Trace the data flow: UI Component -> Zustand Hook -> API Route -> Prisma.
3. Propose a minimal fix. Do not refactor unrelated code.

## Design Tokens
- DO NOT use hardcoded Tailwind colors. Use `ft-card`, `ft-border`, `ft-text`, `ft-green-bright`, `ft-label`, `ft-muted`, `ft-surface`.
- StatsCard colors: `'emerald' | 'amber' | 'blue' | 'rose' | 'violet' | 'cyan'`

## Hole Input Order
Must follow this exact sequence: **strokes → putts → fairway → GIR (flag toggle) → girDirection (when GIR=No) → bunker → approach → putt distance**
