# Server (Express API)

Backend API for the Referee Delegation App.

## Stack

- Express 5
- Sequelize 6 + sequelize-cli
- MySQL (`mysql2`)
- Zod validation
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- File upload (`multer`)

## Scripts

```bash
npm run start
npm run db:migrate
npm run db:migrate:undo
npm run db:seed
npm run db:seed:undo
npm run db:reset
```

Note: `npm test` is currently a placeholder and exits with error.

## Environment Variables

Expected in `server/.env`:

- `DB_HOST`: MySQL host
- `DB_USER`: MySQL user
- `DB_PASS`: MySQL password
- `DB_NAME`: Database name
- `DB_DIALECT`: dialect, default `mysql`
- `PORT`: API port (default in code: `5000`)
- `JWT_SECRET`: signing secret
- `JWT_EXPIRES_IN`: token TTL, default `7d`
- `NODE_ENV`: runtime environment
- `UPLOAD_PATH`: upload directory setting

DB config is loaded in `config/config.js`.

## Project Structure

```text
server/
├── config/        # sequelize/env config
├── routes/        # route declarations + auth/role wiring
├── controllers/   # HTTP handlers
├── services/      # business rules
├── models/        # Sequelize models + associations
├── migrations/    # DB schema evolution
├── validators/    # Zod schemas
├── middlewares/   # auth, validate, upload, error handling
└── seeders/       # initial data
```

## Request Lifecycle

```text
Route -> Middleware (auth/role/validate) -> Controller -> Service -> Model -> DB
```

Main route registration is in `index.js` under:

- `/api/auth`
- `/api/users`
- `/api/referees`
- `/api/teams`
- `/api/venues`
- `/api/competitions`
- `/api/matches`
- `/api/delegations`
- `/api/availability`
- `/api/dashboard`

## Middleware Stack

Global (in `index.js`):

- `cors()`
- `express.json()`
- `express.urlencoded()`
- static uploads
- route mounts
- 404 handler
- `errorHandler`

Route-level (`middlewares/`):

- `authenticate`: verifies bearer JWT and active user
- `authorize(...roles)`: role checks
- `validate(schema, type)`: Zod request validation
- `uploadTeamLogo` / `uploadAvatar`: upload handlers

## Database Model Overview

Entities:

- `users`
- `referees`
- `venues`
- `teams`
- `competitions`
- `matches`
- `match_referees` (join table with role/status metadata)
- `referee_availability`

Core relationships:

- `User hasOne Referee`
- `User hasMany Match` (`delegatedBy`)
- `Competition hasMany Match`
- `Team hasMany Match` (home and away aliases)
- `Venue hasMany Team`
- `Venue hasMany Match`
- `Match hasMany MatchReferee`
- `Referee hasMany MatchReferee`
- `Referee hasMany RefereeAvailability`

Many-to-many match/referee behavior is implemented through explicit join model `MatchReferee` (no `belongsToMany`).

## Domain Rules (Important)

Canonical statuses/roles used by services and schema:

- Match `delegationStatus`:
  - `pending | partial | complete | confirmed`
- MatchReferee `status`:
  - `pending | accepted | declined`
- MatchReferee `role`:
  - `first_referee | second_referee | third_referee`
- Match datetime field:
  - `scheduledAt`

Delegation workflow (`services/delegationService.js`):

- Reject delegation for completed/cancelled matches
- Replace existing assignments transactionally
- Validate referee existence
- Check explicit unavailability on match date
- Check same-day assignment conflict
- Update match delegation status based on assignment count
- Confirm/reject assignment updates both assignment and match delegation state

Availability workflow (`services/availabilityService.js`):

- Single-day upsert
- Range set with transactional replace
- Calendar defaults missing dates to available
- Copy-previous-month copies unavailable records by day-of-month

## API Resource Groups

- Auth: `routes/auth.js`
- Users: `routes/users.js`
- Referees: `routes/referees.js`
- Teams: `routes/teams.js`
- Venues: `routes/venues.js`
- Competitions: `routes/competitions.js`
- Matches: `routes/matches.js`
- Delegations: `routes/delegations.js`
- Availability: `routes/availability.js`
- Admin dashboard: `routes/dashboard.js`

Request schemas are in `validators/*.js`.

## Development Notes

- The API currently exposes uploads under `/uploads`.
- CORS is currently open (`app.use(cors())` with default options).
