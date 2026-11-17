import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is missing.");
  client ??= createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}
