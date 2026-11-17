import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before running migrations.");

const client = new Client({ connectionString, enableChannelBinding: true, connectionTimeoutMillis: 10_000 });
try {
  await client.connect();
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  console.log("Database migrations applied.");
} finally {
  await client.end();
}
