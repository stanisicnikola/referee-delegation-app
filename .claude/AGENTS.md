# AGENTS.md

Subagents working in this repository must read [CLAUDE.md](../CLAUDE.md) for full project context.

## Key Context for Agents

- This is a monorepo: `server/` (Express API) and `client/` (React SPA)
- Server uses CommonJS, client uses ESM — do not mix module systems
- Server follows Routes → Controllers → Services → Models layering — respect this separation
- Client data fetching goes through React Query hooks in `client/src/hooks/` — do not call API modules directly from components
- Forms use React Hook Form + Zod — validation schemas live in `client/src/validations/` (client) and `server/validators/` (server)
- Three user roles: admin, delegate, referee — pages and layouts are organized by role under `client/src/pages/<role>/`
- Auth is JWT-based via localStorage — see `client/src/context/AuthContext.jsx` and `server/middlewares/auth.js`

## Rules

- Do not introduce TypeScript — both server and client are plain JavaScript
- Do not add new dependencies without explicit approval
- Do not modify migration files that have already been run — create new migrations instead
- Keep the layered architecture: route handlers should call services, not query models directly
- Use Zod for all validation (server and client)
