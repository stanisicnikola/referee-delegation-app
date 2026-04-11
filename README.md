# Referee Delegation App

Full-stack monorepo for managing referee assignments to basketball matches.

## Monorepo Structure

```text
referee-delegation-app/
├── server/   # Express API + Sequelize + MySQL
└── client/   # React SPA (Vite + MUI + React Query)
```

## Tech Stack

### Backend (`server/`)
- Express 5
- Sequelize 6 + sequelize-cli
- MySQL (`mysql2`)
- Zod for request validation
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- File uploads (`multer`)

### Frontend (`client/`)
- React 19 + Vite
- React Router
- TanStack React Query
- Axios
- MUI (`@mui/material`, `@mui/icons-material`)
- React Hook Form + Zod

## Setup

### Prerequisites
- Node.js 18+
- MySQL

### 1. Backend

```bash
cd server
npm install
```

Create/update `server/.env` with:
- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_DIALECT` (usually `mysql`)
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV`
- `UPLOAD_PATH`

Run migrations and start server:

```bash
npm run db:migrate
npm run db:seed
npm run start
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Important: client axios fallback points to `http://localhost:8000/api`, while server default port is `5000`.
For local dev, set:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Role-Based Routes

- Admin: `/admin/*`
- Delegate: `/delegate/*`
- Referee: `/referee/*`
- Login: `/login`

Route protection is implemented in `client/src/routes/AppRoutes.jsx`.

## Core Domain Vocabulary

Use these canonical names across backend/frontend integration:

- Match datetime field: `scheduledAt`
- Match delegation status: `pending | partial | complete | confirmed`
- Assignment role: `first_referee | second_referee | third_referee`
- Assignment status: `pending | accepted | declined`
- Delegation POST payload: `refereeAssignments: [{ refereeId, role }]`

## Architecture Summary

Backend request flow:

```text
Routes -> Controllers -> Services -> Sequelize Models -> MySQL
```

Client data flow:

```text
API modules (axios) -> React Query hooks -> Pages/Components
```

## Additional Docs

- Backend details: `server/README.md`
- Frontend details: `client/README.md`
