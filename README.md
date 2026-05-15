# pulseBoard

> Real-time polling platform with live analytics, fraud detection, and AI insights.

PulseBoard / pulseBoard is a hackathon-ready monorepo (`apps/api` + `apps/web`) with Docker Compose for Postgres, Redis, Kafka, and Socket.IO-powered live dashboards.

## Features

- Create polls with multiple questions, mandatory/optional fields, and expiry timers
- Anonymous and authenticated response modes
- Browser fingerprinting for duplicate detection (no login required)
- Real-time analytics dashboard with WebSocket live updates
- Response velocity timeline showing poll momentum
- Drop-off funnel that surfaces questions where respondents stall
- Poll health score (0–100) combining completion, uniqueness, and velocity
- AI-powered insights using GPT-4o-mini (when `OPENAI_API_KEY` is set)
- Kafka event pipeline with a DLQ topic and replay endpoint
- Publish results publicly after you are ready to share
- Google Sign-In plus email/password authentication
- Light/dark theme with **warm off-white** light mode backgrounds

## Tech stack

| Layer    | Stack |
| -------- | ----- |
| Frontend | React 18, Vite, TypeScript (strict), Tailwind CSS v3, Zustand, TanStack Query v5, React Hook Form + Zod, Recharts, Socket.IO client, DnD Kit |
| Backend  | Node.js, Express, TypeScript (strict), Drizzle ORM, PostgreSQL, JWT + HTTP-only refresh cookies, Passport Google OAuth |
| Cache    | Redis (insights + analytics cache + fingerprint keys) |
| Queue    | Kafka (responses → realtime broadcast pipeline) |
| Auth     | Access JWT (15m) + refresh token (7d, rotating, stored hashed in DB) |
| AI       | OpenAI `gpt-4o-mini` for narrative insights |
| Infra    | Docker Compose (Postgres, Redis, Zookeeper, Kafka, Kafka UI, API, Web) |

## Getting started

1. **Clone and enter the monorepo**

   ```bash
   git clone <your-repo-url>
   cd pulseBoard
   ```

2. **Environment**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Fill in secrets — especially `JWT_*`, Google OAuth client ID/secret, and optionally `OPENAI_API_KEY`.

3. **Start infrastructure & apps**

   ```bash
   docker compose up
   ```

   Or run databases only and use local Node:

   ```bash
   docker compose up postgres redis kafka zookeeper -d
   npm install
   npm run dev
   ```

4. **Database**

   ```bash
   cd apps/api
   npm run db:push
   npm run db:seed
   ```

5. **Open the app**

   - Web: [http://localhost:5173](http://localhost:5173)
   - API: [http://localhost:3001](http://localhost:3001)
   - Kafka UI: [http://localhost:8080](http://localhost:8080)

Demo login (after seed): `demo@pulseBoard.dev` / `Demo1234!`

## Google OAuth setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
3. Application type **Web application**.
4. Add **Authorized redirect URIs**:
   - Local API callback: `http://localhost:3001/api/auth/google/callback`
5. Copy **Client ID** and **Client secret** into `apps/api/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and `apps/web/.env` (`VITE_GOOGLE_CLIENT_ID`).
6. Ensure `CLIENT_URL` in the API env matches the frontend origin (`http://localhost:5173` locally).

## Architecture

```
┌─────────────┐     HTTPS/WS      ┌──────────────┐
│ React (Vite)│ ◄──────────────► │ Express API   │
│  pulseBoard UI │    REST + Socket │  + Socket.IO  │
└──────┬──────┘                  └───────┬───────┘
       │                                │
       │                          ┌─────┴─────┐
       │                          │ Postgres   │
       │                          │ Drizzle ORM│
       │                          └────────────┘
       │                          ┌────────────┐
       │                          │ Redis cache│
       │                          └────────────┘
       │                          ┌────────────┐
       └────────────────────────► │ Kafka       │
             (analytics fan-out) │ consumers   │
                                 └────────────┘
```

## Differentiators

- **Warm light UI**: page background uses `#F5F4F0`, not pure white — calmer, more “premium” light mode.
- **Fingerprinting**: lightweight canvas + environment hash stored per poll to reduce duplicate submissions without accounts.
- **Health score**: blends average question completion, distinct authenticated respondents (when applicable), and velocity vs. poll age.
- **Kafka + DLQ**: failed response-processing messages can be inspected in Kafka UI and replayed via the DLQ replay endpoint.
- **AI insights**: structured poll stats are summarized when enough responses exist and `OPENAI_API_KEY` is configured.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Run API + Web together (workspace dev servers) |
| `npm run build` | Build all workspaces |
| `npm run lint` | ESLint all workspaces |
| `npm run typecheck` | Typecheck all workspaces (when configured per package) |
| `npm run docker:up` / `docker:down` | Compose shortcuts |

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies, typechecks both apps, runs lint, and builds Docker images for `apps/api` and `apps/web`.

---

Built for hackathon demos — swap secrets, deploy behind HTTPS, and tighten CORS/cookies for production.
