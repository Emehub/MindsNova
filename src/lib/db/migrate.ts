import path from "node:path";
import { dbKind, getDb } from "./index";

/** Applies pending SQL migrations from ./drizzle. Safe to call repeatedly. */
export async function runMigrations() {
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  const db = getDb();
  if (dbKind() === "pglite") {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder });
  } else {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db, { migrationsFolder });
  }
}
