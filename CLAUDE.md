# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Referee Delegation App — a system for managing referee assignments to sports matches. Three user roles: **admin**, **delegate** (assigns referees to matches), and **referee**. Monorepo with `server/` (Express API) and `client/` (React SPA).

## Commands

### Server (from `server/`)
```bash
npm start                # Start dev server with nodemon (default port 8000)
npm run db:migrate       # Run Sequelize migrations
npm run db:migrate:undo  # Undo all migrations
npm run db:seed          # Run all seeders
npm run db:seed:undo     # Undo all seeders
npm run db:reset         # Full reset: undo migrations → migrate → seed
```

### Client (from `client/`)
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Server — Express + Sequelize + MySQL

Layered architecture: **Routes → Controllers → Services → Models**

- `server/routes/` — Express route definitions, mounted at `/api/<resource>`
- `server/controllers/` — Request handling, calls services
- `server/services/` — Business logic layer
- `server/models/` — Sequelize model definitions (auto-loaded via `models/index.js`)
- `server/validators/` — Zod schemas for request validation
- `server/middlewares/` — `authenticate`/`authorize` (JWT-based), `errorHandler`/`AppError`/`asyncHandler`, `validate`/`validateBody`/`validateQuery`/`validateParams` (Zod), `uploadTeamLogo`/`uploadAvatar` (multer)
- `server/migrations/` — Sequelize CLI migrations
- `server/seeders/` — Seed data
- `server/config/config.js` — DB config from env vars (`DB_USER`, `DB_PASS`, `DB_NAME`, `DB_HOST`, `DB_DIALECT`)
- `server/uploads/` — Static file uploads served at `/uploads`

Server uses CommonJS (`require`/`module.exports`). Plain JavaScript, no TypeScript.

### Client — React + Vite + MUI

- `client/src/api/` — Axios-based API modules per resource. `axios.js` configures base URL (`VITE_API_URL`), auth token interceptor, and 401 redirect
- `client/src/hooks/` — React Query hooks per resource (e.g., `useVenues.js`, `useMatches.js`). Admin-specific hooks in `hooks/admin/`
- `client/src/pages/` — Page components organized by role: `admin/`, `delegate/`, `referee/`
- `client/src/layouts/` — `AdminLayout`, `DelegateLayout`, `RefereeLayout` — each role has its own shell layout
- `client/src/routes/AppRoutes.jsx` — All routing with `ProtectedRoute` (role-based) and `PublicRoute` wrappers
- `client/src/context/AuthContext.jsx` — Auth state via React Context + React Query, JWT token in localStorage
- `client/src/components/` — Shared UI components in `ui/`, role-specific in `delegate/`, `user/`
- `client/src/validations/` — Zod schemas for form validation
- `client/src/theme/` — MUI theme configuration

Client uses ESM (`import`/`export`). JSX files, no TypeScript.

### Key Patterns

- **Data fetching**: TanStack React Query with custom hooks. Each resource has its own hook file exporting query keys and mutation hooks
- **Forms**: React Hook Form + Zod via `@hookform/resolvers`
- **Notifications**: Two systems coexist — notistack (SnackbarProvider) and react-toastify (ToastContainer) in `App.jsx`
- **Auth flow**: Login returns JWT token → stored in localStorage → attached via axios interceptor → verified server-side with `authenticate` middleware → role checked with `authorize` middleware
- **Route structure**: `/admin/*`, `/delegate/*`, `/referee/*` — each role prefix maps to its own layout and page set

### Domain Models

Core entities: `User`, `Referee`, `Competition`, `Match`, `MatchReferee` (delegation join table), `Team`, `Venue`, `RefereeAvailability`
