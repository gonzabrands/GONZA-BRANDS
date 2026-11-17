# Gonza Brands

Gonza Brands runs on Next.js on Vercel. The app uses Turso for persistent SQLite data and Auth.js for Google sign-in.

## Run locally

1. Use Node.js 22 and run `npm ci`.
2. Copy `.env.example` to `.env.local`. For local storage, create a `.local` directory, set `TURSO_DATABASE_URL=file:.local/gonza.db`, and leave `TURSO_AUTH_TOKEN` empty. Run `npm run db:migrate`.
3. To enable sign-in, set `AUTH_SECRET` to a random secret of at least 32 bytes and add your Google OAuth client ID and secret. Add `http://localhost:3000/api/auth/callback/google` to the client's authorized redirect URIs.
4. Run `npm run dev`.

The public home and join pages are available without credentials. Sign-in requires the database and OAuth settings.

## Set up the Vercel project

1. Use the **Next.js** framework preset and the repository root. Remove any previous Build Command or Output Directory overrides from the dashboard. `vercel.json` specifies the Next.js build.
2. Connect a Turso database and add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to each Vercel environment that needs sign-in. Run `npm run db:migrate` against that database before enabling access.
3. Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` in Vercel. In Google Cloud, register `https://gonza-brands.vercel.app/api/auth/callback/google` as an authorized redirect URI. Use a dedicated Google client and database for a stable preview URL if you need to test OAuth before production.
4. On a preview, check the home page, registration, a persisted workspace change, and logout before promoting the build.

## Move existing Sites data

For an existing installation, export the Sites D1 records and import them into an isolated Turso database after running the migrations. Preserve existing primary keys and foreign keys. Verify record counts and run `PRAGMA foreign_key_check;` before switching traffic.

Sites user IDs are tied to the original Sites deployment. For each verified account migration, link the old `users.id` to its Google identity in `legacy_google_accounts`. The `account_id` is `google_` followed by the lowercase SHA-256 hex digest of the verified Google OAuth subject (`sub`). Establish the subject through a trusted account verification process before creating a mapping. Apply the mapping before the user completes a new registration, and verify that the original workspace opens after sign-in.
