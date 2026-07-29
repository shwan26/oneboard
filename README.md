# Oneboard

Oneboard is a responsive real-time workspace for organizing projects, assigning tasks, and discussing updates with a team.

## Features

- Account registration and JWT-based authentication
- Profile name and password management
- Account deletion with password confirmation
- Project rooms with owner and member roles
- Task creation, assignment, status, and deadline management
- Real-time task and comment updates with Socket.IO
- Online member presence
- Comments, mentions, and notifications
- Unread-message badges
- Responsive desktop and mobile layouts

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT and bcrypt |
| Package manager | pnpm |

## Project structure

```text
oneboard/
├── backend/
│   ├── prisma/              # Schema and database migrations
│   └── src/
│       ├── middleware/      # Authentication middleware
│       ├── routes/          # REST API routes
│       └── sockets/         # Real-time event handlers
├── frontend/
│   └── src/
│       ├── components/      # Reusable interface components
│       └── pages/           # Application pages
├── .gitignore
└── README.md
```

## Requirements

- Node.js 20.19 or newer (or Node.js 22.12+)
- pnpm 11
- PostgreSQL

## Local setup

### 1. Configure the backend

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/oneboard"
JWT_SECRET="replace-this-with-a-long-random-secret"
CLIENT_ORIGIN="http://localhost:5173"
PORT=4000
```

Install dependencies and initialize the database:

```bash
cd backend
pnpm install
pnpm exec prisma migrate dev
```

Start the API and Socket.IO server:

```bash
pnpm dev
```

The backend runs at `http://localhost:4000`. Its health endpoint is:

```text
GET http://localhost:4000/health
```

### 2. Configure the frontend

In another terminal, create `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000"
```

Install dependencies and start the development server:

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173` in a browser.

## Useful commands

### Frontend

Run from `frontend/`:

```bash
pnpm dev       # Start the Vite development server
pnpm build     # Type-check and create a production build
pnpm preview   # Preview the production build
```

### Backend

Run from `backend/`:

```bash
pnpm dev                       # Start the server with file watching
pnpm generate                  # Regenerate the Prisma client
pnpm exec prisma migrate dev   # Apply development migrations
pnpm exec prisma studio        # Open Prisma Studio
```

## Environment variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens |
| `CLIENT_ORIGIN` | No | Allowed frontend origin; defaults to `http://localhost:5173` |
| `PORT` | No | Backend port; defaults to `4000` |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend base URL; defaults to `http://localhost:4000` |

## Production build

Build the frontend:

```bash
cd frontend
pnpm build
```

For production, set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_ORIGIN` on the backend host, and set `VITE_API_URL` before building the frontend.

## Security notes

- Never commit `.env` files or real credentials.
- Use a long, randomly generated `JWT_SECRET` in production.
- Serve both applications over HTTPS in production.
- Restrict `CLIENT_ORIGIN` to the deployed frontend URL.
