# Gonza Brands guide

Gonza Brands is one Next.js application. Vercel runs the website and backend API, and Neon Postgres stores application data. This guide records the current setup and proposes how to organize the code as the app grows.

## What changed

- Cloned the repository to the Desktop.
- Traced the production 404 to a Cloudflare Worker build that Vercel had uploaded as static files. Switched the project to the Next.js preset so Vercel deploys the server routes. The homepage and `/join` returned HTTP 200 after the production deployment.
- Converted the database layer from SQLite to PostgreSQL. Applied the migration to Neon and verified all 10 application tables through the pooled connection. Local PostgreSQL tests covered registration, jobs, proposals, projects, messages, invoices, reviews, and notifications.
- Added Google sign-in through Auth.js. The app has the sign-in routes, but production login still needs Google OAuth credentials and an Auth.js secret in Vercel.
- Signed in to the Neon CLI and installed the Neon plugin for Codex. Restart Codex to load its skills and MCP server.

## Where things live

| What | Where | What it does |
| --- | --- | --- |
| Public app | [gonza-brands.vercel.app](https://gonza-brands.vercel.app/) | Serves the website, onboarding, and workspace |
| Hosting | [Gonza Brands project in Vercel](https://vercel.com/gonzaug256-7458s-projects/gonza-brands) | Builds the Next.js app and runs its API routes. `main` feeds production. |
| Database | `gonza-brands-db` in the [Neon Console](https://console.neon.tech/) | Stores user profiles, portfolios, jobs, proposals, projects, messages, invoices, reviews, and notifications |
| Source | [gonzabrands/GONZA-BRANDS](https://github.com/gonzabrands/GONZA-BRANDS) | Holds app code, schema, and migrations. The hosting and database changes landed in `c0e4ac4` and `e67b3a3`. |

Production uses the pooled Neon connection in the `DATABASE_URL` secret in Vercel. For migrations, set `DATABASE_URL_UNPOOLED` to the direct Neon connection in the environment where you run `npm run db:migrate`. Keep production connection strings out of Git. Use a local Postgres instance or a separate Neon branch for development and testing.

To enable Google sign-in on production, set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` in Vercel. Register `https://gonza-brands.vercel.app/api/auth/callback/google` as an authorized redirect URI in Google Cloud, then redeploy and test registration, a saved workspace change, and logout. See [README.md](./README.md) for local setup and migration commands.

## Current code map

- `app/page.tsx` serves the public homepage and shows the workspace to signed-in users. `app/join/` handles onboarding and `app/workspace.tsx` contains the workspace UI.
- `app/api/data/route.ts` handles data requests and currently contains most business rules and SQL. `app/api/auth/[...nextauth]/route.ts` handles Auth.js requests.
- `auth.ts` configures Google sign-in. `lib/current-user.ts` resolves the signed-in user for app code.
- `db/index.ts` creates the PostgreSQL connection pool. `db/schema.ts` and `drizzle/` define and version the schema. `scripts/migrate.mjs` applies pending migrations.
- `vercel.json` declares the Next.js build settings. `.env.example` lists the required settings by name.

## What the app actually does

The code defines two account types: **Designer** and **Business/Customer**. A business posts a design brief, reviews proposals, and selects a designer. The resulting project supports status updates, messages, invoices, and reviews. Designers can also send a direct proposal to businesses that opt in.

- Designer workspace: Dashboard, Marketplace, Projects, Clients, Sales, Invoices, Messages, and Profile. Profiles include portfolio items.
- Business workspace: Dashboard, Find Designers, Post a Job, My Jobs, Projects, Messages, and Profile.
- Public routes: the landing page and signed-in workspace share `/`. Registration uses `/join`. NextAuth uses `/api/auth/[...nextauth]`, and app data uses `/api/data`.
- Conversations group existing messages by participant. Direct proposals are stored as messages. Invoice payment status is recorded by the app. The inspected code has two roles and no admin workflow or payment processor.

These boundaries come from `app/page.tsx`, `app/join/`, `app/workspace.tsx`, `app/api/data/route.ts`, `auth.ts`, and `db/schema.ts`.

## Target tree based on the existing app

This is a refactor layout, so the module files are proposed locations for code that already exists. It keeps the current URLs, roles, and database tables. Prisma is the requested replacement for the current PostgreSQL data layer.

```text
GONZA-BRANDS/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                         # /  landing page or workspace
│   ├── join/page.tsx                    # /join
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── data/route.ts                # Existing GET and action dispatcher
├── modules/
│   ├── website/
│   │   └── web/home-screen.tsx
│   ├── workspace/
│   │   ├── web/workspace-screen.tsx
│   │   ├── web/dashboard.tsx           # Designer and Business views
│   │   ├── web/clients.tsx             # Derived from the designer's projects
│   │   ├── web/sales.tsx               # Derived from invoices
│   │   └── server/workspace-data.ts    # Existing GET /api/data response
│   ├── accounts/
│   │   ├── identity/
│   │   │   ├── web/auth-actions.ts     # Existing Google sign-in and sign-out
│   │   │   └── server/current-user.ts  # Session and legacy account matching
│   │   ├── registration/
│   │   │   ├── web/join-form.tsx
│   │   │   └── server/register.ts
│   │   ├── profiles/
│   │   │   ├── web/profile-screen.tsx
│   │   │   └── server/profiles.ts
│   │   └── portfolios/
│   │       ├── web/portfolio-panel.tsx
│   │       └── server/portfolio.ts    # Add, edit, delete
│   ├── marketplace/
│   │   ├── designers/web/find-designers-screen.tsx
│   │   ├── jobs/
│   │   │   ├── web/marketplace-screen.tsx
│   │   │   ├── web/post-job-screen.tsx
│   │   │   ├── web/my-jobs-screen.tsx
│   │   │   └── server/jobs.ts          # Browse, post, update status
│   │   ├── proposals/
│   │   │   ├── web/proposal-form.tsx
│   │   │   ├── web/proposals-panel.tsx
│   │   │   ├── web/direct-proposal-form.tsx
│   │   │   ├── server/proposals.ts     # Submit, update status, withdraw
│   │   │   └── server/direct-proposal.ts
│   │   └── hiring/server/accept-proposal.ts
│   ├── projects/
│   │   ├── lifecycle/
│   │   │   ├── web/projects-screen.tsx
│   │   │   └── server/projects.ts     # Project status changes
│   │   └── reviews/
│   │       ├── web/review-form.tsx
│   │       └── server/reviews.ts
│   ├── messaging/
│   │   ├── conversations/web/messages-screen.tsx
│   │   └── messages/server/messages.ts
│   ├── billing/
│   │   ├── invoices/
│   │   │   ├── web/invoices-screen.tsx
│   │   │   ├── web/invoice-form.tsx
│   │   │   └── server/invoices.ts
│   │   └── payment-status/server/update-invoice-status.ts
│   └── notifications/
│       ├── delivery/server/create-notification.ts
│       └── inbox/
│           ├── web/notifications-panel.tsx
│           └── server/notifications.ts
├── components/ui/
├── db/prisma.ts
├── prisma/
│   ├── schema.prisma
│   ├── models/
│   │   ├── accounts.prisma             # users, legacy_google_accounts, portfolio
│   │   ├── marketplace.prisma          # jobs, proposals
│   │   ├── projects.prisma             # projects, reviews
│   │   ├── messaging.prisma            # messages
│   │   ├── billing.prisma              # invoices
│   │   └── notifications.prisma        # notifications
│   └── migrations/0_baseline/migration.sql
├── prisma.config.ts
├── drizzle/                            # Historical migrations
├── public/
├── auth.ts
├── next.config.ts
├── vercel.json
├── .env.example
├── package.json
├── README.md
└── GUIDE.md
```

The route files keep the current Next.js entry points and delegate to the modules. Feature screens stay beside their server operations. For example, the existing `jobAdd` API action delegates to `marketplace/jobs/server/jobs.ts`. The existing `proposalStatus` action delegates acceptance to hiring. Hiring coordinates the job, proposal, project, message, and notification writes in one transaction.

### Move the database layer to Prisma

1. Introspect a copy of the existing Neon schema. Keep the table and column names, IDs, foreign keys, defaults, and decimal precision. Use Prisma mappings where application names differ from database names.
2. Create a baseline migration. Test it in a fresh development database and record it as already applied in production after checking that both schemas match. Keep Drizzle migrations as historical records. [Prisma baselining guide](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining)
3. Use the pooled `DATABASE_URL` for Prisma Client on Vercel and `DATABASE_URL_UNPOOLED` for Prisma CLI operations. Generate the client during the build and apply schema migrations as a separate release step. [Neon and Prisma setup](https://neon.com/docs/guides/prisma)

## Suggested refactor order

1. Verify the Prisma baseline using a separate Neon branch.
2. Extract identity, registration, profiles, and portfolios. Keep the current onboarding and API response shapes.
3. Extract jobs, proposals, hiring, and projects. Verify the existing workflow from brief through designer selection and review.
4. Extract messaging, invoices, and notifications. Check that the workspace still shows the same sections and records for each role.
