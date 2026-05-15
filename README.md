# PulseBoard

> Real-time polling platform with live analytics, fraud detection, and AI-powered insights.

PulseBoard is a full-stack monorepo for creating polls, collecting responses, and watching results update in real time. It ships with a marketing landing page, authenticated poll builder, public respond flow, live analytics dashboard, and optional production deployment via Docker Compose.

## Features

### Polls & responses

- Multi-question polls with required/optional fields, multiple-choice options, and expiry timers
- Drag-and-drop question ordering in the poll builder
- **AI poll draft generator** — describe a topic in plain language and get a ready-to-edit poll (requires `OPENAI_API_KEY`)
- Anonymous and authenticated response modes
- Browser fingerprinting for duplicate detection without requiring login
- Public results page after you publish outcomes

### Analytics & reliability

- Real-time analytics dashboard with Socket.IO live updates
- Response velocity timeline, option distribution charts, and question comparison views
- Drop-off funnel highlighting where respondents stall
- Poll health score (0–100) blending completion, uniqueness, and velocity
- **AI narrative insights** on poll stats via GPT-4o-mini (when configured)
- Kafka event pipeline with a DLQ topic and replay endpoint for failed processing

### Auth & account

- Email/password registration and login
- Google Sign-In (OAuth 2.0) with automatic account linking on the same email
- Forgot / reset password flow (SMTP via Nodemailer when `SMTP_*` is configured)
- JWT access tokens (15m) + rotating HTTP-only refresh cookies (7d, hashed in Postgres)

### UX & sharing

- Light/dark theme with warm off-white (`#F5F4F0`) light-mode backgrounds
- Dynamic **Open Graph** SVG preview images per poll for link sharing
- Landing page with product sections, FAQ, and architecture overview

## Tech stack

