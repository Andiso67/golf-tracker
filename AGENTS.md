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

## Architecture: User vs Player Separation
- **User Model**: STRICTLY for Auth (email, password, role). 
- **Player Model**: STRICTLY for Golf data (handicap, licenseNumber, homeCourse).
- NEVER send Player fields (like `homeCourse`) to User API endpoints (`/api/auth/users/*`).

## State Management (Zustand)
- Global state is in `src/store/useStore.ts`.
- Keep slices separated (auth, players, ui).
- Never mutate state directly. Use the `set` function.
- When adding a new async operation, ensure you handle the `idle -> loading -> success/error` states explicitly to avoid UI bugs (like the stuck RFEG banner).

## Bug Fixing Protocol
1. Read `IMPLEMENTATION_NOTES.md` and `CONTEXT.md` first.
2. Trace the data flow: UI Component -> Zustand Hook -> API Route -> Prisma.
3. Propose a minimal fix. Do not refactor unrelated code.