# Gonza Brands

Gonza Brands runs its Next.js pages and API routes on Vercel. Neon Postgres stores application data, and Auth.js handles Google sign-in.

## Run locally

1. Use Node.js 22 and run `npm ci`.
2. Copy `.env.example` to `.env.local`. Set `DATABASE_URL` to a local Postgres instance or a Neon development branch and run `npm run db:migrate`.
3. To enable sign-in, set `AUTH_SECRET` to a random secret of at least 32 bytes and add your Google OAuth client ID and secret. Add `http://localhost:3000/api/auth/callback/google` to the client's authorized redirect URIs.
4. Run `npm run dev`.

The public home and join pages are available without credentials. Sign-in requires the database and OAuth settings.

## Set up the Vercel project

1. Use the **Next.js** framework preset and the repository root. Remove any previous Build Command or Output Directory overrides from the dashboard. `vercel.json` specifies the Next.js build.
2. Connect a Neon Postgres database through [Vercel Storage](https://neon.com/docs/guides/vercel-managed-integration) or set `DATABASE_URL` manually using the pooled Neon connection string. Use a separate Neon branch for Preview. Keep the SSL options Neon supplies in its connection strings.
3. From a trusted machine, run `npm run db:migrate` for each database branch before enabling access. Use the direct Neon URL in `DATABASE_URL_UNPOOLED` for migrations. If it is absent, migrations use `DATABASE_URL`. Keep production connection strings in Vercel or a local environment file excluded from Git.
4. Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` in Vercel. In Google Cloud, register `https://gonza-brands.vercel.app/api/auth/callback/google` as an authorized redirect URI. Use a dedicated Google client for a stable preview URL if you need to test OAuth before production.
5. On a preview, check the home page, registration, a persisted workspace change, and logout before promoting the build.

## Move existing SQLite data

If the old Sites D1 or Turso database contains records, back it up before switching traffic. Migrate a fresh Neon branch, then import the records with their original IDs. Import `users` and `jobs` before `projects` and `proposals`, then import the dependent tables. The old SQLite SQL dump targets a different engine. Export data as CSV with explicit column names, and verify row counts and sample workspaces in Postgres before cutover.

Sites user IDs are tied to the original Sites deployment. For each verified account migration, link the old `users.id` to its Google identity in `legacy_google_accounts`. The `account_id` is `google_` followed by the lowercase SHA-256 hex digest of the verified Google OAuth subject (`sub`). Establish the subject through a trusted account verification process before creating a mapping. Apply the mapping before the user completes a new registration, and verify that the original workspace opens after sign-in.