| Layer    | Stack |
| -------- | ----- |
| Frontend | React 18, Vite, TypeScript (strict), Tailwind CSS v3, Zustand, TanStack Query v5, React Hook Form + Zod, Recharts, Framer Motion, Socket.IO client, DnD Kit |
| Backend  | Node.js, Express, TypeScript (strict), Drizzle ORM, PostgreSQL, JWT + refresh cookies, Passport Google OAuth |
| Cache    | Redis (insights, analytics cache, fingerprint keys) |
| Queue    | Kafka (response processing → realtime broadcast) |
| AI       | OpenAI `gpt-4o-mini` via official Node SDK (see [AI in PulseBoard](#ai-in-pulseboard)) |
| Infra    | Docker Compose — dev (`docker-compose.yml`), infra-only (`docker-compose.infra.yml`), production (`docker-compose.prod.yml`) |

## AI in PulseBoard

PulseBoard uses **OpenAI `gpt-4o-mini`** in two places on the API. Both features are **optional**: set `OPENAI_API_KEY` in `apps/api/.env`. Without it, the app still runs — poll creation falls back to a template draft, and insights show a message pointing you to raw analytics charts.

All AI calls run **server-side only** in `apps/api/src/modules/polls/service.ts`. The web app never holds or sends your API key.

### 1. AI poll draft generator (creation time)

**Where:** Poll builder → “Generate with AI” (`AiPollGenerator` component)  
**Endpoint:** `POST /api/polls/generate` (authenticated)

**What it does:** You describe a poll in plain language (e.g. “Engineering retro for Q4”). The API asks the model to return structured JSON: title, optional description, and 3–5 multiple-choice questions with 3–5 options each. The builder **applies the draft into the form** so you can edit, reorder, and publish — nothing is saved until you click publish.

**How we call the model:**

| Setting | Value |
| ------- | ----- |
| Model | `gpt-4o-mini` |
| Format | `response_format: { type: 'json_object' }` |
| Temperature | `0.65` (creative but structured) |
| Max tokens | `900` |
| Prompt cap | User brief trimmed to **500 characters** |

The system prompt constrains output to valid JSON (title ≤ 80 chars, specific options, no free-text questions). Parsed output is validated and truncated before returning. On parse errors or missing API key, a **static fallback draft** is returned so the UI never blocks.

```
You (prompt) → POST /api/polls/generate → GPT-4o-mini (JSON) → Poll builder form → you edit → publish
```

### 2. AI analytics insights (after responses)

**Where:** Analytics dashboard → **Insight** card (`InsightCard`)  
**Endpoint:** `GET /api/polls/:id/insights` (authenticated, poll owner)

**What it does:** Once a poll has at least one response, the API builds an **aggregate-only** snapshot from Postgres — per question, each option’s count and percentage. That JSON is sent to the model (not individual answers or fingerprints). GPT returns **exactly five** short, actionable bullet lines the UI splits and displays.

**How we call the model:**

| Setting | Value |
| ------- | ----- |
| Model | `gpt-4o-mini` |
| Temperature | `0.4` (factual, consistent tone) |
| Max tokens | `600` |
| Cache | Redis key `insights:v2:{pollId}`, **1 hour TTL** |

Use `?force=true` on the insights endpoint (or “Regenerate” in the UI) to bypass cache after new responses. Publishing or deleting a poll clears related insight cache keys.

**Example payload sent to the model** (structure only — no PII):

```json
[
  {
    "question": "How satisfied are you?",
    "options": [
      { "text": "Very satisfied", "count": 42, "percent": "70%" },
      { "text": "Neutral", "count": 12, "percent": "20%" }
    ]
  }
]
```

The system prompt asks for five lines prefixed with `- `, max ~24 words each, grounded in the numbers — no invented statistics.

```
Responses → Postgres aggregates → stats JSON → GPT-4o-mini → 5 insights → Redis cache → dashboard
```

### Design choices

- **Aggregates only for insights** — raw responses and fingerprints never leave the database for the AI step.
- **Human in the loop** — AI drafts polls; creators review and publish. Insights supplement charts, they don’t replace them.
- **Graceful degradation** — missing key, empty polls, or API errors return clear fallbacks instead of failing the page.
- **Cost control** — insights are cached for an hour; drafts are on-demand per user click.

### Enable AI locally

```bash
# apps/api/.env
OPENAI_API_KEY=sk-your-key-here
```

Restart the API after changing env vars. No frontend env variable is required for OpenAI.

## Project structure

```
PulseBoard/
├── apps/
│   ├── api/          # Express API, Drizzle schema, Kafka consumers, Socket.IO
│   └── web/          # React SPA (Vite)
├── docker-compose.yml
├── docker-compose.infra.yml
├── docker-compose.prod.yml
├── .env.production.example
└── .github/workflows/
    ├── ci.yml        # Lint, typecheck, Docker build
    └── deploy.yml    # SSH deploy to VPS on push to main
```

## Getting started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Postgres, Redis, Kafka)
- Optional: OpenAI API key, Google OAuth credentials, SMTP for password reset

### 1. Clone and install

```bash
git clone <your-repo-url>
cd PulseBoard
npm install
```

### 2. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Configure at minimum:

| Variable | Purpose |
| -------- | ------- |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Auth signing (32+ chars) |
| `DATABASE_URL` | Postgres connection |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (API) |
| `VITE_GOOGLE_CLIENT_ID` | Google Sign-In button (web) |
| `OPENAI_API_KEY` | AI poll drafts + insights (optional) |
| `SMTP_*` | Password reset emails (optional) |

### 3. Start services

**Full stack in Docker:**

```bash
docker compose up
```

**Infrastructure only + local dev servers:**

```bash
npm run docker:infra
npm run dev
```

### 4. Database

```bash
cd apps/api
npm run db:push
npm run db:seed
```

### 5. Open the app

| Service   | URL |
| --------- | --- |
| Web       | http://localhost:5173 |
| API       | http://localhost:3001 |
| API docs  | http://localhost:3001/api/docs |
| OpenAPI   | http://localhost:3001/api/openapi.json |
| Kafka UI  | http://localhost:8080 |

**Demo login** (after seed): `demo@pulseBoard.dev` / `Demo1234!`

## Google OAuth setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. **APIs & Services → Credentials → Create credentials → OAuth client ID** (Web application).
3. Add **Authorized redirect URI**: `http://localhost:3001/api/auth/google/callback`
4. Copy credentials into `apps/api/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`) and `apps/web/.env` (`VITE_GOOGLE_CLIENT_ID`).
5. Set `CLIENT_URL` in the API env to match the frontend origin (`http://localhost:5173` locally).

## Architecture

```
┌─────────────────┐     REST + WS      ┌──────────────────┐
│  React (Vite)   │ ◄────────────────► │  Express API     │
│  PulseBoard UI  │                    │  + Socket.IO     │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │                              ┌───────┴───────┐
         │                              │  PostgreSQL   │
         │                              │  (Drizzle)    │
         │                              ├───────────────┤
         │                              │  Redis cache  │
         │                              ├───────────────┤
         └──────────────────────────────│  Kafka        │
                response events         │  consumers    │
                                        └───────────────┘
```

**Typical flow:** A respondent submits answers → API validates and publishes to Kafka → consumers update analytics, broadcast over WebSockets, and cache aggregates in Redis → the creator’s dashboard refreshes live.

## Production deployment

1. Copy `.env.production.example` to `.env.production` at the repo root and fill in secrets.
2. Build and run:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. Run migrations against the production database:

   ```bash
   cd apps/api && npm run db:push
   ```

Default host ports (override via `HOST_*` in `.env.production`):

| Service  | Default port |
| -------- | ------------ |
| Web      | 9080         |
| API      | 3101         |
| Postgres | 5433         |
| Redis    | 6380         |
| Kafka    | 9093         |

GitHub Actions **Deploy to VPS** (`.github/workflows/deploy.yml`) SSHs into your server, checks out the target commit, and runs `docker compose -f docker-compose.prod.yml` using `.env.production` or `.env.staging` on the host. Configure repository secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_DIR`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | API + web dev servers (concurrently) |
| `npm run build` | Production build for all workspaces |
| `npm run lint` | ESLint across workspaces |
| `npm run typecheck` | TypeScript check across workspaces |
| `npm run docker:up` / `docker:down` | Dev Compose stack |
| `npm run docker:infra` / `docker:infra:down` | Postgres, Redis, Kafka only |

**API workspace** (`apps/api`): `db:push`, `db:seed`, `db:studio`, `db:generate`, `db:migrate`

## CI

`.github/workflows/ci.yml` installs dependencies, typechecks `apps/api` and `apps/web`, runs lint, and builds Docker images for both apps.

## Differentiators

- **Warm light UI** — page background `#F5F4F0` instead of pure white for a calmer light mode.
- **Fingerprinting** — canvas + environment hash per poll to limit duplicate anonymous submissions.
- **Health score** — combines question completion, distinct respondents, and velocity vs. poll age.
- **Kafka + DLQ** — inspect failed messages in Kafka UI and replay via the DLQ endpoint.
- **AI at two layers** — see [AI in PulseBoard](#ai-in-pulseboard) for draft generation and aggregate-based insights.

---

Built for hackathon demos and real deployments. Use HTTPS in production, tighten CORS and cookie settings, and rotate all secrets before going live.
