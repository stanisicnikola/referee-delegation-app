# Client (React SPA)

Frontend for the Referee Delegation App, built with React + Vite.

## Stack

- React 19
- Vite
- React Router
- TanStack React Query
- Axios
- MUI
- React Hook Form + Zod

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Environment

Used in `src/api/axios.js`:

- `VITE_API_URL`: API base URL

Current fallback:

```text
http://localhost:8000/api
```

If backend runs on default server port (`5000`), set:

```bash
VITE_API_URL=http://localhost:5000/api
```

## App Structure

```text
src/
├── api/           # axios modules by resource
├── hooks/         # React Query hooks
├── pages/         # role-based pages (admin/delegate/referee)
├── routes/        # router and protected routes
├── context/       # auth context
├── components/    # UI and feature components
├── layouts/       # role layouts
└── validations/   # Zod schemas for forms
```

## Data Flow

```text
Page -> Hook (React Query) -> API module (axios) -> Backend
```

Examples:
- Delegations: `src/api/delegations.js` -> `src/hooks/useDelegations.js` -> `src/pages/delegate/DelegationPage.jsx`
- Availability: `src/api/availability.js` -> `src/hooks/useAvailability.js` -> `src/pages/referee/AvailabilityPage.jsx`

## Auth Flow

- Login through `src/context/AuthContext.jsx` (`authApi.login`)
- JWT token stored in `localStorage`
- Axios request interceptor adds `Authorization: Bearer <token>`
- Axios response interceptor clears auth state and redirects to `/login` on `401`

## Route Map

Defined in `src/routes/AppRoutes.jsx`:

- Public:
  - `/login`
- Admin:
  - `/admin/dashboard`
  - `/admin/users`
  - `/admin/referees`
  - `/admin/delegates`
  - `/admin/matches`
  - `/admin/competitions`
  - `/admin/teams`
  - `/admin/venues`
  - `/admin/settings`
  - `/admin/profile`
- Delegate:
  - `/delegate/dashboard`
  - `/delegate/matches`
  - `/delegate/delegation/:matchId`
  - `/delegate/referees`
  - `/delegate/competitions`
  - `/delegate/teams`
- Referee:
  - `/referee/dashboard`
  - `/referee/schedule`
  - `/referee/pending`
  - `/referee/availability`
  - `/referee/notifications`
  - `/referee/history`
  - `/referee/profile`

## Form and Validation

- React Hook Form is used in page/forms and modal forms.
- Zod schemas are under `src/validations/`.
- Key form components:
  - `src/components/user/UserModal.jsx`
  - `src/components/ui/MatchModal.jsx`
  - `src/components/user/CompetitionModal.jsx`
  - `src/components/user/TeamModal.jsx`
  - `src/components/user/VenueModal.jsx`

## Integration Contracts (Canonical Backend Fields)

When integrating or updating pages/hooks, use these backend field names:

- Match datetime: `scheduledAt` (not `dateTime`)
- Delegation status: `pending | partial | complete | confirmed`
- Assignment status: `pending | accepted | declined`
- Assignment role: `first_referee | second_referee | third_referee`
- Delegation payload:
  - `refereeAssignments: [{ refereeId, role }]`
