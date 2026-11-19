/**
 * Creates or resets an administrator account.
 *   npm run admin:create -- --email you@org.com --name "Your Name" --role super_admin
 * The password is read from ADMIN_PASSWORD or generated and printed once.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { ROLES } from "../src/lib/catalog";
import { closeDb, getDb, schema } from "../src/lib/db";
import { runMigrations } from "../src/lib/db/migrate";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = (arg("email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const name = arg("name") || process.env.ADMIN_NAME || "Administrator";
  const role = arg("role") || "super_admin";
  if (!email) throw new Error("Provide --email or set ADMIN_EMAIL.");
  if (!(role in ROLES)) throw new Error(`Role must be one of: ${Object.keys(ROLES).join(", ")}`);
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url") + "A1";

  await runMigrations();
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) {
    await db.update(schema.users).set({ passwordHash, role, name, active: true }).where(eq(schema.users.id, existing.id));
    console.info(`Updated ${email} (${role}).`);
  } else {
    await db.insert(schema.users).values({ email, name, role, passwordHash });
    console.info(`Created ${email} (${role}).`);
  }
  if (generated) console.info(`Temporary password: ${password}\nChange it after signing in (Account page).`);
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exitCode = 1;
  })
  .finally(closeDb);
