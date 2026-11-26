/**
 * Database connection.
 *
 * - DATABASE_URL set   -> PostgreSQL through node-postgres (production).
 * - DATABASE_URL empty -> PGlite, a real PostgreSQL engine compiled to WASM,
 *                         stored in .data/pglite (development, no install needed).
 *
 * Note: PGlite allows a single process at a time. Stop `npm run dev` before
 * running database scripts against the local database.
 */
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;

type Holder = { db?: DB; kind?: "pglite" | "postgres"; close?: () => Promise<void> };
const g = globalThis as unknown as { __mnDb?: Holder };
const holder: Holder = g.__mnDb ?? (g.__mnDb = {});

function create(): DB {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg") as typeof import("pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
    // Kept small: on serverless hosts every instance opens its own pool.
    const pool = new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX) || 5 });
    holder.kind = "postgres";
    holder.close = () => pool.end();
    return drizzle(pool, { schema });
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
  // On Vercel without DATABASE_URL ("website only"), use the writable temporary
  // folder. It is rebuilt with the starting content on each cold start.
  const dir = process.env.VERCEL ? "/tmp/pglite" : path.resolve(process.cwd(), ".data", "pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require("node:fs") as typeof import("node:fs")).mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  holder.kind = "pglite";
  holder.close = () => client.close();
  return drizzle(client, { schema }) as unknown as DB;
}

export function getDb(): DB {
  if (!holder.db) holder.db = create();
  return holder.db;
}

/** Lazily connected database instance. */
export const db: DB = new Proxy({} as DB, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export function dbKind() {
  getDb();
  return holder.kind!;
}

export async function closeDb() {
  if (holder.close) await holder.close();
  holder.db = undefined;
}

export { schema };
