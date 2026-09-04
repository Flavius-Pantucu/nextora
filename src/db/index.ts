import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and start Postgres with `npm run db:up`.");
}

/**
 * One pool per process. Next's dev server re-evaluates modules on every edit,
 * so the pool is parked on globalThis — otherwise a morning's editing opens
 * a few hundred Postgres connections and the server stops accepting them.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = globalForDb.pool ?? new Pool({ connectionString, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
