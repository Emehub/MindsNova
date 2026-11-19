/**
 * Prepares the database: runs migrations, loads starting content into an
 * empty database and creates the first Super Administrator from
 * ADMIN_EMAIL / ADMIN_PASSWORD when no users exist yet.
 *
 * Called automatically when the server starts (src/instrumentation.ts) and
 * by `npm run db:setup`.
 */
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { getDb, schema } from "./index";
import { runMigrations } from "./migrate";
import { SEED_IMPACT, SEED_PROGRAMS } from "./seed-data";

export async function bootstrap({ log = console.info } = {}) {
  await runMigrations();
  const db = getDb();

  const [{ n: programCount }] = await db.select({ n: count() }).from(schema.programs);
  if (programCount === 0) {
    await db.insert(schema.programs).values(
      SEED_PROGRAMS.map((p, i) => ({ ...p, applicationStatus: "interest", sortOrder: i, published: true })),
    );
    log(`[db] Loaded ${SEED_PROGRAMS.length} program tracks.`);
  }

  const [{ n: impactCount }] = await db.select({ n: count() }).from(schema.impactMetrics);
  if (impactCount === 0) {
    // Values are empty and unverified, so nothing shows publicly until the team enters real figures.
    await db.insert(schema.impactMetrics).values(SEED_IMPACT.map((m, i) => ({ ...m, value: null, verified: false, sortOrder: i })));
    log("[db] Created impact metrics (hidden until verified).");
  }

  const [{ n: userCount }] = await db.select({ n: count() }).from(schema.users);
  if (userCount === 0) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      await db.insert(schema.users).values({
        email,
        name: process.env.ADMIN_NAME || "Super Administrator",
        passwordHash: await bcrypt.hash(password, 12),
        role: "super_admin",
      });
      log(`[db] Created Super Administrator ${email}.`);
    } else {
      log("[db] No admin user yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env and restart, or run `npm run admin:create`.");
    }
  }
}
