import { Pool, types } from "pg";

let pool: Pool | undefined;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing.");
  if (!pool) {
    pool = new Pool({
      connectionString,
      enableChannelBinding: true,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 5_000,
      types: {
        getTypeParser: (oid, format) => oid === types.builtins.NUMERIC && format !== "binary"
          ? Number
          : types.getTypeParser(oid, format),
      },
    });
    pool.on("error", (error) => console.error("Idle PostgreSQL connection failed", error.message));
  }
  return pool;
}
